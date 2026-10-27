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
      Write-Host 'PC specs copied. Paste into the Hanno import box.'
    } catch {
      Write-Host 'Clipboard unavailable. Copy the JSON below instead:'
      $pcSpecsJson
    }
  } catch {
    Write-Host 'Could not read Windows hardware information. Use manual entry or check with your administrator.'
  }
}`;

export type ProfileImport = { ok: true; profile: PcProfile; fields: (keyof PcProfile)[] } | { ok: false; message: string };
export function parseProfileImport(raw: string): ProfileImport {
  if (!raw.trim()) return { ok: false, message: 'Windows에서 복사한 사양 정보를 먼저 붙여넣어 주세요.' };
  if (raw.length > 20000) return { ok: false, message: '가져올 내용이 너무 길어요. 수집 명령에서 복사한 사양 정보만 붙여넣어 주세요.' };
  let parsed: unknown;
  try { parsed = JSON.parse(raw.replace(/^\uFEFF/, '').trim()); } catch { return { ok: false, message: '사양 정보의 형식을 읽지 못했어요. 수집 결과 전체를 빠짐없이 붙여넣어 주세요.' }; }
  if (!parsed || typeof parsed !== 'object' || !('source' in parsed) || parsed.source !== 'hanno-windows-specs' || !('version' in parsed) || parsed.version !== 1 || !('profile' in parsed) || !parsed.profile || typeof parsed.profile !== 'object' || Array.isArray(parsed.profile)) return { ok: false, message: '이 가져오기는 앱에서 제공하는 Windows 수집 명령의 결과를 지원해요.' };
  const data = parsed.profile as Record<string, unknown>;
  if (Object.keys(emptyProfile).some(key => data[key] !== undefined && typeof data[key] !== 'string')) return { ok: false, message: '일부 항목의 형식이 올바르지 않아요. Windows 수집 명령으로 다시 복사해 주세요.' };
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
