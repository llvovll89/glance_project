import assert from 'node:assert/strict';
import { createServer } from 'vite';

const server = await createServer({ server: { middlewareMode: true, hmr: false }, appType: 'custom' });
try {
  const progress = await server.ssrLoadModule('/src/guide-progress.ts');
  const { guides } = await server.ssrLoadModule('/src/content.ts');
  const data = new Map();
  const storage = { getItem: key => data.get(key) ?? null, setItem: (key, value) => data.set(key, value), removeItem: key => data.delete(key) };
  const sample = { guideId: 'display', step: 1, reviewed: [0] };
  assert.equal(progress.readGuideProgress(guides, storage), null);
  assert.equal(progress.saveGuideProgress(sample, guides, storage), true);
  assert.deepEqual(progress.readGuideProgress(guides, storage), sample);
  const branched = { guideId: 'network', step: 3, reviewed: [0], answers: [{ step: 0, choiceId: 'all-devices' }] };
  assert.equal(progress.saveGuideProgress(branched, guides, storage), true);
  assert.deepEqual(progress.readGuideProgress(guides, storage), branched);
  for (const answers of [null, {}, [null], [{ step: -1, choiceId: 'all-devices' }], [{ step: 0, choiceId: 'unknown' }], [{ step: 1, choiceId: 'working' }], [{ step: 0, choiceId: 'all-devices' }, { step: 0, choiceId: 'pc-only' }]]) {
    assert.equal(progress.saveGuideProgress({ ...branched, answers }, guides, storage), false);
  }
  assert.equal(progress.deleteGuideProgress(storage), true);
  assert.equal(progress.readGuideProgress(guides, storage), null);
  const guideWithVariants = guides.find(guide => guide.variants?.some(variant => !variant.guideId));
  if (guideWithVariants) {
    const variant = guideWithVariants.variants.find(option => !option.guideId);
    const selected = { guideId: guideWithVariants.id, step: variant.step, reviewed: [], variant: variant.id };
    assert.equal(progress.saveGuideProgress(selected, guides, storage), true);
    assert.deepEqual(progress.readGuideProgress(guides, storage), selected);
  }
  for (const invalid of [
    { guideId: 'missing', step: 0, reviewed: [] },
    { guideId: 'display', step: -1, reviewed: [] },
    { guideId: 'display', step: 999, reviewed: [] },
    { guideId: 'display', step: 1, reviewed: [0, 0] },
    { guideId: 'display', step: 1, reviewed: [99] },
    { guideId: 'display', step: 1, reviewed: [], variant: 'unknown' },
  ]) assert.equal(progress.saveGuideProgress(invalid, guides, storage), false);
  for (const raw of ['broken JSON', 'null', '[]', '{"version":2,"progress":{"guideId":"display","step":0,"reviewed":[]}}', 'X'.repeat(2001)]) {
    data.set(progress.GUIDE_PROGRESS_KEY, raw);
    assert.equal(progress.readGuideProgress(guides, storage), null);
  }
  const blocked = { getItem() { throw Error('Blocked'); }, setItem() { throw Error('Blocked'); }, removeItem() { throw Error('Blocked'); } };
  assert.equal(progress.readGuideProgress(guides, blocked), null);
  assert.equal(progress.saveGuideProgress(sample, guides, blocked), false);
  assert.equal(progress.deleteGuideProgress(blocked), false);
  console.log('PASS: diagnosis progress save, restore, delete, schema validation and blocked storage');
} finally { await server.close(); }
