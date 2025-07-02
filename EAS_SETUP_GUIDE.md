# EAS Build & OTA Updates Setup Guide

This guide walks you through setting up EAS Build and OTA Updates for the Sauron Mobile app.

## 📋 Prerequisites

1. **Expo Account**: Create an account at [expo.dev](https://expo.dev)
2. **EAS CLI**: Install globally
   ```bash
   npm install -g eas-cli
   ```
3. **Login to Expo**:
   ```bash
   eas login
   ```

## 🚀 Initial Setup

### 1. Configure Project

The project is already configured with:
- `eas.json` - Build configuration
- `app.config.ts` - Dynamic app configuration
- Build hooks in `hooks/` directory

### 2. Set Environment Variables

Configure these secrets in your repository settings:

#### Required for EAS Build:
```bash
EXPO_TOKEN                    # Your Expo access token
EXPO_OWNER                    # Your Expo username/organization
EXPO_PROJECT_ID               # Your Expo project ID
EXPO_PUBLIC_API_BASE_URL_STAGING    # Staging API URL
EXPO_PUBLIC_API_BASE_URL_PROD       # Production API URL
```

#### Optional for App Store/Play Store:
```bash
EXPO_APPLE_ID                 # Apple ID for iOS submissions
EXPO_APPLE_APP_PASSWORD       # App-specific password
EXPO_ANDROID_KEYSTORE         # Base64 encoded Android keystore
EXPO_ANDROID_KEY_PASSWORD     # Android key password
```

### 3. Initialize EAS Project

Run this command to link your local project to Expo:

```bash
cd sauron-mobile
eas project:init
```

## 🛠️ Build Profiles

The project includes three build profiles:

### Development
- **Purpose**: Development builds with Expo dev client
- **Distribution**: Internal
- **Command**: `npm run build:development`

### Preview
- **Purpose**: Testing builds for internal distribution
- **Distribution**: Internal (APK for Android, Simulator build for iOS)
- **Command**: `npm run build:preview`

### Production
- **Purpose**: App Store/Play Store builds
- **Distribution**: Store
- **Command**: `npm run build:production`

## 🔄 OTA Updates

OTA (Over-The-Air) updates allow you to push JavaScript/TypeScript changes without rebuilding the entire app.

### Automatic OTA Updates
The CI/CD pipeline automatically publishes OTA updates:
- **Staging**: On push to `develop` branch
- **Production**: Manual trigger or on push to `main` branch

### Manual OTA Updates
```bash
# Staging update
npm run update:staging

# Production update  
npm run update:production
```

## 📱 Testing Builds

### 1. Internal Distribution
After a build completes:
1. Visit the build URL provided in CI logs
2. Install the app on your device
3. For iOS: Add your device UDID to your Apple Developer account

### 2. Simulator Testing
```bash
# Build for iOS Simulator
eas build --profile preview --platform ios

# Download and install in simulator
# (Build URL will be provided)
```

## 🚦 CI/CD Integration

The GitHub Actions workflow automatically:

1. **On Pull Requests**:
   - Builds web preview
   - Deploys to Vercel for testing

2. **On Push to `develop`**:
   - Publishes OTA update to staging channel

3. **On Push to `main`**:
   - Builds production apps for both platforms
   - Optionally submits to app stores

## 🔧 Troubleshooting

### Common Issues

#### 1. Build fails with "Expo token invalid"
**Solution**: Regenerate EXPO_TOKEN
```bash
eas whoami
# If not logged in:
eas login
# Get new token for CI
eas credentials:list
```

#### 2. iOS build fails with provisioning profile error
**Solution**: Configure iOS credentials
```bash
eas credentials:configure --platform ios
```

#### 3. Android build fails with keystore error
**Solution**: Generate new keystore
```bash
eas credentials:configure --platform android
```

#### 4. OTA update not appearing
**Checks**:
- Verify runtime version matches between app and update
- Check update channel configuration
- Ensure app is using expo-updates properly

### Debug Commands

```bash
# Check build status
eas build:list

# View build logs
eas build:view [BUILD_ID]

# Check update status
eas update:list

# View project configuration
eas project:info
```

## 📝 Additional Configuration

### Custom Build Process

If you need to customize the build process:

1. **Modify `eas.json`**: Add custom build steps
2. **Update hooks**: Edit files in `hooks/` directory
3. **Environment variables**: Add to build profiles in `eas.json`

### Store Submission

For automatic store submission:

1. **Configure credentials**:
   ```bash
   eas credentials:configure --platform ios
   eas credentials:configure --platform android
   ```

2. **Update submit configuration** in `eas.json`

3. **Enable in CI**: Set `submit:production` in GitHub Actions

## 🔗 Useful Links

- [EAS Build Documentation](https://docs.expo.dev/build/introduction/)
- [EAS Update Documentation](https://docs.expo.dev/eas-update/introduction/)
- [Expo Application Services](https://expo.dev/eas)
- [GitHub Actions for Expo](https://github.com/expo/expo-github-action)

## 📞 Support

If you encounter issues:
1. Check [Expo documentation](https://docs.expo.dev/)
2. Search [Expo forums](https://forums.expo.dev/)
3. Review build logs in EAS dashboard
4. Check GitHub Actions logs for CI issues