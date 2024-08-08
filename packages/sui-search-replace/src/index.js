#!/usr/bin/env node
const fs = require('fs').promises;
const path = require('path');

const [,, rootDir, searchString, replacementString] = process.argv;

async function replaceInFile(filePath) {
  const content = await fs.readFile(filePath, 'utf8');
  const replacedContent = content.replace(new RegExp(searchString, 'g'), replacementString);
  await fs.writeFile(filePath, replacedContent, 'utf8');
}

async function moveContents(sourceDir, targetDir) {
  const entries = await fs.readdir(sourceDir, { withFileTypes: true });
  for (const entry of entries) {
    const sourcePath = path.join(sourceDir, entry.name);
    const targetPath = path.join(targetDir, entry.name);
    if (entry.isDirectory()) {
      await fs.mkdir(targetPath, { recursive: true }).catch(() => {});
      await moveContents(sourcePath, targetPath);
      await fs.rm(sourcePath, { recursive: true });
    } else {
      await fs.rename(sourcePath, targetPath);
    }
  }
}

async function ensureDirectoryExistence(filePath) {
  const dirname = path.dirname(filePath);
  try {
    await fs.access(dirname);
  } catch (e) {
    await fs.mkdir(dirname, { recursive: true });
  }
}

async function replaceInPath(originalPath, isFile) {
  const newPath = originalPath.split(path.sep).map(part => part.replace(new RegExp(searchString, 'g'), replacementString)).join(path.sep);
  if (newPath !== originalPath) {
    try {
      if (!isFile) {
        await ensureDirectoryExistence(newPath);
        await fs.access(newPath);
        // If newPath exists, merge contents
        await moveContents(originalPath, newPath);
        await fs.rm(originalPath, {recursive: true});
      } else {
        await ensureDirectoryExistence(newPath);
        await fs.rename(originalPath, newPath);
      }
    } catch (error) {
      console.error(`Failed to rename ${originalPath} to ${newPath}:`, error);
    }
    return newPath;
  }
  return originalPath;
}

const skipDirs = ['node_modules', '.next', 'export', '.nx', '.idea', '.git', '.vscode', 'dist', 'build', 'coverage', 'public', 'tmp', 'temp'];
async function traverseAndReplace(currentPath) {
  try {
    if (skipDirs.map(dir => currentPath.endsWith(dir)).filter(Boolean).length > 0) {
      return;
    }
    const stats = await fs.stat(currentPath);
    if (stats.isDirectory()) {
      const contents = await fs.readdir(currentPath);
      for (const content of contents) {
        const fullPath = path.join(currentPath, content);
        await traverseAndReplace(fullPath);
      }
      // Rename directory after processing its contents to avoid path issues
      await replaceInPath(currentPath);
    } else if (stats.isFile()) {
      await replaceInFile(currentPath);
      await replaceInPath(currentPath, true);
    }
  } catch (ex) {
    console.error(`Error processing ${currentPath}:`, ex);
  }
}

if (!rootDir || !searchString || !replacementString) {
  console.log('Usage: node script.js <rootDir> <searchString> <replacementString>');
  process.exit(1);
}

traverseAndReplace(rootDir).catch(console.error);
