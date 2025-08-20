#!/bin/sh
set -e
set -x

# Go to iOS folder
cd frontend/ios || exit 1

echo ">>> Ensuring CocoaPods is installed"
if ! command -v pod >/dev/null 2>&1; then
  echo "CocoaPods not found. Installing..."
  gem install cocoapods
fi

echo ">>> Installing pods"
pod install --repo-update --verbose

echo ">>> Pods installed successfully"
