import { useEffect, useId, useRef, useState } from 'react';
import { findScreenGuide, type ScreenGuide } from './settings-visuals';

function Badge({ number }: { number: number }) {
  return <span className="screen-badge">{number}</span>;
}

function VolumeBar() {
  return <span className="screen-volume"><span /><i /></span>;
}

function ScreenDiagram({ guide }: { guide: ScreenGuide }) {
  const task = guide.id === 'task-manager';
  const network = guide.id === 'network';
  const menu = task ? ['프로세스', '성능', '앱 기록', '시작 앱'] : ['시스템', 'Bluetooth 및 장치', '네트워크 및 인터넷', '개인 설정'];
  const active = task ? '프로세스' : network ? '네트워크 및 인터넷' : '시스템';
  const description = guide.points.map((point, index) => `${index + 1}번: ${point.title}`).join('. ');
  return <div className={`screen-diagram screen-diagram-${guide.id}`} role="img" aria-label={`${guide.title} 안내 그림. ${description}. 상태와 수치는 예시입니다.`}>
    <div aria-hidden="true">
      <div className="screen-window-bar"><span>{task ? '작업 관리자' : '설정'}</span><span>안내 그림</span></div>
      <div className="screen-window-body">
        <div className="screen-sidebar">{menu.map(item => <span key={item} className={item === active ? 'is-active' : undefined}>{item}</span>)}</div>
        <div className="screen-canvas">
          <div className="screen-window-heading">{task ? '프로세스' : network ? '네트워크 및 인터넷' : guide.id === 'volume-mixer' ? '소리 › 볼륨 믹서' : '시스템 › 소리'}</div>
          {network ? <>
            <div className="screen-callout screen-status"><Badge number={1} /><div><strong>Wi-Fi</strong><span>인터넷 없음 <small>예시</small></span></div></div>
            <div className="screen-row screen-callout"><Badge number={2} /><div><strong>Wi-Fi</strong><span>무선 연결</span></div><span className="screen-row-end">켜짐 ›</span></div>
            <div className="screen-row screen-callout"><Badge number={3} /><div><strong>이더넷</strong><span>유선 연결</span></div><span className="screen-row-end">›</span></div>
            <div className="screen-row screen-muted-row">비행기 모드</div>
          </> : guide.id === 'sound-output' ? <>
            <div className="screen-section-label"><Badge number={1} /><strong>출력</strong></div>
            <p className="screen-hint">소리를 재생할 위치 선택</p>
            <div className="screen-row screen-callout"><Badge number={2} /><span className="screen-radio is-selected" /><div><strong>스피커</strong><span>장치 이름 예시</span></div></div>
            <div className="screen-row"><span className="screen-radio" /><div><strong>모니터</strong><span>다른 출력 장치 예시</span></div></div>
            <div className="screen-row screen-callout screen-volume-row"><Badge number={3} /><strong>볼륨</strong><VolumeBar /></div>
            <div className="screen-muted-row">입력</div>
          </> : guide.id === 'volume-mixer' ? <>
            <div className="screen-section-label">시스템</div>
            <div className="screen-row screen-callout screen-volume-row"><Badge number={1} /><strong>볼륨</strong><VolumeBar /></div>
            <div className="screen-section-label">앱</div>
            <div className="screen-row screen-callout screen-app-volume"><Badge number={2} /><div><strong>사용 중인 앱</strong><span>앱 이름 예시</span></div><VolumeBar /></div>
            <div className="screen-row screen-app-volume"><div><strong>다른 앱</strong><span>앱 이름 예시</span></div><VolumeBar /></div>
          </> : <>
            <div className="screen-process-table">
              <div className="screen-process-head"><span>이름</span><span className="screen-callout"><Badge number={1} />CPU</span><span className="screen-callout"><Badge number={2} />메모리</span></div>
              <div><span>사용 중인 앱</span><span>24%</span><span>820 MB</span></div>
              <div><span>다른 앱</span><span>3%</span><span>210 MB</span></div>
              <div><span>작업 관리자</span><span>1%</span><span>65 MB</span></div>
            </div>
            <p className="screen-hint">수치는 예시예요. 내 PC에서 앱 이름과 사용량을 함께 살펴보세요.</p>
          </>}
        </div>
      </div>
    </div>
  </div>;
}

function ScreenContent({ guide }: { guide: ScreenGuide }) {
  return <>
    <p className="screen-open-path">{guide.open}</p>
    <figure className="screen-figure">
      <ScreenDiagram guide={guide} />
      <figcaption>Windows 11 화면을 단순화한 안내 그림이에요. 상태·장치 이름·수치는 예시이며, 버전과 기기에 따라 메뉴 위치가 다를 수 있어요.</figcaption>
    </figure>
    <ol className="screen-points">{guide.points.map((point, index) => <li key={point.title}><Badge number={index + 1} /><div><strong>{point.title}</strong><p>{point.description}</p></div></li>)}</ol>
    <p className="screen-note">{guide.note}</p>
    <p className="screen-source"><a href={guide.source} target="_blank" rel="noreferrer">{guide.sourceName}</a><span>검토일 {guide.reviewed}</span></p>
  </>;
}

function VisualGuide({ guide }: { guide: ScreenGuide }) {
  const [expanded, setExpanded] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const dialogTitleId = useId();
  useEffect(() => {
    if (!expanded) return;
    const element = dialog.current;
    element?.showModal();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { element?.close(); document.body.style.overflow = previousOverflow; };
  }, [expanded]);
  return <section className="settings-visual" aria-labelledby={titleId}>
    <div className="screen-guide-heading"><div><span>화면으로 따라가기</span><h4 id={titleId}>{guide.title}</h4></div><button type="button" className="text-button" aria-haspopup="dialog" aria-label={`${guide.title} 크게 보기`} onClick={() => setExpanded(true)}>크게 보기</button></div>
    <p className="screen-breadcrumb">{guide.path.join(' › ')}</p>
    <ScreenContent guide={guide} />
    <dialog ref={dialog} className="visual-dialog" aria-labelledby={dialogTitleId} onCancel={event => { event.preventDefault(); setExpanded(false); }} onClick={event => { if (event.target === event.currentTarget) setExpanded(false); }}>
      <div className="visual-dialog-inner"><div className="visual-dialog-heading"><h2 id={dialogTitleId}>{guide.title}</h2><button type="button" className="button button-secondary" autoFocus onClick={() => setExpanded(false)}>닫기</button></div><p className="screen-breadcrumb">{guide.path.join(' › ')}</p><ScreenContent guide={guide} /></div>
    </dialog>
  </section>;
}

export default function SettingsVisual({ guideId, step }: { guideId: string; step: number }) {
  const guide = findScreenGuide(guideId, step);
  return guide ? <VisualGuide key={guide.id} guide={guide} /> : null;
}
