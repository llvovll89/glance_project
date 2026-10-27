import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Select, TextInput } from '@mantine/core';
import { commands, createLabState, directoryEntries, displayPath, lessonCommand, lessons, prompt, runLabCommand, shellNames, type LessonId, type ShellId } from './shell-lab';

type Entry = { id: number; prompt: string; command: string; output: string; ok: boolean };
const shellIds: ShellId[] = ['powershell', 'cmd', 'bash'];
export default function ShellLab({ onTopic }: { onTopic: (id: string) => void }) {
  const [session, setSession] = useState(createLabState);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [input, setInput] = useState('');
  const [selectedLesson, setSelectedLesson] = useState<LessonId>('where');
  const counter = useRef(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const logRef = useRef<HTMLDivElement>(null);
  const lesson = lessons.find(item => item.id === selectedLesson)!;
  useEffect(() => { const log = logRef.current; if (log) log.scrollTop = log.scrollHeight; }, [entries]);
  function reset(shell = session.shell) { setSession(createLabState(shell)); setEntries([]); setInput(''); setSelectedLesson('where'); }
  function submit(event: FormEvent) {
    event.preventDefault();
    const result = runLabCommand(session, input);
    const entry = { id: ++counter.current, prompt: prompt(session), command: input, output: result.output, ok: result.ok };
    setSession(result.state); setEntries(previous => result.clear ? [entry] : [...previous, entry].slice(-40)); setInput(''); inputRef.current?.focus();
  }
  function fill(command: string) { setInput(command); inputRef.current?.focus(); }
  return <section className="shell-lab" aria-labelledby="lab-title">
    <div className="section-heading"><h2 id="lab-title">처음 쓰는 명령어, 여기서 연습해요.</h2><p>가상 폴더에서 실행해요. 실제 PC 파일에 접근하거나 명령을 전달하지 않아요.</p></div>
    <div className="lab-controls"><label htmlFor="lab-shell">연습할 셸<Select id="lab-shell" value={session.shell} allowDeselect={false} data={shellIds.map(id => ({ value: id, label: shellNames[id] }))} onChange={value => { if (value) reset(value as ShellId); }}/></label><p>셸을 바꾸면 위치와 미션을 처음부터 연습해요.</p><button type="button" className="button button-secondary" onClick={() => reset()}>연습 초기화</button></div>
    <div className="lab-workspace">
      <aside className="lab-missions" aria-labelledby="missions-title"><div><h3 id="missions-title">하나씩 해보기</h3><p role="status">{session.completed.length} / {lessons.length}개 완료</p></div><ol>{lessons.map((item, index) => <li key={item.id}><button type="button" aria-current={selectedLesson === item.id ? 'step' : undefined} onClick={() => setSelectedLesson(item.id)}><span className={`lab-mission-index ${session.completed.includes(item.id) ? 'is-done' : ''}`}><span aria-hidden="true">{session.completed.includes(item.id) ? '✓' : index + 1}</span><span className="sr-only">{session.completed.includes(item.id) ? '완료' : '미완료'}</span></span><span>{item.title}</span></button></li>)}</ol>{session.completed.length === lessons.length && <p className="lab-all-done">모든 미션을 해냈어요. 셸을 바꿔 같은 작업의 명령어를 비교해 보세요.</p>}</aside>
      <div className="lab-practice">
        <div className="lab-task"><h3>{lesson.title}</h3><p>{lesson.detail}</p><div><code>{lessonCommand(session, selectedLesson)}</code><button type="button" className="button button-secondary" onClick={() => fill(lessonCommand(session, selectedLesson))}>예제 넣기</button></div><small>예제를 넣은 뒤 ‘실행’을 눌러요. 현재 위치에 맞춰 경로를 안내해요.</small></div>
        <div className="lab-console"><div className="lab-console-heading"><strong>{shellNames[session.shell]}</strong><span>가상 연습 환경</span></div><div className="lab-log" role="log" aria-label="명령어 실행 기록" aria-live="polite" aria-relevant="additions" tabIndex={0} ref={logRef}>{!entries.length && <p className="lab-console-welcome">연습을 시작해 볼까요? 위의 예제를 넣거나 아래에 명령어를 입력하세요.</p>}{entries.map(entry => <div className={`lab-entry ${entry.ok ? '' : 'has-error'}`} key={entry.id}><p><span>{entry.prompt}</span> {entry.command}</p>{entry.output && <pre>{entry.output}</pre>}</div>)}</div><p className="lab-current-path">현재 위치 <code>{displayPath(session)}</code></p></div>
        <form className="lab-command-form" onSubmit={submit}><label htmlFor="lab-command">연습할 명령어</label><div><TextInput className="lab-command-input" id="lab-command" ref={inputRef} value={input} onChange={event => setInput(event.target.value)} placeholder={commands[session.shell].where} maxLength={240} autoComplete="off" autoCapitalize="off" autoCorrect="off" spellCheck={false} aria-describedby="lab-input-help"/><button className="button button-primary" type="submit">실행</button></div><p id="lab-input-help">Enter로도 실행해요. help로 지원 명령어를 확인하고, {commands[session.shell].clear}로 실행 화면을 비울 수 있어요. 기록은 최근 40개까지 표시해요.</p></form>
        <section className="lab-directory" aria-labelledby="lab-directory-title"><h3 id="lab-directory-title">현재 가상 폴더 안에는</h3><p>항목을 누르면 이동 또는 읽기 명령을 입력해 줘요.</p><ul>{directoryEntries(session).map(item => <li key={item.name}><button type="button" onClick={() => fill(`${item.type === 'folder' ? commands[session.shell].move : commands[session.shell].read} "${item.name}"`)}><span>{item.type === 'folder' ? '폴더' : '파일'}</span><strong>{item.name}</strong></button></li>)}</ul>{directoryEntries(session).length === 0 && <p>이 가상 폴더는 비어 있어요.</p>}</section>
      </div>
    </div>
    <section className="lab-comparison" aria-labelledby="lab-comparison-title"><div className="section-heading"><h2 id="lab-comparison-title">같은 작업, 다른 명령어.</h2><p>대표 명령을 비교해요. 실제 환경에서는 별칭과 옵션에 따라 다른 방법도 사용할 수 있어요.</p></div><div className="lab-command-comparison">{shellIds.map(id => <section key={id}><h3>{shellNames[id]}</h3><dl><div><dt>현재 위치</dt><dd><code>{commands[id].where}</code></dd></div><div><dt>목록 보기</dt><dd><code>{commands[id].list}</code></dd></div><div><dt>폴더 이동</dt><dd><code>{commands[id].move} Documents</code></dd></div><div><dt>파일 읽기</dt><dd><code>{commands[id].read} readme.txt</code></dd></div></dl></section>)}</div><button type="button" className="text-button" onClick={() => onTopic('shell')}>터미널과 셸의 차이 알아보기</button></section>
    <details className="lab-sources"><summary>연습 범위와 공식 참고 자료</summary><p>이 연습장은 학습용 홈 안에서 위치 확인, 폴더 목록, 경로 이동, 텍스트 읽기의 일부 문법을 재현해요. 파일 생성·삭제·외부 프로그램 실행·환경 변수·파이프·옵션 등은 지원하지 않으며, 출력 형식도 실제 셸과 다를 수 있어요.</p><ul><li><a href="https://learn.microsoft.com/en-us/windows-server/administration/windows-commands/cd" target="_blank" rel="noreferrer">Microsoft CMD 명령어</a></li><li><a href="https://learn.microsoft.com/en-us/powershell/module/microsoft.powershell.management/get-location" target="_blank" rel="noreferrer">Microsoft PowerShell 명령어</a></li><li><a href="https://www.gnu.org/software/bash/manual/html_node/Bourne-Shell-Builtins.html" target="_blank" rel="noreferrer">GNU Bash 내장 명령어</a></li><li><a href="https://www.gnu.org/software/coreutils/manual/html_node/cat-invocation.html" target="_blank" rel="noreferrer">GNU 파일 읽기 명령어</a></li></ul></details>
  </section>;
}
