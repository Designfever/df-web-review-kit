# HANDOFF

Updated: 2026-06-26 22:14 KST
Branch: `chore/0.7.0-code-review-cleanup`

## Goal

Figma reference image workflow를 `df-web-review-kit` 안으로 옮긴다.

기존 HDC helper의 `window.__figma` 방식은 다음 문제가 있었다.

- node가 깨지거나 Figma server가 바쁘면 이미지가 뜨지 않는다.
- 개발자뿐 아니라 디자이너도 많이 쓰는데, Figma 경로 변경 요청이 계속 개발자에게 온다.
- browser-side `VITE_FIGMA_TOKEN` 노출 구조는 피해야 한다.
- 한 화면에 Figma image가 여러 개 들어가는 케이스가 필요하다.

새 방향은 `review-kit`에서 Figma image를 local/remote adapter로 관리하는 것이다.

- local adapter: dev server가 Figma API를 호출하고 이미지를 `.df-review`에 저장한다.
- remote adapter: 이후 remote server/storage 쪽으로 확장할 수 있게 둔다.
- `/review/`: Figma file/image 등록 관리자에 가깝게 full feature를 제공한다.
- 일반 origin route: 단축키로 floating overlay만 열어서 page 위에 Figma image를 올린다.

## Current Implementation Notes

Figma image local cache는 dev server plugin에서 처리한다.

- metadata: `.df-review/figma-images.json`
- asset file: `.df-review/figma-assets/<storageKey>.<ext>`
- served URL: `/__dfwr/figma-images/assets/<storageKey>`

Figma API token은 server env의 `FIGMA_TOKEN`을 사용한다.

- `VITE_FIGMA_TOKEN`으로 노출하지 않는다.
- consumer repo에서 `vite.config.ts`에 `reviewFigmaImageStore()` plugin 설정이 필요하다.

`imageFormat: 'webp'`는 target intent다.

- 실제 webp 변환은 `transformAsset`이 있어야 한다.
- consumer repo 쪽에 `sharp` 같은 변환기를 설치하고 plugin option으로 연결해야 한다.
- 변환기가 없으면 Figma render source format 기준으로 png/jpg가 저장된다.

## Layout / Overlay Contract

Figma image 배치는 단순 `cover`/`contain`이 아니라 viewport별 contract가 필요하다.

- mobile: width `100%`, height `auto`, horizontal scrollbar hidden.
- non-mobile: `vw` scaling 금지. Figma 기준 width/height를 fixed px로 두고 center align.

Overlay 조작 state는 localStorage에 둔다.

필수 overlay controls:

- lock / unlock
- visible / hidden
- normal / invert
- y 값만 drag
- reset
- opacity

기존 HDC helper UI 참고점:

- Guide 버튼은 제거해도 된다.
- `/review/`는 full controls.
- 일반 route에서는 단축키로 floating panel 표시.

## Changes In Current Working Tree

### Figma rail icon

Changed file:

- `src/react-shell/review/shell.tsx`

Right rail의 Figma Images 버튼은 custom Figma mark icon을 사용한다.

기존 Figma Images에 쓰던 lucide `Images` icon은 Source/Component list icon으로 옮겼다.

초기 SVG가 겹치고 아래가 잘리는 문제가 있어서 `viewBox="0 0 24 24"` 기준 path를 다시 잡았다.

### Auto label from Figma node name

Changed file:

- `src/vite.ts`

Figma link를 추가할 때 label을 비워두면 Figma node metadata를 조회해서 frame/node name을 자동 저장한다.

Flow:

1. `parseReviewFigmaNodeRef(input.figmaUrl)`로 `fileKey`, `nodeId`를 얻는다.
2. label input이 비어 있으면 `/v1/files/:fileKey/nodes?ids=:nodeId`를 server token으로 조회한다.
3. `nodes[nodeId].document.name`을 `ReviewFigmaImage.label`에 저장한다.
4. 사용자가 label을 직접 입력하면 입력값이 우선이다.
5. metadata 조회 실패는 image add를 막지 않고 기존 `Image 1` fallback으로 둔다.

Smoke result:

- label 없이 node `1817:18669` 추가 시 `AX시너지사업 > FM > PM(종합관리) > 사업소개`가 자동 저장되는 것 확인.
- smoke로 만든 item은 바로 삭제했다.

### Dist

Package가 `dist`를 배포 artifact로 포함하므로 build 결과도 같이 변경돼 있다.

Changed files:

- `dist/react-shell.cjs`
- `dist/react-shell.cjs.map`
- `dist/react-shell.js`
- `dist/react-shell.js.map`
- `dist/vite.cjs`
- `dist/vite.cjs.map`
- `dist/vite.js`
- `dist/vite.js.map`

## Verification Done

Ran:

```bash
corepack pnpm exec tsc --noEmit
corepack pnpm build
```

Both passed.

Also ran a temporary Vite server on `127.0.0.1:5188`, POSTed one Figma image with empty label, verified auto label, then DELETEd it.

## Current Git Status

Expected modified files:

- `src/react-shell/review/shell.tsx`
- `src/vite.ts`
- generated `dist/*`

No commit has been made yet.

## Next UI Work

Likely next step is UI development for the Figma Images panel and overlay.

Focus areas:

- `/review/` panel should feel like a manager for registered Figma images.
- origin route overlay should stay lightweight and shortcut-driven.
- Multi-image selection/list needs to stay clear when several Figma images exist on one viewport.
- Overlay controls need to support lock/visible/invert/y-drag/reset/opacity without feeling heavy.
- Mobile Safari compatibility should be checked for overlay positioning and scroll behavior.

