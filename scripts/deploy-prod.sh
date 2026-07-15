#!/usr/bin/env bash
#
# Promote the current preview to production (deploy/preview -> deploy/master -> cha.fan).
#
# Guarantees:
#   - fast-forward only (aborts if prod diverged from preview)
#   - shows the exact commits being shipped and asks for confirmation
#   - tags the promoted commit as prod-YYYY-MM-DD-HHMM for one-command rollback
#
# Usage: scripts/deploy-prod.sh
set -euo pipefail

echo "Fetching deploy refs..."
git fetch deploy preview master

PREVIEW_SHA=$(git ls-remote deploy refs/heads/preview | cut -f1)
MASTER_SHA=$(git ls-remote deploy refs/heads/master | cut -f1)

[ -n "${PREVIEW_SHA}" ] || { echo "ERROR: cannot read deploy/preview" >&2; exit 1; }
echo "deploy/preview = ${PREVIEW_SHA}"
echo "deploy/master  = ${MASTER_SHA:-<none>}"

if [ "${PREVIEW_SHA}" = "${MASTER_SHA}" ]; then
    echo "Already in sync — nothing to promote."
    exit 0
fi

if [ -n "${MASTER_SHA}" ] && ! git merge-base --is-ancestor "${MASTER_SHA}" "${PREVIEW_SHA}"; then
    echo "ABORT: deploy/master is not an ancestor of deploy/preview (diverged)." >&2
    echo "Refusing a non-fast-forward promotion to production." >&2
    exit 1
fi

echo
echo "Commits to promote to production:"
git --no-pager log --oneline "${MASTER_SHA}..${PREVIEW_SHA}"
echo

read -r -p "Promote to production (cha.fan)? [y/N] " ans
case "${ans}" in
    y | Y) ;;
    *) echo "Aborted."; exit 1 ;;
esac

git push --ff-only deploy "${PREVIEW_SHA}:refs/heads/master"

TAG="prod-$(date +%Y-%m-%d-%H%M)"
git tag -a "${TAG}" "${PREVIEW_SHA}" -m "Prod promotion ${TAG}"
git push deploy "${TAG}"

echo
echo "Promoted to production and tagged ${TAG}."
echo "Rollback (to the previous tag):"
echo "    git push --force-with-lease deploy <prev-tag>^{commit}:refs/heads/master"
