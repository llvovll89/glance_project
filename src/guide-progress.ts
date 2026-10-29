import type { Guide } from './content';

export type GuideAnswer = { step: number; choiceId: string };
export type GuideProgress = { guideId: string; step: number; reviewed: number[]; variant?: string; answers?: GuideAnswer[] };
export type ProgressStorage = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;
export const GUIDE_PROGRESS_KEY = 'hanno-guide-progress-v1';

function browserStorage(): ProgressStorage | undefined {
  try { return typeof window === 'undefined' ? undefined : window.localStorage; } catch { return undefined; }
}

function validProgress(value: unknown, guides: Guide[]): value is GuideProgress {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const progress = value as Record<string, unknown>;
  const guide = guides.find(item => item.id === progress.guideId);
  if (!guide) return false;
  return Number.isInteger(progress.step) && (progress.step as number) >= 0 && (progress.step as number) < guide.steps.length
    && Array.isArray(progress.reviewed) && progress.reviewed.length <= guide.steps.length
    && progress.reviewed.every((step: unknown) => Number.isInteger(step) && (step as number) >= 0 && (step as number) < guide.steps.length)
    && new Set(progress.reviewed).size === progress.reviewed.length
    && (progress.answers === undefined || (Array.isArray(progress.answers) && progress.answers.length <= guide.steps.length
      && progress.answers.every((answer: unknown, index: number, answers: unknown[]) => {
        if (!answer || typeof answer !== 'object' || Array.isArray(answer)) return false;
        const item = answer as Record<string, unknown>;
        return Number.isInteger(item.step) && (item.step as number) >= 0
          && Boolean(guide.steps[item.step as number]?.choices?.some(choice => choice.id === item.choiceId))
          && (index === 0 || (answers[index - 1] as GuideAnswer).step < (item.step as number))
          && (progress.reviewed as number[]).includes(item.step as number);
      })))
    && (progress.variant === undefined || (typeof progress.variant === 'string' && Boolean(guide.variants?.some(item => item.id === progress.variant))));
}

export function readGuideProgress(guides: Guide[], storage: ProgressStorage | undefined = browserStorage()): GuideProgress | null {
  try {
    const raw = storage?.getItem(GUIDE_PROGRESS_KEY);
    if (!raw || raw.length > 2000) return null;
    const data: unknown = JSON.parse(raw);
    if (!data || typeof data !== 'object' || !('version' in data) || data.version !== 1 || !('progress' in data) || !validProgress(data.progress, guides)) return null;
    return data.progress;
  } catch { return null; }
}

export function saveGuideProgress(progress: GuideProgress, guides: Guide[], storage: ProgressStorage | undefined = browserStorage()): boolean {
  try {
    if (!storage || !validProgress(progress, guides)) return false;
    storage.setItem(GUIDE_PROGRESS_KEY, JSON.stringify({ version: 1, progress }));
    return true;
  } catch { return false; }
}

export function deleteGuideProgress(storage: ProgressStorage | undefined = browserStorage()): boolean {
  try { if (!storage) return false; storage.removeItem(GUIDE_PROGRESS_KEY); return true; } catch { return false; }
}
