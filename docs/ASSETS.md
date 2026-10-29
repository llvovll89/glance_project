# 이미지·글꼴·아이콘

## 하드웨어 이미지
public/assets/computer-studio.png
내장 imagegen 도구로 이번 앱을 위해 생성한 이미지. 개념 이미지이며 정확한 분해·배선 절차를 나타내지 않는다.
생성 프롬프트:
Use case: stylized-concept. Asset type: a Korean computer literacy web application's main hardware visualization, landscape 3:2 composition. Create a meticulously art-directed high-end industrial 3D product render of a compact desktop computer tower, three-quarter isometric view facing left, full object visible with generous empty margin. A silver aluminum chassis with an open transparent side reveals tidy recognizable motherboard, rectangular graphics card with two small fans, two vertical memory sticks, metal CPU cooler, SSD, and neatly routed cables. Dark graphite internal components, a restrained cobalt blue detail on one cable or memory edge. A single clean thin silver monitor with dark blank screen is beside the computer, a simple short cable connects them. Entire scene floats just above a pale cool silver-grey studio surface #eef0f5 with a subtle natural contact shadow. Soft diffused daylight, tangible fine brushed aluminum, editorial precision, no neon, no decorative glow, no futuristic holograms, no purple, no green. The tower is the primary subject, not gaming machinery. No text, no labels, no icons, no lettering, no UI, no logos, no watermarks. This is an approachable illustrative product concept rather than a repair diagram. Frame so everything fits in center, lower third has breathing room.

## 글꼴
public/fonts/PretendardVariable.woff2
기존 작업공간에 설치된 Pretendard Variable 복사. SIL Open Font License는 public/fonts/LICENSE.txt.

## 아이콘
public/icons/*.svg
기존 작업공간에 설치된 @phosphor-icons/react 2.1.10의 regular 아이콘을 공식 컴포넌트에서 SVG로 내보냈다. 직접 path를 그리지 않았다. 모든 아이콘은 CSS mask-image로 currentColor를 적용하며 테마별 대비를 유지한다. MIT 라이선스는 public/icons/LICENSE.txt.
앱 실행에 다른 프로젝트나 추가 아이콘 패키지 설치는 필요하지 않다.

## 모바일 전달 최적화
원본 PNG에서 640/1024/1536px WebP를 생성해 화면 크기에 따라 선택하도록 srcset/sizes를 적용했습니다.
이는 이미지 내용 편집이 아닌 파일 형식과 전송 크기 최적화입니다. 원본 PNG는 제작 자산으로 보존합니다.

## Windows 11 설정 안내 그림

`src/SettingsVisual.tsx`, `src/settings-visual.css`에서 직접 구성한 HTML/CSS 안내도입니다. 실제 Windows 화면 캡처나 외부 이미지 자산을 사용하지 않으며, 필요한 메뉴와 번호별 확인 위치만 표현합니다. 사용자 기기의 상태나 개인정보를 수집하지 않습니다.

2026-10-29에 다음 Microsoft 공식 안내에서 메뉴 경로와 확인할 내용을 검토했습니다. 그림과 텍스트에는 예시 표시, 버전·기기별 차이 안내, 해당 공식 출처 링크와 검토일을 함께 제공합니다.

- [네트워크 설정과 연결 상태](https://support.microsoft.com/ko-kr/windows/experience/connectivity-networking/essential-network-settings-and-tasks-in-windows)
- [소리 출력 장치와 볼륨 점검](https://support.microsoft.com/ko-kr/windows/hardware/audio/fix-sound-or-audio-problems-in-windows)
- [작업 관리자와 PC 성능 점검](https://support.microsoft.com/ko-kr/windows/experience/performance-optimization/tips-to-improve-pc-performance-in-windows)
