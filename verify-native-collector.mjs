import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { createServer } from 'vite';

const server = await createServer({ server: { middlewareMode: true, hmr: false }, appType: 'custom' });
try {
  const { windowsCollector, macCollector, linuxCollector, powerShellForCmd, parseProfileImport } = await server.ssrLoadModule('/src/pc-import.ts');
  const platform = process.platform;
  const commands = [];
  if (platform === 'win32') {
    // Hardware calls are real. Only clipboard writes are isolated from the host.
    const prefix = '[Console]::OutputEncoding = [System.Text.UTF8Encoding]::new($false); function Set-Clipboard { param($Value) };\n';
    commands.push(['PowerShell', 'powershell.exe', ['-NoProfile', '-NonInteractive', '-Command', prefix + windowsCollector]]);
    commands.push(['CMD', 'cmd.exe', ['/d', '/s', '/c', powerShellForCmd(prefix + windowsCollector)]]);
  } else if (platform === 'darwin') {
    commands.push(['macOS bash', '/bin/bash', ['-s'], 'pbcopy() { cat > /dev/null; }\n' + macCollector]);
    commands.push(['macOS zsh', '/bin/zsh', ['-s'], 'pbcopy() { cat > /dev/null; }\n' + macCollector]);
  } else if (platform === 'linux') {
    commands.push(['Linux bash', '/bin/bash', ['-s'], 'wl-copy() { cat > /dev/null; }\n' + linuxCollector]);
  } else throw new Error(`Unsupported native collector platform: ${platform}`);

  for (const [label, command, args, input] of commands) {
    const result = spawnSync(command, args, { input, encoding: 'utf8', windowsHide: true, timeout: 45_000, maxBuffer: 256_000 });
    assert.equal(result.status, 0, `${label} failed: ${result.error?.message ?? result.stderr}`);
    // Parse the complete stdout, including any unexpected notices. Never log specs.
    const parsed = parseProfileImport(result.stdout);
    assert.ok(parsed.ok, `${label}: complete collector stdout must be importable`);
    const allowed = new Set(['nickname', 'deviceType', 'os', 'osVersion', 'cpu', 'ram', 'gpu', 'storage']);
    const raw = result.stdout.trim();
    const fields = raw.startsWith('{') ? Object.keys(JSON.parse(raw).profile) : raw.split(/\r?\n/).slice(1).filter(Boolean).map(line => line.split('\t')[0]);
    assert.ok(fields.every(field => allowed.has(field)), `${label}: collector emitted a field outside the approved specification`);
    for (const field of ['cpu', 'ram', 'osVersion']) {
      assert.ok(parsed.fields.includes(field), `${label}: missing native ${field}`);
    }
    assert.ok(Number.parseFloat(parsed.profile.ram) > 0, `${label}: RAM must be positive`);
    if (platform !== 'win32') assert.equal(parsed.profile.os, platform === 'darwin' ? 'macos' : 'linux');
    console.log(`PASS: ${label}, real OS hardware queries, complete stdout parsed, ${parsed.fields.length} fields; clipboard isolated, values not logged`);
  }
} finally { await server.close(); }
