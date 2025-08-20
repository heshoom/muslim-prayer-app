#!/usr/bin/env bash
set -euo pipefail

# Xcode Cloud will run this script after cloning the repo.
# This wrapper delegates to the project's central pod-install helper.

ROOT_DIR="$(cd "$(dirname "$0")/../.." && pwd)"

echo "[xccloud] ci_post_clone: running pod-install wrapper from $ROOT_DIR"

SCRIPT_PATH="$ROOT_DIR/scripts/xcode-cloud/pod-install.sh"
if [ -f "$SCRIPT_PATH" ]; then
  chmod +x "$SCRIPT_PATH" || true
  exec "$SCRIPT_PATH"
else
  echo "[xccloud] ERROR: expected script not found: $SCRIPT_PATH"
  exit 1
fi
