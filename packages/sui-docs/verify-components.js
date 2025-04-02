#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Base directories
const PACKAGE_JSON_PATH = path.join(__dirname, 'package.json');
const COMPONENTS_DIR = path.join(__dirname, 'components');

console.log('Verifying component structure in @stoked-ui/docs...\n');

// 1. Read package.json
const packageJson = JSON.parse(fs.readFileSync(PACKAGE_JSON_PATH, 'utf8'));
const { exports } = packageJson;

// Track results
const results = {
  missingFiles: [],
  missingExports: [],
  incorrectExports: []
};

// 2. Check that each export points to a valid file
console.log('Checking exports in package.json...');
Object.entries(exports).forEach(([exportPath, filePath]) => {
  if (exportPath === '.') return; // Skip main entry

  // Check if the file exists
  const resolvedPath = path.join(__dirname, filePath);
  const resolvedDir = path.dirname(resolvedPath);

  if (!fs.existsSync(resolvedPath)) {
    results.missingFiles.push({ exportPath, filePath });
    console.log(`❌ Export "${exportPath}" points to missing file: ${filePath}`);
  } else {
    console.log(`✅ Export "${exportPath}" is valid`);
  }

  // Check directory structure
  if (exportPath.startsWith('./') && !filePath.includes('/components/')) {
    const componentName = exportPath.slice(2); // Remove './'
    results.incorrectExports.push({ exportPath, filePath, componentName });
    console.log(`⚠️ Export "${exportPath}" should point to components directory`);
  }
});

// 3. Check that all components in components/ have exports
console.log('\nChecking all components have exports...');
if (fs.existsSync(COMPONENTS_DIR)) {
  const componentDirs = fs.readdirSync(COMPONENTS_DIR).filter(dir => {
    const dirPath = path.join(COMPONENTS_DIR, dir);
    return fs.statSync(dirPath).isDirectory();
  });

  componentDirs.forEach(dir => {
    const exportPath = `./${dir}`;
    if (!exports[exportPath]) {
      results.missingExports.push(dir);
      console.log(`❌ Component "${dir}" has no export in package.json`);
    } else {
      console.log(`✅ Component "${dir}" has a valid export`);
    }

    // Check for index files
    const indexPath = path.join(COMPONENTS_DIR, dir, 'index.ts');
    if (!fs.existsSync(indexPath)) {
      console.log(`⚠️ Component "${dir}" is missing index.ts`);
    }
  });
} else {
  console.log('⚠️ Components directory not found');
}

// 4. Summary
console.log('\n=== Summary ===');
console.log(`Missing files: ${results.missingFiles.length}`);
console.log(`Missing exports: ${results.missingExports.length}`);
console.log(`Incorrect exports: ${results.incorrectExports.length}`);

if (results.missingFiles.length === 0 &&
    results.missingExports.length === 0 &&
    results.incorrectExports.length === 0) {
  console.log('\n✨ All components are correctly set up! ✨');
} else {
  console.log('\nSome issues need to be fixed:');

  if (results.missingFiles.length > 0) {
    console.log('\nMissing files:');
    results.missingFiles.forEach(({ exportPath, filePath }) => {
      console.log(`  - ${exportPath} -> ${filePath}`);
    });
  }

  if (results.missingExports.length > 0) {
    console.log('\nComponents missing exports:');
    results.missingExports.forEach(dir => {
      console.log(`  - ${dir}`);
    });
  }

  if (results.incorrectExports.length > 0) {
    console.log('\nIncorrect exports:');
    results.incorrectExports.forEach(({ exportPath, filePath }) => {
      console.log(`  - ${exportPath} should point to components directory`);
      console.log(`    Current: ${filePath}`);
      console.log(`    Expected: ./components/${exportPath.slice(2)}/index.js`);
    });
  }
}

