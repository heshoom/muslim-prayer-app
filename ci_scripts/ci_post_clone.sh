#!/usr/bin/env bash

set -e
set -x  # Print each command for debugging

IOS_DIR="frontend/ios"

# 1️⃣ Ensure the iOS folder exists
if [ ! -d "$IOS_DIR" ]; then
    echo "Error: iOS directory '$IOS_DIR' does not exist."
    exit 1
fi
cd "$IOS_DIR"

# 2️⃣ Check CocoaPods installation
if ! command -v pod >/dev/null 2>&1; then
    echo "CocoaPods not found. Installing..."
    gem install cocoapods --no-document --user-install
    # Add user gem bin to PATH
    GEM_USER_BIN=$(ruby -rubygems -e 'print Gem.user_dir')/bin
    export PATH="$GEM_USER_BIN:$PATH"
else
    echo "CocoaPods is already installed."
fi

# 3️⃣ Check Podfile exists
if [ ! -f "Podfile" ]; then
    echo "Error: Podfile not found in $IOS_DIR."
    exit 1
fi

# 4️⃣ Install pods (retry in case of network issues)
MAX_RETRIES=3
COUNTER=1
while [ $COUNTER -le $MAX_RETRIES ]; do
    echo ">>> pod install attempt $COUNTER"
    if pod install --repo-update --verbose; then
        echo "Pods installed successfully."
        break
    else
        echo "pod install failed. Retrying..."
        COUNTER=$((COUNTER + 1))
        sleep 2
    fi

    if [ $COUNTER -gt $MAX_RETRIES ]; then
        echo "Error: pod install failed after $MAX_RETRIES attempts."
        exit 1
    fi
done

# 5️⃣ Verify the critical xcconfig file exists
XCFILE="Pods/Target Support Files/Pods-IslamicPro/Pods-IslamicPro.release.xcconfig"
if [ ! -f "$XCFILE" ]; then
    echo "Error: $XCFILE not found. Pods may not have installed correctly."
    exit 1
fi

echo ">>> ci_post_clone.sh finished successfully."
exit 0
