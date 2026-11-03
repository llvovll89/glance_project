import type { Topic } from './content';

const refreshSource = { name: 'Microsoft · 모니터 주사율 확인과 변경', url: 'https://support.microsoft.com/en-us/windows/hardware/display-graphics/change-the-refresh-rate-on-your-monitor-in-windows' };
const fpsSource = { name: 'Intel · 주사율과 CPU·GPU의 관계', url: 'https://www.intel.com/content/www/us/en/gaming/resources/highest-refresh-rate-gaming.html' };
const gpuSource = { name: 'NVIDIA · RTX 5060 제품군 공식 사양', url: 'https://www.nvidia.com/en-us/geforce/graphics-cards/50-series/rtx-5060-family/' };
const vramSource = { name: 'AMD · VRAM의 역할', url: 'https://www.amd.com/en/products/graphics/gaming/vram.html' };

export const displayKnowledgeTopics: Topic[] = [
  {
    id: 'refresh-rate', title: '60Hz vs 75Hz vs 144Hz', category: '모니터와 화면', icon: 'Monitor',
    summary: '주사율은 화면을 1초에 몇 번 새로 그릴 수 있는지 나타내요',
    paragraphs: [
      'Hz(헤르츠)는 주사율의 단위예요. 144Hz 모니터는 1초에 최대 144번 화면을 갱신할 수 있어요. 숫자가 높을수록 움직임을 더 촘촘하게 표시할 여지가 있지만, 해상도나 색 표현이 함께 좋아진다는 뜻은 아니에요.',
      '60Hz에서 75Hz는 갱신 횟수가 25% 늘고, 60Hz에서 144Hz는 2.4배가 돼요. 아래 간격은 1,000ms를 주사율로 나눈 값이며 모니터의 응답 속도나 전체 입력 지연을 뜻하지 않아요.',
      '마우스 이동·스크롤·빠른 게임에서 차이를 느낄 수 있어요. 다만 144Hz로 설정해도 게임이 60FPS라면 서로 다른 게임 화면 144장을 매초 받아 보여주는 것은 아니에요. 원본이 24·30FPS인 영상도 주사율만 높인다고 원본의 움직임 정보가 늘지는 않아요.',
    ],
    comparison: { caption: '주사율별 갱신 횟수와 간격', columns: ['주사율', '1초당 최대 갱신', '갱신 사이 간격'], rows: [['60Hz', '60번', '약 16.67ms'], ['75Hz', '75번', '약 13.33ms'], ['144Hz', '144번', '약 6.94ms']] },
    exercise: '설정 > 시스템 > 디스플레이 > 고급 디스플레이에서 대상 모니터를 고르고 현재 주사율을 읽어 보세요. 144Hz 제품이어도 현재 설정이 60Hz일 수 있어요. 표시되지 않는 수치를 강제로 적용하지 않아요.',
    relatedTopics: ['fps-hz', 'display-connection'], sources: [refreshSource, fpsSource],
  },
  {
    id: 'fps-hz', title: 'FPS와 Hz, 응답 속도는 달라요', category: '모니터와 화면', icon: 'Monitor',
    summary: '그래픽카드가 만드는 화면 수와 모니터의 갱신 횟수를 구분해요',
    paragraphs: [
      'FPS는 게임 등이 1초에 만드는 프레임 수예요. Hz는 모니터의 갱신 횟수예요. CPU·GPU가 프레임을 준비하고 모니터가 표시하므로, 게임이 144FPS를 꾸준히 내는지와 모니터가 144Hz로 동작하는지는 따로 확인해요.',
      '60Hz 화면에서 게임이 144FPS로 실행돼도 서로 다른 완전한 프레임 144장을 매초 표시하지는 못해요. 높은 FPS가 입력 반영 지연에 도움을 줄 수는 있지만, 동기화하지 않으면 한 번의 화면 갱신에 여러 프레임 일부가 섞여 화면이 갈라져 보이는 티어링이 생길 수 있어요.',
      'V-Sync는 화면 갱신에 프레임 출력을 맞추는 기능이며, 설정과 상황에 따라 지연이나 끊김이 달라져요. VRR(가변 주사율), G-SYNC, FreeSync는 지원 범위 안에서 모니터 갱신을 프레임에 맞추는 기술이에요. GPU·모니터·연결 방식의 호환성을 확인해야 해요.',
      '제품의 1ms 같은 응답 속도는 픽셀 색이 바뀌는 데 걸리는 시간을 가리키는 경우가 많아요. 1ms라고 1,000Hz인 것도, 마우스 입력부터 화면 표시까지 전체 지연이 1ms인 것도 아니에요. 측정 조건과 잔상도 함께 봐야 해요.',
    ],
    exercise: '게임 내 성능 표시에서 FPS를 읽고, Windows 고급 디스플레이의 Hz와 나란히 적어 보세요. 게임마다 결과가 다르므로 한 게임의 숫자로 그래픽카드 전체 성능을 단정하지 않아요.',
    relatedTopics: ['refresh-rate', 'gpu-monitor-match'], sources: [fpsSource, refreshSource],
  },
  {
    id: 'display-resolution', title: 'FHD·QHD·4K 해상도', category: '모니터와 화면', icon: 'Monitor',
    summary: '화면의 픽셀 수예요. 주사율이나 패널 종류와는 다른 기준이에요',
    paragraphs: [
      '해상도는 가로와 세로에 배치된 픽셀 수예요. 일반적인 16:9 모니터에서 FHD는 1920 × 1080, QHD는 2560 × 1440, 4K UHD는 3840 × 2160이에요. 인치는 화면의 물리적 크기이고, 같은 크기에서는 픽셀이 많을수록 더 촘촘하게 표현할 수 있어요.',
      '4K UHD는 FHD보다 픽셀 수가 4배예요. 같은 조건의 게임에서 해상도를 올리면 GPU가 처리할 픽셀이 많아져 FPS가 낮아지거나 VRAM 사용량이 늘 수 있어요. 다만 실제 성능이 반드시 정확히 4분의 1이 되는 것은 아니에요.',
      'FHD·QHD·4K는 해상도, 60Hz·144Hz는 주사율, OLED·QLED는 화면을 만드는 방식에 관한 말이에요. 서로 경쟁하는 하나의 등급표가 아니므로 FHD 144Hz OLED 같은 조합도 가능해요.',
      '글자가 작게 느껴지면 모니터 권장 해상도를 유지하고 Windows 배율을 확인해요. 게임의 렌더링 해상도·업스케일링과 모니터로 전송하는 출력 해상도는 다를 수 있어요.',
    ],
    comparison: { caption: '일반적인 16:9 해상도 비교', columns: ['이름', '가로 × 세로', 'FHD 대비 픽셀 수'], rows: [['FHD', '1920 × 1080', '1배'], ['QHD', '2560 × 1440', '약 1.78배'], ['4K UHD', '3840 × 2160', '4배']] },
    exercise: '설정 > 시스템 > 디스플레이에서 대상 모니터의 디스플레이 해상도와 배율을 읽어 보세요. 모니터 설명서의 기본 해상도와 비교하고, 게임 속 해상도도 별도로 확인해요.',
    relatedTopics: ['refresh-rate', 'display-panels', 'vram'],
    sources: [{ name: 'Microsoft · 화면 해상도와 배율 변경', url: 'https://support.microsoft.com/en-us/windows/hardware/display-graphics/change-your-screen-resolution-and-layout-in-windows' }, vramSource],
  },
  {
    id: 'display-panels', title: 'LCD·OLED·QLED의 차이', category: '모니터와 화면', icon: 'Monitor',
    summary: '뒤에서 빛을 비추는 방식과 픽셀이 직접 빛나는 방식을 알아봐요',
    paragraphs: [
      'LCD는 백라이트의 빛을 액정으로 조절해 화면을 만들어요. 흔히 LED 모니터라고 부르는 제품도 LED 백라이트를 쓰는 LCD인 경우가 많아요. IPS·VA·TN은 LCD의 액정 구동 방식이에요.',
      'OLED는 픽셀이 스스로 빛을 내므로 별도 백라이트가 없어요. 검은 부분의 픽셀을 끌 수 있어 명암 표현에 장점이 있지만, 고정된 화면을 오래 표시하는 사용 습관과 모델별 번인 방지 기능·보증 조건을 확인해야 해요.',
      '일반적인 소비자용 QLED는 LCD에 퀀텀닷 기술을 더한 방식으로 백라이트를 사용해요. OLED와 같은 자발광 방식이라는 뜻은 아니에요. Mini LED는 백라이트 기술이며, QD-OLED는 퀀텀닷과 OLED를 결합한 별도 방식이에요.',
      '패널 이름만으로 색 정확도·밝기·잔상·주사율을 모두 판단할 수는 없어요. 문서 작업, 밝은 방, 영상 감상 등 사용 환경과 정확한 모델의 사양을 함께 비교해요. OLED나 QLED라는 이유만으로 GPU 요구 성능이 결정되지는 않아요.',
    ],
    comparison: { caption: '화면을 만드는 방식 비교', columns: ['방식', '빛을 만드는 곳', '함께 확인할 점'], rows: [['LCD / LED', '별도 백라이트', 'IPS·VA·TN, 시야각과 잔상'], ['QLED', '퀀텀닷을 활용한 LCD 백라이트', '로컬 디밍·밝기 등 모델 사양'], ['OLED', '각 픽셀이 직접 발광', '번인 관리·사용 환경·보증 조건']] },
    exercise: '모니터 뒷면 라벨이나 구매 내역에서 모델을 찾고 제조사 사양의 패널 방식·해상도·주사율을 각각 적어 보세요. 제품명에 LED라고 적힌 것만으로 OLED라고 판단하지 않아요.',
    relatedTopics: ['display-resolution', 'refresh-rate'],
    sources: [{ name: 'Samsung · LED·OLED·QLED 방식 비교', url: 'https://www.samsung.com/us/tvs/tv-buying-guide/led-vs-oled-vs-qled-vs-neo-qled/' }, { name: 'Samsung · OLED 모니터 번인 예방 안내', url: 'https://www.samsung.com/us/support/troubleshoot/TSG10003240/' }],
  },
  {
    id: 'vram', title: 'VRAM과 그래픽카드의 8GB', category: '그래픽카드와 조합', icon: 'GraphicsCard',
    summary: 'GPU가 그래픽 작업에 쓰는 메모리예요. PC의 RAM과 구분해요',
    paragraphs: [
      'VRAM은 GPU가 텍스처, 화면 버퍼와 그래픽 작업 데이터를 보관하는 메모리예요. 별도 그래픽카드의 전용 VRAM은 PC의 일반 RAM이나 SSD 저장 공간과 역할이 달라요. 공유 GPU 메모리도 전용 VRAM과 같은 속도·성능을 보장하지 않아요.',
      '예를 들어 GeForce RTX 5060 Ti 8GB의 8GB는 전용 그래픽 메모리 용량이에요. GTX 5060 Ti가 아니라 RTX 5060 Ti가 공식 모델명이며, 8GB와 16GB 모델이 있어요. 16GB라고 모든 게임의 FPS가 8GB 모델의 두 배가 되는 것은 아니에요.',
      '해상도, 고해상도 텍스처, 레이 트레이싱, 모드와 작업 데이터에 따라 필요한 메모리가 달라져요. VRAM이 부족하면 작업에 따라 순간 끊김, 늦게 나타나는 텍스처, 성능 저하나 실행 오류가 생길 수 있어요. 모든 끊김이 VRAM 부족 때문인 것은 아니에요.',
      '8GB가 충분한지는 게임·프로그램과 설정마다 달라요. 문제가 있다면 게임의 텍스처 품질 같은 항목을 하나씩 낮춰 비교해요. 사용량이 높다는 사실만으로 부족을 확정하지 말고 실제 끊김과 변화도 함께 기록해요. 모니터를 교체해도 VRAM 자체 용량은 늘지 않아요.',
    ],
    exercise: 'Ctrl + Shift + Esc > 성능 > GPU에서 이름과 전용 GPU 메모리 사용량·전체 용량을 읽어 보세요. GPU가 여러 개면 이름을 확인해 선택해요. 공유 GPU 메모리를 더해서 그래픽카드의 전용 용량으로 적지 않아요.',
    relatedTopics: ['gpu', 'ram', 'display-resolution', 'gpu-monitor-match'], sources: [vramSource, gpuSource],
  },
  {
    id: 'gpu-monitor-match', title: '새 그래픽카드와 구형 모니터 조합', category: '그래픽카드와 조합', icon: 'GraphicsCard',
    summary: 'RTX 5060 Ti 8GB도 모니터·연결·설정에 따라 체감이 달라져요',
    paragraphs: [
      '아래는 RTX 5060 Ti 8GB를 예로 든 조합 설명이에요. 구형 모니터에 연결했다는 이유만으로 그래픽카드가 고장 나거나 성능이 자동으로 같은 비율만큼 떨어지는 것은 아니에요. 지원되는 입력 신호와 연결 조건을 먼저 확인해요.',
      'FHD 60Hz 모니터라면 정상 연결 시 사용할 수 있지만, 모니터는 1초에 60번 갱신해요. 게임이 144FPS를 만들어도 144Hz 화면처럼 완전한 프레임 144장을 매초 표시할 수는 없어요. 그래픽카드가 빨라졌다고 모니터 자체의 해상도·주사율·색 표현 능력이 바뀌지는 않아요.',
      '반대로 4K 고주사율 모니터를 연결한다고 게임도 그 FPS로 실행되는 것은 아니에요. 화면 출력 지원 사양과 실제 게임 성능은 달라요. 게임, CPU, 그래픽 옵션, VRAM 사용량을 함께 확인해야 하며 이 예시는 특정 게임의 성능을 보장하는 벤치마크가 아니에요.',
      '먼저 현재 해상도·Hz와 게임 FPS를 확인하고, 원하는 작업에서 무엇이 부족한지 정리해요. 문서 작업이나 60FPS 콘텐츠가 중심이라면 기존 모니터를 계속 쓸 수도 있어요. 구매 전에는 정확한 그래픽카드·모니터 모델과 입력별 지원 모드를 비교해요.',
    ],
    comparison: { caption: 'RTX 5060 Ti 8GB 조합에서 확인할 상황 예시', columns: ['상황', '가능한 제약', '먼저 확인할 것'], rows: [['FHD 60Hz 모니터', '화면 갱신은 최대 60Hz', '현재 Hz와 실제 게임 FPS'], ['144Hz 제품인데 60Hz만 표시', '설정 또는 입력·연결 조건', '단자별 지원 모드와 케이블'], ['DVI·VGA만 있는 모니터', '직접 연결할 단자가 없을 수 있음', '변환 방향과 지원 해상도·Hz'], ['4K 고주사율 게임', '목표 FPS 미달 또는 메모리 제약', '게임 옵션·CPU·GPU·VRAM']] },
    exercise: '그래픽카드 모델 / 모니터 모델 / 연결 단자와 케이블 / 현재 해상도·Hz / 게임과 FPS를 한 줄씩 적어 보세요. 모니터 나이만으로 교체를 결정하지 말고 원하는 작업의 제약을 찾아봐요.',
    relatedTopics: ['refresh-rate', 'fps-hz', 'vram', 'display-connection'], sources: [gpuSource, refreshSource, fpsSource],
  },
  {
    id: 'display-connection', title: 'HDMI·DisplayPort와 구형 단자', category: '그래픽카드와 조합', icon: 'PlugsConnected',
    summary: '같은 모니터도 어느 단자와 케이블로 연결했는지에 따라 달라요',
    paragraphs: [
      '원하는 해상도와 주사율을 쓰려면 그래픽카드 출력, 모니터 입력, 케이블과 중간 어댑터가 그 조합을 함께 지원해야 해요. HDMI는 무조건 60Hz, DisplayPort는 무조건 144Hz라는 식으로 구분할 수는 없어요.',
      'RTX 5060 제품군 공식 사양에는 HDMI와 DisplayPort가 안내돼 있어요. 실제 단자 수와 구성은 구입한 제조사 모델을 확인해요. 구형 모니터에 DVI나 VGA만 있다면 직접 연결할 수 없을 수 있어요. 변환기는 입력·출력 방향, 신호 변환 방식과 지원 모드를 확인해야 해요.',
      '과거에 DVI로 144Hz를 쓰던 모니터라도 단순 HDMI–DVI 변환으로 같은 주사율을 보장하지 않아요. 특정 모니터는 특정 입력에서만 최대 주사율을 지원해요. VGA 같은 아날로그 신호 변환이나 DVI 듀얼링크에 필요한 조건은 정확한 제품 설명서를 확인해요.',
      '144Hz가 목록에 없다면 대상 모니터 선택, 현재 해상도, 입력별 지원 모드, 케이블·허브·변환기, 드라이버 안내를 순서대로 살펴봐요. 복제 모드 등 다중 화면 구성도 영향을 줄 수 있어요. 비공식 사용자 지정 타이밍이나 모니터 오버클럭은 이 가이드에서 다루지 않아요.',
    ],
    exercise: '모니터 설명서에서 지원 해상도·주사율 표를 찾아 현재 입력 단자와 대조해 보세요. 허브나 변환기가 있다면 모델과 지원 모드도 적어요. 외부 케이블을 다시 연결할 때는 작업을 저장하고 기기 설명서의 절차를 따라요.',
    relatedTopics: ['gpu-monitor-match', 'refresh-rate', 'usb'],
    sources: [refreshSource, gpuSource, { name: 'Intel · FHD 144Hz 연결 조건 확인', url: 'https://www.intel.com/content/www/us/en/support/articles/000037046/graphics.html' }, { name: 'NVIDIA · 디스플레이 변환 어댑터 안내', url: 'https://nvidia.custhelp.com/app/answers/detail/a_id/4449/' }],
  },
];
