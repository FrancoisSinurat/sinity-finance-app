#!/usr/bin/env bash
# One-time setup for GitHub self-hosted runner (no SSH secrets needed).
# Usage: RUNNER_TOKEN=<token-from-github> ./deploy/setup-github-runner.sh
set -euo pipefail

if [[ -z "${RUNNER_TOKEN:-}" ]]; then
  echo "Get a registration token from:"
  echo "https://github.com/FrancoisSinurat/sinity-finance-app/settings/actions/runners/new"
  echo ""
  echo "Then run:"
  echo "  RUNNER_TOKEN=YOUR_TOKEN ./deploy/setup-github-runner.sh"
  exit 1
fi

RUNNER_VERSION="2.321.0"
RUNNER_DIR="/home/ubuntu/actions-runner"
RUNNER_USER="ubuntu"
REPO_URL="https://github.com/FrancoisSinurat/sinity-finance-app"

sudo mkdir -p "$RUNNER_DIR"
sudo chown "$RUNNER_USER:$RUNNER_USER" "$RUNNER_DIR"
cd "$RUNNER_DIR"

if [[ ! -f ./config.sh ]]; then
  curl -fsSL -o "actions-runner-linux-x64-${RUNNER_VERSION}.tar.gz" \
    "https://github.com/actions/runner/releases/download/v2.321.0/actions-runner-linux-x64-${RUNNER_VERSION}.tar.gz"
  tar xzf "./actions-runner-linux-x64-${RUNNER_VERSION}.tar.gz"
  rm -f "./actions-runner-linux-x64-${RUNNER_VERSION}.tar.gz"
fi

./config.sh \
  --url "$REPO_URL" \
  --token "$RUNNER_TOKEN" \
  --name "sinity-vps" \
  --labels "self-hosted,linux,x64" \
  --work "_work" \
  --unattended \
  --replace

sudo ./svc.sh install "$RUNNER_USER"
sudo ./svc.sh start
sudo ./svc.sh status

echo "Runner installed. Workflow can use: runs-on: self-hosted"
