#
//  ci_post_clone.sh
//  IslamicPro
//
//  Created by Hesham on 8/20/25.
//

#!/bin/sh
set -e
echo ">>> Cleaning and reinstalling Pods"
cd frontend/ios
rm -rf Pods Podfile.lock
gem install cocoapods --user-install
pod install --repo-update --verbose
