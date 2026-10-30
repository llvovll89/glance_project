import { emptyProfile, normalizeProfile, type PcProfile } from './pc-profile';

// Runs only when the user copies this text into their own Windows PowerShell.
// No network requests, file writes, serial numbers or user/account fields.
export const windowsCollector = String.raw`& {
  $ErrorActionPreference = 'Stop'
  try {
    $pcSpecsSystem = Get-CimInstance -ClassName Win32_ComputerSystem
    $pcSpecsOs = Get-CimInstance -ClassName Win32_OperatingSystem
    $pcSpecsCpu = @(Get-CimInstance -ClassName Win32_Processor)
    $pcSpecsMemory = @(Get-CimInstance -ClassName Win32_PhysicalMemory)
    $pcSpecsGpu = @(Get-CimInstance -ClassName Win32_VideoController)
    $pcSpecsDisks = @(Get-CimInstance -ClassName Win32_DiskDrive)
    $pcSpecsType = 'unknown'
    if ($pcSpecsSystem.PCSystemType -eq 2) { $pcSpecsType = 'laptop' }
    elseif ($pcSpecsSystem.PCSystemType -in @(1, 3)) { $pcSpecsType = 'desktop' }
    $pcSpecsOsId = 'other'
    if ($pcSpecsOs.Caption -match 'Windows 11') { $pcSpecsOsId = 'windows11' }
    elseif ($pcSpecsOs.Caption -match 'Windows 10') { $pcSpecsOsId = 'windows10' }
    $pcSpecsRamBytes = ($pcSpecsMemory | Measure-Object -Property Capacity -Sum).Sum
    $pcSpecsRam = ''
    if ($pcSpecsRamBytes -gt 0) { $pcSpecsRam = '{0:0.##} GiB' -f ($pcSpecsRamBytes / 1GB) }
    $pcSpecsResult = [ordered]@{
      source = 'hanno-windows-specs'
      version = 1
      profile = [ordered]@{
        nickname = [string]$pcSpecsSystem.Model
        deviceType = $pcSpecsType
        os = $pcSpecsOsId
        osVersion = '{0} (build {1})' -f $pcSpecsOs.Version, $pcSpecsOs.BuildNumber
        cpu = ($pcSpecsCpu | ForEach-Object { $_.Name.Trim() }) -join ', '
        ram = $pcSpecsRam
        gpu = ($pcSpecsGpu | ForEach-Object { $_.Name.Trim() } | Select-Object -Unique) -join ', '
        storage = ($pcSpecsDisks | ForEach-Object { '{0} ({1:0.##} GiB)' -f $_.Model.Trim(), ($_.Size / 1GB) }) -join ', '
      }
    }
    $pcSpecsJson = $pcSpecsResult | ConvertTo-Json -Depth 4
    try {
      Set-Clipboard -Value $pcSpecsJson
      [Console]::Error.WriteLine('PC specs copied. Return to Hanno and click Import from clipboard.')
      $pcSpecsJson
    } catch {
      [Console]::Error.WriteLine('Clipboard unavailable. Copy the JSON below instead:')
      $pcSpecsJson
    }
  } catch {
    [Console]::Error.WriteLine('Could not read Windows hardware information. Use manual entry or check with your administrator.')
  }
}`;

export function powerShellForCmd(script: string): string {
  const utf16 = Array.from(script, character => `${character}\0`).join('');
  return `powershell.exe -NoProfile -EncodedCommand ${btoa(utf16)}`;
}

export const cmdCollector = powerShellForCmd(windowsCollector);

export const macCollector = String.raw`result=$({
  printf 'hanno-specs-v1\tmacos\n'
  model=$(sysctl -n hw.model 2>/dev/null)
  case "$model" in
    (MacBook*) kind=laptop ;;
    (iMac*|Macmini*|MacPro*|MacStudio*) kind=desktop ;;
    (*) kind=unknown ;;
  esac
  printf 'nickname\t%s\ndeviceType\t%s\nos\tmacos\n' "$model" "$kind"
  printf 'osVersion\t%s\n' "$(sw_vers -productVersion 2>/dev/null)"
  cpu=$(sysctl -n machdep.cpu.brand_string 2>/dev/null)
  if [ -z "$cpu" ]; then cpu=$(system_profiler SPHardwareDataType 2>/dev/null | awk -F: '/^[[:space:]]*(Chip|Processor Name):/ { sub(/^[[:space:]]+/, "", $2); print $2; exit }'); fi
  printf 'cpu\t%s\n' "$cpu"
  bytes=$(sysctl -n hw.memsize 2>/dev/null)
  if [ -n "$bytes" ]; then awk -v bytes="$bytes" 'BEGIN { printf "ram\t%.2f GiB\n", bytes / 1073741824 }'; fi
  system_profiler SPDisplaysDataType 2>/dev/null | awk -F: '/^[[:space:]]*Chipset Model:/ { sub(/^[[:space:]]+/, "", $2); print "gpu\t" $2; exit }'
  diskutil info / 2>/dev/null | awk -F: '/^[[:space:]]*Disk Size:/ { sub(/^[[:space:]]+/, "", $2); print "storage\t" $2; exit }'
})
printf '%s\n' "$result"
if printf '%s' "$result" | pbcopy; then printf 'PC specs copied. Return to Hanno and click Import from clipboard.\n' >&2; fi`;

export const linuxCollector = String.raw`result=$({
  printf 'hanno-specs-v1\tlinux\n'
  model=$(cat /sys/devices/virtual/dmi/id/product_name 2>/dev/null)
  chassis=$(cat /sys/class/dmi/id/chassis_type 2>/dev/null)
  case "$chassis" in
    (8|9|10|14) kind=laptop ;;
    (3|4|5|6|7|11|13) kind=desktop ;;
    (*) kind=unknown ;;
  esac
  printf 'nickname\t%s\ndeviceType\t%s\nos\tlinux\n' "$model" "$kind"
  awk -F= '$1 == "PRETTY_NAME" { gsub(/^"|"$/, "", $2); print "osVersion\t" $2; exit }' /etc/os-release 2>/dev/null
  awk -F: '/^model name/ { sub(/^[[:space:]]+/, "", $2); print "cpu\t" $2; exit }' /proc/cpuinfo 2>/dev/null
  awk '/^MemTotal:/ { printf "ram\t%.2f GiB\n", $2 / 1048576; exit }' /proc/meminfo 2>/dev/null
  if command -v lspci >/dev/null 2>&1; then lspci 2>/dev/null | awk -F: '/VGA compatible controller|3D controller/ { sub(/^[[:space:]]+/, "", $3); print "gpu\t" $3; exit }'; fi
  if command -v lsblk >/dev/null 2>&1; then lsblk -dn -o NAME,SIZE,TYPE 2>/dev/null | awk '$3 == "disk" { printf "storage\t%s (%s)\n", $1, $2; exit }'; fi
})
printf '%s\n' "$result"
if command -v wl-copy >/dev/null 2>&1; then printf '%s' "$result" | wl-copy
elif command -v xclip >/dev/null 2>&1; then printf '%s' "$result" | xclip -selection clipboard
elif command -v xsel >/dev/null 2>&1; then printf '%s' "$result" | xsel --clipboard --input
fi
printf 'If clipboard support is unavailable, copy the result above into Hanno.\n' >&2`;

export const collectors = {
  powershell: { label: 'Windows PowerShell', command: windowsCollector },
  cmd: { label: 'Windows CMD', command: cmdCollector },
  mac: { label: 'macOS Terminal (zsh/bash)', command: macCollector },
  linux: { label: 'Linux Terminal (bash)', command: linuxCollector },
} as const;
export type CollectorId = keyof typeof collectors;

export type ProfileImport = { ok: true; profile: PcProfile; fields: (keyof PcProfile)[] } | { ok: false; message: string };
export function parseProfileImport(raw: string): ProfileImport {
  if (!raw.trim()) return { ok: false, message: '복사한 사양 정보를 먼저 붙여넣어 주세요.' };
  if (raw.length > 20000) return { ok: false, message: '가져올 내용이 너무 길어요. 수집 명령에서 복사한 사양 정보만 붙여넣어 주세요.' };
  let parsed: unknown;
  try {
    const clean = raw.replace(/^\uFEFF/, '').trim();
    if (clean.startsWith('hanno-specs-v1\t')) {
      const lines = clean.split(/\r?\n/);
      const platform = lines.shift()?.split('\t')[1];
      if (platform !== 'macos' && platform !== 'linux') throw new Error('Unsupported platform');
      const profile: Record<string, string> = {};
      for (const line of lines) {
        if (!line.trim()) continue;
        const separator = line.indexOf('\t');
        if (separator < 0) throw new Error('Invalid field');
        const key = line.slice(0, separator);
        if (Object.hasOwn(emptyProfile, key) && key !== 'os') profile[key] = line.slice(separator + 1);
      }
      parsed = { source: 'hanno-specs', version: 1, profile: { ...profile, os: platform } };
    } else parsed = JSON.parse(clean);
  } catch { return { ok: false, message: '사양 정보의 형식을 읽지 못했어요. 수집 결과 전체를 빠짐없이 붙여넣어 주세요.' }; }
  if (!parsed || typeof parsed !== 'object' || !('source' in parsed) || !['hanno-windows-specs', 'hanno-specs'].includes(String(parsed.source)) || !('version' in parsed) || parsed.version !== 1 || !('profile' in parsed) || !parsed.profile || typeof parsed.profile !== 'object' || Array.isArray(parsed.profile)) return { ok: false, message: '앱에서 제공하는 수집 명령의 결과만 지원해요.' };
  const data = parsed.profile as Record<string, unknown>;
  if (Object.keys(emptyProfile).some(key => data[key] !== undefined && typeof data[key] !== 'string')) return { ok: false, message: '일부 항목의 형식이 올바르지 않아요. 수집 명령으로 다시 복사해 주세요.' };
  const profile = normalizeProfile(parsed.profile);
  const fields = (Object.keys(emptyProfile) as (keyof PcProfile)[]).filter(key => profile[key] !== '' && profile[key] !== 'unknown');
  if (!fields.length) return { ok: false, message: '적용할 사양 항목이 없어요. 수집 결과를 다시 확인해 주세요.' };
  return { ok: true, profile, fields };
}
export function mergeImportedProfile(current: PcProfile, imported: Extract<ProfileImport, { ok: true }>): PcProfile {
  const next = { ...current };
  for (const key of imported.fields) Object.assign(next, { [key]: imported.profile[key] });
  return normalizeProfile(next);
}
