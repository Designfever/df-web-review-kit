# Release Notes: 0.15.0

Review iframe 크기의 단일 canvas에서 QA 표시와 rectangle annotation을
렌더링합니다. 움직이거나 스크롤되는 페이지에서도 issue 위치를 유지하고,
화면을 가리던 DOM overlay를 줄였습니다.

## Canvas QA overlay

- iframe viewport와 같은 크기의 canvas 하나에서 area와 DOM issue를 렌더링합니다.
- canvas를 iframe 영역에 제한해 외부 drawing을 막고 불필요한 전체 화면 렌더링을
  줄입니다.
- 30fps로 상태를 동기화하면서 선택, drawing, scroll 같은 이벤트에는 즉시
  렌더링해 클릭 시 깜빡임을 줄입니다.
- 기존 dashed area rectangle을 제거해 검토 대상 콘텐츠가 덜 가려집니다.

## Rectangle annotation

- area와 DOM issue에 violet rectangle을 그릴 수 있습니다.
- annotation은 solid stroke와 shadow로 표시해 밝고 어두운 이미지 모두에서
  구분할 수 있습니다.
- 작은 contextual button 하나를 사용합니다. annotation이 없으면 four-corner
  frame 아이콘, annotation이 있으면 삭제용 X 아이콘을 표시합니다.
- 저장된 annotation을 QA 화면에서 선택한 issue와 함께 다시 렌더링합니다.
- 새 issue에는 annotation 데이터를 직접 저장하고, 이 POC에서 먼저 생성된
  issue는 capture attachment metadata에서도 복원합니다.

## Scroll과 위치 복원

- area issue를 만들 때 target scroll 좌표를 저장해 viewport 기준 rectangle을
  페이지 콘텐츠 위치에 고정합니다.
- DOM issue는 anchor가 안정된 뒤 한 번만 scroll하고 highlight합니다.
- area issue와 deep link 복원은 같은 issue에 대한 중복 scroll 작업을 막습니다.
- drawing 중 wheel을 차단하지 않습니다.

## 범위

- canvas는 issue marker, selection과 rectangle annotation만 렌더링합니다.
- label과 interactive control은 접근성과 pointer interaction을 위해 DOM으로
  유지합니다.
- annotation 데이터가 없는 이전 issue에는 violet rectangle을 복원할 수 없습니다.

## 검증

- unit test 398개와 release script test 4개를 통과했습니다.
- library/dev typecheck, dead-code 검사와 package build를 통과했습니다.
- Lexus live-data review 화면에서 area/DOM issue 선택, scroll 복원과 QA annotation
  표시를 확인했습니다.
