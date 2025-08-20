#!/bin/sh
set -e

echo "Installing CocoaPods via Xcode Cloud CI..."

cd frontend/ios
gem install cocoapods --user-install
pod install
