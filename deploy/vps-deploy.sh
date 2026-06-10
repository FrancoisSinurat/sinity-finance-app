  #!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

ENV_FILE="${ENV_FILE:-.env.production}"
if [[ ! -f "$ENV_FILE" ]]; then
  echo "Missing $ENV_FILE on VPS."
  exit 1
fi

npm ci
set -a
source "$ENV_FILE"
set +a
npm run build

sudo mkdir -p /var/www/sinity-main
sudo ln -sfn "$ROOT_DIR/out" /var/www/sinity-main/sinify
sudo systemctl reload nginx

echo "OK: frontend deployed to /sinify/"
