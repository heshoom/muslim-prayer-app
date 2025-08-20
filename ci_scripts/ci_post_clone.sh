#!/bin/sh

# Stop script immediately if a command fails
set -e
set -x  # print each command as it runs for debugging

# Navigate to the iOS folder
IOS_DIR="frontend/ios"
if [ ! -d "$IOS_DIR" ]; then
    echo "Error: iOS directory $IOS_DIR does not exist."
    exit 1
fi
cd "$IOS_DIR"

echo ">>> Checking for CocoaPods installation..."
if ! command -v pod >/dev/null 2>&1; then
    echo "CocoaPods not found. Installing..."
    gem install cocoapods --no-document
else
    echo "CocoaPods already installed."
fi

echo ">>> Installing pods..."
# Install or update pods safely
if [ -f "Podfile" ]; then
    pod install --repo-update --verbose
else
    echo "Error: Podfile not found in $IOS_DIR."
    exit 1
fi

# Success
echo ">>> Pods installed successfully."
exit 0
