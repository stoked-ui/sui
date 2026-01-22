#!/usr/bin/env node

/**
 * Rollback Script: Revert Migration Changes
 *
 * This script provides rollback functionality to revert changes made by
 * the migration script.
 *
 * Features:
 * - Restore from backup created during migration
 * - Git integration for version control
 * - Interactive confirmation prompts
 * - Detailed rollback report
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// ============================================================================
// Configuration
// ============================================================================

const DEPRECATED_PACKAGE = '@stoked-ui/media-selector';
const NEW_PACKAGE = '@stoked-ui/media';

// ============================================================================
// Logger
// ============================================================================

class Logger {
  log(message, level = 'info') {
    const timestamp = new Date().toISOString().split('T')[1].split('.')[0];
    const levelStr = level.toUpperCase().padEnd(7);
    const output = `[${timestamp}] ${levelStr} ${message}`;
    console.log(output);
  }

  info(message) { this.log(message, 'info'); }
  warn(message) { this.log(message, 'warn'); }
  error(message) { this.log(message, 'error'); }
  success(message) { this.log(message, 'success'); }
  debug(message) { this.log(message, 'debug'); }
}

// ============================================================================
// Backup Finder
// ============================================================================

class BackupFinder {
  static findLatestBackup(targetPath) {
    try {
      const entries = fs.readdirSync(targetPath, { withFileTypes: true });

      const backups = entries
        .filter((entry) => entry.isDirectory() && entry.name.startsWith('.migration-backup-'))
        .map((entry) => {
          const timestamp = parseInt(entry.name.replace('.migration-backup-', ''));
          return { name: entry.name, timestamp };
        })
        .sort((a, b) => b.timestamp - a.timestamp);

      if (backups.length === 0) {
        return null;
      }

      return backups[0];
    } catch (err) {
      return null;
    }
  }

  static listBackups(targetPath) {
    try {
      const entries = fs.readdirSync(targetPath, { withFileTypes: true });

      const backups = entries
        .filter((entry) => entry.isDirectory() && entry.name.startsWith('.migration-backup-'))
        .map((entry) => {
          const timestamp = parseInt(entry.name.replace('.migration-backup-', ''));
          const date = new Date(timestamp).toLocaleString();
          return { name: entry.name, timestamp, date };
        })
        .sort((a, b) => b.timestamp - a.timestamp);

      return backups;
    } catch (err) {
      return [];
    }
  }
}

// ============================================================================
// Rollback Manager
// ============================================================================

class RollbackManager {
  constructor(targetPath, logger) {
    this.targetPath = targetPath;
    this.logger = logger;
  }

  rollbackFromBackup(backupPath) {
    try {
      this.logger.info(`Restoring from backup: ${backupPath}`);

      const walk = (src, dst) => {
        fs.mkdirSync(dst, { recursive: true });

        fs.readdirSync(src, { withFileTypes: true }).forEach((entry) => {
          const srcPath = path.join(src, entry.name);
          const dstPath = path.join(dst, entry.name);

          if (entry.isDirectory()) {
            walk(srcPath, dstPath);
          } else {
            fs.copyFileSync(srcPath, dstPath);
            this.logger.debug(`Restored: ${dstPath}`);
          }
        });
      };

      walk(backupPath, this.targetPath);
      this.logger.success('Rollback from backup completed');
      return true;
    } catch (err) {
      this.logger.error(`Failed to rollback from backup: ${err.message}`);
      return false;
    }
  }

  rollbackUsingGit() {
    try {
      // Check if git is available
      try {
        execSync('git --version', { stdio: 'pipe' });
      } catch {
        this.logger.error('Git not available');
        return false;
      }

      // Check if we're in a git repository
      try {
        execSync('git rev-parse --git-dir', { stdio: 'pipe' });
      } catch {
        this.logger.error('Not in a git repository');
        return false;
      }

      this.logger.info('Using git to revert changes...');

      // Get the latest migration commit
      let latestMigrationCommit;
      try {
        const log = execSync('git log --oneline --all --grep="migration" 2>/dev/null', {
          encoding: 'utf8',
        });
        const match = log.match(/^([a-f0-9]+)/);
        if (!match) {
          this.logger.warn('No migration commits found in git history');
          return false;
        }
        latestMigrationCommit = match[1];
      } catch (err) {
        this.logger.warn('Could not find migration commits');
        return false;
      }

      // Revert the commit
      try {
        execSync(`git revert ${latestMigrationCommit} --no-edit`, { stdio: 'inherit' });
        this.logger.success('Git revert completed');
        return true;
      } catch (err) {
        this.logger.error(`Git revert failed: ${err.message}`);
        return false;
      }
    } catch (err) {
      this.logger.error(`Git rollback failed: ${err.message}`);
      return false;
    }
  }
}

// ============================================================================
// Interactive Prompts
// ============================================================================

class Interactive {
  static askConfirmation(message) {
    const readline = require('readline');
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    return new Promise((resolve) => {
      rl.question(`${message} (y/n): `, (answer) => {
        rl.close();
        resolve(answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes');
      });
    });
  }

  static showBackupList(backups) {
    console.log('\nAvailable backups:\n');
    backups.forEach((backup, index) => {
      console.log(`${index + 1}. ${backup.date}`);
      console.log(`   Path: ${backup.name}\n`);
    });
  }
}

// ============================================================================
// Rollback Report
// ============================================================================

class RollbackReport {
  constructor() {
    this.success = false;
    this.method = null;
    this.message = null;
    this.startTime = Date.now();
  }

  generate() {
    const duration = ((Date.now() - this.startTime) / 1000).toFixed(2);

    let report = '\n';
    report += '╔════════════════════════════════════════════════════════════════╗\n';
    report += '║          Rollback Report: Media Selector Migration            ║\n';
    report += '╚════════════════════════════════════════════════════════════════╝\n\n';

    report += `⏱️  Duration: ${duration}s\n`;
    report += `Method: ${this.method}\n\n`;

    if (this.success) {
      report += '✅ Rollback SUCCESSFUL\n';
      report += this.message ? `${this.message}\n` : '';
    } else {
      report += '❌ Rollback FAILED\n';
      report += this.message ? `${this.message}\n` : '';
    }

    report += '\nNext steps:\n';
    report += '  1. Verify your files have been restored\n';
    report += '  2. Review any uncommitted changes\n';
    report += '  3. If using git, ensure your working tree is clean\n';
    report += '  4. Reinstall dependencies if needed\n';

    return report;
  }
}

// ============================================================================
// Main Rollback Function
// ============================================================================

async function main() {
  const logger = new Logger();
  const args = process.argv.slice(2);

  let targetPath = process.cwd();
  const pathIndex = args.indexOf('--path');
  if (pathIndex !== -1 && args[pathIndex + 1]) {
    targetPath = path.resolve(args[pathIndex + 1]);
  }

  logger.info(`Rollback utility for ${DEPRECATED_PACKAGE} to ${NEW_PACKAGE} migration`);
  logger.info(`Target path: ${targetPath}`);

  const report = new RollbackReport();

  try {
    // Find available backups
    const backups = BackupFinder.listBackups(targetPath);

    if (backups.length === 0) {
      logger.warn('No migration backups found');
      logger.info('Attempting to use git for rollback...');

      report.method = 'Git';
      const manager = new RollbackManager(targetPath, logger);

      if (await Interactive.askConfirmation('Proceed with git rollback?')) {
        const success = manager.rollbackUsingGit();
        report.success = success;
        report.message = success
          ? 'Successfully reverted changes using git'
          : 'Failed to revert changes using git';
      } else {
        logger.info('Rollback cancelled');
        process.exit(0);
      }
    } else {
      // Show available backups
      Interactive.showBackupList(backups);

      const latestBackup = backups[0];
      const backupPath = path.join(targetPath, latestBackup.name);

      logger.info(`Latest backup: ${latestBackup.date}`);

      if (await Interactive.askConfirmation('Restore from this backup?')) {
        report.method = 'Backup Restore';
        const manager = new RollbackManager(targetPath, logger);

        const success = manager.rollbackFromBackup(backupPath);
        report.success = success;
        report.message = success
          ? `Successfully restored from backup: ${latestBackup.name}`
          : 'Failed to restore from backup';
      } else {
        logger.info('Rollback cancelled');
        process.exit(0);
      }
    }

    const reportText = report.generate();
    console.log(reportText);

    process.exit(report.success ? 0 : 1);
  } catch (err) {
    logger.error(`Fatal error: ${err.message}`);
    process.exit(1);
  }
}

module.exports = {
  RollbackManager,
  BackupFinder,
  RollbackReport,
  Interactive,
};

if (require.main === module) {
  main().catch((err) => {
    console.error('Rollback failed:', err.message);
    process.exit(1);
  });
}
