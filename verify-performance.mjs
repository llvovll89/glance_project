import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { gzipSync } from 'node:zlib';

const manifest = JSON.parse(readFileSync('dist/.vite/manifest.json', 'utf8'));
const initial = new Set();
function visit(key) {
  if (initial.has(key)) return;
  assert.ok(manifest[key], `Missing build chunk: ${key}`);
  initial.add(key);
  for (const dependency of manifest[key].imports ?? []) visit(dependency);
}
visit('index.html');
let bytes = 0;
let gzip = 0;
for (const key of initial) {
  const content = readFileSync(`dist/${manifest[key].file}`);
  bytes += content.length;
  gzip += gzipSync(content).length;
}
for (const feature of ['src/PcProfile.tsx', 'src/ShellLab.tsx', 'src/LearningLibrary.tsx']) {
  assert.ok(manifest[feature]?.isDynamicEntry, `Expected a deferred feature: ${feature}`);
  assert.ok(!initial.has(feature), `Feature is part of the initial download: ${feature}`);
}
assert.ok(bytes <= 550_000, `Initial JavaScript ${bytes} bytes exceeds the 550,000-byte budget`);
assert.ok(gzip <= 165_000, `Initial gzip JavaScript ${gzip} bytes exceeds the 165,000-byte budget`);
console.log(`PASS: initial JavaScript including static imports: ${bytes} bytes, ${gzip} gzip bytes; PC, lab and library deferred`);
