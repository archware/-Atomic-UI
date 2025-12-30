/**
 * Script to combine Angular app and Storybook builds for GitHub Pages deployment
 * 
 * This script:
 * 1. Creates a dist/gh-pages directory
 * 2. Copies the Angular app build to the root
 * 3. Copies Storybook to /storybook subdirectory
 */

const fs = require('fs');
const path = require('path');

const ANGULAR_BUILD_DIR = 'dist/angular-scrollable-table/browser';
const STORYBOOK_BUILD_DIR = 'dist/storybook/angular-scrollable-table';
const OUTPUT_DIR = 'dist/gh-pages';
const STORYBOOK_SUBDIR = 'storybook';

// Helper function to copy directory recursively
function copyDirSync(src, dest) {
  if (!fs.existsSync(src)) {
    console.error(`❌ Source directory not found: ${src}`);
    process.exit(1);
  }

  // Create destination directory
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }

  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copyDirSync(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

// Helper function to remove directory recursively
function removeDirSync(dir) {
  if (fs.existsSync(dir)) {
    fs.rmSync(dir, { recursive: true, force: true });
  }
}

console.log('🚀 Combining builds for GitHub Pages deployment...\n');

// Step 1: Clean and create output directory
console.log('📁 Creating output directory...');
removeDirSync(OUTPUT_DIR);
fs.mkdirSync(OUTPUT_DIR, { recursive: true });

// Step 2: Copy Angular app to root
console.log(`📦 Copying Angular app from ${ANGULAR_BUILD_DIR}...`);
copyDirSync(ANGULAR_BUILD_DIR, OUTPUT_DIR);
console.log('   ✅ Angular app copied to root\n');

// Step 3: Copy Storybook to subdirectory
const storybookDest = path.join(OUTPUT_DIR, STORYBOOK_SUBDIR);
console.log(`📚 Copying Storybook from ${STORYBOOK_BUILD_DIR}...`);
copyDirSync(STORYBOOK_BUILD_DIR, storybookDest);
console.log(`   ✅ Storybook copied to /${STORYBOOK_SUBDIR}/\n`);

// Step 4: Create .nojekyll file (prevents GitHub Pages from processing with Jekyll)
const nojekyllPath = path.join(OUTPUT_DIR, '.nojekyll');
fs.writeFileSync(nojekyllPath, '');
console.log('   ✅ Created .nojekyll file\n');

// Summary
console.log('🎉 Build combination complete!');
console.log('─'.repeat(50));
console.log(`📂 Output: ${OUTPUT_DIR}/`);
console.log(`   ├── /           → Angular App`);
console.log(`   └── /storybook/ → Storybook`);
console.log('─'.repeat(50));
console.log('\n💡 Run "npm run deploy" to publish to GitHub Pages');
