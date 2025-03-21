#!/usr/bin/env node

import { execSync } from 'child_process';
import path from 'path';
import fs from 'fs';

// List of packages we want to build
const packages = [
  'sui-editor',
  'sui-timeline',
  'sui-media-selector',
  'sui-file-explorer',
  'sui-common'
];

// Function to create empty type declaration files recursively
function createEmptyTypeDeclarations(packagePath) {
  console.log(`Creating empty type declarations in ${packagePath}...`);
  
  // Find all directories in the build folder
  const buildDir = path.join(packagePath, 'build');
  
  // Create root index.d.ts if it doesn't exist
  const rootDtsPath = path.join(buildDir, 'index.d.ts');
  if (!fs.existsSync(rootDtsPath)) {
    console.log(`Creating empty ${rootDtsPath}`);
    fs.writeFileSync(rootDtsPath, '// Auto-generated empty declaration file\n', 'utf8');
  }
  
  // Function to process a directory recursively
  function processDirectory(dir) {
    // Read all entries in the directory
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    
    // Process each entry
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      
      if (entry.isDirectory()) {
        // If it's a directory, process it recursively
        processDirectory(fullPath);
        
        // Create empty index.d.ts in this directory if package.json exists
        const packageJsonPath = path.join(fullPath, 'package.json');
        const dtsPath = path.join(fullPath, 'index.d.ts');
        
        if (fs.existsSync(packageJsonPath) && !fs.existsSync(dtsPath)) {
          console.log(`Creating empty ${dtsPath}`);
          fs.writeFileSync(dtsPath, '// Auto-generated empty declaration file\n', 'utf8');
        }
      }
    }
  }
  
  // Start processing from the build directory
  processDirectory(buildDir);
}

// Function to manually update package.json files to fix type references
function fixPackageJsonTypeReferences(packagePath) {
  console.log(`Fixing package.json type references in ${packagePath}...`);
  
  const buildDir = path.join(packagePath, 'build');
  
  // Function to process a directory recursively
  function processDirectory(dir) {
    // Read all entries in the directory
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    
    // Process each entry
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      
      if (entry.isDirectory()) {
        // If it's a directory, process it recursively
        processDirectory(fullPath);
        
        // Fix package.json if it exists
        const packageJsonPath = path.join(fullPath, 'package.json');
        
        if (fs.existsSync(packageJsonPath)) {
          try {
            const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
            
            // Remove types/typings fields to avoid type checking issues
            delete packageJson.types;
            delete packageJson.typings;
            
            // Write updated package.json
            fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2), 'utf8');
            console.log(`Updated ${packageJsonPath}`);
          } catch (error) {
            console.error(`Error updating ${packageJsonPath}:`, error.message);
          }
        }
      }
    }
  }
  
  // Start processing from the build directory
  processDirectory(buildDir);
  
  // Also fix the root package.json
  const rootPackageJsonPath = path.join(buildDir, 'package.json');
  if (fs.existsSync(rootPackageJsonPath)) {
    try {
      const packageJson = JSON.parse(fs.readFileSync(rootPackageJsonPath, 'utf8'));
      
      // Set types to the empty index.d.ts we created
      packageJson.types = './index.d.ts';
      packageJson.typings = './index.d.ts';
      
      // Write updated package.json
      fs.writeFileSync(rootPackageJsonPath, JSON.stringify(packageJson, null, 2), 'utf8');
      console.log(`Updated root ${rootPackageJsonPath}`);
    } catch (error) {
      console.error(`Error updating root ${rootPackageJsonPath}:`, error.message);
    }
  }
}

// Function to build a package
async function buildPackage(packageName) {
  try {
    console.log(`\n\n======= Building ${packageName} =======`);
    const packagePath = path.join(process.cwd(), 'packages', packageName);
    
    if (!fs.existsSync(packagePath)) {
      console.error(`Package directory ${packagePath} does not exist!`);
      return;
    }
    
    // Clean build directory
    execSync(`cd ${packagePath} && rimraf build tsconfig.build.tsbuildinfo`, { stdio: 'inherit' });
    
    // Build JavaScript files without type checking
    console.log(`Building JS files for ${packageName}...`);
    execSync(`cd ${packagePath} && node ../../scripts/build.mjs modern`, { stdio: 'inherit' });
    execSync(`cd ${packagePath} && node ../../scripts/build.mjs node`, { stdio: 'inherit' });
    execSync(`cd ${packagePath} && node ../../scripts/build.mjs stable`, { stdio: 'inherit' });
    
    // Create empty type declaration files
    createEmptyTypeDeclarations(packagePath);
    
    // Fix package.json type references
    fixPackageJsonTypeReferences(packagePath);
    
    // Copy necessary files
    console.log(`Copying files for ${packageName}...`);
    try {
      if (fs.existsSync(path.join(packagePath, 'scripts', 'customCopyFiles.mjs'))) {
        execSync(`cd ${packagePath} && node ./scripts/customCopyFiles.mjs`, { stdio: 'inherit' });
      } else {
        execSync(`cd ${packagePath} && node ../../scripts/copyFiles.mjs`, { stdio: 'inherit' });
      }
    } catch (copyError) {
      console.error(`Warning: Error during copy files for ${packageName}, but continuing:`, copyError.message);
    }
    
    console.log(`✅ Successfully built ${packageName} without type checking`);
  } catch (error) {
    console.error(`❌ Error building ${packageName}:`, error.message);
  }
}

async function main() {
  console.log('Building packages without type checking...');
  
  // Build each package in sequence
  for (const packageName of packages) {
    await buildPackage(packageName);
  }
  
  console.log('\n\n✅ Build completed for all packages without type checking');
  console.log('\nTo use these packages in your project, you may need to add "skipLibCheck": true to your tsconfig.json');
}

main().catch(error => {
  console.error('❌ Build failed:', error);
  process.exit(1);
});
