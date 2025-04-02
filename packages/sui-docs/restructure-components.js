#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Base directories
const SRC_DIR = path.join(__dirname, 'src');
const COMPONENTS_DIR = path.join(__dirname, 'components');
const PACKAGE_JSON_PATH = path.join(__dirname, 'package.json');

// Create components directory if it doesn't exist
if (!fs.existsSync(COMPONENTS_DIR)) {
  fs.mkdirSync(COMPONENTS_DIR, { recursive: true });
}

// Read package.json
const packageJson = JSON.parse(fs.readFileSync(PACKAGE_JSON_PATH, 'utf8'));

// Initialize arrays to track export paths and copy commands
const newExports = {};
const copyCommands = [];

// Find all component directories in src folder
const srcDirs = fs.readdirSync(SRC_DIR).filter(file => {
  const fullPath = path.join(SRC_DIR, file);
  return fs.statSync(fullPath).isDirectory();
});

// Process each component directory
srcDirs.forEach(dirName => {
  const srcPath = path.join(SRC_DIR, dirName);
  const componentsPath = path.join(COMPONENTS_DIR, dirName);

  // Skip if it's not a component directory or already processed
  if (dirName === 'components' || dirName === 'node_modules') {
    return;
  }

  console.log(`Processing component: ${dirName}`);

  // Create destination directory
  if (!fs.existsSync(componentsPath)) {
    fs.mkdirSync(componentsPath, { recursive: true });
  }

  // Find main component file - could be .js, .jsx, .ts, or .tsx
  const dirFiles = fs.readdirSync(srcPath);
  let mainFile = dirFiles.find(f => f === `${dirName}.tsx` || f === `${dirName}.jsx` || f === `${dirName}.ts` || f === `${dirName}.js`);

  // If not found, just use index file
  if (!mainFile) {
    mainFile = dirFiles.find(f => f.startsWith('index.'));
  }

  if (!mainFile) {
    console.log(`Warning: Could not find main file for ${dirName}`);
    return;
  }

  // Create index.ts file
  const extension = path.extname(mainFile);
  const baseName = path.basename(mainFile, extension);
  const indexPath = path.join(componentsPath, 'index.ts');

  // Component file path
  const componentSrcPath = path.join(srcPath, mainFile);
  const componentDestPath = path.join(componentsPath, mainFile);

  // Create the index.ts file
  const indexContent = `export { default } from './${baseName}';\n`;
  fs.writeFileSync(indexPath, indexContent);

  // Check if destination file already exists
  if (!fs.existsSync(componentDestPath)) {
    // Copy the component file
    fs.copyFileSync(componentSrcPath, componentDestPath);
    console.log(`Copied ${componentSrcPath} to ${componentDestPath}`);
  }

  // Look for declaration file
  const declFile = dirFiles.find(f => f === `${baseName}.d.ts`);
  if (declFile) {
    const declSrcPath = path.join(srcPath, declFile);
    const declDestPath = path.join(componentsPath, declFile);

    // Copy declaration file if it doesn't exist
    if (!fs.existsSync(declDestPath)) {
      fs.copyFileSync(declSrcPath, declDestPath);
      console.log(`Copied ${declSrcPath} to ${declDestPath}`);
    }
  } else {
    // Create a simple declaration file
    const declContent = `import * as React from 'react';\n\nexport interface ${dirName}Props {\n  // Add component props\n}\n\ndeclare const ${dirName}: React.FunctionComponent<${dirName}Props>;\nexport default ${dirName};\n`;
    fs.writeFileSync(path.join(componentsPath, `${baseName}.d.ts`), declContent);
    console.log(`Created declaration file for ${dirName}`);
  }

  // Add to exports
  const jsExtension = extension === '.tsx' || extension === '.ts' ? '.js' : extension;
  newExports[`./${dirName}`] = `./components/${dirName}/index${jsExtension}`;

  // Add to copy commands
  const copyFilesJs = [
    `./components/${dirName}/index.js:./components/${dirName}/index.js`,
    `./components/${dirName}/${baseName}${jsExtension}:./components/${dirName}/${baseName}${jsExtension}`,
    `./components/${dirName}/index.d.ts:./components/${dirName}/index.d.ts`,
    `./components/${dirName}/${baseName}.d.ts:./components/${dirName}/${baseName}.d.ts`
  ];

  copyCommands.push(...copyFilesJs);
});

// Update package.json exports
console.log('Updating package.json exports...');

// Merge existing exports with new ones
const allExports = { ...packageJson.exports, ...newExports };

// Sort exports alphabetically
const sortedExports = {};
Object.keys(allExports).sort().forEach(key => {
  sortedExports[key] = allExports[key];
});

packageJson.exports = sortedExports;

// Update build:copy-files script
const existingCopyFiles = packageJson.scripts['build:copy-files'];
const newCopyFiles = existingCopyFiles + ' ' + copyCommands.join(' ');
packageJson.scripts['build:copy-files'] = newCopyFiles;

// Write updated package.json
fs.writeFileSync(PACKAGE_JSON_PATH, JSON.stringify(packageJson, null, 2));

console.log('\nDone! Package.json updated with all components.');
console.log('\nImportant next steps:');
console.log('1. Review the generated files and fix any issues');
console.log('2. Update the import paths in component files to reference the new locations');
console.log('3. Run build to verify everything works correctly');

