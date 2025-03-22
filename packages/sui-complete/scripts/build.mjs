#!/usr/bin/env node

import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const packagePath = path.resolve(__dirname, '..');
const buildPath = path.join(packagePath, 'build');
const workspacePath = path.resolve(packagePath, '../..');

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

// Copy all assets from component packages
function copyAssets() {
  const assetsDirs = [
    { src: path.join(workspacePath, 'packages/sui-editor/assets'), dest: path.join(buildPath, 'assets/editor') },
    { src: path.join(workspacePath, 'packages/sui-media-selector/assets'), dest: path.join(buildPath, 'assets/media-selector') },
    { src: path.join(workspacePath, 'packages/sui-file-explorer/assets'), dest: path.join(buildPath, 'assets/file-explorer') },
    { src: path.join(workspacePath, 'packages/sui-timeline/assets'), dest: path.join(buildPath, 'assets/timeline') },
    { src: path.join(workspacePath, 'packages/sui-common/assets'), dest: path.join(buildPath, 'assets/common') }
  ];

  assetsDirs.forEach(({ src, dest }) => {
    if (fs.existsSync(src)) {
      console.log(`Copying assets from ${src} to ${dest}`);
      fs.mkdirSync(dest, { recursive: true });
      
      const files = fs.readdirSync(src);
      files.forEach(file => {
        const srcFile = path.join(src, file);
        const destFile = path.join(dest, file);
        
        if (fs.statSync(srcFile).isDirectory()) {
          // Skip directories for simplicity
          console.log(`Skipping directory: ${srcFile}`);
        } else {
          fs.copyFileSync(srcFile, destFile);
          console.log(`Copied asset: ${srcFile} -> ${destFile}`);
        }
      });
    } else {
      console.log(`No assets directory found at ${src}`);
    }
  });
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
    
    // We need to mark React and React DOM as external, but include all our packages
    // This creates a more robust bundled version
    const esbuildCmd = `esbuild ${entryPoint} --bundle --format=${format} --target=${target} --outfile=${outfile} \
      --external:react --external:react-dom \
      --platform=browser`;
    
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

if (buildType === 'modern') {
  copyAssets();
} 
