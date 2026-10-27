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
