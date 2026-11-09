# Release Notes: 0.16.2

리뷰 킷 iframe의 네이티브 스크롤바가 콘텐츠 너비를 줄이지 않도록
모든 뷰포트에서 숨기고, 스크롤은 iframe 바깥 막대로 맞춥니다.

## 바깥 스크롤바

- 모바일뿐 아니라 tablet·desktop·wide를 포함한 모든 뷰포트에서
  target 문서의 `html`/`body` 스크롤바를 숨깁니다. 스크롤 자체는
  그대로 동작합니다.
- iframe 오른쪽에 가상 스크롤바를 두고 iframe 스크롤과 양방향으로
  동기화합니다. Figma 비교 시 프레임 너비(예: 390px)를 유지합니다.
- 줌이 125%처럼 프레임보다 클 때도 보이는 영역 기준으로 막대 위치와
  높이를 맞춥니다.
- 아코디언처럼 문서 높이가 바뀌면 바깥 스크롤바 길이도 함께 갱신합니다.
- absolute로 올라오는 Figma 오버레이처럼 `html`/`body` 박스 크기 없이
  `scrollHeight`만 커지는 경우에도 mutation·이미지 load를 보고 막대를
  다시 맞춥니다.

## 프레임 표시

- 리뷰 device frame의 `border-radius`를 제거해 iframe 미리보기를
  사각으로 표시합니다.

## 검증

- `dev:review` / `review-df-sheet`에서 MO 390·TA 768·PC 1920·Wide 3840
  스크롤바 숨김과 바깥 막대 동기화를 확인했습니다.
- 125% 줌에서 프레임보다 큰 iframe과 바깥 스크롤바 위치가 맞는 것을
  확인했습니다.
- 페이지 높이 증가·축소(아코디언형)와 화면보다 긴 Figma overlay 로드·숨김
  후 `scrollHeight`와 바깥 막대 길이가 일치하는 것을 확인했습니다.

## 릴리즈 메모

`0.16.2: 모든 뷰포트 스크롤바 숨김, iframe 바깥 스크롤바 동기화, Figma absolute overlay 갱신 및 device frame 사각 표시`
