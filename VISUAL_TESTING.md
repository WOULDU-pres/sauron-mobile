# Visual Regression Testing Guide

## Overview

This project implements automated visual regression testing to ensure UI consistency across changes. The system uses **jest-image-snapshot** with **SSIM comparison** to detect visual differences with ≤5px accuracy as per the acceptance criteria.

## 🎯 Key Features

- **Pixel-perfect comparison**: Detects visual changes within ≤5px threshold
- **SSIM algorithm**: Advanced structural similarity comparison for reduced false positives
- **Multi-theme testing**: Automatic light/dark theme validation
- **Responsive testing**: Multiple screen size validation (phone, tablet)
- **CI/CD integration**: Automated testing on pull requests
- **Demo mode**: Consistent screenshots with mocked timestamps and animations

## 📁 Project Structure

```
sauron-mobile/
├── e2e/
│   ├── setup.ts                    # Jest configuration for image snapshots
│   ├── utils/
│   │   └── screenshot-helper.ts    # Screenshot capture utilities
│   └── visual/
│       ├── baselines/              # Baseline images (committed to git)
│       ├── diffs/                  # Generated diff images (CI artifacts)
│       ├── dashboard.test.tsx      # Dashboard screen visual tests
│       ├── reports.test.tsx        # Reports screen visual tests
│       ├── detection-log.test.tsx  # Detection log screen visual tests
│       └── profile.test.tsx        # Profile screen visual tests
├── jest.config.js                  # Jest configuration
└── .github/workflows/
    └── visual-regression.yml       # GitHub Actions CI workflow
```

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install --save-dev jest-image-snapshot @types/jest-image-snapshot @testing-library/react-native react-test-renderer @types/react-test-renderer
```

### 2. Run Visual Tests

```bash
# Run all visual tests
npm run test:visual

# Run tests and update baselines
npm run test:visual:update

# Run tests in CI mode (no watch)
npm run test:visual:ci

# Generate initial baselines
npm run generate-baselines
```

## 📸 Screenshot Configuration

The system uses advanced configuration for consistent, accurate screenshots:

```typescript
const screenshot = await captureScreenshot(
  <ComponentToTest />,
  { 
    theme: 'light',              // Theme mode: 'light' | 'dark'
    waitTime: 1000,              // Animation settling time (ms)
    dimensions: { width: 375, height: 812 }, // Screen dimensions
    demoMode: true               // Enable consistent mock data
  }
);

expect(screenshot).toMatchImageSnapshot({
  customSnapshotIdentifier: 'unique-test-name',
  comparisonMethod: 'ssim',      // SSIM structural comparison
  failureThreshold: 0.005,       // 0.5% difference threshold
  failureThresholdType: 'percent',
  customDiffConfig: { threshold: 0.01 }, // Per-pixel sensitivity
});
```

## 🎨 Testing Different Themes

Each screen is automatically tested in both light and dark themes:

```typescript
describe('Dashboard Screen Visual Tests', () => {
  it('should match dashboard in light theme', async () => {
    const screenshot = await captureScreenshot(
      <DashboardView />,
      { theme: 'light', waitTime: 1000 }
    );
    expect(screenshot).toMatchImageSnapshot({
      customSnapshotIdentifier: 'dashboard-light',
      // ... configuration
    });
  });

  it('should match dashboard in dark theme', async () => {
    const screenshot = await captureScreenshot(
      <DashboardView />,
      { theme: 'dark', waitTime: 1000 }
    );
    expect(screenshot).toMatchImageSnapshot({
      customSnapshotIdentifier: 'dashboard-dark',
      // ... configuration
    });
  });
});
```

## 📱 Responsive Testing

The system tests multiple screen dimensions to ensure responsive behavior:

```typescript
// Phone dimensions (iPhone 12/13)
{ width: 375, height: 812 }

// Tablet dimensions (iPad)
{ width: 768, height: 1024 }

// Small phone dimensions (iPhone SE)
{ width: 320, height: 568 }
```

## 🔧 Demo Mode Features

Demo mode ensures consistent screenshots by mocking:

- **Fixed timestamps**: January 15, 2024, 10:30 AM UTC
- **Consistent random values**: Math.random() returns 0.5
- **Stable animations**: performance.now() returns 0
- **Predictable async operations**: Mocked AsyncStorage, Haptics, etc.

## 🤖 CI/CD Integration

### GitHub Actions Workflow

The system automatically runs on:
- Pull requests to main/master
- Pushes to main/master branches
- Manual workflow dispatch

### Workflow Features:

1. **Multi-Node Testing**: Tests on Node.js 18.x and 20.x
2. **System Dependencies**: Installs required packages for headless browser testing
3. **Artifact Upload**: Saves diff images and test results for 30 days
4. **PR Comments**: Automatically comments on failed PRs with diff information
5. **Consistent Environment**: UTC timezone, disabled animations, demo mode

### Artifact Types:

- **visual-test-results**: Baseline images, coverage reports
- **visual-diff-images**: Diff images showing pixel differences (on failure)

## 🐛 Troubleshooting

### Test Failures

When visual tests fail, you'll see output like:
```
Error: Expected image to match or be a close match to snapshot but was 0.0061% different from snapshot (1.47 differing pixels).
```

**Resolution Steps:**

1. **Download diff images** from CI artifacts
2. **Review changes** carefully in the diff images
3. **If changes are intentional**: Run `npm run test:visual:update`
4. **If changes are bugs**: Fix the UI issue and push again

### Common Issues

**Issue**: Tests pass locally but fail in CI
**Solution**: Ensure consistent environment by:
- Using the same Node.js version
- Running tests with `CI=true` environment variable
- Checking for platform-specific rendering differences

**Issue**: Screenshots show different fonts/rendering
**Solution**: The CI environment installs required system fonts and libraries automatically.

**Issue**: Baseline images are missing
**Solution**: Run `npm run generate-baselines` to create initial baselines, then commit them.

### Debugging Tools

1. **Console diff output**: Set `dumpDiffToConsole: true` in test configuration
2. **Inline diff images**: Set `dumpInlineDiffToConsole: true` for terminal preview
3. **Verbose logging**: Use `npm run test:visual -- --verbose`

## 📋 Best Practices

### 1. Writing Visual Tests

- **Use descriptive snapshot identifiers**: `dashboard-light-mobile` vs `test-1`
- **Test key user interactions**: Button states, form validation, modals
- **Include edge cases**: Empty states, loading states, error states
- **Wait for animations**: Use appropriate `waitTime` for transitions

### 2. Managing Baselines

- **Commit baseline images** to version control
- **Review diffs carefully** before updating baselines
- **Update baselines together** for related changes
- **Test on multiple devices** before committing updates

### 3. CI/CD Best Practices

- **Review artifacts** before merging failed visual tests
- **Use draft PRs** for experimental UI changes
- **Test locally first** with `npm run test:visual:ci`
- **Coordinate team updates** when changing global styles

## 🔬 Technical Details

### SSIM Algorithm Benefits

- **Reduced false positives**: Better at detecting meaningful visual changes
- **Higher sensitivity**: More accurate than pixel-by-pixel comparison
- **Structural analysis**: Considers image structure, not just individual pixels

### Performance Optimization

- **Bezkrovny SSIM**: Optimized implementation for speed with minimal accuracy loss
- **Parallel testing**: Multiple screens tested simultaneously
- **Efficient diffing**: Only generates diffs on failures
- **Smart caching**: Jest caches results for unchanged tests

### Configuration Options

```typescript
// Global configuration in setup.ts
const toMatchImageSnapshot = configureToMatchImageSnapshot({
  comparisonMethod: 'ssim',
  threshold: 0.005,           // Global threshold
  failureThreshold: 0.005,    // Global failure threshold
  failureThresholdType: 'percent',
  customDiffDir: 'e2e/visual/diffs',
  customSnapshotsDir: 'e2e/visual/baselines',
  dumpDiffToConsole: false,   // Set to true for debugging
  blur: 0,                    // Gaussian blur for noise reduction
});
```

## 📚 Additional Resources

- [jest-image-snapshot Documentation](https://github.com/americanexpress/jest-image-snapshot)
- [SSIM Algorithm Explanation](https://en.wikipedia.org/wiki/Structural_similarity)
- [React Native Testing Library](https://callstack.github.io/react-native-testing-library/)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)

## 🤝 Contributing

When adding new screens or components:

1. **Create test file**: Follow naming convention `<screen-name>.test.tsx`
2. **Include both themes**: Test light and dark mode variations
3. **Add responsive tests**: Include tablet/mobile dimension testing
4. **Generate baselines**: Run `npm run generate-baselines` for new tests
5. **Update documentation**: Add any special testing considerations

## 📞 Support

For questions or issues with visual regression testing:

1. Check the troubleshooting section above
2. Review GitHub Actions workflow logs
3. Download and examine diff artifacts from failed tests
4. Consult the jest-image-snapshot documentation for advanced configuration 