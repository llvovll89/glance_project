export type Question = { id: string; question: string; choices: string[]; answer: number; explanation: string; topicId: string };
export const questions: Question[] = [
  { id: 'ram', question: '실행 중인 작업 데이터를 잠시 보관하는 부품은?', choices: ['RAM', 'SSD', '파워서플라이'], answer: 0, explanation: 'RAM은 실행 중인 작업 공간이고, SSD는 파일을 오래 보관하는 저장장치예요.', topicId: 'ram' },
  { id: 'storage', question: '파일 저장 공간이 부족할 때 먼저 확인할 것은?', choices: ['RAM을 무조건 늘린다', '어느 드라이브와 항목이 공간을 쓰는지 확인한다', 'Windows 폴더를 직접 지운다'], answer: 1, explanation: '저장 공간과 RAM은 역할이 달라요. 부족한 드라이브와 내용을 먼저 확인하고 필요한 파일을 보관해요.', topicId: 'files' },
  { id: 'beep', question: '전원을 켤 때 비프음이 3번 나면?', choices: ['모든 PC에서 RAM 고장을 뜻한다', 'CPU를 바로 교체해야 한다', '정확한 모델과 소리 패턴을 공식 자료에서 확인한다'], answer: 2, explanation: '비프음의 의미는 제조사와 모델에 따라 달라요. 횟수만으로 부품 고장을 확정할 수 없어요.', topicId: 'motherboard' },
  { id: 'usb', question: 'USB-C 단자 모양이 같으면 기능도 같을까요?', choices: ['항상 영상 출력과 충전이 된다', 'PC·케이블·기기의 지원 기능을 함께 확인해야 한다', '케이블 색으로 모든 기능을 알 수 있다'], answer: 1, explanation: 'USB-C는 커넥터 모양이에요. 실제 전송·충전·영상 기능은 제품의 지원 규격을 확인해야 해요.', topicId: 'usb' },
  { id: 'network', question: 'Wi-Fi에 연결됐다는 표시가 있으면?', choices: ['인터넷도 반드시 정상이다', '모든 사이트가 반드시 열린다', '공유기에 연결돼도 인터넷 회선에는 문제가 있을 수 있다'], answer: 2, explanation: 'Wi-Fi 연결과 인터넷 연결은 달라요. 같은 네트워크의 다른 기기와 여러 사이트를 비교해요.', topicId: 'network' },
  { id: 'backup', question: '동기화와 백업에 대한 설명으로 맞는 것은?', choices: ['동기화 폴더에서 지운 파일은 다른 곳에 영향이 없다', '동기화는 삭제도 반영될 수 있어 별도 사본과 복구 정책을 확인한다', '파일 이름만 바꾸면 백업이다'], answer: 1, explanation: '동기화는 여러 위치를 맞추는 기능이에요. 중요한 파일은 별도 사본이 열리는지와 복구 범위를 확인해요.', topicId: 'backup' },
  { id: 'driver', question: '장치 드라이버를 확인할 때 알맞은 출처는?', choices: ['모르는 자동 설치 도구', '검색 광고의 첫 다운로드 버튼', 'Windows 업데이트나 해당 모델의 공식 제조사 안내'], answer: 2, explanation: '출처와 정확한 모델이 중요해요. 문제가 있다는 이유만으로 드라이버부터 삭제하지 않아요.', topicId: 'drivers' },
  { id: 'shell', question: '터미널과 셸의 관계로 맞는 것은?', choices: ['터미널은 명령을 입력하고 결과를 보는 인터페이스, 셸은 명령을 해석하는 프로그램이다', '터미널과 RAM은 같은 부품이다', 'Bash는 그래픽카드 이름이다'], answer: 0, explanation: '터미널에서 PowerShell이나 Bash 같은 셸을 사용할 수 있고, 셸에 따라 명령 문법이 달라요.', topicId: 'shell' },
  { id: 'audio', question: '모니터 연결 뒤 소리가 안 나면 먼저?', choices: ['스피커를 바로 구매한다', '선택한 출력 장치와 음소거 상태를 확인한다', '파워를 분해한다'], answer: 1, explanation: '소리의 출력 대상이 모니터 등으로 바뀔 수 있어요. 출력 장치와 PC·앱·기기 볼륨을 확인해요.', topicId: 'audio' },
  { id: 'extension', question: 'photo.txt의 이름을 photo.jpg로 바꾸면?', choices: ['자동으로 사진으로 변환된다', '원본 내용이 모두 지워진다', '확장자만 바뀌며 내용의 형식이 자동 변환되지는 않는다'], answer: 2, explanation: '확장자는 형식의 단서예요. 실제 형식 변환은 해당 프로그램의 변환이나 내보내기 기능이 필요해요.', topicId: 'extensions' },
  { id: 'task', question: '작업 관리자에서 CPU 사용률이 잠깐 높다면?', choices: ['무조건 CPU 고장이다', '어떤 작업과 앱이 사용 중인지 함께 살펴본다', '모르는 프로세스를 모두 끝낸다'], answer: 1, explanation: '앱 실행이나 업데이트 중 사용률이 높아질 수 있어요. 한 순간의 수치만으로 고장을 판단하지 않아요.', topicId: 'taskmanager' },
  { id: 'firmware', question: 'BIOS·UEFI 업데이트를 생각할 때는?', choices: ['모양이 비슷한 다른 모델의 파일도 괜찮다', '전원을 껐다 켜며 아무 파일이나 시험한다', '정확한 모델의 공식 절차와 필요성을 확인한다'], answer: 2, explanation: '펌웨어는 기기의 기본 동작에 관여해요. 정확한 모델과 공식 절차가 중요해요.', topicId: 'firmware' },
  {"id":"router-internet","question":"Wi-Fi 목록에는 연결됐지만 여러 기기의 인터넷이 모두 안 되면?","choices":["PC의 RAM만 교체한다","공유기 바깥 회선이나 공통 연결 상태도 확인한다","모든 PC의 파일을 삭제한다"],"answer":1,"explanation":"무선 연결과 외부 인터넷 연결은 달라요. 같은 네트워크의 다른 기기와 비교해 확인 범위를 좁혀요.","topicId":"router"},
  {"id":"dns-scope","question":"DNS 오류가 보이는 사이트가 한 곳이라면 먼저?","choices":["회사 DNS를 무조건 바꾼다","보안 기능을 모두 끈다","주소·오류를 기록하고 다른 사이트와 기기를 비교한다"],"answer":2,"explanation":"오류만으로 원인을 확정할 수 없어요. 서비스와 브라우저, 연결의 범위를 먼저 비교해요.","topicId":"dns"},
  {"id":"dhcp","question":"DHCP의 역할은?","choices":["네트워크 주소 같은 연결 설정을 자동으로 받도록 돕는다","삭제한 파일을 모두 복원한다","모니터의 밝기를 조절한다"],"answer":0,"explanation":"DHCP는 IP 주소 같은 네트워크 설정을 자동으로 받는 데 쓰여요. 조직 환경의 지정 설정은 담당자에게 확인해요.","topicId":"ip-dhcp"},
  {"id":"recovery-history","question":"파일을 지운 뒤 파일 기록을 처음 켜면?","choices":["과거의 모든 파일이 생긴다","이전에 만들어지지 않은 사본을 소급해서 만들지는 못한다","클라우드 휴지통도 비워진다"],"answer":1,"explanation":"파일 기록 복원에는 미리 준비된 사본이 필요해요. 삭제 위치의 휴지통과 다른 백업도 확인해요.","topicId":"file-recovery"},
  {"id":"cloud-offline","question":"탐색기에 온라인 전용 파일 이름이 보이면?","choices":["언제나 인터넷 없이 열린다","PC에 전체 내용이 반드시 저장돼 있다","내용을 내려받을 연결이 필요할 수 있다"],"answer":2,"explanation":"이름이 표시되는 것과 로컬 사본이 있는 것은 달라요. 파일 상태와 동기화 안내를 확인해요.","topicId":"cloud-files"},
  {"id":"cloud-quota","question":"PC 공간은 충분한데 OneDrive 업로드가 멈췄다면?","choices":["클라우드 계정 저장 한도와 앱의 오류도 확인한다","Windows 폴더를 지운다","동기화 폴더를 전부 삭제한다"],"answer":0,"explanation":"PC 여유 공간과 클라우드 저장 한도는 별개예요. 오류를 읽고 미업로드 원본을 먼저 보관해요.","topicId":"cloud-files"},
];
export function quizScore(answers: Record<string, number>): { answered: number; correct: number } {
  const valid = questions.filter(question => Number.isInteger(answers[question.id]) && answers[question.id] >= 0 && answers[question.id] < question.choices.length);
  return { answered: valid.length, correct: valid.filter(question => answers[question.id] === question.answer).length };
}
