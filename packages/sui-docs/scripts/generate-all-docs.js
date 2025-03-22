const fs = require('fs');
const path = require('path');
const util = require('util');
const { execSync } = require('child_process');

const readdir = util.promisify(fs.readdir);
const stat = util.promisify(fs.stat);
const exists = util.promisify(fs.exists);

/**
 * Get directories inside a directory
 * @param {string} source - The directory to scan
 * @returns {Promise<string[]>} - Array of directory paths
 */
async function getDirectories(source) {
  const items = await readdir(source);
  const itemStats = await Promise.all(items.map(item => {
    const itemPath = path.join(source, item);
    return stat(itemPath).then(stats => ({ name: item, stats, path: itemPath }));
  }));
  
  return itemStats
    .filter(item => item.stats.isDirectory())
    .map(item => item.path);
}

/**
 * Check if a directory contains a component
 * @param {string} directory - The directory to check
 * @returns {Promise<boolean>} - Whether the directory contains a component
 */
async function isComponentDirectory(directory) {
  try {
    const files = await readdir(directory);
    const dirName = path.basename(directory);
    
    // Check if there's a file with the same name as the directory with .tsx or .ts or .jsx or .js extension
    return files.some(file => {
      const baseName = file.split('.')[0];
      const ext = path.extname(file);
      return (baseName === dirName && 
        (ext === '.tsx' || ext === '.ts' || ext === '.jsx' || ext === '.js'));
    });
  } catch (error) {
    console.error(`Error checking ${directory}:`, error);
    return false;
  }
}

/**
 * Find all component directories in a package
 * @param {string} packageDir - The package directory to scan
 * @returns {Promise<string[]>} - Array of component directory paths
 */
async function findComponentDirectories(packageDir) {
  try {
    const srcDir = path.join(packageDir, 'src');
    
    if (!await exists(srcDir)) {
      return [];
    }
    
    const directories = await getDirectories(srcDir);
    let componentDirs = [];
    
    for (const dir of directories) {
      if (await isComponentDirectory(dir)) {
        componentDirs.push(dir);
      }
      
      // Recursively check subdirectories
      const subDirs = await getDirectories(dir);
      for (const subDir of subDirs) {
        if (await isComponentDirectory(subDir)) {
          componentDirs.push(subDir);
        }
      }
    }
    
    return componentDirs;
  } catch (error) {
    console.error(`Error scanning ${packageDir}:`, error);
    return [];
  }
}

/**
 * Generate documentation for all components in a package
 * @param {string} packageName - Name of the package to generate docs for (e.g., 'sui-timeline')
 * @param {boolean} force - Whether to force regeneration even if docs already exist
 */
async function generateDocsForPackage(packageName, force = false) {
  try {
    console.log(`Generating documentation for package: ${packageName}`);
    
    const packageDir = path.resolve(__dirname, '../../', packageName);
    const componentDirs = await findComponentDirectories(packageDir);
    
    console.log(`Found ${componentDirs.length} components in ${packageName}`);
    
    for (const componentDir of componentDirs) {
      const componentName = path.basename(componentDir);
      const docDir = path.join(packageDir, 'docs', 'src', 'components', componentName);
      
      if (!force && await exists(docDir)) {
        console.log(`Documentation already exists for ${componentName}, skipping. Use --force to override.`);
        continue;
      }
      
      console.log(`Generating documentation for ${componentName}...`);
      
      const generateScript = path.join(__dirname, 'generate-component-docs.js');
      execSync(`node ${generateScript} ${packageName} ${componentName}`, { stdio: 'inherit' });
    }
    
    console.log(`Documentation generation complete for ${packageName}`);
  } catch (error) {
    console.error(`Error generating docs for package ${packageName}:`, error);
  }
}

/**
 * Generate documentation for all components in all packages
 * @param {boolean} force - Whether to force regeneration even if docs already exist
 */
async function generateAllDocs(force = false) {
  try {
    const packagesDir = path.resolve(__dirname, '../../');
    const packageDirs = await getDirectories(packagesDir);
    
    let suiPackages = [];
    
    for (const packageDir of packageDirs) {
      const packageName = path.basename(packageDir);
      if (packageName.startsWith('sui-') && packageName !== 'sui-docs') {
        suiPackages.push(packageName);
      }
    }
    
    console.log(`Found ${suiPackages.length} sui packages to document`);
    
    for (const packageName of suiPackages) {
      await generateDocsForPackage(packageName, force);
    }
    
    console.log('All documentation generation complete!');
  } catch (error) {
    console.error('Error generating all docs:', error);
  }
}

// Check command line arguments
const args = process.argv.slice(2);
const force = args.includes('--force');
const packageName = args.find(arg => !arg.startsWith('--'));

if (packageName) {
  // Generate docs for a specific package
  generateDocsForPackage(packageName, force);
} else {
  // Generate docs for all packages
  generateAllDocs(force);
} 