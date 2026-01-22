#!/usr/bin/env node

/**
 * Migration Tool: @stoked-ui/media-selector to @stoked-ui/media
 *
 * This tool helps developers automatically migrate from the deprecated
 * @stoked-ui/media-selector package to the new @stoked-ui/media package.
 *
 * Features:
 * - Updates import statements
 * - Handles named, default, and type imports
 * - Preserves import aliases
 * - Updates package.json dependencies
 * - Dry-run mode for preview
 * - Rollback capability
 * - Comprehensive migration report
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// ============================================================================
// Configuration and Constants
// ============================================================================

const DEPRECATED_PACKAGE = '@stoked-ui/media-selector';
const NEW_PACKAGE = '@stoked-ui/media';

const IMPORT_PATTERNS = [
  // Named imports: import { X, Y } from '@stoked-ui/media-selector'
  {
    regex: /import\s*\{\s*([^}]+)\s*\}\s*from\s*['"]@stoked-ui\/media-selector['"]/g,
    type: 'named',
  },
  // Default imports: import X from '@stoked-ui/media-selector'
  {
    regex: /import\s+(\w+)\s+from\s*['"]@stoked-ui\/media-selector['"]/g,
    type: 'default',
  },
  // Type imports: import type { X, Y } from '@stoked-ui/media-selector'
  {
    regex: /import\s+type\s*\{\s*([^}]+)\s*\}\s*from\s*['"]@stoked-ui\/media-selector['"]/g,
    type: 'type',
  },
  // Subpath imports: import X from '@stoked-ui/media-selector/something'
  {
    regex: /from\s*['"]@stoked-ui\/media-selector\/([^'"]+)['"]/g,
    type: 'subpath',
  },
];

const SUPPORTED_EXTENSIONS = ['.ts', '.tsx', '.js', '.jsx'];

// ============================================================================
// Logger Utility
// ============================================================================

class Logger {
  constructor(verbose = false) {
    this.verbose = verbose;
    this.logs = [];
  }

  log(message, level = 'info') {
    const timestamp = new Date().toISOString().split('T')[1].split('.')[0];
    const levelStr = level.toUpperCase().padEnd(7);
    const output = `[${timestamp}] ${levelStr} ${message}`;
    this.logs.push(output);

    if (this.verbose || level !== 'debug') {
      console.log(output);
    }
  }

  info(message) { this.log(message, 'info'); }
  warn(message) { this.log(message, 'warn'); }
  error(message) { this.log(message, 'error'); }
  debug(message) { this.log(message, 'debug'); }
  success(message) { this.log(message, 'success'); }

  getLogs() {
    return this.logs;
  }
}

// ============================================================================
// File Discovery
// ============================================================================

class FileDiscovery {
  static findSourceFiles(targetPath) {
    const files = [];

    const walk = (dir) => {
      try {
        const entries = fs.readdirSync(dir, { withFileTypes: true });

        for (const entry of entries) {
          const fullPath = path.join(dir, entry.name);
          const relativePath = path.relative(targetPath, fullPath);

          // Skip common directories
          if (this.shouldSkipDirectory(relativePath)) {
            continue;
          }

          if (entry.isDirectory()) {
            walk(fullPath);
          } else if (entry.isFile()) {
            if (this.isSourceFile(fullPath)) {
              files.push(fullPath);
            }
          }
        }
      } catch (err) {
        // Permission denied or other errors
      }
    };

    walk(targetPath);
    return files;
  }

  static shouldSkipDirectory(dirPath) {
    const skipDirs = [
      'node_modules',
      '.git',
      'dist',
      'build',
      'coverage',
      '.turbo',
      '.next',
      'out',
      '.vscode',
      '.idea',
    ];

    return skipDirs.some((dir) => dirPath.includes(dir));
  }

  static isSourceFile(filePath) {
    const ext = path.extname(filePath);
    return SUPPORTED_EXTENSIONS.includes(ext);
  }
}

// ============================================================================
// Import Analysis and Transformation
// ============================================================================

class ImportTransformer {
  static analyzeFile(content) {
    const imports = [];
    const hasDeprecatedImport = content.includes(DEPRECATED_PACKAGE);

    if (!hasDeprecatedImport) {
      return { imports, hasDeprecatedImport: false };
    }

    for (const pattern of IMPORT_PATTERNS) {
      let match;
      while ((match = pattern.regex.exec(content)) !== null) {
        imports.push({
          type: pattern.type,
          original: match[0],
          items: match[1],
          startIndex: match.index,
        });
      }
      // Reset regex state
      pattern.regex.lastIndex = 0;
    }

    return { imports, hasDeprecatedImport: true };
  }

  static transformImports(content) {
    let transformed = content;

    // Replace deprecated package references
    transformed = transformed.replace(
      /@stoked-ui\/media-selector/g,
      NEW_PACKAGE
    );

    // Handle subpath imports - convert to main package exports
    // This addresses the pattern: import X from '@stoked-ui/media-selector/FileWithPath'
    // Should become: import { FileWithPath } from '@stoked-ui/media'
    transformed = this.handleSubpathImports(transformed);

    return {
      transformed,
      changed: transformed !== content,
    };
  }

  static handleSubpathImports(content) {
    // Patterns for common subpath imports from media-selector
    const subpathMappings = {
      "require('@stoked-ui/media-selector/FileWithPath')": "require('@stoked-ui/media')",
      "from '@stoked-ui/media-selector/FileWithPath'": "from '@stoked-ui/media'",
      "import FileWithPath from '@stoked-ui/media-selector/FileWithPath'":
        "import { FileWithPath } from '@stoked-ui/media'",
    };

    let result = content;
    for (const [oldPattern, newPattern] of Object.entries(subpathMappings)) {
      result = result.replace(new RegExp(oldPattern, 'g'), newPattern);
    }

    return result;
  }
}

// ============================================================================
// Package.json Manager
// ============================================================================

class PackageJsonManager {
  static updateDependencies(packageJsonPath, logger) {
    if (!fs.existsSync(packageJsonPath)) {
      logger.warn(`package.json not found at ${packageJsonPath}`);
      return { changed: false, updates: [] };
    }

    let content = fs.readFileSync(packageJsonPath, 'utf8');
    const original = content;
    let packageJson;

    try {
      packageJson = JSON.parse(content);
    } catch (err) {
      logger.error(`Failed to parse package.json: ${err.message}`);
      return { changed: false, updates: [] };
    }

    const updates = [];

    // Update dependencies
    if (packageJson.dependencies?.[DEPRECATED_PACKAGE]) {
      const version = packageJson.dependencies[DEPRECATED_PACKAGE];
      delete packageJson.dependencies[DEPRECATED_PACKAGE];
      packageJson.dependencies[NEW_PACKAGE] = version;
      updates.push(`Updated dependencies: ${DEPRECATED_PACKAGE} -> ${NEW_PACKAGE}`);
    }

    // Update devDependencies
    if (packageJson.devDependencies?.[DEPRECATED_PACKAGE]) {
      const version = packageJson.devDependencies[DEPRECATED_PACKAGE];
      delete packageJson.devDependencies[DEPRECATED_PACKAGE];
      packageJson.devDependencies[NEW_PACKAGE] = version;
      updates.push(`Updated devDependencies: ${DEPRECATED_PACKAGE} -> ${NEW_PACKAGE}`);
    }

    // Update peerDependencies
    if (packageJson.peerDependencies?.[DEPRECATED_PACKAGE]) {
      const version = packageJson.peerDependencies[DEPRECATED_PACKAGE];
      delete packageJson.peerDependencies[DEPRECATED_PACKAGE];
      packageJson.peerDependencies[NEW_PACKAGE] = version;
      updates.push(`Updated peerDependencies: ${DEPRECATED_PACKAGE} -> ${NEW_PACKAGE}`);
    }

    content = JSON.stringify(packageJson, null, 2) + '\n';

    return {
      changed: content !== original,
      updates,
      newContent: content,
      oldContent: original,
    };
  }
}

// ============================================================================
// Migration Report Generator
// ============================================================================

class MigrationReport {
  constructor() {
    this.filesModified = 0;
    this.importsUpdated = 0;
    this.packageJsonUpdated = false;
    this.filesAnalyzed = 0;
    this.filesSkipped = 0;
    this.errors = [];
    this.details = [];
    this.startTime = Date.now();
  }

  addFileProcessed(filePath, importCount, changed) {
    this.filesAnalyzed++;
    if (changed) {
      this.filesModified++;
      this.importsUpdated += importCount;
      this.details.push({
        file: filePath,
        imports: importCount,
        status: 'MIGRATED',
      });
    } else {
      this.filesSkipped++;
    }
  }

  addError(message) {
    this.errors.push(message);
  }

  markPackageJsonUpdated() {
    this.packageJsonUpdated = true;
  }

  generate() {
    const duration = ((Date.now() - this.startTime) / 1000).toFixed(2);

    let report = '\n';
    report += '╔════════════════════════════════════════════════════════════════╗\n';
    report += '║         Migration Report: media-selector to media              ║\n';
    report += '╚════════════════════════════════════════════════════════════════╝\n\n';

    report += `⏱️  Duration: ${duration}s\n\n`;

    report += '📊 Summary:\n';
    report += `  • Files analyzed: ${this.filesAnalyzed}\n`;
    report += `  • Files modified: ${this.filesModified}\n`;
    report += `  • Imports updated: ${this.importsUpdated}\n`;
    report += `  • package.json updated: ${this.packageJsonUpdated ? 'Yes' : 'No'}\n\n`;

    if (this.details.length > 0) {
      report += '📝 Modified Files:\n';
      this.details.forEach((detail) => {
        report += `  ✓ ${detail.file} (${detail.imports} imports)\n`;
      });
      report += '\n';
    }

    if (this.errors.length > 0) {
      report += '⚠️  Errors:\n';
      this.errors.forEach((error) => {
        report += `  ✗ ${error}\n`;
      });
      report += '\n';
    }

    report += '✅ Migration complete!\n';
    report += 'Next steps:\n';
    report += '  1. Review the changes made\n';
    report += '  2. Run your tests to ensure everything works\n';
    report += `  3. Remove ${DEPRECATED_PACKAGE} from dependencies if no longer used\n`;
    report += '  4. Commit your changes\n';

    return report;
  }
}

// ============================================================================
// Backup and Rollback Manager
// ============================================================================

class BackupManager {
  constructor(targetPath, logger) {
    this.targetPath = targetPath;
    this.logger = logger;
    this.backupDir = path.join(targetPath, '.migration-backup-' + Date.now());
  }

  createBackup(files) {
    try {
      fs.mkdirSync(this.backupDir, { recursive: true });

      for (const file of files) {
        const relativePath = path.relative(this.targetPath, file);
        const backupPath = path.join(this.backupDir, relativePath);
        const backupPathDir = path.dirname(backupPath);

        fs.mkdirSync(backupPathDir, { recursive: true });
        fs.copyFileSync(file, backupPath);
      }

      // Also backup package.json
      const packageJsonPath = path.join(this.targetPath, 'package.json');
      if (fs.existsSync(packageJsonPath)) {
        fs.copyFileSync(packageJsonPath, path.join(this.backupDir, 'package.json'));
      }

      this.logger.success(`Backup created: ${this.backupDir}`);
      return this.backupDir;
    } catch (err) {
      this.logger.error(`Failed to create backup: ${err.message}`);
      throw err;
    }
  }

  rollback() {
    try {
      if (!fs.existsSync(this.backupDir)) {
        this.logger.error(`Backup directory not found: ${this.backupDir}`);
        return false;
      }

      // Restore files from backup
      const entries = fs.readdirSync(this.backupDir);
      for (const entry of entries) {
        const backupPath = path.join(this.backupDir, entry);
        const targetPath = path.join(this.targetPath, entry);

        if (fs.lstatSync(backupPath).isDirectory()) {
          const walk = (src, dst) => {
            fs.mkdirSync(dst, { recursive: true });
            fs.readdirSync(src).forEach((file) => {
              const srcFile = path.join(src, file);
              const dstFile = path.join(dst, file);
              if (fs.lstatSync(srcFile).isDirectory()) {
                walk(srcFile, dstFile);
              } else {
                fs.copyFileSync(srcFile, dstFile);
              }
            });
          };
          walk(backupPath, targetPath);
        } else {
          fs.copyFileSync(backupPath, targetPath);
        }
      }

      this.logger.success('Rollback completed successfully');
      return true;
    } catch (err) {
      this.logger.error(`Failed to rollback: ${err.message}`);
      return false;
    }
  }
}

// ============================================================================
// Validation and Breaking Change Detection
// ============================================================================

class ValidationChecker {
  static checkForBreakingChanges(content, filePath, logger) {
    const issues = [];

    // Check for deprecated API patterns that might not exist in new package
    const deprecatedPatterns = [
      {
        pattern: /FileWithPath\.from\s*\(/,
        message: 'FileWithPath.from() API usage detected',
        severity: 'info',
      },
    ];

    for (const check of deprecatedPatterns) {
      if (check.pattern.test(content)) {
        issues.push({
          file: filePath,
          message: check.message,
          severity: check.severity,
        });
      }
    }

    return issues;
  }

  static validate(files, logger) {
    const issues = [];

    for (const file of files) {
      try {
        const content = fs.readFileSync(file, 'utf8');
        const fileIssues = this.checkForBreakingChanges(content, file, logger);
        issues.push(...fileIssues);
      } catch (err) {
        logger.warn(`Could not validate ${file}: ${err.message}`);
      }
    }

    return issues;
  }
}

// ============================================================================
// Main Migration Engine
// ============================================================================

class Migrator {
  constructor(options = {}) {
    this.targetPath = options.targetPath || process.cwd();
    this.dryRun = options.dryRun || false;
    this.verbose = options.verbose || false;
    this.logger = new Logger(this.verbose);
    this.report = new MigrationReport();
  }

  async run() {
    try {
      this.logger.info(`Starting migration from ${DEPRECATED_PACKAGE} to ${NEW_PACKAGE}`);
      this.logger.info(`Target path: ${this.targetPath}`);
      this.logger.info(`Dry run mode: ${this.dryRun ? 'Yes' : 'No'}`);

      // Step 1: Find files
      this.logger.info('Scanning for source files...');
      const files = FileDiscovery.findSourceFiles(this.targetPath);
      this.logger.success(`Found ${files.length} source files`);

      if (files.length === 0) {
        this.logger.warn('No source files found. Migration cancelled.');
        return this.report;
      }

      // Step 2: Create backup if not dry-run
      let backupManager;
      if (!this.dryRun) {
        this.logger.info('Creating backup...');
        backupManager = new BackupManager(this.targetPath, this.logger);
        backupManager.createBackup(files);
      }

      // Step 3: Process files
      this.logger.info('Processing files...');
      const changes = [];

      for (const file of files) {
        try {
          const content = fs.readFileSync(file, 'utf8');
          const analysis = ImportTransformer.analyzeFile(content);

          if (analysis.hasDeprecatedImport) {
            const result = ImportTransformer.transformImports(content);

            if (result.changed) {
              changes.push({
                file,
                original: content,
                transformed: result.transformed,
              });

              this.report.addFileProcessed(file, analysis.imports.length, true);

              if (!this.dryRun) {
                fs.writeFileSync(file, result.transformed, 'utf8');
                this.logger.debug(`Updated: ${file}`);
              }
            } else {
              this.report.addFileProcessed(file, 0, false);
            }
          } else {
            this.report.addFileProcessed(file, 0, false);
          }
        } catch (err) {
          const message = `Error processing ${file}: ${err.message}`;
          this.report.addError(message);
          this.logger.error(message);
        }
      }

      // Step 4: Update package.json
      this.logger.info('Processing package.json...');
      const packageJsonPath = path.join(this.targetPath, 'package.json');
      const pkgResult = PackageJsonManager.updateDependencies(packageJsonPath, this.logger);

      if (pkgResult.changed) {
        if (!this.dryRun) {
          fs.writeFileSync(packageJsonPath, pkgResult.newContent, 'utf8');
          this.logger.success('Updated package.json');
          this.report.markPackageJsonUpdated();
        }
      }

      // Step 5: Validate
      this.logger.info('Validating migration...');
      const validationIssues = ValidationChecker.validate(files, this.logger);

      if (validationIssues.length > 0) {
        this.logger.warn(`Found ${validationIssues.length} validation issues`);
        validationIssues.forEach((issue) => {
          this.logger.warn(`  - ${issue.file}: ${issue.message}`);
        });
      }

      // Generate report
      const reportText = this.report.generate();
      console.log(reportText);

      // Show diff if dry-run
      if (this.dryRun && changes.length > 0) {
        this.showDiff(changes);
      }

      return this.report;
    } catch (err) {
      this.logger.error(`Migration failed: ${err.message}`);
      throw err;
    }
  }

  showDiff(changes) {
    console.log('\n📋 Preview of Changes (Dry-Run Mode):\n');

    changes.forEach((change) => {
      console.log(`File: ${change.file}`);
      console.log('─'.repeat(70));

      const originalLines = change.original.split('\n');
      const transformedLines = change.transformed.split('\n');

      // Simple diff display
      const diffLines = [];
      for (let i = 0; i < Math.max(originalLines.length, transformedLines.length); i++) {
        const orig = originalLines[i] || '';
        const trans = transformedLines[i] || '';

        if (orig !== trans) {
          if (orig.includes(DEPRECATED_PACKAGE)) {
            diffLines.push(`- ${orig}`);
          }
          if (trans.includes(NEW_PACKAGE)) {
            diffLines.push(`+ ${trans}`);
          }
        }
      }

      diffLines.forEach((line) => {
        if (line.startsWith('-')) {
          console.log(`\x1b[31m${line}\x1b[0m`); // Red for removed
        } else if (line.startsWith('+')) {
          console.log(`\x1b[32m${line}\x1b[0m`); // Green for added
        }
      });

      console.log('');
    });
  }
}

// ============================================================================
// CLI Interface
// ============================================================================

async function main() {
  const args = process.argv.slice(2);
  const options = {
    dryRun: args.includes('--dry-run'),
    verbose: args.includes('--verbose'),
    targetPath: process.cwd(),
  };

  // Parse --path argument
  const pathIndex = args.indexOf('--path');
  if (pathIndex !== -1 && args[pathIndex + 1]) {
    options.targetPath = path.resolve(args[pathIndex + 1]);
  }

  const migrator = new Migrator(options);

  try {
    await migrator.run();
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err.message);
    process.exit(1);
  }
}

// ============================================================================
// Module Exports (for programmatic usage)
// ============================================================================

module.exports = {
  Migrator,
  FileDiscovery,
  ImportTransformer,
  PackageJsonManager,
  ValidationChecker,
  BackupManager,
  MigrationReport,
  Logger,
};

// Run if executed directly
if (require.main === module) {
  main().catch((err) => {
    console.error('Fatal error:', err);
    process.exit(1);
  });
}
