import { useState } from 'react';
import { Select, Textarea } from '@mantine/core';
import { profileLines } from './pc-profile';
import { collectors, parseProfileImport, windowsCollector, type CollectorId, type ProfileImport } from './pc-import';

export default function PcImport({ onApply }: { onApply: (data: Extract<ProfileImport, { ok: true }>) => void }) {
  const [open, setOpen] = useState(false);
  const [collectorId, setCollectorId] = useState<CollectorId>('powershell');
  const [raw, setRaw] = useState('');
  const [preview, setPreview] = useState<Extract<ProfileImport, { ok: true }> | null>(null);
  const [status, setStatus] = useState('');
  const collector = collectors[collectorId];

  async function copy() {
    try {
      await navigator.clipboard.writeText(collector.command);
      setStatus(`${collector.label} 명령을 복사했어요. 터미널에 붙여넣고 실행해 주세요.`);
    } catch {
      setStatus('명령을 복사하지 못했어요. 아래 명령 보기에서 직접 복사해 주세요.');
    }
  }
  function inspect(value = raw) {
    const result = parseProfileImport(value);
    setRaw(value);
    if (!result.ok) { setPreview(null); setStatus(result.message); return; }
    setPreview(result);
    setStatus(`${result.fields.length}개 항목을 찾았어요. 내용을 확인한 뒤 입력칸에 적용해 주세요.`);
  }
  async function importClipboard() {
    try { inspect(await navigator.clipboard.readText()); }
    catch { setStatus('클립보드를 읽지 못했어요. 아래 칸에 Ctrl+V 또는 ⌘+V로 붙여넣어 주세요.'); }
  }

  return <section className="pc-import" aria-labelledby="pc-import-title"><div className="pc-import-heading"><div><span className="pc-import-symbol icon" aria-hidden="true" style={{ maskImage: 'url(/icons/PlugsConnected.svg)' }}/><h3 id="pc-import-title">내 PC 사양 가져오기</h3><p>Windows·macOS·Linux에서 확인한 사양을 입력칸에 채워요.</p></div><button type="button" className="button button-secondary" aria-expanded={open} aria-controls="pc-import-content" onClick={() => setOpen(value => !value)}>{open ? '가져오기 접기' : '사양 가져오기'}</button></div>
    {open && <div id="pc-import-content" className="pc-import-content">
      <Select className="pc-import-platform" label="운영체제와 터미널" data={Object.entries(collectors).map(([value, item]) => ({ value, label: item.label }))} value={collectorId} onChange={value => { if (value && value in collectors) { setCollectorId(value as CollectorId); setStatus(''); } }} allowDeselect={false}/>
      <ol className="pc-import-steps"><li><strong>명령 복사</strong><p>아래 명령을 직접 확인하고 복사하세요. 계정 이름·일련번호는 수집하지 않아요.</p><button type="button" className="button button-secondary" onClick={copy}>수집 명령 복사</button></li><li><strong>{collector.label}에서 실행</strong><p>터미널에 붙여넣고 Enter를 누르세요. 사양 결과가 화면에 표시되고 가능한 경우 클립보드에도 복사돼요.</p></li><li><strong>결과 확인 후 적용</strong><p>클립보드 가져오기를 누르거나 아래에 결과만 붙여넣고, 미리보기를 확인해 주세요.</p></li></ol>
      <p className="pc-import-note">{collectorId === 'cmd' && 'CMD 명령은 PowerShell을 호출해 실행해요. 긴 스크립트의 줄바꿈을 보존하려고 UTF-16으로 인코딩했으며, 실제 스크립트는 아래에서 확인할 수 있어요. '}웹사이트는 보안상 정확한 CPU·그래픽·저장장치 정보를 한 번의 클릭으로 읽을 수 없어요. 명령은 내 기기에서만 실행되며 결과는 이 과정에서 서버로 전송하지 않아요. 가상 머신·외장 장치에서는 일부 값이 다를 수 있어요.</p>
      <details className="pc-collector-details"><summary>수집 명령 보기</summary><pre>{collector.command}</pre>{collectorId === 'cmd' && <><p>CMD가 실행하는 PowerShell 스크립트</p><pre>{windowsCollector}</pre></>}</details>
      <label className="pc-import-label" htmlFor="pc-import-data">복사한 사양 정보</label><Textarea className="pc-import-textarea" id="pc-import-data" value={raw} maxLength={20000} rows={5} resize="vertical" spellCheck={false} placeholder="수집 결과를 붙여넣거나 클립보드에서 가져오세요." onChange={event => { setRaw(event.target.value); setPreview(null); setStatus(''); }}/>
      <div className="pc-import-actions"><button className="button button-secondary" type="button" onClick={importClipboard}>클립보드에서 가져오기</button><button className="button button-secondary" type="button" onClick={() => inspect()}>붙여넣은 내용 확인</button></div>
      {preview && <div className="pc-import-preview"><h4>입력칸에 적용할 정보</h4><ul>{profileLines(preview.profile).map(line => <li key={line}>{line}</li>)}</ul><p>값이 있는 항목만 현재 입력에 반영해요. 수집하지 않은 항목은 그대로 유지해요.</p><button type="button" className="button button-primary" onClick={() => { onApply(preview); setPreview(null); setRaw(''); setStatus('입력칸에 적용했어요. 내용을 살펴본 뒤 내 PC 사양 저장을 눌러 주세요.'); }}>입력칸에 적용</button></div>}
      <p role="status" className="pc-import-status">{status}</p></div>}
  </section>;
}
