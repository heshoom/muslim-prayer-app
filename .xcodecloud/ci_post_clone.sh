#!/bin/sh
set -e
echo ">>> Running ci_post_clone.sh inside Xcode Cloud"
pwd
ls -la
cd frontend/ios
echo ">>> Inside frontend/ios"
ls -la
gem install cocoapods --user-install
pod install --verbose
