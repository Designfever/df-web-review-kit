# Vue Router `/review`

Review Shell uses React internally, so a Vue host must install the package peer runtime:

```bash
pnpm add @designfever/web-review-kit react react-dom zustand
```

Create a Vue route component that owns a small React mount point:

```vue
<script setup lang="ts">
import { onBeforeUnmount, onMounted } from 'vue';
import { localAdapter } from '@designfever/web-review-kit';
import { mountReviewShell } from '@designfever/web-review-kit/react-shell';
import { REVIEW_PROJECT_ID } from '../../df';

let unmount: (() => void) | undefined;
const pages = [{ href: '/' }, { href: '/about' }];

onMounted(() => {
  unmount = mountReviewShell({
    rootId: 'review-root',
    projectId: REVIEW_PROJECT_ID,
    pages,
    adapters: [
      localAdapter({ storageKey: `${REVIEW_PROJECT_ID}-review-items` }),
    ],
    reviewPathPrefix: '/review',
  });
});

onBeforeUnmount(() => unmount?.());
</script>

<template>
  <div id="review-root" style="width: 100vw; height: 100vh" />
</template>
```

Register this component at `/review` with the host's existing Vue Router setup. Build `pages` from the host route table and exclude `/review`. Standard Designfever hosts should replace the local adapter with the [df-sheet login/session flow](../df-sheet.md).
