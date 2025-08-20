#!/usr/bin/env bash
set -euo pipefail

echo "[xccloud] ci_post_clone: delegating CocoaPods install to scripts/xcode-cloud/pod-install.sh"

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
SCRIPT_PATH="$ROOT_DIR/scripts/xcode-cloud/pod-install.sh"

if [ -x "$SCRIPT_PATH" ] || [ -f "$SCRIPT_PATH" ]; then
	chmod +x "$SCRIPT_PATH" || true
	exec "$SCRIPT_PATH"
else
	echo "[xccloud] ERROR: pod-install helper not found at: $SCRIPT_PATH"
	exit 1
fi
