#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."
if [[ "${1:-}" == "--" ]]; then shift; fi
if [[ $# -ne 1 || -z "$1" ]]; then
  echo 'Usage: pnpm release -- "Release memo"' >&2
  exit 1
fi

# Check both destinations and the memo before publishing anything.
node --env-file-if-exists=.env.release scripts/release/notify.mjs check "$1"
pnpm test
pnpm test:release
pnpm typecheck
pnpm build
npm publish --access public --ignore-scripts

if ! node --env-file-if-exists=.env.release scripts/release/notify.mjs send "$1"; then
  echo 'npm publish succeeded, but notification delivery failed. Do not publish again; check the channels before retrying notifications.' >&2
  exit 1
fi
