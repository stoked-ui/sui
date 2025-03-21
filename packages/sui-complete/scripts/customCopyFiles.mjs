#!/usr/bin/env node

import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const packagePath = path.resolve(__dirname, '..');
const buildPath = path.join(packagePath, 'build');

/**
 * Creates a package.json in the build directory based on the one in the project root
 */
function createPackageJson() {
  console.log(`buildPath ${buildPath}`);
  
  try {
    const packageData = JSON.parse(fs.readFileSync(path.join(packagePath, 'package.json'), 'utf8'));
    
    // Create the modified package.json for distribution
    const newPackageData = {
      name: packageData.name,
      version: packageData.version,
      description: packageData.description,
      author: packageData.author,
      license: packageData.license,
      repository: packageData.repository,
      bugs: packageData.bugs,
      homepage: packageData.homepage,
      keywords: packageData.keywords,
      sideEffects: packageData.sideEffects,
      main: './index.js',
      module: './index.modern.js',
      types: './index.d.ts',
      typings: './index.d.ts',
      peerDependencies: packageData.peerDependencies,
      dependencies: packageData.dependencies,
      engines: packageData.engines
    };
    
    // Write the new package.json
    const targetPath = path.join(buildPath, 'package.json');
    fs.writeFileSync(
      targetPath,
      JSON.stringify(newPackageData, null, 2)
    );
    console.log(`Created package.json in ${targetPath}`);
    
  } catch (err) {
    console.error('Error creating package.json:', err);
  }
}

/**
 * Copy a file to the build directory
 */
function copyFile(file, targetFileName) {
  const sourcePath = path.join(packagePath, file);
  const targetPath = path.join(buildPath, targetFileName || path.basename(file));
  
  if (fs.existsSync(sourcePath)) {
    fs.copyFileSync(sourcePath, targetPath);
    console.log(`Copied ${sourcePath} to ${targetPath}`);
  } else {
    console.log(`File ${sourcePath} does not exist`);
  }
}

// Create build directory if it doesn't exist
if (!fs.existsSync(buildPath)) {
  fs.mkdirSync(buildPath, { recursive: true });
}

// Create package.json
createPackageJson();

// Copy README.md
copyFile('README.md');

// Copy LICENSE from root
copyFile('../../LICENSE', 'LICENSE');

// Copy CHANGELOG.md from root
copyFile('../../CHANGELOG.md', 'CHANGELOG.md');

// Create an empty index.d.ts if needed
const indexDtsPath = path.join(buildPath, 'index.d.ts');
if (!fs.existsSync(indexDtsPath)) {
  fs.writeFileSync(indexDtsPath, '// Auto-generated empty declaration file\n', 'utf8');
  console.log(`Created empty ${indexDtsPath}`);
} 
