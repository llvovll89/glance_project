import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { MantineProvider, Select, TextInput, Textarea } from '@mantine/core';
import { formTheme } from './form-theme';
import { guides, topics, type Guide, type Topic, type IconName, type ResultChoice } from './content';
import PcProfilePanel from './PcProfile';
import ShellLab from './ShellLab';
import SettingsVisual from './SettingsVisual';
import DiagnosisHistory from './DiagnosisHistory';
import { createDiagnosisRecord, diagnosisReport, HISTORY_LIMIT, NOTE_LIMIT, newHistoryId, readDiagnosisHistory, upsertDiagnosisRecord, writeDiagnosisHistory, type DiagnosisRecord, type DiagnosisStatus } from './diagnosis-history';
import { Dictionary, KnowledgeQuiz } from './LearningLibrary';
import { guideGroups, filterGuides } from './guide-categories';
import { readPcProfile, profileLines, type PcProfile } from './pc-profile';
import { deleteGuideProgress, readGuideProgress, saveGuideProgress, type GuideProgress, type GuideAnswer } from './guide-progress';

type Theme = 'system' | 'light' | 'dark';
const topicIcons: Record<string, IconName> = { cpu: 'Cpu', ram: 'Memory', ssd: 'HardDrives', gpu: 'GraphicsCard', os: 'Desktop', shell: 'TerminalWindow' };
function topicIcon(topic: Topic): IconName { return topic.icon ?? topicIcons[topic.id] ?? 'BookOpen'; }
function guideIcon(guide: Guide): IconName { return guide.icon ?? (guide.id === 'display' ? 'Monitor' : 'SpeakerHigh'); }
function Icon({ name, className = '' }: { name: IconName; className?: string }) {
  return <span aria-hidden="true" className={`icon ${className}`} style={{ '--icon': `url("/icons/${name}.svg")` } as CSSProperties} />;
}
function readTheme(): Theme {
  try { const value = localStorage.getItem('hanno-theme'); return value === 'light' || value === 'dark' ? value : 'system'; } catch { return 'system'; }
}
function HardwareImage() {
  const [failed, setFailed] = useState(false);
  return failed ? <div className="image-fallback"><Icon name="Desktop" /><p>컴퓨터 이미지를 불러오지 못했어요.</p></div> : <img src="/assets/computer-studio-1024.webp" srcSet="/assets/computer-studio-640.webp 640w, /assets/computer-studio-1024.webp 1024w, /assets/computer-studio-1536.webp 1536w" sizes="(max-width: 767px) calc(100vw - 40px), (max-width: 1280px) calc((100vw - 100px) / 2), 590px" alt="내부 부품이 보이는 실버 데스크톱 본체와 모니터의 개념 이미지" width="1536" height="1024" decoding="async" fetchPriority="high" onError={() => setFailed(true)} />;
}
function Article({ topic, close }: { topic: Topic | undefined; close: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    if (topic && !ref.current?.open) ref.current?.showModal();
    else if (!topic) ref.current?.close();
    if (!topic) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = previousOverflow; };
  }, [topic]);
  return <dialog ref={ref} onCancel={close} onClick={event => { if (event.target === event.currentTarget) close(); }} aria-labelledby="article-title" className="article-dialog">
    {topic && <article className="article-content">
      <div className="article-toolbar"><span>{topic.category}</span><button className="icon-button" aria-label="설명 닫기" onClick={close}><Icon name="X" /></button></div>
      <div className="article-symbol"><Icon name={topicIcon(topic)} /></div>
      <h2 id="article-title">{topic.title}</h2><p className="article-lead">{topic.summary}</p>
      <div className="article-body">{topic.paragraphs.map(p => <p key={p}>{p}</p>)}</div>
      <aside className="practice"><div className="practice-heading"><Icon name="Desktop" /><h3>내 컴퓨터에서 확인하기</h3></div><p>{topic.exercise}</p><small>Windows 11 기준. 버전이나 기기에 따라 메뉴가 다를 수 있어요.</small></aside>
      <button className="button button-secondary article-close" onClick={close}>확인했어요<Icon name="Check" /></button>
    </article>}
  </dialog>;
}
function StepVisual({ guide, step }: { guide: Guide; step: number }) {
  const visual = guide.id === 'display'
    ? [{ icon: 'Monitor', title: '모니터 자체 메뉴', detail: '화면이 검어도 모니터 메뉴가 나오는지 확인해요.' }, { icon: 'PlugsConnected', title: '케이블과 입력 선택', detail: 'HDMI에 연결했다면 모니터 입력도 HDMI로 선택해요.' }, { icon: 'Desktop', title: 'PC와 모니터의 연결', detail: '외부 케이블부터 확인해요. 본체를 열 필요는 없어요.' }, { icon: 'SpeakerHigh', title: '소리와 표시등', detail: '관찰한 패턴이 다음 점검의 단서가 돼요.' }]
    : [{ icon: 'Desktop', title: '본체 라벨 또는 구매 내역', detail: '완제품 모델이나 메인보드 모델을 먼저 알아봐요.' }, { icon: 'SpeakerHigh', title: '횟수보다 정확한 패턴', detail: '짧은 소리, 긴 소리, 쉬는 간격을 구분해요.' }, { icon: 'BookOpen', title: '내 모델의 공식 설명서', detail: '다른 제조사의 코드표로 판단하지 않아요.' }, { icon: 'ShieldCheck', title: '확인한 내용을 전달하기', detail: '직접 분해하기 어렵다면 전문 지원을 받아요.' }];
  const current = guide.steps[step].visual ?? (['display', 'beep'].includes(guide.id) ? visual[step] : { icon: 'BookOpen', title: guide.steps[step].title, detail: '표시된 안내에 따라 하나씩 확인해요.' });
  return <figure className="step-visual"><div className="step-visual-symbol"><Icon name={current.icon as IconName} /></div><figcaption><strong>{current.title}</strong><span>{current.detail}</span></figcaption></figure>;
}
export function Diagnosis({ guide, onTopic, onGuide, onProgress, onArchive, initialProgress, profile }: { guide: Guide; onTopic: (id: string) => void; onGuide: (id: string) => void; onProgress?: (progress: GuideProgress | null, guideId: string) => void; onArchive?: (record: DiagnosisRecord) => string | null; initialProgress?: GuideProgress | null; profile?: PcProfile | null }) {
  const [step, setStep] = useState(initialProgress?.step ?? 0);
  const [done, setDone] = useState(false);
  const [reviewed, setReviewed] = useState<number[]>(initialProgress?.reviewed ?? []);
  const [copyStatus, setCopyStatus] = useState('');
  const [variant, setVariant] = useState<string | undefined>(initialProgress?.variant);
  const [answers, setAnswers] = useState<GuideAnswer[]>(initialProgress?.answers ?? []);
  const [note, setNote] = useState(initialProgress?.note ?? '');
  const [historyId] = useState(() => initialProgress?.historyId ?? newHistoryId());
  const [completionStatus, setCompletionStatus] = useState<DiagnosisStatus>('resolved');
  const [archiveError, setArchiveError] = useState<string | null>(null);
  const stepHeading = useRef<HTMLHeadingElement>(null);
  const shouldFocus = useRef(false);
  useEffect(() => {
    if (shouldFocus.current) { stepHeading.current?.focus(); shouldFocus.current = false; }
  }, [step, done]);
  const current = guide.steps[step];
  const last = step === guide.steps.length - 1;
  const relatedTopics = (current.relatedTopics ?? guide.relatedTopics ?? ['ram', 'gpu']).map(id => topics.find(topic => topic.id === id)).filter((topic): topic is Topic => Boolean(topic));
  function progress(nextReviewed = reviewed, nextAnswers = answers): GuideProgress {
    return { guideId: guide.id, step, reviewed: nextReviewed, answers: nextAnswers, note, historyId, ...(variant ? { variant } : {}) };
  }
  function record(nextStep: number, nextReviewed: number[], nextVariant = variant, nextAnswers = answers, nextNote = note) {
    onProgress?.({ guideId: guide.id, step: nextStep, reviewed: nextReviewed, answers: nextAnswers, note: nextNote, historyId, ...(nextVariant ? { variant: nextVariant } : {}) }, guide.id);
  }
  function finishCheck(status: DiagnosisStatus, nextReviewed: number[], nextAnswers: GuideAnswer[]) {
    const error = onArchive?.(createDiagnosisRecord(guide, progress(nextReviewed, nextAnswers), status, profile ? profileLines(profile) : [])) ?? null;
    setReviewed(nextReviewed);
    setAnswers(nextAnswers);
    setCompletionStatus(status);
    setArchiveError(error);
    setDone(true);
    setCopyStatus('');
    shouldFocus.current = true;
    if (error) record(step, nextReviewed, variant, nextAnswers);
    else onProgress?.(null, guide.id);
  }
  function returnToCheck() {
    const savedNote = !archiveError ? readDiagnosisHistory().find(item => item.id === historyId)?.note : undefined;
    const nextNote = savedNote ?? note;
    setNote(nextNote);
    setDone(false);
    shouldFocus.current = true;
    record(step, reviewed, variant, answers, nextNote);
  }
  function chooseResult(choice: ResultChoice) {
    // Re-answering an earlier check invalidates the results after that check.
    const nextAnswers = [...answers.filter(answer => answer.step < step), { step, choiceId: choice.id }];
    const nextReviewed = [...reviewed.filter(index => index < step), step];
    setAnswers(nextAnswers);
    setReviewed(nextReviewed);
    setCopyStatus('');
    shouldFocus.current = true;
    if (choice.target === 'resolved') {
      finishCheck('resolved', nextReviewed, nextAnswers);
    } else {
      setStep(choice.target);
      record(choice.target, nextReviewed, variant, nextAnswers);
    }
  }
  function advanceWithoutAnswer() {
    const nextAnswers = answers.filter(answer => answer.step < step);
    const nextReviewed = [...reviewed.filter(index => index < step), step];
    setAnswers(nextAnswers);
    setReviewed(nextReviewed);
    setStep(step + 1);
    setCopyStatus('');
    shouldFocus.current = true;
    record(step + 1, nextReviewed, variant, nextAnswers);
  }
  async function copyReport() {
    const report = diagnosisReport(createDiagnosisRecord(guide, progress(), done ? completionStatus : 'unresolved', profile ? profileLines(profile) : []));
    try { await navigator.clipboard.writeText(report); setCopyStatus('복사했어요. 모델명과 실제 결과를 덧붙여 전달하세요.'); }
    catch { setCopyStatus('복사할 수 없어요. 확인한 단계와 결과를 직접 기록해 주세요.'); }
  }
  return <section className="diagnosis" aria-labelledby="guide-title">
    <div className="diagnosis-heading"><div><span className="guide-kicker">선택한 증상</span><h2 id="guide-title">{guide.title}</h2></div><span className="guide-scope"><Icon name="ShieldCheck" />외부 점검부터</span></div>
    {guide.variants && <div className="guide-variants"><h3>어떤 상황에 가장 가까운가요?</h3><div>{guide.variants.map(option => <button key={option.id} aria-pressed={variant === option.id} onClick={() => { if (option.guideId) { onGuide(option.guideId); return; } setAnswers([]); setVariant(option.id); setStep(option.step); setDone(false); setReviewed([]); setCopyStatus(''); record(option.step, [], option.id, []); }}><span><strong>{option.title}</strong><span>{option.description}</span></span><Icon name={variant === option.id ? 'Check' : 'CaretRight'} /></button>)}</div></div>}
    <div className="diagnosis-workspace">
      <aside className="checklist"><h3>확인할 순서</h3><ol aria-label="점검 순서">{guide.steps.map((item, i) => <li key={item.title}><button className={`${!done && i === step ? 'is-current' : ''} ${reviewed.includes(i) ? 'is-reviewed' : ''}`} onClick={() => { setStep(i); setDone(false); setCopyStatus(''); record(i, reviewed); }} aria-current={!done && i === step ? 'step' : undefined}><span className="step-index">{reviewed.includes(i) ? <Icon name="Check" /> : i + 1}</span><span>{item.title}</span>{!done && i === step && <Icon name="CaretRight" />}</button></li>)}</ol><div className="checklist-foot"><Icon name="Info" /><p>익숙하지 않은 내부 작업은<br/>공식 지원을 받아 진행하세요.</p></div></aside>
      <div className="step-main"><div className="step-content" aria-live="polite" aria-atomic="true" key={done ? 'done' : step}>
        {done ? <div className="completion"><span className="completion-symbol"><Icon name={completionStatus === 'resolved' ? 'CheckCircle' : 'BookOpen'} /></span><h3 ref={stepHeading} tabIndex={-1}>{completionStatus === 'resolved' ? '다시 잘 작동한다니 다행이에요.' : '추가 확인이 필요해요.'}</h3><p>{completionStatus === 'resolved' ? '해결됨으로 표시했어요. 같은 증상이 반복되면 발생 상황을 기록하고 공식 지원에 문의하세요.' : '확인한 결과와 발생 상황을 정리해 공식 지원에 문의하세요.'}</p>{archiveError ? <div className="archive-error"><p role="alert">{archiveError}</p><button type="button" className="button button-secondary" onClick={() => finishCheck(completionStatus, reviewed, answers)}>기록 저장 다시 시도</button></div> : onArchive && <p className="archive-success" role="status">점검 이력에 결과와 메모를 남겼어요.</p>}<button className="button button-secondary" onClick={returnToCheck}><Icon name="ArrowLeft" />점검으로 돌아가기</button></div> : <>
          <div className="step-meta"><span>{step + 1}번째 확인</span><span>전체 {guide.steps.length}단계</span></div><h3 ref={stepHeading} tabIndex={-1}>{current.title}</h3>
          <div className="step-explanation"><StepVisual guide={guide} step={step}/><div className="step-copy"><p>{current.body}</p>{current.check && <dl className="step-outcomes"><div><dt>확인할 결과</dt><dd>{current.check}</dd></div><div><dt>다음 행동</dt><dd>{current.next}</dd></div></dl>}{current.tip && <aside className="notice"><Icon name="Info" /><p>{current.tip}</p></aside>}</div></div>
          <SettingsVisual guideId={guide.id} step={step} />
          {current.choices && <fieldset className="result-question"><legend>{current.question}</legend><p>확인한 결과를 고르면 다음 점검으로 이동해요.</p><div>{current.choices.map(choice => <button type="button" key={choice.id} onClick={() => chooseResult(choice)}><span>{choice.label}</span><Icon name={choice.target === 'resolved' ? 'Check' : 'ArrowRight'} /></button>)}</div><small>잘 모르겠으면 ‘다음 확인’으로 순서대로 진행해도 괜찮아요.</small></fieldset>}
          <details className="diagnosis-note"><summary>결과 메모 남기기 (선택)</summary><Textarea label="결과 메모" description={`최대 ${NOTE_LIMIT}자. 확인한 상황이나 해결 방법을 적어 두세요.`} placeholder="예: 모니터 입력을 HDMI 2로 바꾸니 화면이 나왔어요." value={note} maxLength={NOTE_LIMIT} autosize minRows={2} maxRows={6} onChange={event => { const value = event.currentTarget.value; setNote(value); record(step, reviewed, variant, answers, value); }} /><small>{note.length} / {NOTE_LIMIT}자</small></details>
          <div className="step-actions"><button className="button button-secondary" onClick={() => finishCheck('resolved', [...reviewed.filter(index => index < step), step], answers.filter(answer => answer.step < step))}><Icon name="Check" />해결됐어요</button>{!last ? <button className="button button-primary" onClick={advanceWithoutAnswer}>다음 확인<Icon name="ArrowRight" /></button> : <a className="button button-primary" href={guide.source} target="_blank" rel="noreferrer">공식 지원 보기<Icon name="ArrowSquareOut" /></a>}</div>
          <div className="archive-unresolved"><button type="button" className="text-button" onClick={() => finishCheck('unresolved', reviewed, answers)}>미해결로 기록</button></div>
        </>}
      </div>{answers.length > 0 && <details className="answer-history"><summary>선택한 확인 결과 {answers.length}개</summary><ul>{answers.map(answer => <li key={answer.step}><span>{guide.steps[answer.step].question}</span><strong>{guide.steps[answer.step].choices?.find(choice => choice.id === answer.choiceId)?.label}</strong><button type="button" className="text-button" aria-label={`${answer.step + 1}번째 확인 결과 변경`} onClick={() => { setStep(answer.step); setDone(false); setCopyStatus(''); shouldFocus.current = true; record(answer.step, reviewed); }}>결과 변경</button></li>)}</ul></details>}<div className="guide-tools"><div><span>이 단계의 용어</span>{relatedTopics.map(topic => <button key={topic.id} onClick={() => onTopic(topic.id)}>{topic.title}</button>)}</div><button className="text-button" onClick={copyReport}><Icon name="Copy" />점검 기록 복사</button></div>{copyStatus && <p role="status" className="copy-status">{copyStatus}</p>}</div>
    </div>
    <details className="source-details"><summary><Icon name="BookOpen" />참고 자료와 안내 범위<Icon name="CaretDown" /></summary><p>참고: <a href={guide.source} target="_blank" rel="noreferrer">{guide.sourceName}</a>. 검토일 {guide.sourceDate ?? '2026.10.26'}.</p><p>기기별 매뉴얼을 우선 확인하세요. 이 가이드는 고장을 확정하지 않으며, 내부 부품의 분해나 교체를 안내하지 않습니다.</p></details>
  </section>;
}
function HardwareExplorer({ openTopic }: { openTopic: (id: string) => void }) {
  const [selected, setSelected] = useState('cpu');
  const current = topics.find(t => t.id === selected)!;
  return <section className="explorer" aria-labelledby="explorer-title"><div className="section-heading"><h2 id="explorer-title">부품을 누르면, 역할이 보여요.</h2><p>이름보다 하는 일부터 알아볼까요?</p></div><div className="explorer-workspace"><div className="parts-board" aria-label="알아볼 부품 선택">{topics.filter(t => t.category === '부품').map(t => <button key={t.id} className={`part part-${t.id} ${selected === t.id ? 'is-selected' : ''}`} aria-pressed={selected === t.id} onClick={() => setSelected(t.id)}><Icon name={topicIcon(t)} /><strong>{t.title}</strong><span>{t.shortLabel ?? ({ cpu: '명령 처리', ram: '작업 공간', ssd: '파일 보관', gpu: '화면과 그래픽' } as Record<string, string>)[t.id]}</span><Icon name="CaretRight" className="part-arrow" /></button>)}<p>역할을 살펴보는 개념도예요. 실제 배치와 크기는 기기에 따라 달라요.</p></div><article className="part-description" key={selected}><span className="part-category">부품 알아보기</span><h3>{current.title}</h3><p className="part-summary">{current.summary}</p><p>{current.paragraphs[0]}</p><button className="button button-primary" onClick={() => openTopic(selected)}>설명과 실습 보기<Icon name="ArrowRight" /></button></article></div></section>;
}
function ConceptSection({ title, description, id, items, openTopic }: { title: string; description: string; id: string; items: Topic[]; openTopic: (id: string) => void }) {
  return <section className="concepts" aria-labelledby={id}><div className="section-heading"><h2 id={id}>{title}</h2><p>{description}</p></div><div className="concept-grid">{items.map(topic => <button className="concept-item" key={topic.id} onClick={() => openTopic(topic.id)}><Icon name={topicIcon(topic)}/><div><h3>{topic.title}</h3><p>{topic.summary}</p><span>설명과 실습 보기<Icon name="ArrowRight"/></span></div></button>)}</div></section>;
}
export default function App() {
  const [view, setView] = useState<'help' | 'learn' | 'pc' | 'lab'>('help');
  const [selected, setSelected] = useState('display');
  const [learnMode, setLearnMode] = useState<'explore' | 'dictionary' | 'quiz'>('explore');
  const [guideFilter, setGuideFilter] = useState('all');
  const [guideLimit, setGuideLimit] = useState(6);
  const [savedProgress, setSavedProgress] = useState<GuideProgress | null>(() => readGuideProgress(guides));
  const [history, setHistory] = useState<DiagnosisRecord[]>(readDiagnosisHistory);
  const [initialProgress, setInitialProgress] = useState<GuideProgress | null>(null);
  const [guideInstance, setGuideInstance] = useState(0);
  const visibleGuides = filterGuides(guides, guideFilter);
  const shownGuides = visibleGuides.slice(0, guideLimit);
  function openGuide(id: string, fresh = false) { if (!visibleGuides.some(guide => guide.id === id)) setGuideFilter('all'); setInitialProgress(!fresh && savedProgress?.guideId === id ? savedProgress : null); setGuideInstance(value => value + 1); setSelected(id); setView('help'); setQuery(''); requestAnimationFrame(() => document.querySelector('.diagnosis')?.scrollIntoView({ block: 'start', behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' })); }
  function changeHistory(records: DiagnosisRecord[]): boolean {
    if (!writeDiagnosisHistory(records)) return false;
    setHistory(records);
    return true;
  }
  function archiveDiagnosis(record: DiagnosisRecord): string | null {
    const records = upsertDiagnosisRecord(history, record);
    if (records.length > HISTORY_LIMIT) return `이력은 ${HISTORY_LIMIT}개까지 보관할 수 있어요. 필요 없는 기록을 삭제한 뒤 다시 저장해 주세요.`;
    return changeHistory(records) ? null : '점검 이력을 저장하지 못했어요. 메모와 진행 상태는 이 화면에 유지돼요. 다시 저장하거나 점검 기록을 복사해 주세요.';
  }
  function updateProgress(progress: GuideProgress | null, guideId: string) {
    if (!progress) { if (savedProgress?.guideId === guideId) { deleteGuideProgress(); setSavedProgress(null); setInitialProgress(null); } return; }
    if (saveGuideProgress(progress, guides)) { setSavedProgress(progress); setInitialProgress(progress); }
  }
  function clearProgress() { deleteGuideProgress(); if (savedProgress?.guideId === selected) { setInitialProgress(null); setGuideInstance(value => value + 1); } setSavedProgress(null); }
  const [query, setQuery] = useState('');
  const [articleId, setArticleId] = useState<string>();
  const [theme, setTheme] = useState<Theme>(readTheme);
  const [profile, setProfile] = useState<PcProfile | null>(readPcProfile);
  useEffect(() => { document.documentElement.dataset.theme = theme; try { localStorage.setItem('hanno-theme', theme); } catch { /* The selection remains available in memory. */ } }, [theme]);
  const keyword = query.trim().toLocaleLowerCase();
  const filteredGuides = guides.filter(g => `${g.title} ${g.summary} ${g.tags.join(' ')}`.toLocaleLowerCase().includes(keyword));
  const filteredTopics = topics.filter(t => `${t.title} ${t.summary} ${t.category} ${t.paragraphs.join(' ')}`.toLocaleLowerCase().includes(keyword));
  const currentGuide = guides.find(g => g.id === selected) ?? guides[0];
  return <MantineProvider theme={formTheme} defaultColorScheme="auto" forceColorScheme={theme === 'system' ? undefined : theme}><><a className="skip-link" href="#main">본문으로 이동</a>
    <header className="site-header"><div className="header-inner"><a href="#" className="brand" onClick={() => { setView('help'); setQuery(''); }}>한눈<span>컴퓨터 가이드</span></a><nav aria-label="주요 메뉴"><button aria-current={view === 'help' ? 'page' : undefined} onClick={() => { setView('help'); setQuery(''); }}><Icon name="SquaresFour" />문제 해결</button><button aria-current={view === 'learn' ? 'page' : undefined} onClick={() => { setView('learn'); setQuery(''); }}><Icon name="BookOpen" />컴퓨터 이해하기</button><button aria-current={view === 'pc' ? 'page' : undefined} onClick={() => { setView('pc'); setQuery(''); }}><Icon name="Desktop" />내 PC 알아보기</button><button aria-current={view === 'lab' ? 'page' : undefined} onClick={() => { setView('lab'); setQuery(''); }}><Icon name="TerminalWindow" />명령어 연습</button></nav><div className="theme-control"><Icon name={theme === 'dark' ? 'Moon' : theme === 'light' ? 'Sun' : 'Desktop'} /><Select className="theme-select" aria-label="화면 테마" value={theme} allowDeselect={false} data={[{ value: 'system', label: '시스템 테마' }, { value: 'light', label: '밝은 화면' }, { value: 'dark', label: '어두운 화면' }]} onChange={value => { if (value) setTheme(value as Theme); }}/></div></div></header>
    <main id="main" className="page-shell">
      <section className="hero" aria-labelledby="page-title"><div className="hero-copy"><h1 id="page-title">{view === 'help' ? <>컴퓨터의 문제,<br/>한눈에 짚어보세요.</> : view === 'pc' ? <>내 컴퓨터를,<br/>내 말로 알아가세요.</> : view === 'lab' ? <>명령어의 첫걸음,<br/>직접 눌러 익혀보세요.</> : <>컴퓨터 속 이야기를<br/>눈으로 이해하세요.</>}</h1><p>{view === 'help' ? '낯선 소리도, 꺼진 화면도. 보이는 증상부터 하나씩 확인해요.' : view === 'pc' ? '사양을 몰라도 괜찮아요. 확인하는 방법부터, 내 PC 기록까지 함께해요.' : view === 'lab' ? '낯선 검은 창도 차근차근. 가상 폴더에서 내 속도로 연습해요.' : '부품의 역할부터 운영체제와 셸까지. 눌러보고, 알아보고, 직접 확인해요.'}</p><a className="hero-link" href={view === 'help' ? '#symptoms' : view === 'pc' ? '#pc-title' : view === 'lab' ? '#lab-title' : '#learn-start'}>{view === 'help' ? '내 증상 찾기' : view === 'pc' ? '내 사양 기록하기' : view === 'lab' ? '명령어 연습 시작' : '기초 알아보기'}<Icon name="ArrowRight" /></a></div><figure className="hero-visual"><HardwareImage /><figcaption>컴퓨터의 연결과 내부 부품을 표현한 개념 이미지</figcaption></figure></section>
      <section className="search-section" aria-label="가이드 검색"><div className="search-heading"><Icon name="MagnifyingGlass" /><label htmlFor="search">무엇이 궁금한가요?</label></div><TextInput className="search-field" id="search" type="search" value={query} onChange={e => setQuery(e.target.value)} placeholder="예: 화면이 안 나와요, RAM, 운영체제" autoComplete="off" rightSection={query && <button className="icon-button" aria-label="검색어 지우기" onClick={() => setQuery('')}><Icon name="X" /></button>} rightSectionPointerEvents="all" rightSectionWidth={44}/><span className="search-scope">Windows PC 기초 가이드</span></section>
      {keyword ? <section className="results" aria-labelledby="result-title"><div className="section-heading"><h2 id="result-title">검색 결과</h2><p role="status">{filteredGuides.length + filteredTopics.length}개를 찾았어요.</p></div>{!filteredGuides.length && !filteredTopics.length && <div className="empty"><Icon name="MagnifyingGlass" /><h3>일치하는 가이드가 없어요.</h3><p>‘화면’, ‘비프음’, ‘RAM’처럼 짧은 단어로 다시 찾아보세요.</p><button className="button button-secondary" onClick={() => setQuery('')}>전체 가이드 보기</button></div>}<div className="result-list">{filteredGuides.map(g => <button className="result-row" key={g.id} onClick={() => openGuide(g.id)}><span className="result-symbol"><Icon name={guideIcon(g)} /></span><span><small>문제 해결</small><strong>{g.title}</strong><span>{g.summary}</span></span><Icon name="ArrowRight" /></button>)}{filteredTopics.map(t => <button className="result-row" key={t.id} onClick={() => setArticleId(t.id)}><span className="result-symbol"><Icon name={topicIcon(t)} /></span><span><small>{t.category}</small><strong>{t.title}</strong><span>{t.summary}</span></span><Icon name="ArrowRight" /></button>)}</div></section> : view === 'help' ? <>
        {savedProgress && <section className="resume-card" aria-label="이어서 점검"><div><span>이 브라우저에 저장된 점검</span><h2>{guides.find(guide => guide.id === savedProgress.guideId)?.title}</h2><p>{savedProgress.step + 1}번째 단계부터 이어갈 수 있어요. 사이트 데이터를 지우면 이 기록도 사라져요.</p></div><div className="resume-actions"><button type="button" className="button button-primary" onClick={() => openGuide(savedProgress.guideId)}>이어서 점검</button><button type="button" className="text-button" onClick={clearProgress}>기록 삭제</button></div></section>}
        <a className="history-jump text-button" href="#diagnosis-history">점검 이력 {history.length}개 보기<Icon name="ArrowRight" /></a>
        <section id="symptoms" className="symptoms" aria-labelledby="symptom-title">
          <div className="section-heading"><h2 id="symptom-title">지금 어떤 증상이 있나요?</h2><p>{guides.length}가지 증상 중 가장 가까운 것을 고르고 점검을 시작하세요.</p></div>
          <div className="guide-filters" aria-label="증상 분야">{guideGroups.map(group => <button type="button" key={group.id} aria-pressed={guideFilter === group.id} onClick={() => { setGuideFilter(group.id); setGuideLimit(6); }}>{group.label} {filterGuides(guides, group.id).length}</button>)}</div>
          <div id="symptom-options" className="symptom-options">{shownGuides.map(g => <button key={g.id} className={`symptom-option ${selected === g.id ? 'is-selected' : ''}`} aria-pressed={selected === g.id} onClick={() => openGuide(g.id)}><span className="symptom-symbol"><Icon name={guideIcon(g)} /></span><span className="symptom-copy"><strong>{g.title}</strong><span>{g.summary}</span></span><span className="selection-mark">{selected === g.id ? <><Icon name="Check" /><span className="sr-only">선택됨</span></> : <Icon name="CaretRight" />}</span></button>)}</div>
          {visibleGuides.length > 6 && <div className="symptom-more"><span role="status">{shownGuides.length} / {visibleGuides.length}개 표시</span><button type="button" aria-controls="symptom-options" onClick={() => setGuideLimit(limit => limit >= visibleGuides.length ? 6 : limit + 6)}>{guideLimit >= visibleGuides.length ? '처음 6개만 보기' : `증상 ${Math.min(6, visibleGuides.length - guideLimit)}개 더 보기`}<Icon name="CaretDown" className={guideLimit >= visibleGuides.length ? 'is-up' : ''} /></button></div>}
        </section>
        <Diagnosis key={`${selected}:${guideInstance}`} guide={currentGuide} onTopic={setArticleId} onGuide={openGuide} onProgress={updateProgress} onArchive={archiveDiagnosis} initialProgress={initialProgress} profile={profile}/>
        <DiagnosisHistory records={history} onChange={changeHistory} onRestart={id => openGuide(id, true)} />
        <section className="learning-strip"><span className="learning-strip-symbol"><Icon name="Cpu" /></span><div><h2>RAM이 뭔지 몰라도 괜찮아요.</h2><p>컴퓨터를 이루는 부품과 기본 개념을 알아보세요.</p></div><button className="button button-secondary" onClick={() => { setView('learn'); setQuery(''); window.scrollTo({ top: 0, behavior: 'instant' }); }}>컴퓨터 이해하기<Icon name="ArrowRight" /></button></section>
      </> : view === 'pc' ? <PcProfilePanel profile={profile} onSave={setProfile} onTopic={setArticleId} onGuide={openGuide}/>: view === 'lab' ? <ShellLab onTopic={setArticleId}/>: <><div className="learning-modes" id="learn-start" aria-label="학습 방식"><button type="button" aria-pressed={learnMode === 'explore'} onClick={() => setLearnMode('explore')}>부품과 기초</button><button type="button" aria-pressed={learnMode === 'dictionary'} onClick={() => setLearnMode('dictionary')}>용어 사전</button><button type="button" aria-pressed={learnMode === 'quiz'} onClick={() => setLearnMode('quiz')}>이해도 퀴즈</button></div>{learnMode === 'explore' ? <><HardwareExplorer openTopic={setArticleId}/><ConceptSection title="부품 다음은, 기본 개념." description="운영체제와 명령어 창의 역할을 알아봐요." id="concept-title" items={topics.filter(t => ['os', 'shell'].includes(t.id))} openTopic={setArticleId}/><ConceptSection title="Windows에서 직접 해보기" description="설정과 도구를 이해하면 일상적인 문제도 덜 낯설어요." id="windows-title" items={topics.filter(t => t.category === 'Windows 기초')} openTopic={setArticleId}/></> : learnMode === 'dictionary' ? <Dictionary onTopic={setArticleId}/> : <KnowledgeQuiz onTopic={setArticleId}/>}</>}
    </main><footer className="site-footer"><strong>한눈</strong><p>내 컴퓨터를 이해하는 가장 작은 시작.</p><span>Windows PC 기초 가이드</span></footer><Article topic={topics.find(t => t.id === articleId)} close={() => setArticleId(undefined)}/>
  </></MantineProvider>;
}
