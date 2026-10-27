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
  const root = mkdtempSync(join(tmpdir(), 'hanno-collector-test-'));
  const collectorPath = join(root, 'collector.ps1');
  writeFileSync(collectorPath, imp.windowsCollector);
  const parseOnly = '$tokens=$null; $errors=$null; [void][System.Management.Automation.Language.Parser]::ParseFile($env:HANNO_COLLECTOR_TEST,[ref]$tokens,[ref]$errors); if($errors.Count){$errors | ForEach-Object { Write-Error $_.Message }; exit 1}; Write-Output "COLLECTOR_SYNTAX_PASS"';
  const result = spawnSync('powershell.exe', ['-NoProfile', '-NonInteractive', '-Command', parseOnly], { encoding: 'utf8', windowsHide: true, env: { ...process.env, HANNO_COLLECTOR_TEST: collectorPath } });
  assert.equal(result.status, 0, result.stderr || result.error?.message); assert.match(result.stdout, /COLLECTOR_SYNTAX_PASS/);
  console.log('PASS: import schema, invalid data, preview merge, unknown field exclusion, PowerShell collector syntax; collector execution is not tested (local script execution policy). No hardware queries or clipboard writes in tests');
} finally { await server.close(); }
