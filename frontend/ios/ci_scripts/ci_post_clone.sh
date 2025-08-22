#!/usr/bin/env bash

set -e
set -x  # Print each command for debugging

# Debug: Print current working directory and list contents
echo "Current working directory: $(pwd)"
echo "Contents of current directory:"
ls -la

# Resolve repository root robustly and find the iOS directory (Podfile-based)
# This makes the script work regardless of the current working directory.
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

# Prefer to use git to determine repo root when available
if git rev-parse --show-toplevel >/dev/null 2>&1; then
    REPO_ROOT="$(git rev-parse --show-toplevel)"
else
    # Fallback: assume script sits under .../frontend/ios/ci_scripts
    REPO_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
fi

IOS_DIR=""
# Candidate locations relative to repo root (prefer ones containing a Podfile)
candidates=(
    "$REPO_ROOT/frontend/ios"
    "$REPO_ROOT/ios"
    "$REPO_ROOT/frontend"
    "$REPO_ROOT"
)

for p in "${candidates[@]}"; do
    if [ -d "$p" ] && [ -f "$p/Podfile" ]; then
        IOS_DIR="$p"
        break
    fi
done

# Last-resort: shallow search for Podfile up to 3 levels deep
if [ -z "$IOS_DIR" ]; then
    found=$(find "$REPO_ROOT" -maxdepth 3 -type f -name Podfile 2>/dev/null | head -n 1 || true)
    if [ -n "$found" ]; then
        IOS_DIR="$(dirname "$found")"
    fi
fi

if [ -z "$IOS_DIR" ]; then
    echo "Error: iOS directory not found. Searched under REPO_ROOT: $REPO_ROOT"
    echo "Searched candidates:"; printf '%s
' "${candidates[@]}"
    echo "Current directory structure (shallow):"
    find "$REPO_ROOT" -maxdepth 3 -name "*.xcodeproj" -o -name "Podfile" 2>/dev/null || true
    exit 1
fi

echo "Found iOS directory: $IOS_DIR"
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

# Ensure Node.js is available because the Podfile invokes `node` to locate
# autolinking scripts (e.g. `node --print "require.resolve('expo/package.json')"`).
if ! command -v node >/dev/null 2>&1; then
    echo "Node.js not found in PATH. Attempting to install via Homebrew..."
    if command -v brew >/dev/null 2>&1; then
        brew install node || {
            echo "Homebrew failed to install node. Please make sure CI image provides Node or add a setup step (e.g. actions/setup-node)." >&2
            exit 1
        }
    else
        echo "Homebrew not found. Please ensure Node.js is installed in the CI environment or add a setup step to install Node (e.g. actions/setup-node)." >&2
        exit 1
    fi
fi

# Install JS dependencies in the frontend so node can resolve packages referenced by the Podfile
if [ -f "$REPO_ROOT/frontend/package.json" ]; then
    echo "Installing JavaScript dependencies in $REPO_ROOT/frontend ..."
    (cd "$REPO_ROOT/frontend" && npm ci) || {
        echo "npm ci failed. Ensure network access and a valid package-lock.json or run npm install manually." >&2
        exit 1
    }
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
//
//  ci_post_clone.sh
//  IslamicPro
//
//  Created by Hesham on 8/22/25.
//

