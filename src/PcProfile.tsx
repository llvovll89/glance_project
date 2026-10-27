import { useState, type FormEvent, type CSSProperties } from 'react';
import { Select, TextInput } from '@mantine/core';
import PcImport from './PcImport';
import { mergeImportedProfile } from './pc-import';
import { topics } from './content';
import { deletePcProfile, deviceNames, emptyProfile, hasProfileValues, normalizeProfile, osNames, profileLines, profileTopicIds, savePcProfile, type PcProfile } from './pc-profile';

const fields = [
  { key: 'cpu', icon: 'Cpu', label: 'CPU', example: '예: Intel Core i5-13400', help: '설정 > 시스템 > 정보의 프로세서 항목을 확인해요.' },
  { key: 'ram', icon: 'Memory', label: 'RAM 용량', example: '예: 16 GB', help: '설정 > 시스템 > 정보에서 설치된 RAM을 확인해요.' },
  { key: 'gpu', icon: 'GraphicsCard', label: '그래픽 장치', example: '예: NVIDIA GeForce RTX 4060', help: '시작 버튼을 오른쪽 클릭 > 장치 관리자 > 디스플레이 어댑터를 펼쳐요. 여러 개면 함께 기록해도 좋아요.' },
  { key: 'storage', icon: 'HardDrives', label: '저장장치와 용량', example: '예: SSD 512 GB', help: '설정 > 시스템 > 저장소에서 공간을 확인해요. 종류를 모르면 확인한 용량만 적어도 돼요.' },
] as const;

function FieldIcon({ name }: { name: string }) { return <span aria-hidden="true" className="icon" style={{ '--icon': 'url(/icons/' + name + '.svg)' } as CSSProperties}/>; }
export default function PcProfilePanel({ profile, onSave, onTopic, onGuide }: { profile: PcProfile | null; onSave: (profile: PcProfile | null) => void; onTopic: (id: string) => void; onGuide: (id: string) => void }) {
  const [draft, setDraft] = useState<PcProfile>(() => ({ ...(profile ?? emptyProfile) }));
  const [status, setStatus] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);
  const changed = JSON.stringify(normalizeProfile(draft)) !== JSON.stringify(profile ?? emptyProfile);
  const related = profile ? profileTopicIds(profile).map(id => topics.find(topic => topic.id === id)).filter(topic => topic !== undefined) : [];
  const filledCount = Object.values(normalizeProfile(draft)).filter(value => value && value !== 'unknown').length;
  const windows = profile && ['windows11', 'windows10'].includes(profile.os);
  function change<K extends keyof PcProfile>(key: K, value: PcProfile[K]) { setDraft(previous => ({ ...previous, [key]: value })); setStatus(''); setConfirmDelete(false); }
  function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const normalized = normalizeProfile(draft);
    if (!hasProfileValues(normalized)) { setStatus('아는 항목 하나만 입력해도 저장할 수 있어요.'); return; }
    if (!savePcProfile(normalized)) { setStatus('저장하지 못했어요. 브라우저의 사이트 저장소 허용 여부와 여유 공간을 확인해 주세요. 입력한 내용은 화면에 남아 있어요.'); return; }
    setDraft(normalized); onSave(normalized); setStatus('이 브라우저에 저장했어요. 새로고침해도 다시 볼 수 있어요.'); setConfirmDelete(false);
  }
  function remove() {
    if (!deletePcProfile()) { setStatus('삭제하지 못했어요. 브라우저의 사이트 저장소 설정을 확인해 주세요.'); return; }
    onSave(null); setDraft({ ...emptyProfile }); setConfirmDelete(false); setStatus('이 브라우저의 PC 사양 기록을 삭제했어요.');
  }
  return <section className="pc-page" aria-labelledby="pc-title">
    <div className="section-heading"><h2 id="pc-title">내 컴퓨터부터 알아볼까요?</h2><p>모르는 항목은 비워 두세요. 확인한 정보만 직접 기록해요.</p></div>
    <PcImport onApply={data => { setDraft(previous => mergeImportedProfile(previous, data)); setStatus('가져온 사양을 입력칸에 적용했어요. 확인 후 저장해 주세요.'); setConfirmDelete(false); }}/>
    <div className="pc-workspace">
      <form className="pc-form" onSubmit={save} aria-label="내 PC 사양 기록">
        <div className="pc-form-heading"><div><h3>{profile ? '저장한 사양 수정하기' : '내 PC 사양 기록하기'}</h3><span className="pc-field-count">{filledCount} / 8개 작성</span></div><span>{changed ? '아직 저장하지 않은 변경이 있어요' : profile ? '저장된 기록' : '모든 항목은 선택 사항이에요'}</span></div>
        <fieldset className="pc-fieldset"><legend>PC 기본 정보<span>기기를 구분할 정보예요</span></legend><div className="pc-fields">
          <div className="pc-field pc-field-wide"><label htmlFor="pc-nickname">PC 이름 또는 모델</label><TextInput className="pc-control" data-filled={Boolean(draft.nickname)} leftSection={<FieldIcon name="Desktop"/>} id="pc-nickname" value={draft.nickname} maxLength={80} placeholder="집 데스크톱, 노트북 모델명" onChange={e => change('nickname', e.target.value)} aria-describedby="pc-nickname-help"/><p id="pc-nickname-help">알아보기 쉬운 이름이나 구매 내역의 모델명을 적어 주세요.</p></div>
          <div className="pc-field"><label htmlFor="pc-device">기기 종류</label><Select className="pc-control" data-filled={draft.deviceType !== 'unknown'} leftSection={<FieldIcon name="Desktop"/>} id="pc-device" value={draft.deviceType} allowDeselect={false} data={Object.entries(deviceNames).map(([value, label]) => ({ value, label }))} onChange={value => { if (value) change('deviceType', value as PcProfile['deviceType']); }}/></div>
          <div className="pc-field"><label htmlFor="pc-os">운영체제</label><Select className="pc-control" data-filled={draft.os !== 'unknown'} leftSection={<FieldIcon name="SquaresFour"/>} id="pc-os" value={draft.os} allowDeselect={false} data={Object.entries(osNames).map(([value, label]) => ({ value, label }))} onChange={value => { if (value) change('os', value as PcProfile['os']); }}/></div>
          <div className="pc-field pc-field-wide"><label htmlFor="pc-osVersion">OS 버전</label><TextInput className="pc-control" data-filled={Boolean(draft.osVersion)} leftSection={<FieldIcon name="Info"/>} id="pc-osVersion" value={draft.osVersion} maxLength={80} placeholder="설정에 표시된 Windows 버전" onChange={e => change('osVersion', e.target.value)} aria-describedby="pc-osVersion-help"/><p id="pc-osVersion-help">Windows는 설정 &gt; 시스템 &gt; 정보의 Windows 사양에서 확인해요.</p></div>
        </div></fieldset>
        <fieldset className="pc-fieldset"><legend>핵심 부품<span>아는 항목부터 채워보세요</span></legend><div className="pc-fields">
          {fields.map(field => <div className="pc-field" key={field.key}><label htmlFor={'pc-' + field.key}>{field.label}<span className="pc-field-optional">선택</span></label><TextInput className="pc-control" data-filled={Boolean(draft[field.key])} leftSection={<FieldIcon name={field.icon}/>} id={'pc-' + field.key} value={draft[field.key]} maxLength={80} placeholder={field.example.replace('예: ', '')} onChange={e => change(field.key, e.target.value)} aria-describedby={'pc-' + field.key + '-help'}/><p id={'pc-' + field.key + '-help'}>{field.help}</p></div>)}
        </div></fieldset>
        <p className="pc-storage-note">입력한 사양은 이 브라우저의 저장소에 보관해요. 다른 기기나 브라우저와 자동으로 동기화되지 않으며, 사이트 데이터를 지우면 기록도 사라져요.</p>
        <div className="pc-form-actions"><button type="submit" className="button button-primary">내 PC 사양 저장</button>{profile && <button type="button" className="text-button" onClick={() => setConfirmDelete(true)}>저장한 기록 삭제</button>}</div>
        {confirmDelete && <div className="pc-delete-confirm"><p>저장한 사양 기록을 삭제할까요?</p><div><button type="button" className="button button-secondary" onClick={() => setConfirmDelete(false)}>취소</button><button type="button" className="button button-secondary" onClick={remove}>사양 기록 삭제</button></div></div>}
        <p role="status" className="pc-status">{status}</p>
      </form>
      <aside className="pc-sidebar" aria-label="사양 확인과 이어서 읽기">
        <section className="pc-discovery"><h3>어디서 확인하나요?</h3><p>Windows라면 위의 사양 가져오기로 한 번에 채울 수 있어요. 직접 기록할 때는 아래 위치에서 확인해 보세요.</p><ol><li><strong>CPU · RAM · Windows 버전</strong><span>시작 버튼을 오른쪽 클릭하고 설정 &gt; 시스템 &gt; 정보를 열어요.</span></li><li><strong>그래픽 장치</strong><span>장치 관리자 &gt; 디스플레이 어댑터에서 이름을 확인해요.</span></li><li><strong>저장 공간</strong><span>설정 &gt; 시스템 &gt; 저장소에서 용량을 확인해요.</span></li></ol><p>위 경로는 Windows 기준이에요. 다른 운영체제는 해당 시스템의 정보 화면에서 확인한 내용을 기록해 주세요.</p><a href="https://support.microsoft.com/en-us/windows/experience/find-information-about-your-windows-device" target="_blank" rel="noreferrer">Microsoft 사양 확인 안내</a></section>
        <section className="pc-saved" aria-labelledby="pc-saved-title"><h3 id="pc-saved-title">{profile?.nickname || '내 PC 기록'}</h3>{profile ? <><ul>{profileLines(profile).map(line => <li key={line}>{line}</li>)}</ul><p>문제 해결 화면에서 점검 기록을 복사하면 저장한 사양도 함께 담겨요.</p></> : <p>사양을 저장하면 여기에서 한눈에 보고, 관련 설명으로 이어갈 수 있어요.</p>}</section>
        {related.length > 0 && <section className="pc-reading"><h3>기록한 항목에서 이어서 읽기</h3><p>부품 이름을 기록했다면 어떤 역할인지도 알아봐요.</p><div>{related.map(topic => <button key={topic.id} type="button" onClick={() => onTopic(topic.id)}>{topic.title}</button>)}</div></section>}
        {windows && <section className="pc-reading"><h3>필요할 때 확인할 가이드</h3><p>아래 증상이 실제로 있을 때 점검을 시작해요.</p><div><button type="button" onClick={() => onGuide('slow')}>컴퓨터가 느려요</button><button type="button" onClick={() => onGuide('display')}>화면이 안 나와요</button></div></section>}
        {profile && profile.os !== 'unknown' && !windows && <p className="pc-platform-note">사양 기록은 사용할 수 있어요. 현재 문제 해결 절차와 실습은 Windows PC를 기준으로 안내해요.</p>}
      </aside>
    </div>
  </section>;
}
