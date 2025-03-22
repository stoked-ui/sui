#!/usr/bin/env node

import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const packagePath = path.resolve(__dirname, '..');
const buildPath = path.join(packagePath, 'build');
const workspacePath = path.resolve(packagePath, '../..');

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
      sideEffects: false,
      main: './index.js',
      module: './index.modern.js',
      types: './index.d.ts',
      typings: './index.d.ts',
      peerDependencies: packageData.peerDependencies,
      engines: packageData.engines
    };
    
    // Handle workspace dependencies by resolving their actual versions
    if (packageData.dependencies) {
      newPackageData.dependencies = {};
      
      // For each dependency in the original package.json
      Object.entries(packageData.dependencies).forEach(([name, version]) => {
        // If it's a workspace dependency
        if (version.startsWith('workspace:')) {
          // Look up the actual version from the target package
          try {
            const depPackagePath = path.resolve(packagePath, '..', name.replace('@stoked-ui/', 'sui-'));
            const depPackageJson = JSON.parse(fs.readFileSync(path.join(depPackagePath, 'package.json'), 'utf8'));
            // Use the actual version but with a caret (^) for semver compatibility
            newPackageData.dependencies[name] = `^${depPackageJson.version}`;
            console.log(`Resolved workspace dependency ${name} to version ${depPackageJson.version}`);
          } catch (err) {
            // Fallback to a specific version if we can't resolve it
            newPackageData.dependencies[name] = '^0.1.0';
            console.warn(`Couldn't resolve workspace dependency ${name}, using ^0.1.0`);
          }
        } else {
          // For non-workspace dependencies, just copy the version as-is
          newPackageData.dependencies[name] = version;
        }
      });
    }
    
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

/**
 * Copy CSS files from all dependencies to build/styles
 */
function copyCssFiles() {
  const stylesDir = path.join(buildPath, 'styles');
  if (!fs.existsSync(stylesDir)) {
    fs.mkdirSync(stylesDir, { recursive: true });
  }
  
  const packages = [
    'sui-editor',
    'sui-file-explorer',
    'sui-media-selector',
    'sui-timeline',
    'sui-common'
  ];
  
  packages.forEach(pkg => {
    const pkgPath = path.join(workspacePath, 'packages', pkg);
    if (!fs.existsSync(pkgPath)) {
      console.log(`Package path does not exist: ${pkgPath}`);
      return;
    }
    
    // Check for styles directory 
    const srcStylesDir = path.join(pkgPath, 'src', 'styles');
    if (fs.existsSync(srcStylesDir)) {
      console.log(`Copying styles from ${srcStylesDir}`);
      const files = fs.readdirSync(srcStylesDir);
      files.forEach(file => {
        if (file.endsWith('.css')) {
          const srcFile = path.join(srcStylesDir, file);
          const destFile = path.join(stylesDir, `${pkg.replace('sui-', '')}-${file}`);
          fs.copyFileSync(srcFile, destFile);
          console.log(`Copied CSS: ${srcFile} -> ${destFile}`);
        }
      });
    }
    
    // Also check for individual CSS files in src
    const srcDir = path.join(pkgPath, 'src');
    if (fs.existsSync(srcDir)) {
      const files = fs.readdirSync(srcDir);
      files.forEach(file => {
        if (file.endsWith('.css')) {
          const srcFile = path.join(srcDir, file);
          const destFile = path.join(stylesDir, `${pkg.replace('sui-', '')}-${file}`);
          fs.copyFileSync(srcFile, destFile);
          console.log(`Copied CSS: ${srcFile} -> ${destFile}`);
        }
      });
    }
  });
  
  // Create an index.css that imports all other CSS files
  const cssFiles = fs.readdirSync(stylesDir).filter(file => file.endsWith('.css'));
  if (cssFiles.length > 0) {
    let indexCssContent = '/* Stoked UI Complete CSS */\n\n';
    cssFiles.forEach(file => {
      indexCssContent += `@import "./styles/${file}";\n`;
    });
    
    const indexCssPath = path.join(buildPath, 'index.css');
    fs.writeFileSync(indexCssPath, indexCssContent);
    console.log(`Created index.css with imports for ${cssFiles.length} CSS files`);
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

// Copy CSS files
copyCssFiles();

// Create an empty index.d.ts if needed
const indexDtsPath = path.join(buildPath, 'index.d.ts');
if (!fs.existsSync(indexDtsPath)) {
  let dtsContent = '// Type definitions for @stoked-ui/complete\n\n';
  dtsContent += 'import * as React from \'react\';\n\n';
  dtsContent += '// Re-export all types from component packages\n';
  dtsContent += 'export * from \'@stoked-ui/editor\';\n';
  dtsContent += 'export * from \'@stoked-ui/timeline\';\n';
  dtsContent += 'export * from \'@stoked-ui/file-explorer\';\n';
  dtsContent += 'export * from \'@stoked-ui/media-selector\';\n';
  dtsContent += 'export * from \'@stoked-ui/common\';\n\n';
  
  fs.writeFileSync(indexDtsPath, dtsContent, 'utf8');
  console.log(`Created type definitions at ${indexDtsPath}`);
}

// Add React check banner to the beginning of index.js
try {
  const indexJsPath = path.join(buildPath, 'index.js');
  const indexJsContent = fs.readFileSync(indexJsPath, 'utf8');
  const reactCheckBanner = 
`/**
 * @stoked-ui/complete - Bundled Stoked UI components
 * 
 * This package requires React to be loaded in the environment.
 * If you're seeing errors related to React not being found,
 * make sure you have React loaded before this bundle.
 */
`;
  fs.writeFileSync(indexJsPath, reactCheckBanner + indexJsContent);
  console.log(`Added React check banner to ${indexJsPath}`);
} catch (err) {
  console.error('Error adding React check banner:', err);
}

console.log('Created type definitions at', path.join(buildPath, 'index.d.ts')); 
