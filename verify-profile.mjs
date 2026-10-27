import assert from 'node:assert/strict';
import { createServer } from 'vite';
import { createElement } from 'react';
import { renderToString } from 'react-dom/server';
const server = await createServer({ server: { middlewareMode: true, hmr: false }, appType: 'custom' });
try {
  const p = await server.ssrLoadModule('/src/pc-profile.ts');
  const { topics } = await server.ssrLoadModule('/src/content.ts');
  const data = new Map();
  const storage = { getItem: key => data.get(key) ?? null, setItem: (key, value) => data.set(key, value), removeItem: key => data.delete(key) };
  assert.equal(p.readPcProfile(storage), null);
  assert.equal(p.savePcProfile(p.emptyProfile, storage), false);
  const profile = p.normalizeProfile({ nickname: '  My PC  ', deviceType: 'laptop', os: 'windows11', cpu: 'Example CPU', ram: '16 GB', gpu: 'Example GPU', storage: 'SSD 512 GB', osVersion: '24H2', extra: 'ignore' });
  assert.equal(p.savePcProfile(profile, storage), true);
  assert.deepEqual(p.readPcProfile(storage), profile, 'Refresh restores the saved profile');
  assert.equal(profile.nickname, 'My PC');
  assert.ok(p.profileLines(profile).includes('RAM: 16 GB'));
  assert.ok(p.profileLines(profile).includes('운영체제: Windows 11'));
  for (const id of p.profileTopicIds(profile)) assert.ok(topics.some(topic => topic.id === id), `Existing recommendation target ${id}`);
  assert.ok(p.profileTopicIds(profile).includes('cooling'));
  assert.ok(!p.profileTopicIds(profile).includes('power'));
  assert.equal(p.deletePcProfile(storage), true);
  assert.equal(p.readPcProfile(storage), null);
  for (const invalid of ['broken JSON', 'null', '[]', '{"version":2,"profile":{"cpu":"Future"}}', '{"version":1,"profile":{"cpu":42}}']) { data.set(p.PROFILE_KEY, invalid); assert.equal(p.readPcProfile(storage), null); }
  const blocked = { getItem() { throw Error('Blocked'); }, setItem() { throw Error('Quota exceeded'); }, removeItem() { throw Error('Blocked'); } };
  assert.equal(p.readPcProfile(blocked), null);
  assert.equal(p.savePcProfile(profile, blocked), false);
  assert.equal(p.deletePcProfile(blocked), false);
  const cleaned = p.normalizeProfile({ os: 'toString', deviceType: 'spaceship', cpu: 'X'.repeat(200), ram: { invalid: true }, gpu: 'A\nB' });
  assert.equal(cleaned.os, 'unknown'); assert.equal(cleaned.deviceType, 'unknown'); assert.equal(cleaned.cpu.length, 80); assert.equal(cleaned.ram, ''); assert.equal(cleaned.gpu, 'A B');
  const { default: Panel } = await server.ssrLoadModule('/src/PcProfile.tsx');
  const populated = renderToString(createElement(Panel, { profile, onSave() {}, onTopic() {}, onGuide() {} }));
  assert.ok(populated.includes('My PC')); assert.ok(populated.includes('16 GB')); assert.ok(populated.includes('pc-ram-help'));
  const empty = renderToString(createElement(Panel, { profile: null, onSave() {}, onTopic() {}, onGuide() {} }));
  assert.ok(empty.includes('사양 기록하기'));
  const mac = renderToString(createElement(Panel, { profile: { ...profile, os: 'macos' }, onSave() {}, onTopic() {}, onGuide() {} }));
  assert.ok(mac.includes('pc-platform-note')); assert.ok(!mac.includes('필요할 때 확인할 가이드'));
  console.log('PASS: profile save/read/delete, malformed data, unsupported schema, blocked storage, input normalization, topic targets, populated/empty/non-Windows rendering');
} finally { await server.close(); }
