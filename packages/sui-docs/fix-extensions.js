#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Base directories
const COMPONENTS_DIR = path.join(__dirname, 'components');

// Process component files to add missing extensions in imports
function processComponentDir(componentDir) {
  console.log(`Processing files in: ${componentDir}`);

  const files = fs.readdirSync(componentDir).filter(file =>
    !file.endsWith('.d.ts') && (file.endsWith('.js') || file.endsWith('.jsx') || file.endsWith('.ts') || file.endsWith('.tsx'))
  );

  files.forEach(file => {
    const filePath = path.join(componentDir, file);
    const content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    // Fix missing extensions in imports
    const newContent = content.replace(
      /from\s+['"]([^'"]*)['"]/g,
      (match, importPath) => {
        // Don't modify node_modules or absolute imports
        if (importPath.startsWith('@') || importPath.startsWith('/') || !importPath.includes('/')) {
          return match;
        }

        // Add .js extension if missing
        if (!importPath.endsWith('.js') && !importPath.endsWith('.jsx') &&
            !importPath.endsWith('.ts') && !importPath.endsWith('.tsx')) {
          modified = true;
          return `from '${importPath}.js'`;
        }

        return match;
      }
    );

    if (modified) {
      fs.writeFileSync(filePath, newContent);
      console.log(`  Fixed extensions in ${file}`);
    }
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

  console.log('\nCompleted fixing file extensions in imports');
} else {
  console.error('Components directory not found. Run restructure-components.js first.');
}

