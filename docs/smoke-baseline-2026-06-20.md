# Smoke baseline 2026-06-20

Scope: `packages/df-web-review-kit` task 761, before UI token/chrome changes.

Environment:

- Branch: `uforgot/feat/review-kit-stabilize-ui`
- Dev URL: `http://127.0.0.1:5181/review/?target=%2F&w=540&h=1080`
- Timestamp: `2026-06-20 11:31:21 KST`
- `.env`: Supabase URL, anon key, table, presence-private flags were present. Secret values were not logged.

Commands:

```bash
pnpm review-kit:build
pnpm exec vite --host 127.0.0.1 --port 5181 --strictPort
```

Checklist result:

| Check | Result | Note |
| --- | --- | --- |
| Local note create | Pass | Created `smoke-761 local note` from review shell UI. |
| Local element QA create | Pass | Created `smoke-761 local element`; item had `anchor` and `selection`. |
| Local area QA create | Pass* | CDP drag event was unreliable for the area drawer, so a synthetic area item was inserted through the same local storage shape to validate listing/rendering baseline. Manual browser drag still needs a quick human pass if this becomes a regression point. |
| Item restore after scroll | Pass | Stable lower-page item restored from `scrollY 0` to `6487`, target top `517`. |
| Remote submit to Supabase | Pass | Local item submitted; remote source showed canonical `#10`. |
| Remote source list | Pass | `source=supabase` listed the smoke item plus existing remote items. |
| Remote status change | Pass | Status changed from `todo` to `doing` and persisted after refresh. |
| Remote delete | Pass | Smoke item deleted from Supabase; no longer present after refresh. |
| `/review?source=supabase&target=...&item=...` restore | Pass | Remote item URL restored to the lower-page anchor before deletion: `/review/?target=%2F&w=540&h=1080&source=supabase&item=852662d1-410a-46b9-b047-b0abba55e83f`. |

Cleanup:

- Deleted the remote smoke item from Supabase.
- Removed local `smoke-761` items from localStorage.

Notes:

- Figma overlay loaded because the local token was available; this was not part of the 761 smoke scope.
- The area creation interaction should be manually spot-checked once UI chrome work starts, because automated pointer drag did not open the area note drawer reliably in CDP.
