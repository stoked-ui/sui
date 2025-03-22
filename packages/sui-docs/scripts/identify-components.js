const fs = require('fs');
const path = require('path');
const util = require('util');

const readdir = util.promisify(fs.readdir);
const stat = util.promisify(fs.stat);
const writeFile = util.promisify(fs.writeFile);

/**
 * Get directories inside a directory
 * @param {string} source - The directory to scan
 * @returns {Promise<string[]>} - Array of directory names
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
 * Recursively find all component directories in a package
 * @param {string} packageDir - The package directory to scan
 * @returns {Promise<string[]>} - Array of component directory paths
 */
async function findComponentDirectories(packageDir) {
  try {
    const srcDir = path.join(packageDir, 'src');
    
    if (!fs.existsSync(srcDir)) {
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
 * Generate a component documentation status report
 */
async function generateComponentDocReport() {
  try {
    // Get all package directories
    const packagesDir = path.resolve(__dirname, '../../');
    const packageDirs = await getDirectories(packagesDir);
    
    const report = [];
    let totalComponents = 0;
    
    // Process each package
    for (const packageDir of packageDirs) {
      const packageName = path.basename(packageDir);
      
      // Skip non-sui packages
      if (!packageName.startsWith('sui-')) {
        continue;
      }
      
      // Find component directories in this package
      const componentDirs = await findComponentDirectories(packageDir);
      totalComponents += componentDirs.length;
      
      // Check documentation status
      const componentStatus = await Promise.all(componentDirs.map(async (compDir) => {
        const componentName = path.basename(compDir);
        const docDir = path.join(packageDir, 'docs', 'src', 'components', componentName);
        const hasDocumentation = fs.existsSync(docDir);
        
        return {
          component: componentName,
          package: packageName,
          path: compDir,
          hasDocumentation,
        };
      }));
      
      report.push({
        package: packageName,
        components: componentStatus,
      });
    }
    
    // Generate report
    const reportData = {
      totalComponents,
      packages: report,
      generatedAt: new Date().toISOString(),
    };
    
    const reportPath = path.join(__dirname, '../component-doc-status.json');
    await writeFile(reportPath, JSON.stringify(reportData, null, 2));
    
    console.log(`Found ${totalComponents} components across all packages.`);
    console.log(`Report generated at: ${reportPath}`);
    
    // Print components missing documentation
    console.log('\nComponents missing documentation:');
    report.forEach(pkg => {
      const missingDocs = pkg.components.filter(comp => !comp.hasDocumentation);
      if (missingDocs.length > 0) {
        console.log(`\n${pkg.package} (${missingDocs.length}/${pkg.components.length}):`);
        missingDocs.forEach(comp => {
          console.log(`  - ${comp.component}`);
        });
      }
    });
    
  } catch (error) {
    console.error('Error generating report:', error);
  }
}

// Run the script
generateComponentDocReport(); 