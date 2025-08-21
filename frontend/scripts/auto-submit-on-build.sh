#!/usr/bin/env bash
set -euo pipefail

# auto-submit-on-build.sh
# Watches the latest iOS EAS build for this project and automatically runs
# `eas submit --platform ios --latest --non-interactive` when it finishes.

cd "$(dirname "$0")/../.." || exit 1

echo "[auto-submit] starting watcher in $(pwd)"

# Retrieve the latest build id for iOS (inProgress or finished or errored)
get_latest_build_id() {
  eas build:list --platform ios --limit 1 --status inProgress,finished,errored --json 2>/dev/null \
    | node -e "let s='';process.stdin.on('data',c=>s+=c);process.stdin.on('end',()=>{try{const a=JSON.parse(s); if(Array.isArray(a) && a.length>0) console.log(a[0].id);}catch(e){} })"
}

get_status() {
  local id="$1"
  # Use inspect and look for a status line; fall back to printing all if parsing fails
  eas build:inspect "$id" --platform ios 2>/dev/null | awk '/^status:/{print $2}' || true
}

id=$(get_latest_build_id)
if [ -z "$id" ]; then
  echo "[auto-submit] no recent iOS build found for this project. Exiting." >&2
  exit 1
fi

echo "[auto-submit] watching build id: $id"

while true; do
  status=$(get_status "$id" || echo "unknown")
  echo "[auto-submit] $(date -u +"%Y-%m-%dT%H:%M:%SZ") status=$status"
  if [ "$status" = "finished" ]; then
    echo "[auto-submit] build finished — running eas submit (non-interactive)"
    eas submit --platform ios --latest --non-interactive || { echo "[auto-submit] submit failed"; exit 3; }
    echo "[auto-submit] submit completed"
    exit 0
  elif [ "$status" = "errored" ] || [ "$status" = "canceled" ]; then
    echo "[auto-submit] build status is $status — will not submit" >&2
    exit 2
  fi
  sleep 30
done
