#!/usr/bin/env node

/**
 * Comprehensive Script for Restructuring @stoked-ui/docs Components
 *
 * This script restructures all components to enable direct imports:
 * import Component from '@stoked-ui/docs/Component'
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Base directories
const SRC_DIR = path.join(__dirname, 'src');
const COMPONENTS_DIR = path.join(__dirname, 'components');
const PACKAGE_JSON_PATH = path.join(__dirname, 'package.json');

// Results tracking
const results = {
  createdDirs: 0,
  copiedFiles: 0,
  updatedImports: 0,
  fixedExtensions: 0,
  errors: 0
};

console.log('🚀 Starting @stoked-ui/docs component restructuring...\n');

// 1. Create components directory if it doesn't exist
if (!fs.existsSync(COMPONENTS_DIR)) {
  fs.mkdirSync(COMPONENTS_DIR, { recursive: true });
  console.log('✅ Created components directory');
}

// 2. Read package.json
console.log('📖 Reading package.json...');
const packageJson = JSON.parse(fs.readFileSync(PACKAGE_JSON_PATH, 'utf8'));
let newExports = {};
let copyCommands = [];

// 3. Find all component directories in src folder
console.log('🔍 Finding components to restructure...');
const srcDirs = fs.readdirSync(SRC_DIR).filter(file => {
  const fullPath = path.join(SRC_DIR, file);
  return fs.statSync(fullPath).isDirectory();
});

// 4. Process each component directory
console.log('\n=== Processing Components ===');
srcDirs.forEach(dirName => {
  const srcPath = path.join(SRC_DIR, dirName);
  const componentsPath = path.join(COMPONENTS_DIR, dirName);

  // Skip if it's not a component directory or already processed
  if (dirName === 'components' || dirName === 'node_modules') {
    return;
  }

  console.log(`\n📦 Processing: ${dirName}`);

  try {
    // Create destination directory
    if (!fs.existsSync(componentsPath)) {
      fs.mkdirSync(componentsPath, { recursive: true });
      results.createdDirs++;
    }

    // Find main component file - could be .js, .jsx, .ts, or .tsx
    const dirFiles = fs.readdirSync(srcPath);
    let mainFile = dirFiles.find(f => f === `${dirName}.tsx` || f === `${dirName}.jsx` || f === `${dirName}.ts` || f === `${dirName}.js`);

    // If not found, try to use index file
    if (!mainFile) {
      mainFile = dirFiles.find(f => f.startsWith('index.'));
    }

    if (!mainFile) {
      console.log(`⚠️ Could not find main file for ${dirName}`);
      results.errors++;
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
    console.log(`  📝 Created index.ts file`);

    // Copy the component file
    if (!fs.existsSync(componentDestPath)) {
      fs.copyFileSync(componentSrcPath, componentDestPath);
      console.log(`  📄 Copied component file`);
      results.copiedFiles++;
    }

    // Look for declaration file
    const declFile = dirFiles.find(f => f === `${baseName}.d.ts`);
    if (declFile) {
      const declSrcPath = path.join(srcPath, declFile);
      const declDestPath = path.join(componentsPath, declFile);

      // Copy declaration file
      if (!fs.existsSync(declDestPath)) {
        fs.copyFileSync(declSrcPath, declDestPath);
        console.log(`  📄 Copied declaration file`);
        results.copiedFiles++;
      }
    } else {
      // Create a simple declaration file
      const declContent = `import * as React from 'react';\n\nexport interface ${dirName}Props {\n  // Add component props\n}\n\ndeclare const ${dirName}: React.FunctionComponent<${dirName}Props>;\nexport default ${dirName};\n`;
      fs.writeFileSync(path.join(componentsPath, `${baseName}.d.ts`), declContent);
      console.log(`  📝 Created declaration file`);
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

    // Process component files to update imports
    const filesToUpdate = fs.readdirSync(componentsPath).filter(file =>
      !file.endsWith('.d.ts') && (file.endsWith('.js') || file.endsWith('.jsx') || file.endsWith('.ts') || file.endsWith('.tsx'))
    );

    filesToUpdate.forEach(file => {
      // Update import paths
      const filePath = path.join(componentsPath, file);
      let content = fs.readFileSync(filePath, 'utf8');

      // Replace imports with correct paths
      let updatedContent = content.replace(
        /from\s+['"]\.\.\/([^\/]+)\/([^'"]+)['"]/g,
        "from '../../components/$1/$2'"
      );

      updatedContent = updatedContent.replace(
        /from\s+['"]\.\.\/([^\/'"]+)['"]/g,
        "from '../../components/$1'"
      );

      // Add extensions to local imports
      updatedContent = updatedContent.replace(
        /from\s+['"]([^'"]*)['"]/g,
        (match, importPath) => {
          // Don't modify node_modules or absolute imports
          if (importPath.startsWith('@') || importPath.startsWith('/') || !importPath.includes('/')) {
            return match;
          }

          // Add .js extension if missing
          if (!importPath.endsWith('.js') && !importPath.endsWith('.jsx') &&
              !importPath.endsWith('.ts') && !importPath.endsWith('.tsx')) {
            results.fixedExtensions++;
            return `from '${importPath}.js'`;
          }

          return match;
        }
      );

      if (content !== updatedContent) {
        fs.writeFileSync(filePath, updatedContent);
        console.log(`  🔄 Updated imports in ${file}`);
        results.updatedImports++;
      }
    });
  } catch (error) {
    console.error(`❌ Error processing ${dirName}:`, error);
    results.errors++;
  }
});

// 5. Update package.json
try {
  console.log('\n📝 Updating package.json...');

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
  console.log('✅ Updated package.json exports and build script');
} catch (error) {
  console.error('❌ Error updating package.json:', error);
  results.errors++;
}

// 6. Verify restructuring
console.log('\n=== Verification ===');

// Check if exports point to valid files
Object.entries(packageJson.exports).forEach(([exportPath, filePath]) => {
  if (exportPath === '.') return; // Skip main entry

  const resolvedPath = path.join(__dirname, filePath);
  if (!fs.existsSync(resolvedPath)) {
    console.log(`❌ Export "${exportPath}" points to missing file: ${filePath}`);
    results.errors++;
  }
});

// Check that all components have exports
if (fs.existsSync(COMPONENTS_DIR)) {
  const componentDirs = fs.readdirSync(COMPONENTS_DIR).filter(dir => {
    const dirPath = path.join(COMPONENTS_DIR, dir);
    return fs.statSync(dirPath).isDirectory();
  });

  componentDirs.forEach(dir => {
    const exportPath = `./${dir}`;
    if (!packageJson.exports[exportPath]) {
      console.log(`❌ Component "${dir}" has no export in package.json`);
      results.errors++;
    }
  });
}

// 7. Summary
console.log('\n=== Summary ===');
console.log(`Created directories: ${results.createdDirs}`);
console.log(`Copied files: ${results.copiedFiles}`);
console.log(`Updated import paths: ${results.updatedImports}`);
console.log(`Fixed import extensions: ${results.fixedExtensions}`);
console.log(`Errors encountered: ${results.errors}`);

if (results.errors === 0) {
  console.log('\n✨ Component restructuring completed successfully! ✨');
} else {
  console.log('\n⚠️ Component restructuring completed with some issues.');
}

console.log('\nNext steps:');
console.log('1. Run "pnpm build" to verify the build process');
console.log('2. Test importing components directly:');
console.log('   import Component from "@stoked-ui/docs/Component"');
