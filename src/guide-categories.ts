import type { Guide } from './content';
export const guideGroups = [
  { id: 'all', label: '전체', ids: [] as string[] },
  { id: 'screen-power', label: '화면·전원·발열', ids: ['display', 'beep', 'power', 'stop-error', 'heat', 'charging', 'screen-flicker', 'external-display', 'wake-sleep'] },
  { id: 'performance', label: '속도·저장 공간', ids: ['slow', 'disk-space'] },
  { id: 'connections', label: '연결·주변기기', ids: ['network', 'audio', 'usb-device', 'bluetooth-connect', 'camera', 'keyboard-mouse', 'microphone-input', 'printer', 'touchpad'] },
  { id: 'system', label: 'Windows·앱', ids: ['windows-update', 'app-freeze', 'app-install', 'korean-input'] },
];
export function filterGuides(guides: Guide[], groupId: string): Guide[] {
  const group = guideGroups.find(item => item.id === groupId);
  return !group || group.id === 'all' ? guides : guides.filter(guide => group.ids.includes(guide.id));
}
