#!/usr/bin/env node

import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const packagePath = path.resolve(__dirname, '..');
const buildPath = path.join(packagePath, 'build');

// Get build type from args
const buildType = process.argv[2] || 'modern'; // modern, node, stable

// Paths
const srcDir = path.join(packagePath, 'src');
const targetDir = buildType === 'modern' ? buildPath : path.join(buildPath, buildType);

// Get the package name and version
const packageJson = JSON.parse(fs.readFileSync(path.join(packagePath, 'package.json'), 'utf8'));
const packageName = packageJson.name;

console.log(`Building ${packageName} (${buildType})...`);

// Make sure target directory exists
if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

// Transpile using esbuild directly
function esbuildTranspile() {
  try {
    const entryPoint = path.join(srcDir, 'index.ts');
    
    const format = buildType === 'modern' ? 'esm' : 'cjs';
    const outfile = path.join(
      targetDir, 
      buildType === 'modern' ? 'index.modern.js' : 'index.js'
    );
    
    // esbuild options for different targets
    const target = 
      buildType === 'modern' ? 'es2020' : 
      buildType === 'node' ? 'node14' : 
      'es2015';
    
    // Keep all stoked-ui packages as external to avoid resolution issues
    // This creates a re-export package instead of a fully bundled one
    const esbuildCmd = `esbuild ${entryPoint} --bundle --format=${format} --target=${target} --outfile=${outfile} \
      --external:react --external:react-dom \
      --external:@stoked-ui/common --external:@stoked-ui/editor \
      --external:@stoked-ui/file-explorer --external:@stoked-ui/media-selector \
      --external:@stoked-ui/timeline --platform=browser`;
    
    console.log(`Running: ${esbuildCmd}`);
    execSync(esbuildCmd, { stdio: 'inherit' });
    
    // If this is the modern build, create a copy at the root level
    if (buildType === 'modern') {
      const rootIndexPath = path.join(buildPath, 'index.js');
      if (!fs.existsSync(rootIndexPath)) {
        fs.copyFileSync(outfile, rootIndexPath);
        console.log(`Created root index.js from modern build`);
      }
    }
    
    console.log(`Successfully built ${buildType} version`);
  } catch (error) {
    console.error(`Error building ${buildType} version:`, error);
    process.exit(1);
  }
}

esbuildTranspile(); 
