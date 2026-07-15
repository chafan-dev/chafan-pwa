#!/usr/bin/env bash
#
# Promote a tested ref to the preview site (deploy/preview -> preview.cha.fan).
#
# Usage:
#   scripts/deploy-preview.sh              # promote public/master (post-migration default)
#   scripts/deploy-preview.sh preview      # promote the local `preview` branch (during Vue 3 migration)
#   scripts/deploy-preview.sh <ref>
#
# Fast-forward only: if deploy/preview has diverged from the source, this fails
# loudly instead of clobbering it.
set -euo pipefail

SRC="${1:-public/master}"

echo "Fetching public..."
git fetch public

SRC_SHA=$(git rev-parse "${SRC}^{commit}")
echo "Promoting ${SRC} (${SRC_SHA}) -> deploy/preview  [fast-forward only]"
git push --ff-only deploy "${SRC_SHA}:refs/heads/preview"

echo "Pushed. Cloudflare will build preview.cha.fan"
