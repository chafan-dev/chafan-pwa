#!/usr/bin/env bash
#
# Standalone launcher for the preview E2E suite.
# No yarn run-scripts needed — this drives Playwright directly.
#
# Usage:
#   e2e/run.sh                 # headless, all journeys
#   e2e/run.sh --headed        # watch the browser
#   e2e/run.sh --ui            # Playwright UI mode
#   e2e/run.sh --project=public   # only logged-out journeys (no credentials)
#   e2e/run.sh e2e/journeys/03-create-question-answer.spec.ts   # a single journey
#
# Any extra args are passed straight through to `playwright test`.
set -euo pipefail

HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$(cd "$HERE/.." && pwd)"
cd "$ROOT"

if [ ! -x "node_modules/.bin/playwright" ]; then
  echo "Playwright is not installed. Run 'yarn install' first." >&2
  exit 1
fi

# The 'public' project needs no credentials; everything else does.
wants_public_only=false
for arg in "$@"; do
  [ "$arg" = "--project=public" ] && wants_public_only=true
done

if [ "$wants_public_only" = false ] && [ ! -f "$ROOT/env.e2e" ]; then
  echo "Missing env.e2e — copy e2e/env.e2e.example to env.e2e and fill" >&2
  echo "E2E_EMAIL / E2E_PASSWORD, or run only the public journeys:" >&2
  echo "  e2e/run.sh --project=public" >&2
  exit 1
fi

# Ensure the chromium binary is present (no-op once cached).
node_modules/.bin/playwright install chromium >/dev/null 2>&1 || \
  node_modules/.bin/playwright install chromium

exec node_modules/.bin/playwright test --config "$HERE/playwright.config.ts" "$@"
