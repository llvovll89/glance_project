import { useState } from 'react';
import { Textarea } from '@mantine/core';
import { profileLines } from './pc-profile';
import { parseProfileImport, windowsCollector, type ProfileImport } from './pc-import';

export default function PcImport({ onApply }: { onApply: (data: Extract<ProfileImport, { ok: true }>) => void }) {
  const [open, setOpen] = useState(false);
  const [raw, setRaw] = useState('');
  const [preview, setPreview] = useState<Extract<ProfileImport, { ok: true }> | null>(null);
  const [status, setStatus] = useState('');
  async function copy() {
    try { await navigator.clipboard.writeText(windowsCollector); setStatus('수집 명령을 복사했어요. Windows PowerShell에 붙여넣고 실행해 주세요.'); }
    catch { setStatus('복사하지 못했어요. 아래 ‘수집 명령 보기’를 펼쳐 명령을 직접 복사할 수 있어요.'); }
  }
  function inspect() { const result = parseProfileImport(raw); if (!result.ok) { setPreview(null); setStatus(result.message); return; } setPreview(result); setStatus(`${result.fields.length}개 항목을 찾았어요. 아래 내용을 확인한 뒤 입력칸에 적용해 주세요.`); }
  return <section className="pc-import" aria-labelledby="pc-import-title"><div className="pc-import-heading"><div><span className="pc-import-symbol icon" aria-hidden="true" style={{ maskImage: 'url(/icons/PlugsConnected.svg)' }}/><h3 id="pc-import-title">Windows 사양, 한 번에 가져오기</h3><p>CPU·RAM·그래픽·저장장치·OS를 읽고 입력칸을 채워요.</p></div><button type="button" className="button button-secondary" aria-expanded={open} aria-controls="pc-import-content" onClick={() => setOpen(value => !value)}>{open ? '가져오기 접기' : '사양 가져오기'}</button></div>
    {open && <div id="pc-import-content" className="pc-import-content"><ol className="pc-import-steps"><li><strong>수집 명령 복사</strong><p>Windows 기기의 기본 시스템 정보만 읽어요. 계정 이름·일련번호는 가져오지 않아요.</p><button type="button" className="button button-secondary" onClick={copy}>수집 명령 복사</button></li><li><strong>PowerShell에서 실행</strong><p>시작 메뉴에서 Windows PowerShell을 열고 붙여넣은 뒤 Enter를 눌러요. 결과가 클립보드에 복사돼요.</p></li><li><strong>결과 붙여넣고 확인</strong><p>아래에 Ctrl+V로 붙여넣어요. 내용 확인 후 적용하며, 저장은 따로 할 수 있어요.</p></li></ol>
      <p className="pc-import-note">Windows PC에서 사용하는 기능이에요. 수집 결과는 기기의 Windows가 보고하는 정보이며, 가상 머신·외장 기기 구성에 따라 표시가 달라질 수 있어요. 이 과정에서 서버로 전송하지 않아요.</p>
      <details className="pc-collector-details"><summary>수집 명령 보기</summary><pre>{windowsCollector}</pre><a href="https://learn.microsoft.com/en-us/powershell/scripting/samples/collecting-information-about-computers" target="_blank" rel="noreferrer">Microsoft 시스템 정보 조회 안내</a></details>
      <label className="pc-import-label" htmlFor="pc-import-data">복사한 사양 정보</label><Textarea className="pc-import-textarea" id="pc-import-data" value={raw} maxLength={20000} rows={5} resize="vertical" spellCheck={false} placeholder="PowerShell 실행 후 이곳에 Ctrl+V로 붙여넣으세요." onChange={event => { setRaw(event.target.value); setPreview(null); setStatus(''); }}/><button className="button button-secondary pc-inspect-button" type="button" onClick={inspect}>가져온 내용 확인</button>
      {preview && <div className="pc-import-preview"><h4>입력칸에 적용할 정보</h4><ul>{profileLines(preview.profile).map(line => <li key={line}>{line}</li>)}</ul><p>값이 있는 항목만 현재 입력을 바꿔요. 수집되지 않은 항목은 그대로 유지해요.</p><button type="button" className="button button-primary" onClick={() => { onApply(preview); setPreview(null); setRaw(''); setStatus('입력칸에 적용했어요. 내용을 살펴본 뒤 ‘내 PC 사양 저장’을 눌러 주세요.'); }}>입력칸에 적용</button></div>}
      <p role="status" className="pc-import-status">{status}</p></div>}
  </section>;
}
