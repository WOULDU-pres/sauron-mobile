#!/bin/bash

# EAS Build Pre-Install Hook
# This script runs before dependency installation during EAS Build

set -e

echo "🔧 EAS Build Pre-Install Hook"
echo "Build Profile: $EAS_BUILD_PROFILE"
echo "Platform: $EAS_BUILD_PLATFORM"
echo "Git Commit: $EAS_BUILD_GIT_COMMIT_HASH"

# Set build environment variables
export NODE_ENV=${EAS_BUILD_PROFILE}
export EXPO_VERSION=$(cat package.json | grep '"version"' | head -1 | awk -F: '{ print $2 }' | sed 's/[",]//g' | tr -d '[[:space:]]')

echo "Node.js version: $(node --version)"
echo "npm version: $(npm --version)"
echo "Expo version will be set to: $EXPO_VERSION"

# Create build info
cat > build-info.json << EOF
{
  "buildProfile": "$EAS_BUILD_PROFILE",
  "platform": "$EAS_BUILD_PLATFORM",
  "gitCommit": "$EAS_BUILD_GIT_COMMIT_HASH",
  "buildTime": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "nodeVersion": "$(node --version)",
  "environment": "$NODE_ENV"
}
EOF

echo "✅ Pre-install hook completed successfully"