#!/usr/bin/env bash
set -euo pipefail

echo "[xccloud] ci_post_clone: delegating to scripts/xcode-cloud/pod-install.sh"

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
SCRIPT="$ROOT_DIR/scripts/xcode-cloud/pod-install.sh"

if [ -f "$SCRIPT" ]; then
	chmod +x "$SCRIPT" || true
	exec "$SCRIPT"
else
	echo "[xccloud] ERROR: helper not found at $SCRIPT"
	exit 1
fi
