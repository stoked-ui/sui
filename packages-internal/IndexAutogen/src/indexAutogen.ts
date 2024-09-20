import * as fs from 'fs';
import * as path from 'path';
import * as glob from 'glob';
import * as ts from 'typescript';

// Helper function to get the base name of a directory
function getDirectoryName(dirPath: string): string {
  return path.basename(dirPath);
}

// Helper function to convert a file name with dots into camelCase
function toCamelCase(fileName: string): string {
  return fileName.replace(/\.([a-z])/g, (_, char) => char.toUpperCase());
}

// Function to extract the name of the default export from file content
function getDefaultExportName(fileContent: string): string | null {
  const defaultExportRegex = /export\s+default\s+(function|class)?\s*(\w+)/;
  const match = fileContent.match(defaultExportRegex);
  return match ? match[2] : null;
}

// Check if a file has exports (named or default)
function fileHasExports(fileContent: string): { hasDefault: boolean; defaultName: string | null; namedExports: string[] } {
  const defaultExportRegex = /export\s+default/g;
  const namedExportRegex = /export\s+(const|function|class|let|var)\s+(\w+)/g;

  const hasDefault = defaultExportRegex.test(fileContent);
  const namedExports: string[] = [];
  const defaultName = getDefaultExportName(fileContent);

  let match;
  while ((match = namedExportRegex.exec(fileContent)) !== null) {
    namedExports.push(match[2]);
  }

  return { hasDefault, defaultName, namedExports };
}

function isDirectory(fullPath: string): boolean {
  try {
    const stats = fs.statSync(fullPath);
    return stats.isDirectory();
  } catch (err) {
    // Path doesn't exist or is inaccessible
    return false;
  }
}

// Function to find the closest tsconfig.json file by traversing up the directory hierarchy
function findClosestTsConfig(startDir: string): string | null {
  let currentDir = startDir;

  while (currentDir !== path.parse(currentDir).root) {
    const tsConfigPath = path.join(currentDir, 'tsconfig.json');
    const packageJsonPath = path.join(currentDir, 'package.json');

    if (fs.existsSync(tsConfigPath)) {
      return tsConfigPath;
    }

    // Stop if there's a package.json but no tsconfig.json
    if (fs.existsSync(packageJsonPath) && !fs.existsSync(tsConfigPath)) {
      console.log(`Found package.json but no tsconfig.json in ${currentDir}. Stopping search.`);
      return null;
    }

    currentDir = path.dirname(currentDir); // Go up one level
  }

  return null; // Return null if no tsconfig.json is found
}

// Helper function to get the include and exclude patterns from tsconfig.json
async function getFilesFromTsConfig(tsConfigPath: string): Promise<string[]> {
  if (!fs.existsSync(tsConfigPath)) {
    throw new Error(`tsconfig.json not found at ${tsConfigPath}`);
  }

  // Read the tsconfig.json file
  const tsconfig = ts.readConfigFile(tsConfigPath, ts.sys.readFile);

  if (tsconfig.error) {
    throw new Error(`Error reading tsconfig.json: ${tsconfig.error.messageText}`);
  }

  const { config } = tsconfig;
  const includePatterns = config.include || [];
  const excludePatterns = config.exclude || [];

  // Use glob to resolve included and excluded files
  const includedFiles = await Promise.all(includePatterns.map(pattern => glob.sync(pattern, { ignore: excludePatterns })));

  // Flatten the results if multiple include patterns exist
  return includedFiles.flat();
}
// Function to recursively scan directories and generate index.ts files in each
export default async function IndexAutogen(dir: string): Promise<void> {
  const tsConfigPath = findClosestTsConfig(dir);
  let allFiles: string[] = [];

  // If tsconfig.json exists, load include/exclude patterns and fetch matching files
  if (fs.existsSync(tsConfigPath)) {
    allFiles = await getFilesFromTsConfig(tsConfigPath);
  } else {
    // Fallback if no tsconfig.json: match all .ts, .tsx, .js, .jsx files
    allFiles = glob.sync('**/*.{ts,tsx,js,jsx}', { cwd: dir });
  }

  // Group files by directory
  const filesByDirectory: Record<string, string[]> = {};
  allFiles.forEach((file) => {
    const dirPath = path.dirname(file);
    if (dirPath !== 'src') {
    if (!filesByDirectory[dirPath]) {
      filesByDirectory[dirPath] = [];
    }
    filesByDirectory[dirPath].push(file);
  }});

  // Generate index.ts for each directory
  Object.entries(filesByDirectory).forEach(([subDir, files]) => {
    let indexContent = '';

    files.forEach((file) => {
      const fullPath = path.join(dir, file);
      const ext = path.extname(file);
      const base = path.basename(file, ext);

      if (base === 'index') {
        return; // Ski}p index files
      }
      const importPath = `./${base}`;
      if (isDirectory(fullPath)) {
        indexContent += `export * from '${importPath}';\n`;
      } else {
        const fileContent = fs.readFileSync(fullPath, 'utf-8');
        const {hasDefault, defaultName, namedExports} = fileHasExports(fileContent);

        if (hasDefault || namedExports.length > 0) {

          if (hasDefault) {
            if (defaultName) {
              // Use the actual name of the default export instead of the filename
              indexContent += `export { default as ${defaultName} } from '${importPath}';\n`;
            } else {
              // Fallback in case the default name cannot be found
              indexContent += `export { default } from '${importPath}';\n`;
            }
          }

          if (namedExports.length) {
            indexContent += `export * from '${importPath}';\n`;
          }
        }
      }
    });


    // If any exports were found, generate the index.ts file in the sub-directory
    if (indexContent) {
      const indexPath = path.join(dir, subDir, 'index.ts');
      fs.writeFileSync(indexPath, indexContent, 'utf-8');
      console.log(`Generated: ${indexPath}`);
    }
  });
}
