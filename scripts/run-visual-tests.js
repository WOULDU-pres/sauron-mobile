#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function showHelp() {
  log('\n📸 Visual Regression Test Runner', colors.cyan + colors.bright);
  log('=====================================\n', colors.cyan);
  
  log('Usage:', colors.bright);
  log('  npm run visual-test [command] [options]\n');
  
  log('Commands:', colors.bright);
  log('  run          Run visual tests (default)');
  log('  update       Update baseline images');
  log('  clean        Clean up test artifacts');
  log('  baseline     Generate initial baselines');
  log('  help         Show this help message\n');
  
  log('Options:', colors.bright);
  log('  --verbose    Show detailed test output');
  log('  --watch      Run tests in watch mode');
  log('  --screen     Run tests for specific screen (dashboard|reports|detection-log|profile)');
  log('  --theme      Run tests for specific theme (light|dark)');
  log('  --ci         Run in CI mode (no watch, coverage disabled)\n');
  
  log('Examples:', colors.bright);
  log('  npm run visual-test run --verbose');
  log('  npm run visual-test update --screen dashboard');
  log('  npm run visual-test run --theme light --watch');
  log('  npm run visual-test baseline\n');
}

function checkDirectories() {
  const dirs = [
    'e2e/visual/baselines',
    'e2e/visual/diffs',
    'e2e/utils'
  ];
  
  dirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      log(`✓ Created directory: ${dir}`, colors.green);
    }
  });
}

function cleanArtifacts() {
  log('🧹 Cleaning test artifacts...', colors.yellow);
  
  const dirsToClean = [
    'e2e/visual/diffs',
    'e2e/visual/__diff_output__',
    'coverage'
  ];
  
  dirsToClean.forEach(dir => {
    if (fs.existsSync(dir)) {
      fs.rmSync(dir, { recursive: true, force: true });
      log(`✓ Cleaned: ${dir}`, colors.green);
    }
  });
}

function buildJestCommand(command, options) {
  let jestCmd = 'jest --testPathPattern=e2e/visual';
  
  // Add command-specific options
  switch (command) {
    case 'update':
    case 'baseline':
      jestCmd += ' --updateSnapshot';
      break;
    case 'run':
    default:
      // Default run command
      break;
  }
  
  // Add options
  if (options.verbose) {
    jestCmd += ' --verbose';
  }
  
  if (options.watch && !options.ci) {
    jestCmd += ' --watch';
  }
  
  if (options.ci) {
    jestCmd += ' --ci --coverage=false --watchAll=false';
  }
  
  if (options.screen) {
    jestCmd += ` --testNamePattern="${options.screen}"`;
  }
  
  if (options.theme) {
    jestCmd += ` --testNamePattern="${options.theme} theme"`;
  }
  
  return jestCmd;
}

function runTests(command, options) {
  try {
    log(`🚀 Running visual regression tests...`, colors.blue);
    
    // Set environment variables
    const env = {
      ...process.env,
      NODE_ENV: 'test',
      TZ: 'UTC'
    };
    
    if (options.ci) {
      env.CI = 'true';
      env.EXPO_NO_DOTENV = '1';
    }
    
    const jestCommand = buildJestCommand(command, options);
    
    log(`📋 Command: ${jestCommand}`, colors.cyan);
    
    execSync(jestCommand, {
      stdio: 'inherit',
      env: env,
      cwd: process.cwd()
    });
    
    log('✅ Visual tests completed successfully!', colors.green + colors.bright);
    
    if (command === 'update' || command === 'baseline') {
      log('\n📸 Baseline images have been updated.', colors.yellow);
      log('🔍 Please review the changes and commit them to git.', colors.yellow);
    }
    
  } catch (error) {
    log('❌ Visual tests failed!', colors.red + colors.bright);
    
    if (fs.existsSync('e2e/visual/diffs')) {
      log('\n📁 Diff images have been generated in e2e/visual/diffs/', colors.yellow);
      log('🔍 Review the diff images to understand the visual changes.', colors.yellow);
    }
    
    process.exit(1);
  }
}

function showStatus() {
  log('\n📊 Visual Testing Status', colors.cyan + colors.bright);
  log('========================\n', colors.cyan);
  
  // Check baseline images
  const baselineDir = 'e2e/visual/baselines';
  if (fs.existsSync(baselineDir)) {
    const baselines = fs.readdirSync(baselineDir).filter(f => f.endsWith('.png'));
    log(`📸 Baseline images: ${baselines.length}`, colors.green);
  } else {
    log('📸 Baseline images: 0 (run npm run visual-test baseline)', colors.yellow);
  }
  
  // Check diff images
  const diffDir = 'e2e/visual/diffs';
  if (fs.existsSync(diffDir)) {
    const diffs = fs.readdirSync(diffDir).filter(f => f.endsWith('.png'));
    if (diffs.length > 0) {
      log(`🔍 Diff images: ${diffs.length} (review required)`, colors.red);
    } else {
      log(`🔍 Diff images: 0`, colors.green);
    }
  }
  
  // Check test files
  const testDir = 'e2e/visual';
  if (fs.existsSync(testDir)) {
    const tests = fs.readdirSync(testDir).filter(f => f.endsWith('.test.tsx'));
    log(`🧪 Test files: ${tests.length}`, colors.blue);
    tests.forEach(test => {
      log(`   - ${test}`, colors.cyan);
    });
  }
  
  log('');
}

function main() {
  const args = process.argv.slice(2);
  const command = args[0] || 'run';
  
  // Parse options
  const options = {
    verbose: args.includes('--verbose'),
    watch: args.includes('--watch'),
    ci: args.includes('--ci'),
    screen: args.find(arg => arg.startsWith('--screen='))?.split('=')[1],
    theme: args.find(arg => arg.startsWith('--theme='))?.split('=')[1]
  };
  
  // Handle commands
  switch (command) {
    case 'help':
    case '--help':
    case '-h':
      showHelp();
      break;
      
    case 'clean':
      cleanArtifacts();
      break;
      
    case 'status':
      showStatus();
      break;
      
    case 'run':
    case 'update':
    case 'baseline':
      checkDirectories();
      runTests(command, options);
      break;
      
    default:
      log(`❌ Unknown command: ${command}`, colors.red);
      showHelp();
      process.exit(1);
  }
}

// Run the script
main(); 