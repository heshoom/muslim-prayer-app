#!/usr/bin/env bash
# Safe cleanup script for frontend to reduce archive size
# - keeps backups of audio files (not removed)
# Usage: ./scripts/clean-frontend.sh
set -euo pipefail
ROOT_DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)
cd "$ROOT_DIR"

echo "Sizes BEFORE cleanup:"
du -sh ./* | sort -h || true

REMOVE=(
  node_modules
  ios/Pods
  ios/build
  dist
  .expo
)

for p in "${REMOVE[@]}"; do
  if [ -e "$p" ]; then
    echo "Removing $p"
    rm -rf "$p"
  else
    echo "Not present: $p"
  fi
done

# Recommended: remove package-lock if you plan to regenerate later
# echo "Removing package-lock.json"
# rm -f package-lock.json

echo "\nSizes AFTER cleanup:"
du -sh ./* | sort -h || true

echo "Cleanup complete. To restore, run 'npm install' in frontend and 'cd ios && pod install' for iOS after installing CocoaPods." 
