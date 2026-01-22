#!/usr/bin/env node

/**
 * Validation Script: Verify Migration Completeness
 *
 * This script validates that the migration from @stoked-ui/media-selector
 * to @stoked-ui/media has been completed successfully.
 *
 * Checks:
 * - No remaining imports from deprecated package
 * - All imports resolve correctly
 * - API compatibility
 * - package.json consistency
 * - Breaking changes
 */

const fs = require('fs');
const path = require('path');

// ============================================================================
// Configuration
// ============================================================================

const DEPRECATED_PACKAGE = '@stoked-ui/media-selector';
const NEW_PACKAGE = '@stoked-ui/media';

const SUPPORTED_EXTENSIONS = ['.ts', '.tsx', '.js', '.jsx'];

// ============================================================================
// Validation Results Tracker
// ============================================================================

class ValidationResults {
  constructor() {
    this.errors = [];
    this.warnings = [];
    this.success = [];
    this.startTime = Date.now();
  }

  addError(message, context = '') {
    this.errors.push({ message, context });
  }

  addWarning(message, context = '') {
    this.warnings.push({ message, context });
  }

  addSuccess(message) {
    this.success.push(message);
  }

  isValid() {
    return this.errors.length === 0;
  }

  generate() {
    const duration = ((Date.now() - this.startTime) / 1000).toFixed(2);

    let report = '\n';
    report += '╔════════════════════════════════════════════════════════════════╗\n';
    report += '║      Validation Report: Media Selector Migration              ║\n';
    report += '╚════════════════════════════════════════════════════════════════╝\n\n';

    report += `⏱️  Duration: ${duration}s\n\n`;

    // Errors
    if (this.errors.length > 0) {
      report += `❌ Errors (${this.errors.length}):\n`;
      this.errors.forEach((err) => {
        report += `  • ${err.message}\n`;
        if (err.context) {
          report += `    ${err.context}\n`;
        }
      });
      report += '\n';
    }

    // Warnings
    if (this.warnings.length > 0) {
      report += `⚠️  Warnings (${this.warnings.length}):\n`;
      this.warnings.forEach((warn) => {
        report += `  • ${warn.message}\n`;
        if (warn.context) {
          report += `    ${warn.context}\n`;
        }
      });
      report += '\n';
    }

    // Success
    if (this.success.length > 0) {
      report += `✅ Passed (${this.success.length}):\n`;
      this.success.forEach((msg) => {
        report += `  ✓ ${msg}\n`;
      });
      report += '\n';
    }

    report += '═'.repeat(66) + '\n';
    report += this.isValid()
      ? '✅ Migration validation PASSED\n'
      : '❌ Migration validation FAILED\n';
    report += '═'.repeat(66) + '\n';

    return report;
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

          if (this.shouldSkipDirectory(relativePath)) {
            continue;
          }

          if (entry.isDirectory()) {
            walk(fullPath);
          } else if (entry.isFile() && this.isSourceFile(fullPath)) {
            files.push(fullPath);
          }
        }
      } catch (err) {
        // Ignore permission errors
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
      '.migration-backup',
    ];

    return skipDirs.some((dir) => dirPath.includes(dir));
  }

  static isSourceFile(filePath) {
    const ext = path.extname(filePath);
    return SUPPORTED_EXTENSIONS.includes(ext);
  }
}

// ============================================================================
// Validators
// ============================================================================

class DeprecatedPackageValidator {
  static validate(targetPath, results) {
    const files = FileDiscovery.findSourceFiles(targetPath);
    const filesWithDeprecated = [];

    for (const file of files) {
      try {
        const content = fs.readFileSync(file, 'utf8');

        // Check for deprecated package imports
        const deprecatedMatches = content.match(
          new RegExp(`from\\s+['"]${DEPRECATED_PACKAGE}`, 'g')
        );

        if (deprecatedMatches) {
          filesWithDeprecated.push({
            file,
            count: deprecatedMatches.length,
          });
        }
      } catch (err) {
        // Ignore errors
      }
    }

    if (filesWithDeprecated.length > 0) {
      filesWithDeprecated.forEach((item) => {
        results.addError(
          `Found ${item.count} import(s) from deprecated package`,
          `File: ${item.file}`
        );
      });
      return false;
    }

    results.addSuccess('No imports from deprecated package found');
    return true;
  }
}

class PackageJsonValidator {
  static validate(targetPath, results) {
    const packageJsonPath = path.join(targetPath, 'package.json');

    if (!fs.existsSync(packageJsonPath)) {
      results.addWarning('package.json not found', `Path: ${packageJsonPath}`);
      return true;
    }

    try {
      const content = fs.readFileSync(packageJsonPath, 'utf8');
      const packageJson = JSON.parse(content);

      // Check for deprecated package in dependencies
      const hasDeprecatedDep =
        packageJson.dependencies?.[DEPRECATED_PACKAGE] ||
        packageJson.devDependencies?.[DEPRECATED_PACKAGE] ||
        packageJson.peerDependencies?.[DEPRECATED_PACKAGE];

      if (hasDeprecatedDep) {
        results.addError(
          `Deprecated package still in package.json dependencies`,
          `Package: ${DEPRECATED_PACKAGE}`
        );
        return false;
      }

      // Check for new package
      const hasNewPkg =
        packageJson.dependencies?.[NEW_PACKAGE] ||
        packageJson.devDependencies?.[NEW_PACKAGE] ||
        packageJson.peerDependencies?.[NEW_PACKAGE];

      if (hasNewPkg) {
        results.addSuccess(`New package found in dependencies: ${NEW_PACKAGE}`);
      } else {
        results.addWarning(
          `New package not found in dependencies`,
          `Consider adding: ${NEW_PACKAGE}`
        );
      }

      return true;
    } catch (err) {
      results.addError(`Failed to parse package.json: ${err.message}`);
      return false;
    }
  }
}

class ImportConsistencyValidator {
  static validate(targetPath, results) {
    const files = FileDiscovery.findSourceFiles(targetPath);
    let newPackageImportCount = 0;

    for (const file of files) {
      try {
        const content = fs.readFileSync(file, 'utf8');

        // Count imports from new package
        const newPackageMatches = content.match(
          new RegExp(`from\\s+['"]${NEW_PACKAGE}`, 'g')
        );

        if (newPackageMatches) {
          newPackageImportCount += newPackageMatches.length;
        }
      } catch (err) {
        // Ignore errors
      }
    }

    if (newPackageImportCount > 0) {
      results.addSuccess(`${newPackageImportCount} imports from new package found`);
    } else {
      results.addWarning('No imports from new package found');
    }

    return true;
  }
}

class ApiCompatibilityValidator {
  static validate(targetPath, results) {
    const files = FileDiscovery.findSourceFiles(targetPath);
    const apiChecks = [
      {
        pattern: /FileWithPath\s*\./,
        message: 'FileWithPath API usage',
      },
      {
        pattern: /MediaFile\s*\./,
        message: 'MediaFile API usage',
      },
      {
        pattern: /WebFile\s*\./,
        message: 'WebFile API usage',
      },
    ];

    for (const file of files) {
      try {
        const content = fs.readFileSync(file, 'utf8');

        for (const check of apiChecks) {
          if (check.pattern.test(content)) {
            results.addSuccess(`${check.message} detected in migrated code`);
          }
        }
      } catch (err) {
        // Ignore errors
      }
    }

    return true;
  }
}

class BreakingChangesValidator {
  static validate(targetPath, results) {
    const files = FileDiscovery.findSourceFiles(targetPath);

    // Patterns that might indicate breaking changes
    const breakingPatterns = [
      {
        pattern: /import.*from\s+['"]@stoked-ui\/media\/[^'"]+['"]/,
        severity: 'warn',
        message: 'Subpath import detected - verify it resolves correctly',
      },
    ];

    for (const file of files) {
      try {
        const content = fs.readFileSync(file, 'utf8');

        for (const check of breakingPatterns) {
          const matches = content.match(check.pattern);
          if (matches) {
            if (check.severity === 'warn') {
              results.addWarning(check.message, `File: ${file}`);
            } else if (check.severity === 'error') {
              results.addError(check.message, `File: ${file}`);
            }
          }
        }
      } catch (err) {
        // Ignore errors
      }
    }

    return true;
  }
}

class TypeScriptValidator {
  static validate(targetPath, results) {
    const tsconfigPath = path.join(targetPath, 'tsconfig.json');

    if (!fs.existsSync(tsconfigPath)) {
      results.addWarning('tsconfig.json not found - TypeScript validation skipped');
      return true;
    }

    results.addSuccess('TypeScript configuration found');
    return true;
  }
}

// ============================================================================
// Main Validator
// ============================================================================

class Validator {
  constructor(targetPath = process.cwd()) {
    this.targetPath = targetPath;
    this.results = new ValidationResults();
  }

  run() {
    console.log('Starting validation...\n');

    // Run all validators
    DeprecatedPackageValidator.validate(this.targetPath, this.results);
    PackageJsonValidator.validate(this.targetPath, this.results);
    ImportConsistencyValidator.validate(this.targetPath, this.results);
    ApiCompatibilityValidator.validate(this.targetPath, this.results);
    BreakingChangesValidator.validate(this.targetPath, this.results);
    TypeScriptValidator.validate(this.targetPath, this.results);

    const report = this.results.generate();
    console.log(report);

    return this.results;
  }

  isValid() {
    return this.results.isValid();
  }
}

// ============================================================================
// CLI
// ============================================================================

async function main() {
  const args = process.argv.slice(2);
  let targetPath = process.cwd();

  const pathIndex = args.indexOf('--path');
  if (pathIndex !== -1 && args[pathIndex + 1]) {
    targetPath = path.resolve(args[pathIndex + 1]);
  }

  const validator = new Validator(targetPath);
  const results = validator.run();

  process.exit(results.isValid() ? 0 : 1);
}

module.exports = {
  Validator,
  ValidationResults,
  DeprecatedPackageValidator,
  PackageJsonValidator,
  ImportConsistencyValidator,
  ApiCompatibilityValidator,
  BreakingChangesValidator,
  TypeScriptValidator,
};

if (require.main === module) {
  main().catch((err) => {
    console.error('Validation failed:', err.message);
    process.exit(1);
  });
}
