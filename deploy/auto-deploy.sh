#!/usr/bin/env bash
# Poll origin/master and deploy when new commits are pushed.
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"
LOG_TAG="[sinity-auto-deploy]"

git fetch origin master --quiet 2>/dev/null || {
  echo "$LOG_TAG $(date -Is) git fetch failed"
  exit 0
}

LOCAL_SHA="$(git rev-parse master)"
REMOTE_SHA="$(git rev-parse origin/master)"

if [[ "$LOCAL_SHA" == "$REMOTE_SHA" ]]; then
  exit 0
fi

echo "$LOG_TAG $(date -Is) deploying $LOCAL_SHA -> $REMOTE_SHA"
git reset --hard origin/master
chmod +x deploy/vps-deploy.sh
./deploy/vps-deploy.sh
