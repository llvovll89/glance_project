export type ScreenGuideId = 'network' | 'sound-output' | 'volume-mixer' | 'task-manager';
export type ScreenPoint = { title: string; description: string };
export type ScreenGuide = {
  id: ScreenGuideId;
  title: string;
  path: string[];
  open: string;
  points: ScreenPoint[];
  note: string;
  source: string;
  sourceName: string;
  reviewed: string;
};

export const screenGuides: Record<ScreenGuideId, ScreenGuide> = {
  network: {
    id: 'network', title: '네트워크 연결 상태 찾기',
    path: ['설정', '네트워크 및 인터넷'],
    open: 'Windows 키 + I로 설정을 열고 ‘네트워크 및 인터넷’을 선택해요.',
    points: [
      { title: '연결 상태 문구 읽기', description: '연결되지 않음, 인터넷 없음 등 내 PC에 표시된 문구를 확인해요. Wi-Fi 연결과 인터넷 연결은 달라요.' },
      { title: '무선 연결은 Wi-Fi', description: 'Wi-Fi 항목을 열어 켜짐 여부와 연결할 네트워크를 확인해요. 항목 자체가 없다면 그 사실을 점검 결과로 선택해요.' },
      { title: '유선 연결은 이더넷', description: '랜선을 사용한다면 이더넷 항목을 열어 연결 상태를 확인해요. 모르는 IP 주소나 DNS 값을 입력하지 않아요.' },
    ],
    note: 'PC가 지원하는 연결 방식에 따라 Wi-Fi나 이더넷 항목이 없을 수 있어요.',
    source: 'https://support.microsoft.com/ko-kr/windows/experience/connectivity-networking/essential-network-settings-and-tasks-in-windows',
    sourceName: 'Microsoft 네트워크 설정 안내', reviewed: '2026.10.29',
  },
  'sound-output': {
    id: 'sound-output', title: '소리를 보낼 출력 장치 찾기',
    path: ['설정', '시스템', '소리'],
    open: 'Windows 키 + I로 설정을 열고 ‘시스템’, ‘소리’ 순서로 선택해요.',
    points: [
      { title: '출력 영역 찾기', description: '소리를 들을 장치는 ‘출력’에서 선택해요. 마이크를 고르는 ‘입력’ 영역과 구분해요.' },
      { title: '실제로 들을 장치 선택하기', description: '내 스피커나 헤드셋의 이름을 확인해 선택해요. 모니터 이름이 보여도 스피커가 내장돼 있지 않을 수 있어요.' },
      { title: '낮은 음량으로 확인하기', description: '음소거 상태와 볼륨을 확인해요. 갑자기 큰 소리가 날 수 있으니 낮은 음량부터 비교해요.' },
    ],
    note: '그림의 장치 이름은 예시예요. 내 PC에 표시된 장치 이름을 기준으로 선택하세요.',
    source: 'https://support.microsoft.com/ko-kr/windows/hardware/audio/fix-sound-or-audio-problems-in-windows',
    sourceName: 'Microsoft 소리 문제 점검 안내', reviewed: '2026.10.29',
  },
  'volume-mixer': {
    id: 'volume-mixer', title: '앱별 볼륨 찾기',
    path: ['설정', '시스템', '소리', '볼륨 믹서'],
    open: '설정의 ‘시스템 > 소리’에서 아래로 내려 ‘볼륨 믹서’를 열어요.',
    points: [
      { title: '시스템 음량과 구분하기', description: '전체 볼륨이 켜져 있어도 앱 하나만 음소거돼 있을 수 있어요.' },
      { title: '문제가 있는 앱 찾기', description: '앱 영역에서 소리가 안 나는 프로그램을 찾아 음소거와 볼륨을 확인해요. 앱 내부의 음량도 함께 살펴봐요.' },
    ],
    note: '앱이 목록에 없다면 해당 앱에서 소리를 재생한 뒤 다시 확인해요. 표시되는 앱은 실행 상태에 따라 달라요.',
    source: 'https://support.microsoft.com/ko-kr/windows/hardware/audio/fix-sound-or-audio-problems-in-windows',
    sourceName: 'Microsoft 소리 문제 점검 안내', reviewed: '2026.10.29',
  },
  'task-manager': {
    id: 'task-manager', title: 'CPU와 메모리 사용량 찾기',
    path: ['작업 관리자', '프로세스'],
    open: 'Ctrl + Shift + Esc로 작업 관리자를 열고 ‘프로세스’를 선택해요.',
    points: [
      { title: 'CPU 열로 정렬하기', description: 'CPU 열 제목을 눌러 사용량 순서로 살펴봐요. 사용량이 높은 앱의 이름을 기록해요.' },
      { title: '메모리 열도 비교하기', description: '메모리 열 제목을 눌러 어떤 앱이 메모리를 사용하는지 확인해요. 잠깐 높은 수치만으로 고장을 판단하지 않아요.' },
    ],
    note: '모르는 프로세스는 강제로 끝내지 않아요. 익숙한 앱도 작업을 저장하고 앱의 닫기 기능으로 정상 종료해요.',
    source: 'https://support.microsoft.com/ko-kr/windows/experience/performance-optimization/tips-to-improve-pc-performance-in-windows',
    sourceName: 'Microsoft PC 성능 개선 안내', reviewed: '2026.10.29',
  },
};

export const screenGuideTargets: { guideId: string; step: number; screen: ScreenGuideId }[] = [
  { guideId: 'network', step: 1, screen: 'network' },
  { guideId: 'wifi-missing', step: 0, screen: 'network' },
  { guideId: 'ethernet', step: 0, screen: 'network' },
  { guideId: 'audio', step: 1, screen: 'sound-output' },
  { guideId: 'audio', step: 2, screen: 'volume-mixer' },
  { guideId: 'slow', step: 1, screen: 'task-manager' },
];

export function findScreenGuide(guideId: string, step: number): ScreenGuide | undefined {
  const target = screenGuideTargets.find(item => item.guideId === guideId && item.step === step);
  return target ? screenGuides[target.screen] : undefined;
}
