#!/usr/bin/env bash
set -euo pipefail

# ci_post_clone.sh - run by CI after clone to prepare iOS pods
echo ">>> Cleaning and reinstalling Pods"

IOS_DIR="frontend/ios"
if [ ! -d "$IOS_DIR" ]; then
	echo "[ci] ERROR: iOS directory not found: $IOS_DIR"
	exit 1
fi

cd "$IOS_DIR"

# Clean existing pods (safe on CI)
rm -rf Pods Podfile.lock || true

# Prefer Bundler if Gemfile present
if [ -f "Gemfile" ]; then
	echo "[ci] Gemfile detected - using bundler"
	if command -v bundle >/dev/null 2>&1; then
		bundle install --jobs=4 --retry=3
		bundle exec pod install --repo-update --verbose
		exit $?
	else
		echo "[ci] Bundler not found - attempting to install bundler into user gems"
		gem install bundler --conservative --no-document --user-install || true
		GEM_USER_BIN=$(ruby -rubygems -e 'print Gem.user_dir')/bin
		export PATH="$GEM_USER_BIN:$PATH"
		bundle install --jobs=4 --retry=3
		bundle exec pod install --repo-update --verbose
		exit $?
	fi
fi

# No Gemfile: ensure cocoapods available
if ! command -v pod >/dev/null 2>&1; then
	echo "[ci] cocoapods not found - installing into user gems"
	gem install cocoapods --conservative --no-document --user-install
	GEM_USER_DIR=$(ruby -rubygems -e 'print Gem.user_dir')
	GEM_USER_BIN="$GEM_USER_DIR/bin"
	export PATH="$GEM_USER_BIN:$PATH"
fi

echo "[ci] Running pod install"
pod install --repo-update --verbose

