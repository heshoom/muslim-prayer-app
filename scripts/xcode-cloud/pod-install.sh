#!/usr/bin/env bash
set -euo pipefail

echo "[xccloud] Starting CocoaPods install (pre-build)"

# Find ios directory (support common layouts)
IOS_DIR=""
if [ -d "ios" ]; then
  IOS_DIR="ios"
elif [ -d "frontend/ios" ]; then
  IOS_DIR="frontend/ios"
elif [ -d "app/ios" ]; then
  IOS_DIR="app/ios"
fi

if [ -z "$IOS_DIR" ]; then
  echo "[xccloud] ERROR: Could not locate iOS directory (tried ./ios, ./frontend/ios, ./app/ios)"
  exit 1
fi

echo "[xccloud] Using iOS directory: $IOS_DIR"
cd "$IOS_DIR"

# If a Gemfile + Gemfile.lock exist, prefer Bundler
USE_BUNDLER=false
if [ -f "Gemfile" ]; then
  USE_BUNDLER=true
fi

run_pod_install() {
  echo "[xccloud] Running: pod install --repo-update"
  # pod can be noisy; print timestamps for CI debugging
  pod install --repo-update --verbose
}

# If bundle is available and Gemfile exists, use bundle exec pod install
if $USE_BUNDLER; then
  echo "[xccloud] Gemfile detected, using Bundler"
  if command -v bundle >/dev/null 2>&1; then
    echo "[xccloud] bundle found: $(bundle --version)"
    bundle install --jobs=4 --retry=3
    echo "[xccloud] bundle install complete - running pod via bundle exec"
    bundle exec pod install --repo-update --verbose
  else
    echo "[xccloud] Bundler not found in PATH; attempting to install bundler into user gems"
    gem install bundler --conservative --no-document --user-install || true
    # add gem user bin to PATH
    GEM_USER_BIN=$(ruby -rubygems -e 'print Gem.user_dir')/bin
    export PATH="$GEM_USER_BIN:$PATH"
    echo "[xccloud] PATH updated to include user gem bin: $GEM_USER_BIN"
    bundle install --jobs=4 --retry=3
    bundle exec pod install --repo-update --verbose
  fi
  echo "[xccloud] pod install via Bundler finished"
  exit 0
fi

# No Gemfile -> try using system pod
if command -v pod >/dev/null 2>&1; then
  echo "[xccloud] pod found: $(pod --version)"
  # Try once, but retry on failure (network issues)
  if run_pod_install; then
    echo "[xccloud] pod install completed"
    exit 0
  fi
fi

# Fallback: attempt to install cocoapods into user gem dir and run pod
echo "[xccloud] cocoapods not found in PATH - attempting user-install"
# Use conservative install to avoid permissions issues on CI
gem install cocoapods --conservative --no-document --user-install
GEM_USER_DIR=$(ruby -rubygems -e 'print Gem.user_dir')
GEM_USER_BIN="$GEM_USER_DIR/bin"
export PATH="$GEM_USER_BIN:$PATH"

if ! command -v pod >/dev/null 2>&1; then
  echo "[xccloud] ERROR: pod still not found after installing cocoapods; PATH=$PATH"
  exit 2
fi

# Final attempt
run_pod_install

echo "[xccloud] CocoaPods install completed successfully"
exit 0
