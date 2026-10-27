export type ShellId = 'powershell' | 'cmd' | 'bash';
export type LabState = { shell: ShellId; cwd: string[]; completed: string[] };
export type LabResult = { state: LabState; output: string; ok: boolean; clear?: boolean };
export const shellNames: Record<ShellId, string> = { powershell: 'PowerShell', cmd: '명령 프롬프트 (CMD)', bash: 'Bash' };
export const commands = {
  powershell: { where: 'Get-Location', list: 'Get-ChildItem', move: 'Set-Location', read: 'Get-Content', clear: 'Clear-Host' },
  cmd: { where: 'cd', list: 'dir', move: 'cd', read: 'type', clear: 'cls' },
  bash: { where: 'pwd', list: 'ls', move: 'cd', read: 'cat', clear: 'clear' },
};
export const lessons = [
  { id: 'where', title: '지금 위치 확인하기', detail: '명령어를 입력하는 출발점이 어느 폴더인지 확인해요.' },
  { id: 'list', title: '홈 폴더의 목록 보기', detail: 'Documents와 readme.txt가 보이는지 살펴봐요.' },
  { id: 'move', title: 'Documents로 이동하기', detail: '폴더를 옮기면 다음 명령이 기준으로 삼는 위치도 바뀌어요.' },
  { id: 'read', title: 'notes.txt 읽어보기', detail: 'Documents 안의 텍스트 파일을 화면에 표시해요.' },
  { id: 'spaces', title: '공백이 있는 폴더로 이동하기', detail: 'Computer Guide처럼 공백이 있는 경로는 큰따옴표로 묶어 입력해 봐요.' },
  { id: 'welcome', title: 'welcome.txt 읽어보기', detail: '이동한 폴더의 텍스트 파일을 직접 읽어봐요.' },
  { id: 'home', title: '홈 폴더로 돌아오기', detail: '상위 폴더로 이동하거나 홈의 전체 경로를 사용해요.' },
] as const;
export type LessonId = typeof lessons[number]['id'];
const nodes: { path: string; type: 'folder' | 'file'; content?: string }[] = [
  { path: '', type: 'folder' }, { path: 'Documents', type: 'folder' }, { path: 'Downloads', type: 'folder' }, { path: 'Pictures', type: 'folder' },
  { path: 'readme.txt', type: 'file', content: '한눈 명령어 연습장에 오신 것을 환영해요.\n여기는 가상 폴더예요. 실제 PC 파일에는 접근하지 않아요.\nDocuments 폴더에서 notes.txt를 찾아보세요.' },
  { path: 'Documents/notes.txt', type: 'file', content: 'RAM: 실행 중인 작업의 데이터를 잠시 보관해요.\nSSD: 전원이 꺼져도 파일을 보관해요.\n폴더 이동은 파일을 옮기거나 삭제하는 작업과 달라요.' },
  { path: 'Documents/Computer Guide', type: 'folder' },
  { path: 'Documents/Computer Guide/welcome.txt', type: 'file', content: '잘 찾아왔어요!\n현재 위치 확인, 목록 보기, 경로 이동, 파일 읽기를 연습했어요.\n이 연습장은 명령어의 일부 기능과 출력을 간단하게 재현해요.' },
];
export function createLabState(shell: ShellId = 'powershell'): LabState { return { shell, cwd: [], completed: [] }; }
function home(shell: ShellId) { return shell === 'bash' ? '/home/learner' : 'C:\\Users\\Learner'; }
export function displayPath(state: Pick<LabState, 'shell' | 'cwd'>): string { const separator = state.shell === 'bash' ? '/' : '\\'; return home(state.shell) + (state.cwd.length ? separator + state.cwd.join(separator) : ''); }
export function prompt(state: LabState): string { return state.shell === 'powershell' ? `PS ${displayPath(state)}>` : state.shell === 'bash' ? `learner:${displayPath(state)} $` : displayPath(state) + '>'; }
export function directoryEntries(state: LabState): { name: string; type: 'folder' | 'file' }[] {
  return nodes.filter(node => node.path && node.path.split('/').slice(0, -1).join('/') === state.cwd.join('/')).map(node => ({ name: node.path.split('/').at(-1)!, type: node.type }));
}
function tokenize(input: string, shell: ShellId): string[] | null {
  const tokens: string[] = []; let word = ''; let quote = ''; let started = false;
  for (const char of input) {
    if (quote) { if (char === quote) quote = ''; else word += char; started = true; }
    else if (char === '"' || (char === "'" && shell !== 'cmd')) { quote = char; started = true; }
    else if (/[;&|<>`]/.test(char)) return null;
    else if (/\s/.test(char)) { if (started) { tokens.push(word); word = ''; started = false; } }
    else { word += char; started = true; }
  }
  if (quote) return null;
  if (started) tokens.push(word);
  return tokens;
}
function resolvePath(state: LabState, argument: string): typeof nodes[number] | undefined {
  let value = argument; let parts = [...state.cwd];
  const bash = state.shell === 'bash';
  if (!bash) value = value.replaceAll('\\', '/');
  const root = home(state.shell).replaceAll('\\', '/');
  const equal = (a: string, b: string) => bash ? a === b : a.toLowerCase() === b.toLowerCase();
  if (bash && (value === '~' || value.startsWith('~/'))) { value = value.slice(1).replace(/^\//, ''); parts = []; }
  else if (equal(value.slice(0, root.length), root) && (value.length === root.length || value[root.length] === '/')) { value = value.slice(root.length).replace(/^\//, ''); parts = []; }
  else if (value.startsWith('/') || /^[a-z]:/i.test(value)) return;
  for (const part of value.split('/')) {
    if (!part) continue;
    if (!nodes.some(node => node.type === 'folder' && equal(node.path, parts.join('/')))) return;
    if (part === '.') continue;
    if (part === '..') { if (!parts.length) return; parts.pop(); continue; }
    const folder = nodes.find(node => node.type === 'folder' && equal(node.path, parts.join('/')));
    if (!folder) return;
    const item = nodes.find(node => equal(node.path, [...parts, part].join('/')));
    if (!item) return;
    parts = item.path.split('/');
  }
  return nodes.find(node => equal(node.path, parts.join('/')));
}
export function lessonCommand(state: LabState, lesson: LessonId): string {
  const cmd = commands[state.shell];
  const absolute = (segments: string[]) => '"' + displayPath({ shell: state.shell, cwd: segments }) + '"';
  if (lesson === 'where') return cmd.where;
  if (lesson === 'list') return state.cwd.length ? `${cmd.list} ${absolute([])}` : cmd.list;
  if (lesson === 'move') return `${cmd.move} ${state.cwd.length ? absolute(['Documents']) : 'Documents'}`;
  if (lesson === 'read') return `${cmd.read} ${state.cwd.join('/') === 'Documents' ? 'notes.txt' : absolute(['Documents', 'notes.txt'])}`;
  if (lesson === 'spaces') return `${cmd.move} ${state.cwd.join('/') === 'Documents' ? '"Computer Guide"' : absolute(['Documents', 'Computer Guide'])}`;
  if (lesson === 'welcome') return `${cmd.read} ${state.cwd.join('/') === 'Documents/Computer Guide' ? 'welcome.txt' : absolute(['Documents', 'Computer Guide', 'welcome.txt'])}`;
  return `${cmd.move} ${absolute([])}`;
}
export function runLabCommand(state: LabState, raw: string): LabResult {
  const unchanged = (): LabState => ({ ...state, cwd: [...state.cwd], completed: [...state.completed] });
  const fail = (message: string): LabResult => ({ state: unchanged(), ok: false, output: message });
  if (raw.length > 240) return fail('명령어는 240자 이내로 입력해 주세요.');
  const tokens = tokenize(raw.trim(), state.shell);
  if (!tokens) return fail('따옴표를 닫고 명령어 하나만 입력해 보세요. 연결 기호, 파이프, 출력 저장 기능은 이 연습장에서 지원하지 않아요.');
  if (!tokens.length) return fail('예제를 입력하거나 명령어를 직접 적어 주세요.');
  const [first, ...args] = tokens;
  const name = state.shell === 'bash' ? first : first.toLowerCase();
  const shell = state.shell;
  const is = (...names: string[]) => names.includes(name);
  const where = shell === 'cmd' ? is('cd', 'chdir') && !args.length : shell === 'powershell' ? is('get-location', 'pwd') : is('pwd');
  const move = shell === 'powershell' ? is('set-location', 'cd', 'sl', 'chdir') : is('cd', ...(shell === 'cmd' ? ['chdir'] : []));
  const list = shell === 'cmd' ? is('dir') : shell === 'powershell' ? is('get-childitem', 'ls', 'dir', 'gci') : is('ls');
  const read = shell === 'cmd' ? is('type') : shell === 'powershell' ? is('get-content', 'cat', 'type', 'gc') : is('cat');
  const result = (output: string, cwd = state.cwd, completed?: LessonId, clear = false): LabResult => ({ state: { ...state, cwd: [...cwd], completed: completed && !state.completed.includes(completed) ? [...state.completed, completed] : [...state.completed] }, output, ok: true, clear });
  if (is('help')) return args.length ? fail('이 연습장에서는 help만 입력해 주세요.') : result(`현재 위치: ${commands[shell].where}\n목록 보기: ${commands[shell].list}\n폴더 이동: ${commands[shell].move} Documents\n파일 읽기: ${commands[shell].read} readme.txt\n화면 비우기: ${commands[shell].clear}\n예제의 일부 문법만 지원하는 가상 연습장이에요.`);
  if ((shell === 'cmd' && is('cls')) || (shell === 'bash' && is('clear')) || (shell === 'powershell' && is('clear-host', 'cls', 'clear'))) return args.length ? fail('화면을 비우는 명령에는 추가 값을 붙이지 않아요.') : result('화면을 비웠어요. 현재 위치와 완료한 연습은 유지돼요.', state.cwd, undefined, true);
  if (where) { if (args.length) return fail('현재 위치를 확인하는 명령만 입력해 주세요.'); return result(displayPath(state), state.cwd, 'where'); }
  if (!move && !list && !read) return fail(`이 연습장에서는 위치 확인·목록 보기·폴더 이동·파일 읽기만 연습해요. ${commands[shell].where} 또는 help를 입력해 보세요.`);
  if (!args.length && move) { if (shell === 'bash') return result('', [], state.cwd.length ? 'home' : undefined); return fail('이 연습에서는 이동할 폴더를 붙여 주세요. 예: Set-Location Documents'); }
  if (!args.length && read) return fail(`읽을 파일 이름을 붙여 주세요. 예: ${commands[shell].read} readme.txt`);
  if (args.length > 1) return fail('이 연습장에서는 경로 하나만 받을 수 있어요. 공백이 있는 경로는 큰따옴표로 묶어 주세요.');
  if (args[0]?.startsWith('-') || args[0]?.startsWith('/?')) return fail('추가 옵션은 생략하고 연습 예제의 명령어와 경로만 입력해 주세요.');
  const node = args.length ? resolvePath(state, args[0]) : nodes.find(node => node.path === state.cwd.join('/'));
  if (!node) return fail('가상 폴더에서 해당 경로를 찾지 못했어요. 아래의 항목 목록과 이름을 비교해 보세요. Bash에서는 대소문자도 구분해요. 연습 홈 밖의 경로는 지원하지 않아요.');
  if (move) {
    if (node.type !== 'folder') return fail('파일 안으로는 이동할 수 없어요. 파일은 읽기 명령으로 열어 보세요.');
    const cwd = node.path ? node.path.split('/') : [];
    const completed = node.path === 'Documents' ? 'move' : node.path === 'Documents/Computer Guide' ? 'spaces' : !node.path && state.cwd.length ? 'home' : undefined;
    return result('', cwd, completed);
  }
  if (read) {
    if (node.type !== 'file') return fail('이 경로는 폴더예요. 목록 보기 명령으로 안의 항목을 살펴보세요.');
    return result(node.content ?? '', state.cwd, node.path === 'Documents/notes.txt' ? 'read' : node.path === 'Documents/Computer Guide/welcome.txt' ? 'welcome' : undefined);
  }
  if (node.type === 'file') return result(node.path.split('/').at(-1)!);
  const cwd = node.path ? node.path.split('/') : [];
  const entries = directoryEntries({ ...state, cwd });
  return result(entries.map(item => `${item.type === 'folder' ? '[폴더]' : '[파일]'} ${item.name}`).join('\n') || '(빈 폴더)', state.cwd, node.path === '' ? 'list' : undefined);
}
