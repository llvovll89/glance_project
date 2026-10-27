export type PcProfile = {
  nickname: string;
  deviceType: 'unknown' | 'desktop' | 'laptop';
  os: 'unknown' | 'windows11' | 'windows10' | 'macos' | 'linux' | 'other';
  osVersion: string;
  cpu: string;
  ram: string;
  gpu: string;
  storage: string;
};
export type ProfileStorage = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;
export const PROFILE_KEY = 'hanno-pc-profile-v1';
export const emptyProfile: PcProfile = { nickname: '', deviceType: 'unknown', os: 'unknown', osVersion: '', cpu: '', ram: '', gpu: '', storage: '' };
export const osNames: Record<PcProfile['os'], string> = { unknown: '아직 모르겠어요', windows11: 'Windows 11', windows10: 'Windows 10', macos: 'macOS', linux: 'Linux', other: '기타 운영체제' };
export const deviceNames: Record<PcProfile['deviceType'], string> = { unknown: '아직 모르겠어요', desktop: '데스크톱', laptop: '노트북' };
const textKeys = ['nickname', 'osVersion', 'cpu', 'ram', 'gpu', 'storage'] as const;

export function normalizeProfile(value: unknown): PcProfile {
  const profile = { ...emptyProfile };
  if (!value || typeof value !== 'object' || Array.isArray(value)) return profile;
  const data = value as Record<string, unknown>;
  for (const key of textKeys) if (typeof data[key] === 'string') profile[key] = data[key].replace(/[\u0000-\u001f]/g, ' ').trim().slice(0, 80);
  if (typeof data.deviceType === 'string' && Object.hasOwn(deviceNames, data.deviceType)) profile.deviceType = data.deviceType as PcProfile['deviceType'];
  if (typeof data.os === 'string' && Object.hasOwn(osNames, data.os)) profile.os = data.os as PcProfile['os'];
  return profile;
}
export function hasProfileValues(profile: PcProfile): boolean {
  return textKeys.some(key => Boolean(profile[key].trim())) || profile.deviceType !== 'unknown' || profile.os !== 'unknown';
}
function browserStorage(): ProfileStorage | undefined {
  try { return typeof window === 'undefined' ? undefined : window.localStorage; } catch { return undefined; }
}
export function readPcProfile(storage: ProfileStorage | undefined = browserStorage()): PcProfile | null {
  try {
    const raw = storage?.getItem(PROFILE_KEY);
    if (!raw || raw.length > 10000) return null;
    const data: unknown = JSON.parse(raw);
    if (!data || typeof data !== 'object' || !('version' in data) || data.version !== 1 || !('profile' in data)) return null;
    const profile = normalizeProfile(data.profile);
    return hasProfileValues(profile) ? profile : null;
  } catch { return null; }
}
export function savePcProfile(profile: PcProfile, storage: ProfileStorage | undefined = browserStorage()): boolean {
  try {
    const normalized = normalizeProfile(profile);
    if (!storage || !hasProfileValues(normalized)) return false;
    storage.setItem(PROFILE_KEY, JSON.stringify({ version: 1, profile: normalized }));
    return true;
  } catch { return false; }
}
export function deletePcProfile(storage: ProfileStorage | undefined = browserStorage()): boolean {
  try { if (!storage) return false; storage.removeItem(PROFILE_KEY); return true; } catch { return false; }
}
export function profileLines(profile: PcProfile): string[] {
  const fields: [string, string][] = [
    ['PC 이름', profile.nickname], ['기기', profile.deviceType === 'unknown' ? '' : deviceNames[profile.deviceType]],
    ['운영체제', profile.os === 'unknown' ? '' : osNames[profile.os]], ['OS 버전', profile.osVersion],
    ['CPU', profile.cpu], ['RAM', profile.ram], ['그래픽', profile.gpu], ['저장장치', profile.storage],
  ];
  return fields.filter(([, value]) => value.trim()).map(([label, value]) => `${label}: ${value}`);
}
export function profileTopicIds(profile: PcProfile): string[] {
  const ids: string[] = [];
  if (profile.cpu) ids.push('cpu', 'taskmanager');
  if (profile.ram) ids.push('ram');
  if (profile.gpu) ids.push('gpu');
  if (profile.storage) ids.push('ssd', 'files');
  if (profile.os !== 'unknown' || profile.osVersion) ids.push('os');
  if (profile.deviceType === 'desktop') ids.push('power');
  if (profile.deviceType === 'laptop') ids.push('cooling');
  return [...new Set(ids)];
}
