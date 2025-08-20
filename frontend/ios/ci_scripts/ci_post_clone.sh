#!/usr/bin/env bash

set -e
set -x  # Print each command for debugging

# Debug: Print current working directory and list contents
echo "Current working directory: $(pwd)"
echo "Contents of current directory:"
ls -la

# Since this script is in frontend/ios/ci_scripts/, we're already close to the iOS directory
# The iOS directory should be the parent directory
IOS_DIR="."
if [ -f "Podfile" ]; then
    echo "Found Podfile in current directory"
    IOS_DIR="."
elif [ -f "../Podfile" ]; then
    echo "Found Podfile in parent directory"
    IOS_DIR=".."
else
    echo "Error: Podfile not found. Searched in current directory and parent."
    echo "Current directory structure:"
    find . -name "*.xcodeproj" -o -name "Podfile" 2>/dev/null || true
    exit 1
fi

echo "Using iOS directory: $IOS_DIR"
cd "$IOS_DIR"

# 2️⃣ Check Node.js installation (required for Expo Podfile)
if ! command -v node >/dev/null 2>&1; then
    echo "Node.js not found. Installing via nvm..."
    
    # Install nvm if not present
    if [ ! -f "$HOME/.nvm/nvm.sh" ]; then
        echo "Installing nvm..."
        curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
        export NVM_DIR="$HOME/.nvm"
        [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
    else
        export NVM_DIR="$HOME/.nvm"
        [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
    fi
    
    # Install and use Node.js LTS
    nvm install --lts
    nvm use --lts
    
    # Verify installation
    if ! command -v node >/dev/null 2>&1; then
        echo "Error: Node.js installation failed"
        exit 1
    fi
    
    echo "Node.js installed: $(node --version)"
    echo "npm version: $(npm --version)"
else
    echo "Node.js is already installed: $(node --version)"
fi

# 3️⃣ Check CocoaPods installation
if ! command -v pod >/dev/null 2>&1; then
    echo "CocoaPods not found. Installing..."
    gem install cocoapods --no-document --user-install
    # Add user gem bin to PATH
    GEM_USER_BIN=$(ruby -rubygems -e 'print Gem.user_dir')/bin
    export PATH="$GEM_USER_BIN:$PATH"
else
    echo "CocoaPods is already installed."
fi

# 4️⃣ Check Podfile exists
if [ ! -f "Podfile" ]; then
    echo "Error: Podfile not found in current directory."
    exit 1
fi

# 5️⃣ Install pods (retry in case of network issues)
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

# 6️⃣ Verify the critical xcconfig file exists
XCFILE="Pods/Target Support Files/Pods-IslamicPro/Pods-IslamicPro.release.xcconfig"
if [ ! -f "$XCFILE" ]; then
    echo "Error: $XCFILE not found. Pods may not have installed correctly."
    exit 1
fi

echo ">>> ci_post_clone.sh finished successfully."
exit 0
