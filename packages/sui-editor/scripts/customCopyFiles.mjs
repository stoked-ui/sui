/* eslint-disable no-console */
import path from 'path';
import fse from 'fs-extra';
import glob from 'fast-glob';

const packagePath = process.cwd();
const buildPath = path.join(packagePath, './build');

/**
 * Copies a file into the build directory. By default it copies it under the same
 * base name in the root, but you can provide a second argument to specify a
 * different subpath.
 * @param {string} file source file path
 * @param {string=} target target file path
 * @returns {Promise<void>}
 */
async function includeFileInBuild(file, target = path.basename(file)) {
  const sourcePath = path.resolve(packagePath, file);
  const targetPath = path.resolve(buildPath, target);
  await fse.copy(sourcePath, targetPath);
  console.log(`Copied ${sourcePath} to ${targetPath}`);
}

/**
 * Puts a package.json into every immediate child directory of rootDir.
 * That package.json contains information about esm for bundlers so that imports
 * like import Typography from '@mui/material/Typography' are tree-shakeable.
 *
 * This is a custom version that doesn't check for type declarations.
 * @param {object} param0
 * @param {string} param0.from
 * @param {string} param0.to
 */
async function createModulePackages({ from, to }) {
  const directoryPackages = glob.sync('*/index.{js,ts,tsx}', { cwd: from }).map(path.dirname);

  await Promise.all(
    directoryPackages.map(async (directoryPackage) => {
      const packageJsonPath = path.join(to, directoryPackage, 'package.json');
      const topLevelPathImportsAreCommonJSModules = await fse.pathExists(
        path.resolve(path.dirname(packageJsonPath), '../esm'),
      );

      const packageJson = {
        sideEffects: false,
        module: topLevelPathImportsAreCommonJSModules
          ? path.posix.join('../esm', directoryPackage, 'index.js')
          : './index.js',
        main: topLevelPathImportsAreCommonJSModules
          ? './index.js'
          : path.posix.join('../node', directoryPackage, 'index.js'),
        // No types entry to avoid errors
      };

      await fse.writeFile(packageJsonPath, JSON.stringify(packageJson, null, 2));

      return packageJsonPath;
    }),
  );
}

/**
 * Creates a package.json for the root directory to support imports like:
 * import Button from '@stoked-ui/editor';
 */
async function createMainPackageJson() {
  const packageJsonPath = path.resolve(buildPath, 'package.json');

  const packageJson = await fse.readFile(path.resolve(packagePath, 'package.json'), 'utf8');
  const { scripts, devDependencies, workspaces, files, ...packageDataOther } = JSON.parse(
    packageJson,
  );

  const newPackageData = {
    ...packageDataOther,
    main: './index.js',
    module: './modern/index.js',
    // Remove types to avoid errors
    // types: './index.d.ts',
    private: false,
  };

  await fse.writeFile(packageJsonPath, JSON.stringify(newPackageData, null, 2));
  console.log(`Created package.json in ${packageJsonPath}`);
}

/**
 * Main function to run the copy files process
 */
async function run() {
  console.log(`buildPath ${buildPath}`);

  // First create the main package.json
  await createMainPackageJson();

  // Then copy README and license files
  await Promise.all(
    [
      './README.md',
      '../../LICENSE',
      '../../CHANGELOG.md',
    ].map((file) => includeFileInBuild(file)),
  );

  // Create packages for the subfolders
  await createModulePackages({
    from: buildPath,
    to: buildPath,
  });
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
}); 
