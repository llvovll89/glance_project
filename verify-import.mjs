import assert from 'node:assert/strict';
import { createServer } from 'vite';
import { mkdtempSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { spawnSync } from 'node:child_process';
const server = await createServer({ server: { middlewareMode: true, hmr: false }, appType: 'custom' });
try {
  const imp = await server.ssrLoadModule('/src/pc-import.ts');
  const { emptyProfile } = await server.ssrLoadModule('/src/pc-profile.ts');
  const good = JSON.stringify({ source: 'hanno-windows-specs', version: 1, profile: { cpu: 'Example processor', ram: '32 GiB', gpu: 'Example graphics', os: 'windows11' } });
  const parsed = imp.parseProfileImport(good);
  assert.equal(parsed.ok, true); assert.equal(parsed.fields.length, 4);
  const current = { ...emptyProfile, nickname: 'Keep my name', storage: 'Keep storage', deviceType: 'laptop' };
  const merged = imp.mergeImportedProfile(current, parsed);
  assert.equal(merged.cpu, 'Example processor'); assert.equal(merged.nickname, current.nickname); assert.equal(merged.storage, current.storage); assert.equal(merged.deviceType, current.deviceType);
  for (const text of ['', 'bad JSON', 'null', '[]', '{"version":1,"profile":{}}', JSON.stringify({ source: 'hanno-windows-specs', version: 2, profile: { cpu: 'no' } }), JSON.stringify({ source: 'hanno-windows-specs', version: 1, profile: { ram: 32 } }), JSON.stringify({ source: 'hanno-windows-specs', version: 1, profile: { os: 'unknown' } }), 'X'.repeat(20001)]) assert.equal(imp.parseProfileImport(text).ok, false);
  const unknown = imp.parseProfileImport(JSON.stringify({ source: 'hanno-windows-specs', version: 1, profile: { cpu: 'CPU', serialNumber: 'do not import', account: 'ignore' } }));
  assert.equal(unknown.ok, true); assert.equal('serialNumber' in unknown.profile, false); assert.equal('account' in unknown.profile, false);
  for (const platform of ['macos', 'linux']) {
    const result = imp.parseProfileImport(`hanno-specs-v1\t${platform}\nnickname\tExample device\ncpu\tExample processor\nram\t16 GiB\nos\twindows11\nserialNumber\tprivate`);
    assert.equal(result.ok, true); assert.equal(result.profile.os, platform); assert.equal(result.profile.cpu, 'Example processor'); assert.equal(result.profile.nickname, 'Example device'); assert.equal('serialNumber' in result.profile, false);
    assert.equal(imp.parseProfileImport(`hanno-specs-v1\t${platform}\ninvalid-line`).ok, false);
  }
  assert.equal(imp.parseProfileImport('hanno-specs-v1\tother\ncpu\tExample processor').ok, false);
  assert.match(imp.cmdCollector, /^powershell\.exe -NoProfile -EncodedCommand /);
  assert.ok(imp.cmdCollector.length < 8191, 'CMD command exceeds the Windows command-line limit');
  assert.equal(Buffer.from(imp.cmdCollector.split(' ').at(-1), 'base64').toString('utf16le'), imp.windowsCollector);
  const root = mkdtempSync(join(tmpdir(), 'hanno-collector-test-'));
  const collectorPath = join(root, 'collector.ps1');
  writeFileSync(collectorPath, imp.windowsCollector);
  const parseOnly = '$tokens=$null; $errors=$null; [void][System.Management.Automation.Language.Parser]::ParseFile($env:HANNO_COLLECTOR_TEST,[ref]$tokens,[ref]$errors); if($errors.Count){$errors | ForEach-Object { Write-Error $_.Message }; exit 1}; Write-Output "COLLECTOR_SYNTAX_PASS"';
  const result = spawnSync('powershell.exe', ['-NoProfile', '-NonInteractive', '-Command', parseOnly], { encoding: 'utf8', windowsHide: true, env: { ...process.env, HANNO_COLLECTOR_TEST: collectorPath } });
  assert.equal(result.status, 0, result.stderr || result.error?.message); assert.match(result.stdout, /COLLECTOR_SYNTAX_PASS/);
  const mockHardware = `function Get-CimInstance { param([string]$ClassName)
    switch ($ClassName) {
      Win32_ComputerSystem { [pscustomobject]@{ Model='Test PC'; PCSystemType=1 } }
      Win32_OperatingSystem { [pscustomobject]@{ Caption='Windows 11'; Version='10.0'; BuildNumber='12345' } }
      Win32_Processor { [pscustomobject]@{ Name='Test CPU' } }
      Win32_PhysicalMemory { [pscustomobject]@{ Capacity=17179869184 } }
      Win32_VideoController { [pscustomobject]@{ Name='Test GPU' } }
      Win32_DiskDrive { [pscustomobject]@{ Model='Test SSD'; Size=512000000000 } }
    }
  }
  function Set-Clipboard { param($Value) }
  `;
  const cmdResult = spawnSync('cmd.exe', ['/d', '/s', '/c', imp.powerShellForCmd(mockHardware + imp.windowsCollector)], { encoding: 'utf8', windowsHide: true });
  assert.equal(cmdResult.status, 0, cmdResult.stderr || cmdResult.error?.message);
  assert.match(cmdResult.stdout, /"cpu"\s*:\s*"Test CPU"/);
  assert.match(cmdResult.stdout, /"ram"\s*:\s*"16 GiB"/);
  for (const platform of ['mac', 'linux']) {
    const shellPath = join(root, `${platform}.sh`);
    writeFileSync(shellPath, imp.collectors[platform].command);
    const syntax = spawnSync('bash', ['-n', shellPath], { encoding: 'utf8', windowsHide: true });
    assert.equal(syntax.status, 0, syntax.stderr || syntax.error?.message);
  }
  console.log('PASS: Windows/macOS/Linux import schema, invalid data, preview merge, unknown field exclusion, CMD execution with mocked hardware and PowerShell/shell syntax; real hardware is not queried in tests');
} finally { await server.close(); }
