마산 어시장 게임 — 최신 소스

현재 게시된 버전: 18c93ae20e3688a58892f4f13eb847fc5374da48
접속 주소: https://masan-market-walk.kimsrain3.chatgpt.site
바다횟집 GLB 모델 교체가 반영된 버전입니다.

설치
1. 이 ZIP의 내용을 D:\1Game_projec\masan_fish_market 안에 풉니다.
2. game_web 폴더가 생깁니다. 기존 Blender·Python 작업 파일과 구분됩니다.
3. game_web 안의 start_game.bat를 실행합니다. Python 3가 필요합니다.
4. 브라우저에서 http://127.0.0.1:8000 으로 접속합니다.
   종료할 때는 실행한 명령 창에서 Ctrl+C를 누릅니다.

다른 실행 방법
VS Code에서 game_web 폴더를 열고 Live Server 확장으로 dist/index.html을 실행합니다.
index.html을 탐색기에서 더블클릭하면 모듈과 GLB 로딩이 차단될 수 있으므로 로컬 웹 서버를 사용하세요.

조작
바닥 클릭·터치: 이동 / 화면 드래그: 시점 회전 / WASD·방향키: 이동
상단 ‘횟집 앞’ → ‘바다횟집 안으로 들어가기’ → ‘식탁에 앉기’
흥정·식사에 쓰이는 돈은 놀이용입니다. 지갑·식사는 브라우저에 저장됩니다.

코드 구성
dist/app.js: 이동, 카메라, 화면 연결
dist/market.js: 시장과 상인, 가게 구성
dist/restaurant-model.js: 업로드한 GLB 배치, 식탁과 식사 연결
dist/play.js: 흥정, 지갑, 주문, 회 먹기
dist/player.js: 내 캐릭터
dist/renderer.js: 3D 렌더러와 WebGL 미지원 시 대체 렌더러
dist/style.css: 화면 디자인
dist/assets/bada-restaurant.glb: 올려주신 바다횟집 모델 원본 바이트
dist/restaurant-detail.js: 이전 횟집 재질 보강 코드, 현재는 불러오지 않음

로컬 작업: 횟집 앞 해산물 좌판 보강 (2026-11-12)
dist/assets/restaurant-front.glb: 기존 바다횟집 GLB에 얹는 붉은 칸막이 수조·해산물·대야·상자·호스
tools/build_restaurant_front.py: 위 소품 GLB를 다시 만드는 Blender 스크립트
dist/restaurant-model.js: 원본 횟집 모델을 유지하고 소품과 붉은 아케이드 재질을 적용
dist/app.js: 상단 '횟집 앞' 버튼에서 가게 정면을 보도록 시점 설정
restaurant-front-preview.png: 횟집 정면 참고 렌더
이 로컬 작업은 아래에 적힌 게시 주소에 자동 반영되지 않습니다.

로컬에서 수정한 내용은 게시된 사이트에 자동 반영되지 않습니다.
현재 사이트의 게시 설정·로그인 정보·Git 인증정보는 이 압축 파일에 포함하지 않았습니다.
