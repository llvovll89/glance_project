import type { Guide, ResultChoice } from './content';

type Branch = { guideId: string; step: number; question: string; choices: ResultChoice[] };

// Destinations refer to the existing checks, using the same official sources.
const branches: Branch[] = [
  { guideId: 'network', step: 0, question: '같은 네트워크의 다른 기기에서는 인터넷이 되나요?', choices: [
    { id: 'pc-only', label: '다른 기기는 되고 이 PC만 안 돼요', target: 1 },
    { id: 'all-devices', label: '다른 기기도 여러 사이트가 안 열려요', target: 3 },
  ] },
  { guideId: 'network', step: 1, question: '연결 상태를 확인한 뒤 인터넷이 되나요?', choices: [
    { id: 'working', label: '이제 여러 사이트가 잘 열려요', target: 'resolved' },
    { id: 'still-offline', label: '여전히 인터넷이 안 돼요', target: 2 },
  ] },
  { guideId: 'audio', step: 0, question: '다른 앱에서도 소리가 안 나나요?', choices: [
    { id: 'all-apps', label: '모든 앱에서 소리가 안 나요', target: 1 },
    { id: 'one-app', label: '다른 앱은 들리고 특정 앱만 안 들려요', target: 2 },
    { id: 'working', label: '볼륨을 확인하니 다시 들려요', target: 'resolved' },
  ] },
  { guideId: 'audio', step: 2, question: '앱별 볼륨과 연결을 확인한 결과는 어떤가요?', choices: [
    { id: 'working', label: '사용하려던 앱에서도 소리가 나요', target: 'resolved' },
    { id: 'still-silent', label: '아직 소리가 안 나요', target: 3 },
  ] },
  { guideId: 'wifi-missing', step: 0, question: '설정에 Wi-Fi 항목이 보이나요?', choices: [
    { id: 'no-wifi', label: 'Wi-Fi 항목 자체가 없어요', target: 3 },
    { id: 'missing-name', label: 'Wi-Fi 항목은 있지만 내 공유기 이름이 없어요', target: 1 },
  ] },
  { guideId: 'wifi-missing', step: 1, question: '다른 기기에서는 내 공유기 이름이 보이나요?', choices: [
    { id: 'pc-only', label: '다른 기기에는 보이고 이 PC만 안 보여요', target: 2 },
    { id: 'all-devices', label: '다른 기기에서도 안 보여요', target: 3 },
  ] },
  { guideId: 'ethernet', step: 0, question: '이더넷에 어떤 상태가 표시되나요?', choices: [
    { id: 'unplugged', label: '네트워크 케이블이 연결되지 않았다고 나와요', target: 1 },
    { id: 'no-internet', label: '연결돼 있지만 인터넷이 없다고 나와요', target: 2 },
  ] },
  { guideId: 'slow', step: 0, question: '다시 시작한 뒤 같은 작업을 해보니 어떤가요?', choices: [
    { id: 'working', label: '다시 평소처럼 작동해요', target: 'resolved' },
    { id: 'still-slow', label: '여전히 느려요', target: 1 },
  ] },
  { guideId: 'slow', step: 1, question: '사용량이 높은 익숙한 앱을 정상적으로 닫았나요?', choices: [
    { id: 'working', label: '앱을 닫으니 평소처럼 작동해요', target: 'resolved' },
    { id: 'still-slow', label: '계속 느리거나 어떤 앱인지 모르겠어요', target: 2 },
  ] },
];

export function applyGuideBranches(guides: Guide[]) {
  for (const branch of branches) {
    const step = guides.find(guide => guide.id === branch.guideId)?.steps[branch.step];
    if (!step) throw new Error(`Missing branch step: ${branch.guideId}/${branch.step}`);
    step.question = branch.question;
    step.choices = branch.choices;
  }
}
