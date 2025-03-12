#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Base directories
const COMPONENTS_DIR = path.join(__dirname, 'components');

// Process component files to update imports
function processComponentDir(componentDir) {
  console.log(`Processing imports for: ${componentDir}`);

  const files = fs.readdirSync(componentDir).filter(file =>
    !file.endsWith('.d.ts') && (file.endsWith('.js') || file.endsWith('.jsx') || file.endsWith('.ts') || file.endsWith('.tsx'))
  );

  files.forEach(file => {
    const filePath = path.join(componentDir, file);
    let content = fs.readFileSync(filePath, 'utf8');

    // Replace imports from src directories to component directories
    content = content.replace(
      /from\s+['"]\.\.\/([^\/]+)\/([^'"]+)['"]/g,
      "from '../../components/$1/$2'"
    );

    // Replace imports from src directories (no subpath)
    content = content.replace(
      /from\s+['"]\.\.\/([^\/'"]+)['"]/g,
      "from '../../components/$1'"
    );

    fs.writeFileSync(filePath, content);
    console.log(`  Updated imports in ${file}`);
  });
}

// Find all component directories
if (fs.existsSync(COMPONENTS_DIR)) {
  const componentDirs = fs.readdirSync(COMPONENTS_DIR).filter(dir => {
    const dirPath = path.join(COMPONENTS_DIR, dir);
    return fs.statSync(dirPath).isDirectory();
  });

  // Process each component directory
  componentDirs.forEach(dir => {
    processComponentDir(path.join(COMPONENTS_DIR, dir));
  });

  console.log('\nCompleted updating import paths');
} else {
  console.error('Components directory not found. Run restructure-components.js first.');
}
