import assert from 'node:assert/strict';
import { createServer } from 'vite';

const server = await createServer({ server: { middlewareMode: true, hmr: false }, appType: 'custom' });
try {
  const history = await server.ssrLoadModule('/src/diagnosis-history.ts');
  const { guides } = await server.ssrLoadModule('/src/content.ts');
  const progress = await server.ssrLoadModule('/src/guide-progress.ts');
  const data = new Map();
  const storage = { getItem: key => data.get(key) ?? null, setItem: (key, value) => data.set(key, value), removeItem: key => data.delete(key) };
  const draft = { guideId: 'network', step: 1, reviewed: [0, 1], answers: [{ step: 0, choiceId: 'pc-only' }, { step: 1, choiceId: 'working' }], note: '  재연결하니 해결됨\n다른 사이트도 확인함  ', historyId: 'history-sample' };
  assert.ok(progress.saveGuideProgress(draft, guides, storage));
  assert.deepEqual(progress.readGuideProgress(guides, storage), draft);
  const escapedNote = { ...draft, note: '\n'.repeat(1000) };
  assert.ok(progress.saveGuideProgress(escapedNote, guides, storage));
  assert.deepEqual(progress.readGuideProgress(guides, storage), escapedNote, 'Escaped note content must fit the draft serialization limit');
  for (const invalid of [{ ...draft, note: 'X'.repeat(1001) }, { ...draft, note: 3 }, { ...draft, historyId: '<invalid>' }, { ...draft, historyId: '' }]) assert.equal(progress.saveGuideProgress(invalid, guides, storage), false);
  const record = history.createDiagnosisRecord(guides.find(guide => guide.id === 'network'), draft, 'resolved', ['CPU: 예시']);
  assert.equal(record.id, 'history-sample');
  assert.equal(record.note, draft.note.trim());
  assert.equal(record.checked.length, 2);
  assert.equal(record.answers[1].answer, '이제 여러 사이트가 잘 열려요');
  assert.ok(history.writeDiagnosisHistory([record], storage));
  assert.deepEqual(history.readDiagnosisHistory(storage), [record]);
  assert.ok(progress.deleteGuideProgress(storage));
  assert.deepEqual(history.readDiagnosisHistory(storage), [record], 'Ending a draft must preserve history');
  const updated = { ...record, status: 'unresolved', note: '수정한 메모', recordedAt: '2026-10-29T12:00:00.000Z' };
  const replaced = history.upsertDiagnosisRecord([record], updated);
  assert.equal(replaced.length, 1, 'Saving the same check twice must not duplicate history');
  assert.equal(replaced[0].recordedAt, record.recordedAt);
  assert.equal(replaced[0].note, updated.note);
  const report = history.diagnosisReport(record);
  for (const text of [record.title, record.note, record.answers[0].answer, 'CPU: 예시', '사용자가 해결됨으로 표시']) assert.ok(report.includes(text));
  assert.ok(history.diagnosisReport(updated).includes('추가 확인 필요'));
  const full = Array.from({ length: history.HISTORY_LIMIT }, (_, i) => ({ ...record, id: `history-${i}` }));
  assert.ok(history.writeDiagnosisHistory(full, storage));
  assert.equal(history.writeDiagnosisHistory([...full, record], storage), false);
  assert.equal(history.readDiagnosisHistory(storage).length, history.HISTORY_LIMIT, 'Capacity failure must preserve existing records');
  for (const invalid of [{ ...record, status: 'unknown' }, { ...record, note: 'X'.repeat(1001) }, { ...record, recordedAt: 'yesterday' }, { ...record, checked: [null] }, { ...record, answers: [{ question: '', answer: 2 }] }]) assert.equal(history.writeDiagnosisHistory([invalid], storage), false);
  assert.equal(history.writeDiagnosisHistory([record, record], storage), false);
  data.set(history.HISTORY_KEY, JSON.stringify({ version: 1, records: [null, record, { ...record, id: 'other', status: 'bad' }, record] }));
  assert.deepEqual(history.readDiagnosisHistory(storage), [record], 'Retain valid records and ignore damaged or duplicate entries');
  for (const raw of ['broken JSON', 'null', '[]', '{"version":2,"records":[]}', 'X'.repeat(500001)]) {
    data.set(history.HISTORY_KEY, raw);
    assert.deepEqual(history.readDiagnosisHistory(storage), []);
  }
  const blocked = { getItem() { throw Error('Blocked'); }, setItem() { throw Error('Blocked'); }, removeItem() { throw Error('Blocked'); } };
  assert.deepEqual(history.readDiagnosisHistory(blocked), []);
  assert.equal(history.writeDiagnosisHistory([record], blocked), false);
  assert.ok(history.writeDiagnosisHistory([], storage));
  assert.deepEqual(history.readDiagnosisHistory(storage), []);
  console.log('PASS: history snapshots, draft compatibility, report content, upsert, capacity, malformed records and blocked storage');
} finally { await server.close(); }
