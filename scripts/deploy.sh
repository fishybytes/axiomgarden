#!/usr/bin/env bash
# Usage: ./scripts/deploy.sh [dev|prod]
set -euo pipefail

ENV=${1:-dev}
REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SSH_KEY="$REPO_ROOT/.ssh/axiomgarden_${ENV}_ed25519"
IMAGE_TAG="axiomgarden:$ENV"

# Read VPS IP from Terraform output
SERVER_IP=$(terraform -chdir="$REPO_ROOT/infra/environments/$ENV" output -raw vps_ip 2>/dev/null)
if [[ -z "$SERVER_IP" ]]; then
  echo "error: could not read vps_ip from Terraform state. Have you run terraform apply?" >&2
  exit 1
fi

echo "→ target: $ENV ($SERVER_IP)"

echo "→ building $IMAGE_TAG..."
docker build -t "$IMAGE_TAG" "$REPO_ROOT"

echo "→ transferring image to server (this takes a minute)..."
docker save "$IMAGE_TAG" | gzip | ssh \
  -i "$SSH_KEY" \
  -o StrictHostKeyChecking=no \
  -o ConnectTimeout=15 \
  "root@$SERVER_IP" \
  "gunzip | docker load"

echo "→ restarting containers..."
ssh \
  -i "$SSH_KEY" \
  -o StrictHostKeyChecking=no \
  "root@$SERVER_IP" \
  "cd /opt/axiomgarden && docker compose up -d --remove-orphans 2>&1"

echo "✓ deployed $IMAGE_TAG to $SERVER_IP"
