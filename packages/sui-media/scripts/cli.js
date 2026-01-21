#!/usr/bin/env node

/**
 * CLI Entry Point: @stoked-ui/media Migration Tools
 *
 * This provides a convenient command-line interface for:
 * - migrate: Automated migration from @stoked-ui/media-selector
 * - validate-migration: Validate migration completeness
 * - rollback: Revert migration changes
 *
 * Usage:
 *   npx @stoked-ui/media migrate [options]
 *   npx @stoked-ui/media validate-migration [options]
 *   npx @stoked-ui/media rollback [options]
 */

const path = require('path');
const fs = require('fs');

// ============================================================================
// Help Text
// ============================================================================

const HELP_TEXT = `
╔════════════════════════════════════════════════════════════════╗
║  @stoked-ui/media - Migration Tools CLI                        ║
╚════════════════════════════════════════════════════════════════╝

USAGE:
  npx @stoked-ui/media <command> [options]

COMMANDS:
  migrate               Migrate from @stoked-ui/media-selector
  validate-migration    Validate migration completeness
  rollback              Revert migration changes
  help                  Show this help message
  version               Show version information

MIGRATE OPTIONS:
  --dry-run             Preview changes without modifying files
  --path <path>         Target directory (default: current working directory)
  --verbose             Show detailed logging

VALIDATION OPTIONS:
  --path <path>         Target directory (default: current working directory)

ROLLBACK OPTIONS:
  --path <path>         Target directory (default: current working directory)

EXAMPLES:
  # Preview migration changes
  npx @stoked-ui/media migrate --dry-run

  # Perform migration
  npx @stoked-ui/media migrate

  # Migrate specific project
  npx @stoked-ui/media migrate --path ./packages/my-app

  # Validate migration
  npx @stoked-ui/media validate-migration

  # Rollback changes
  npx @stoked-ui/media rollback

DOCUMENTATION:
  For more information, see: MIGRATION.md
  Or visit: https://github.com/stoked-ui/sui

VERSION:
  Run 'npx @stoked-ui/media version' for version information
`;

// ============================================================================
// Version
// ============================================================================

function showVersion() {
  try {
    const packagePath = path.join(__dirname, '..', 'package.json');
    const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
    console.log(`@stoked-ui/media v${packageJson.version}`);
  } catch (err) {
    console.log('@stoked-ui/media (version unknown)');
  }
}

// ============================================================================
// Main CLI Handler
// ============================================================================

async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log(HELP_TEXT);
    process.exit(0);
  }

  const command = args[0];

  try {
    switch (command) {
      case 'migrate':
        await runMigrate(args.slice(1));
        break;

      case 'validate-migration':
        await runValidateMigration(args.slice(1));
        break;

      case 'validate':
        // Alias for validate-migration
        await runValidateMigration(args.slice(1));
        break;

      case 'rollback':
        await runRollback(args.slice(1));
        break;

      case 'help':
      case '--help':
      case '-h':
        console.log(HELP_TEXT);
        process.exit(0);
        break;

      case 'version':
      case '--version':
      case '-v':
        showVersion();
        process.exit(0);
        break;

      default:
        console.error(`Unknown command: ${command}`);
        console.log(`\nRun 'npx @stoked-ui/media help' for usage information`);
        process.exit(1);
    }
  } catch (err) {
    console.error(`Error: ${err.message}`);
    process.exit(1);
  }
}

// ============================================================================
// Command Implementations
// ============================================================================

async function runMigrate(args) {
  try {
    const { Migrator } = require('./migrate');

    const options = {
      dryRun: args.includes('--dry-run'),
      verbose: args.includes('--verbose'),
      targetPath: process.cwd(),
    };

    const pathIndex = args.indexOf('--path');
    if (pathIndex !== -1 && args[pathIndex + 1]) {
      options.targetPath = path.resolve(args[pathIndex + 1]);
    }

    const migrator = new Migrator(options);
    const report = await migrator.run();

    process.exit(0);
  } catch (err) {
    console.error(`Migration failed: ${err.message}`);
    if (process.argv.includes('--verbose')) {
      console.error(err.stack);
    }
    process.exit(1);
  }
}

async function runValidateMigration(args) {
  try {
    const { Validator } = require('./validate-migration');

    let targetPath = process.cwd();

    const pathIndex = args.indexOf('--path');
    if (pathIndex !== -1 && args[pathIndex + 1]) {
      targetPath = path.resolve(args[pathIndex + 1]);
    }

    const validator = new Validator(targetPath);
    const results = validator.run();

    process.exit(results.isValid() ? 0 : 1);
  } catch (err) {
    console.error(`Validation failed: ${err.message}`);
    process.exit(1);
  }
}

async function runRollback(args) {
  try {
    // The rollback script handles its own execution with interactive prompts
    require('./rollback');
  } catch (err) {
    console.error(`Rollback failed: ${err.message}`);
    process.exit(1);
  }
}

// ============================================================================
// Entry Point
// ============================================================================

if (require.main === module) {
  main().catch((err) => {
    console.error('Fatal error:', err.message);
    process.exit(1);
  });
}

module.exports = { main };
