#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
chmod +x "$ROOT_DIR/deploy/auto-deploy.sh"

LOG_FILE="/home/ubuntu/logs/sinity-auto-deploy.log"
mkdir -p /home/ubuntu/logs
CRON_LINE="*/2 * * * * $ROOT_DIR/deploy/auto-deploy.sh >> $LOG_FILE 2>&1"

if crontab -l 2>/dev/null | grep -Fq "auto-deploy.sh"; then
  echo "Cron already installed."
else
  (crontab -l 2>/dev/null; echo "$CRON_LINE") | crontab -
  echo "Installed cron: $CRON_LINE"
fi

touch "$LOG_FILE"
chmod 644 "$LOG_FILE"

echo "Auto-deploy active. Log: $LOG_FILE"
