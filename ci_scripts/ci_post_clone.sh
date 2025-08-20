#!/bin/sh
set -e

# ci_post_clone.sh
# IslamicPro
# Created by Hesham on 8/20/25

echo ">>> Cleaning and reinstalling Pods"
cd frontend/ios || exit 1

rm -rf Pods Podfile.lock

# Install CocoaPods (user install)
gem install cocoapods --user-install

# Install pods with repo update and verbose logging
pod install --repo-update --verbose
