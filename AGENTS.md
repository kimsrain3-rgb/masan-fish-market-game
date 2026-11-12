# 마산 어시장 게임

## 작업 기록

- Notion 기록: https://app.notion.com/p/4167112aae24817fa28dcc1a7ae047a2?pvs=204
- 이 저장소에서 새 작업을 시작할 때 Notion 기록의 '현재 상태'와 관련 일지를 먼저 읽고, 현재 코드 및 Git 작업 트리와 대조하세요. Notion 연결이 안 되면 현재 파일과 Git 기록을 확인해 진행하고, 기록을 읽지 못한 점을 사용자에게 알리세요.
- 의미 있는 작업을 마치면 Notion에 날짜, 변경 내용, 결정 이유, 확인 결과, 남은 일을 갱신하세요. 확인하지 않은 사실이나 계획을 완료된 작업으로 기록하지 마세요.
- Blender와 게임 코딩은 별도 VS Code 창에서 진행합니다. 다른 창이 수정 중인 파일은 동시에 수정하거나 묶어서 커밋하지 마세요.

현재 동작하는 정적 Three.js 프로젝트입니다. 실행 파일은 dist/index.html입니다.
먼저 README_KO.txt를 읽고 기존 구조를 유지해 필요한 부분만 수정하세요.

- 이동·카메라: dist/app.js
- 시장·상인: dist/market.js
- GLB 횟집 배치: dist/restaurant-model.js
- 흥정·주문·식사·지갑: dist/play.js
- 내 캐릭터: dist/player.js
- 렌더러: dist/renderer.js
- UI: dist/index.html, dist/style.css

바다횟집 GLB를 임의의 기본 도형 횟집으로 바꾸지 마세요.
흥정·지갑 저장·입장·착석·회 먹기·골목 복귀·클릭 이동을 보존하세요.
GLB는 로컬 assets에서 불러오며 외부 CDN이 없어도 동작해야 합니다.
로컬 HTTP 서버로 실행해 확인하세요. WebGL 지원 여부에 따라 대체 렌더러가 사용됩니다.
사이트 게시와 로컬 파일 편집은 별개입니다. 이 폴더에는 게시 인증정보가 없습니다.
