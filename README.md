# B-1 · 살살재촉 (PBC 자료요청 도우미)

회신 기한에 맞춰, 누구에게 무엇을 어떤 말투로 요청·독촉할지 정해 주고 할 일까지 챙겨 주는 PBC 도우미입니다.
2026 DISCOVER 조별과제 MVP · 시안 3(할 일 중심) 구현.

프레임워크·빌드 없이 **HTML + CSS + 바닐라 JS(ES 모듈)** 로 만들었습니다. 첫 화면은 `index.html`입니다.

## 실행

ES 모듈을 쓰기 때문에 파일을 더블클릭(`file://`)하면 열리지 않아요. 간단한 로컬 서버로 여세요.

```bash
python -m http.server 5173     # 그다음 http://localhost:5173
```

VS Code를 쓴다면 Live Server 확장으로 `index.html`을 열어도 됩니다.

테스트(날짜 계산 · 메일 분석 규칙):

```bash
node --test js/lib/
```

## 배포 (Vercel)

저장소를 Import하고 Framework Preset은 **Other**, Build Command는 비워 두면 됩니다. 저장소 맨 바깥의 `index.html`이 그대로 첫 화면이 됩니다.

## 구조

| 경로 | 내용 |
| --- | --- |
| `index.html` | 첫 화면 |
| `css/tokens/` | Wanted 디자인 시스템 토큰 (색·글자 변수) |
| `css/pbc.css` | 시안 화면 스타일 (claude.ai/design 시안에서 가져옴) |
| `css/app.css` | 반응형 · 버튼/체크박스/입력란 등 컴포넌트 스타일 |
| `js/main.js` | 화면 그리기 · 클릭/입력 처리 |
| `js/store.js` | 상태 · localStorage 저장 · 모든 동작(독촉 기록, 등록, 반영 등) |
| `js/views/` | 화면별 HTML: shell(헤더·히어로) · dashboard · drawer(문안 패널) · compose · analyze |
| `js/lib/` | 계산 규칙과 메일 문안(pbc), 날짜, 메일 분석(analyze), 시연 데이터(seed) |
| `PBC 시안.html` 외 `pbc-*.jsx`, `_ds/` | 원본 디자인 시안 (참고용, 앱에서는 쓰지 않음) |

## 메모

- 처음 열면 시연 데이터와 **시연 날짜 10/5**로 시작합니다. 헤더의 날짜를 눌러 실제 오늘로 바꿀 수 있고, 하단 [모두 비우기]로 새로 시작할 수 있습니다.
- 데이터는 브라우저 localStorage(`salsal.v1`)에만 저장됩니다. 서버·외부 API로 보내지 않습니다.
- 화면은 영역(`data-region`)별로 HTML을 다시 그리되, 입력 중인 영역은 건드리지 않아 한글 입력이 끊기지 않습니다. 사용자 입력은 `html``` 템플릿에서 모두 이스케이프됩니다.
