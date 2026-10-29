import { useRef, useState } from 'react';
import { Textarea } from '@mantine/core';
import { guides } from './content';
import { diagnosisReport, HISTORY_LIMIT, NOTE_LIMIT, type DiagnosisRecord } from './diagnosis-history';

function HistoryEntry({ record, onSave, onDelete, onRestart }: {
  record: DiagnosisRecord;
  onSave: (id: string, note: string) => boolean;
  onDelete: (id: string) => boolean;
  onRestart: (guideId: string) => void;
}) {
  const [note, setNote] = useState(record.note);
  const [status, setStatus] = useState('');
  async function copy() {
    try { await navigator.clipboard.writeText(diagnosisReport(record)); setStatus('저장된 점검 기록을 복사했어요.'); }
    catch { setStatus('복사하지 못했어요. 표시된 기록을 선택해서 직접 복사해 주세요.'); }
  }
  return <details className="history-entry">
    <summary><span className="history-entry-title"><strong>{record.title}</strong><time dateTime={record.recordedAt}>{new Date(record.recordedAt).toLocaleString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</time></span><span className={`history-status ${record.status}`}>{record.status === 'resolved' ? '해결됨' : '추가 확인 필요'}</span></summary>
    <div className="history-entry-body">
      {record.variant && <p className="history-variant">선택한 상황: {record.variant}</p>}
      <div className="history-facts"><div><h3>확인한 단계</h3>{record.checked.length ? <ul>{record.checked.map((title, index) => <li key={index}>{title}</li>)}</ul> : <p>확인 완료로 남긴 단계가 없어요.</p>}</div>
        <div><h3>선택한 확인 결과</h3>{record.answers.length ? <dl>{record.answers.map((answer, index) => <div key={index}><dt>{answer.question}</dt><dd>{answer.answer}</dd></div>)}</dl> : <p>선택한 결과가 없어요.</p>}</div>
      </div>
      {record.device.length > 0 && <details className="history-device"><summary>점검 당시의 PC 사양</summary><ul>{record.device.map((line, index) => <li key={index}>{line}</li>)}</ul></details>}
      <form className="history-note" onSubmit={event => { event.preventDefault(); setStatus(onSave(record.id, note.trim()) ? '메모를 저장했어요.' : '메모를 저장하지 못했어요. 작성한 내용은 유지되니 다시 시도해 주세요.'); }}>
        <Textarea label="메모 수정" value={note} onChange={event => { setNote(event.currentTarget.value); setStatus(''); }} maxLength={NOTE_LIMIT} autosize minRows={2} maxRows={6} />
        <div><small>{note.length} / {NOTE_LIMIT}자</small><button className="button button-secondary" type="submit" disabled={note.trim() === record.note}>메모 저장</button></div>
      </form>
      {note.trim() !== record.note && <p className="history-unsaved">메모를 수정 중이에요. 복사에는 마지막으로 저장한 메모가 포함돼요.</p>}
      <div className="history-entry-actions"><button type="button" className="button button-secondary" onClick={copy}>기록 복사</button><button type="button" className="button button-secondary" disabled={!guides.some(guide => guide.id === record.guideId)} onClick={() => onRestart(record.guideId)}>다시 점검</button><button type="button" className="text-button history-delete" onClick={() => { if (!onDelete(record.id)) setStatus('기록을 삭제하지 못했어요. 잠시 후 다시 시도해 주세요.'); }}>이 기록 삭제</button></div>
      {status && <p className="history-feedback" role="status">{status}</p>}
    </div>
  </details>;
}

export default function DiagnosisHistory({ records, onChange, onRestart }: {
  records: DiagnosisRecord[];
  onChange: (records: DiagnosisRecord[]) => boolean;
  onRestart: (guideId: string) => void;
}) {
  const [limit, setLimit] = useState(5);
  const [status, setStatus] = useState('');
  const heading = useRef<HTMLHeadingElement>(null);
  function saveNote(id: string, note: string) {
    return onChange(records.map(record => record.id === id ? { ...record, note } : record));
  }
  function remove(id: string) {
    if (!onChange(records.filter(record => record.id !== id))) return false;
    setStatus('선택한 점검 기록을 삭제했어요.');
    requestAnimationFrame(() => heading.current?.focus());
    return true;
  }
  return <section id="diagnosis-history" className="diagnosis-history" aria-labelledby="history-title">
    <div className="section-heading"><h2 id="history-title" ref={heading} tabIndex={-1}>점검 이력</h2><p>어떤 문제가 있었고, 어떻게 확인했는지 남겨 두세요.</p></div>
    <p className="history-storage">이 브라우저에 최대 {HISTORY_LIMIT}개를 보관해요. 사이트 데이터를 지우면 사라지며 다른 기기와 자동으로 동기화되지 않아요.</p>
    {records.length ? <>
      <p className="history-count">남겨 둔 기록 {records.length}개</p>
      <div className="history-list">{records.slice(0, limit).map(record => <HistoryEntry key={record.id} record={record} onSave={saveNote} onDelete={remove} onRestart={onRestart} />)}</div>
      {records.length > 5 && <button className="text-button history-more" type="button" onClick={() => setLimit(limit >= records.length ? 5 : limit + 5)}>{limit >= records.length ? '처음 5개만 보기' : `이력 ${Math.min(5, records.length - limit)}개 더 보기`}</button>}
    </> : <div className="history-empty"><h3>아직 남긴 점검 기록이 없어요.</h3><p>점검 중 ‘해결됐어요’ 또는 ‘미해결로 기록’을 누르면 확인한 내용과 메모를 여기에 보관해요.</p></div>}
    {status && <p className="history-feedback" role="status">{status}</p>}
  </section>;
}
