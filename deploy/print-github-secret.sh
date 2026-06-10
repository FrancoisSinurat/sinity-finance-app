#!/usr/bin/env bash
# Print values to paste into GitHub → Settings → Secrets → Actions
set -euo pipefail

KEY_FILE="/home/ubuntu/.ssh/github_actions_deploy"

echo "=== GitHub Actions Secrets ==="
echo ""
echo "1) VPS_HOST is no longer required (hardcoded in workflow)."
echo "2) VPS_USER is no longer required (hardcoded in workflow)."
echo ""
echo "Create ONE secret:"
echo "  Name:  VPS_SSH_KEY"
echo "  Value: (private key below)"
echo ""
echo "URL: https://github.com/FrancoisSinurat/sinity-finance-app/settings/secrets/actions"
echo ""
echo "---------- BEGIN VPS_SSH_KEY ----------"
if [[ -f "$KEY_FILE" ]]; then
  cat "$KEY_FILE"
else
  echo "ERROR: $KEY_FILE not found. Run deploy/setup-ssh-key.sh first."
  exit 1
fi
echo "---------- END VPS_SSH_KEY ----------"
