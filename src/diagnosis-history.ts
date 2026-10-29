import type { Guide } from './content';
import type { GuideProgress, ProgressStorage } from './guide-progress';

export type DiagnosisStatus = 'resolved' | 'unresolved';
export type DiagnosisRecord = {
  id: string;
  guideId: string;
  title: string;
  recordedAt: string;
  status: DiagnosisStatus;
  checked: string[];
  answers: { question: string; answer: string }[];
  device: string[];
  variant: string;
  note: string;
};
export const HISTORY_KEY = 'hanno-diagnosis-history-v1';
export const HISTORY_LIMIT = 50;
export const NOTE_LIMIT = 1000;
const STORAGE_LIMIT = 500_000;

function browserStorage(): ProgressStorage | undefined {
  try { return typeof window === 'undefined' ? undefined : window.localStorage; } catch { return undefined; }
}

export function newHistoryId(): string {
  return globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function createDiagnosisRecord(guide: Guide, progress: GuideProgress, status: DiagnosisStatus, device: string[] = []): DiagnosisRecord {
  return {
    id: progress.historyId ?? newHistoryId(), guideId: guide.id, title: guide.title,
    recordedAt: new Date().toISOString(), status,
    checked: [...progress.reviewed].sort((a, b) => a - b).map(index => guide.steps[index].title),
    answers: (progress.answers ?? []).map(item => {
      const step = guide.steps[item.step];
      return { question: step.question ?? step.title, answer: step.choices?.find(choice => choice.id === item.choiceId)?.label ?? item.choiceId };
    }),
    device: [...device], variant: guide.variants?.find(item => item.id === progress.variant)?.title ?? '',
    note: (progress.note ?? '').trim(),
  };
}

function text(value: unknown, limit: number): value is string { return typeof value === 'string' && value.length <= limit; }
function validRecord(value: unknown): value is DiagnosisRecord {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const item = value as Record<string, unknown>;
  return text(item.id, 80) && /^[a-zA-Z0-9-]+$/.test(item.id)
    && text(item.guideId, 100) && /^[a-z0-9-]+$/.test(item.guideId)
    && text(item.title, 200) && Boolean(item.title.trim())
    && text(item.recordedAt, 30) && /^\d{4}-\d{2}-\d{2}T/.test(item.recordedAt) && Number.isFinite(Date.parse(item.recordedAt))
    && (item.status === 'resolved' || item.status === 'unresolved')
    && text(item.note, NOTE_LIMIT) && text(item.variant, 200)
    && Array.isArray(item.checked) && item.checked.length <= 100 && item.checked.every(label => text(label, 300))
    && Array.isArray(item.device) && item.device.length <= 20 && item.device.every(line => text(line, 500))
    && Array.isArray(item.answers) && item.answers.length <= 100 && item.answers.every(answer => answer && typeof answer === 'object' && text(answer.question, 300) && text(answer.answer, 300));
}

export function readDiagnosisHistory(storage: ProgressStorage | undefined = browserStorage()): DiagnosisRecord[] {
  try {
    const raw = storage?.getItem(HISTORY_KEY);
    if (!raw || raw.length > STORAGE_LIMIT) return [];
    const data: unknown = JSON.parse(raw);
    if (!data || typeof data !== 'object' || !('version' in data) || data.version !== 1 || !('records' in data) || !Array.isArray(data.records) || data.records.length > HISTORY_LIMIT) return [];
    const seen = new Set<string>();
    return data.records.filter(validRecord).filter(record => {
      if (seen.has(record.id)) return false;
      seen.add(record.id); return true;
    }).sort((a, b) => Date.parse(b.recordedAt) - Date.parse(a.recordedAt));
  } catch { return []; }
}

export function writeDiagnosisHistory(records: DiagnosisRecord[], storage: ProgressStorage | undefined = browserStorage()): boolean {
  try {
    if (!storage || records.length > HISTORY_LIMIT || !records.every(validRecord) || new Set(records.map(item => item.id)).size !== records.length) return false;
    const raw = JSON.stringify({ version: 1, records });
    if (raw.length > STORAGE_LIMIT) return false;
    storage.setItem(HISTORY_KEY, raw);
    return true;
  } catch { return false; }
}

export function upsertDiagnosisRecord(records: DiagnosisRecord[], record: DiagnosisRecord): DiagnosisRecord[] {
  const previous = records.find(item => item.id === record.id);
  return [{ ...record, recordedAt: previous?.recordedAt ?? record.recordedAt }, ...records.filter(item => item.id !== record.id)]
    .sort((a, b) => Date.parse(b.recordedAt) - Date.parse(a.recordedAt));
}

export function diagnosisReport(record: DiagnosisRecord): string {
  const checked = record.checked.length ? record.checked.map(title => `- ${title}`).join('\n') : '확인 완료로 기록한 단계 없음';
  const answers = record.answers.length ? record.answers.map(item => `- ${item.question}: ${item.answer}`).join('\n') : '선택한 결과 없음';
  return `한눈 컴퓨터 점검 기록\n증상: ${record.title}\n점검일: ${new Date(record.recordedAt).toLocaleString('ko-KR')}\n상태: ${record.status === 'resolved' ? '사용자가 해결됨으로 표시' : '추가 확인 필요'}${record.variant ? `\n선택한 상황: ${record.variant}` : ''}\n확인 완료한 단계:\n${checked}\n선택한 확인 결과:\n${answers}\n${record.device.length ? `기기 사양(사용자가 입력한 기록):\n${record.device.join('\n')}` : '기기 모델: (입력해 주세요)'}\n결과 메모: ${record.note || '기록한 메모 없음'}`;
}
