#!/bin/bash

# EAS Build Post-Install Hook
# This script runs after dependency installation during EAS Build

set -e

echo "🔧 EAS Build Post-Install Hook"

# Clear any cached build artifacts
if [ -d ".expo" ]; then
  echo "Clearing .expo cache..."
  rm -rf .expo
fi

# Verify critical dependencies
echo "Verifying dependencies..."
npm list expo expo-router expo-updates || echo "Some optional dependencies missing"

# Generate build manifest
echo "Generating build manifest..."
cat > build-manifest.json << EOF
{
  "dependencies": $(npm list --json --depth=0 | jq '.dependencies // {}'),
  "buildProfile": "$EAS_BUILD_PROFILE",
  "platform": "$EAS_BUILD_PLATFORM",
  "buildTime": "$(date -u +%Y-%m-%dT%H:%M:%SZ)"
}
EOF

echo "✅ Post-install hook completed successfully"