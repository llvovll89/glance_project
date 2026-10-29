import { networkRecoveryGuides, networkRecoveryTopics } from './network-recovery';
import { expandedGuides, expandedTopics } from './expanded-content';
import { libraryGuides, libraryTopics } from './library-content';
import { additionalSymptomGuides, additionalSymptomTopics } from './additional-symptoms';
import { extendedSymptomGuides, extendedSymptomTopics } from './extended-symptoms';
import { applyGuideBranches } from './guide-branches';
export type IconName = 'ArrowRight' | 'ArrowLeft' | 'CaretRight' | 'CaretDown' | 'Check' | 'CheckCircle' | 'X' | 'MagnifyingGlass' | 'Monitor' | 'SpeakerHigh' | 'Cpu' | 'Memory' | 'HardDrives' | 'GraphicsCard' | 'TerminalWindow' | 'SquaresFour' | 'ArrowSquareOut' | 'Copy' | 'Info' | 'BookOpen' | 'Sun' | 'Moon' | 'Desktop' | 'ShieldCheck' | 'PlugsConnected';
export type Topic = { id: string; title: string; category: string; summary: string; paragraphs: string[]; exercise: string; icon?: IconName; shortLabel?: string };
export const topics: Topic[] = [
  { id: 'cpu', title: 'CPU', category: '부품', summary: '프로그램의 명령을 처리하는 장치', paragraphs: ['CPU는 프로그램의 명령을 실행하고 계산합니다. 프로그램과 작업에 따라 중요한 성능 지표가 달라서, 코어 수나 동작 속도 하나만으로 모든 성능을 판단하기는 어렵습니다.', '작업 관리자에서 사용률을 볼 수 있어요. 사용률이 높다는 사실만으로 고장을 의미하지는 않습니다.'], exercise: 'Ctrl + Shift + Esc로 작업 관리자를 열고 성능 탭에서 CPU를 확인해 보세요.' },
  { id: 'ram', title: 'RAM', category: '부품', summary: '실행 중인 작업의 데이터를 잠시 보관하는 메모리', paragraphs: ['RAM에는 실행 중인 프로그램이 사용하는 데이터가 올라갑니다. 일반적인 RAM의 내용은 전원을 끄면 사라지므로 사진이나 문서를 오래 보관하는 저장장치와 역할이 달라요.', '메모리 용량이 부족하면 프로그램 전환이 느려질 수 있습니다. 하지만 느려짐에는 여러 원인이 있어 사용량과 함께 확인해야 해요.'], exercise: '작업 관리자 > 성능 > 메모리에서 현재 사용량과 전체 용량을 확인해 보세요.' },
  { id: 'ssd', title: 'SSD', category: '부품', summary: '파일과 프로그램을 보관하는 저장장치', paragraphs: ['SSD는 운영체제, 프로그램, 문서와 사진 등을 저장하는 장치입니다. 전원을 꺼도 저장한 데이터가 유지됩니다.', '저장 공간이 부족하면 업데이트나 파일 저장에 문제가 생길 수 있어요. 모르는 시스템 파일을 직접 삭제하기보다 Windows의 저장소 관리 기능부터 살펴보세요.'], exercise: 'Windows 설정 > 시스템 > 저장소에서 사용 중인 공간을 확인해 보세요.' },
  { id: 'gpu', title: '그래픽카드', category: '부품', summary: '화면을 만들고 그래픽 연산을 처리하는 장치', paragraphs: ['GPU는 화면 표시와 그래픽 연산을 처리합니다. CPU에 내장되기도 하고 별도 그래픽카드에 탑재되기도 해요.', '어떤 화면 출력 단자를 사용해야 하는지는 PC 구성에 따라 달라요. 단자의 위치만 보고 고장이나 정답을 단정하지 말고 제품 설명서를 확인하세요.'], exercise: '장치 관리자 > 디스플레이 어댑터에서 표시되는 이름을 확인해 보세요. 드라이버 삭제나 변경은 하지 않아도 됩니다.' },
  { id: 'os', title: '운영체제', category: '기본 개념', summary: '하드웨어와 프로그램이 함께 동작하도록 관리하는 소프트웨어', paragraphs: ['Windows, macOS, Linux 같은 운영체제는 메모리와 파일, 장치 등을 관리하고 프로그램이 실행되는 환경을 제공합니다.', '앱에서 문제가 생겨도 원인이 항상 운영체제인 것은 아닙니다. 앱 하나의 문제인지, 여러 앱에서 같은 문제가 생기는지 구분하면 확인 범위를 좁힐 수 있어요.'], exercise: 'Windows 설정 > 시스템 > 정보에서 Windows 버전과 장치 사양을 확인해 보세요.' },
  { id: 'shell', title: '터미널과 셸', category: '명령어 입문', summary: '명령을 입력하는 창과, 명령을 해석하는 프로그램', paragraphs: ['터미널은 글자로 명령을 입력하고 결과를 보는 인터페이스입니다. 셸은 입력한 명령을 해석하고 실행하는 프로그램이에요.', 'Windows Terminal에서 PowerShell 같은 셸을 사용할 수 있습니다. 명령 프롬프트(CMD)는 Windows 명령을, PowerShell은 명령과 객체를 다루며, Bash는 Linux와 macOS 등에서 사용하는 셸의 하나예요. Windows에서는 WSL이나 Git Bash 등으로 Bash를 사용할 수도 있어요. 셸이 다르면 같은 목적의 명령도 다를 수 있어요.'], exercise: 'PowerShell에서 Get-Location을 입력하면 현재 위치가 표시됩니다. Get-ChildItem은 현재 위치의 항목을 나열합니다. 두 명령 모두 파일을 수정하거나 삭제하지 않습니다.' },
];
topics.push(...expandedTopics, ...libraryTopics, ...additionalSymptomTopics, ...extendedSymptomTopics, ...networkRecoveryTopics);
export type ResultChoice = { id: string; label: string; target: number | 'resolved' };
export type Guide = { id: string; title: string; summary: string; tags: string[]; icon?: IconName; relatedTopics?: string[]; variants?: { id: string; title: string; description: string; guideId?: string; step: number }[]; steps: { title: string; body: string; tip?: string; check?: string; next?: string; question?: string; choices?: ResultChoice[]; relatedTopics?: string[]; visual?: { icon: IconName; title: string; detail: string } }[]; source: string; sourceName: string; sourceDate?: string };
export const guides: Guide[] = [
  { id: 'display', title: '본체는 켜지는데 화면이 안 나와요', summary: '모니터, 연결 상태, 입력 선택부터 차근차근 확인해요.', tags: ['화면', '모니터', '검은 화면'], relatedTopics: ['gpu', 'motherboard'], steps: [
    { title: '모니터의 메뉴가 표시되나요?', body: '모니터 자체의 메뉴 버튼을 눌러 보세요. 메뉴도 보이지 않으면 모니터 전원과 콘센트 연결을 먼저 확인하세요.', tip: '타는 냄새나 연기, 스파크가 있으면 점검을 멈추고 전원을 안전하게 차단한 뒤 수리를 요청하세요.' },
    { title: '선택한 입력이 연결한 단자와 같나요?', body: '모니터의 입력 선택에서 HDMI 또는 DisplayPort 등 실제 연결한 단자와 같은 입력을 선택하세요. 단자가 여러 개라면 번호도 확인하세요.' },
    { title: '케이블과 PC 연결 위치를 확인해요', body: 'PC를 끄고 외부 영상 케이블의 양쪽 연결을 확인하세요. PC의 올바른 화면 출력 단자는 해당 제품 설명서에서 확인해요. 가능하면 정상 작동을 확인한 케이블이나 모니터로 비교해 보세요.' },
    { title: '비프음이나 진단 표시등이 있나요?', body: '같은 증상이 계속되면 소리 패턴과 표시등을 기록하세요. 화면이 안 나온다는 이유만으로 RAM이나 그래픽카드 고장이라고 판단할 수 없어요. 모델명과 확인한 내용을 준비해 공식 지원에 문의하세요.' },
  ], source: 'https://www.asus.com/us/support/faq/1029959/', sourceName: 'ASUS 화면·비프음 점검 안내' },
  { id: 'beep', title: '전원을 켜면 삐 소리가 나요', summary: '소리 횟수만으로 판단하지 않고 모델과 패턴을 확인해요.', tags: ['비프음', '소리', '삐', '램'], relatedTopics: ['motherboard', 'ram'], steps: [
    { title: '기기 모델부터 확인해요', body: '완제품은 본체 라벨이나 구매 내역에서 모델을 확인하세요. 조립 PC는 구매 내역에서 메인보드 제조사와 모델을 확인하세요. 모르면 분해하지 말고 판매처에 문의해도 괜찮아요.' },
    { title: '소리의 길이와 반복을 기록해요', body: '짧은 소리와 긴 소리를 구분하고, 한 묶음의 횟수와 반복 간격을 적어 보세요. 진단 표시등이 있다면 색과 깜빡임도 기록하세요. 비프음 3번의 의미는 모든 PC에서 같지 않아요.' },
    { title: '해당 모델의 공식 코드표와 비교해요', body: '제조사 지원 페이지에서 정확한 모델의 매뉴얼을 찾아 패턴을 비교하세요. 이 초기 버전에는 모델별 코드 검색이 아직 없어요. 아래 공식 자료는 제조사별 차이를 확인하는 참고 자료예요.', tip: '코드가 메모리 이상을 가리켜도 부품 교체가 바로 필요한 것은 아닙니다. 모델별 절차와 지원 안내를 먼저 확인하세요.' },
    { title: '익숙하지 않은 내부 작업은 지원을 받아요', body: '내부 부품을 만지는 단계는 이 가이드에 포함하지 않아요. 모델명, 패턴, 최근 부품 변경 여부를 정리해 제조사나 수리 담당자에게 전달하세요.' },
  ], source: 'https://www.dell.com/support/kbdoc/en-td/000124349/understanding-beep-codes-on-a-dell-desktop-pc', sourceName: 'Dell 데스크톱 비프음 코드 안내' },
];
guides.push(...expandedGuides, ...libraryGuides, ...additionalSymptomGuides, ...extendedSymptomGuides, ...networkRecoveryGuides);
applyGuideBranches(guides);
