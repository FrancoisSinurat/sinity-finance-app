#!/usr/bin/env bash
set -euo pipefail

KEY_FILE="/home/ubuntu/.ssh/github_actions_deploy"

if [[ -f "$KEY_FILE" ]]; then
  echo "SSH key already exists: $KEY_FILE"
  exit 0
fi

ssh-keygen -t ed25519 -f "$KEY_FILE" -N "" -C "github-actions-deploy"
grep -qF "$(cat "${KEY_FILE}.pub")" /home/ubuntu/.ssh/authorized_keys 2>/dev/null || \
  cat "${KEY_FILE}.pub" >> /home/ubuntu/.ssh/authorized_keys
chmod 600 "$KEY_FILE" /home/ubuntu/.ssh/authorized_keys

echo "SSH key ready. Run: ./deploy/print-github-secret.sh"
