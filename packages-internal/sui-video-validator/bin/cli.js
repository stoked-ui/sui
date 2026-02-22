#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import { promises as fs } from 'fs';
import path from 'path';
import { VideoValidator } from '../dist/VideoValidator.js';
import { BatchValidator } from '../dist/BatchValidator.js';
import { Reporter } from '../dist/Reporter.js';

const program = new Command();

program
  .name('video-validator')
  .description('Video rendering validation test harness')
  .version('0.1.0');

// Single validation command
program
  .command('validate')
  .description('Validate a rendered video against reference')
  .requiredOption('-r, --reference <path>', 'Reference video path')
  .requiredOption('-o, --output <path>', 'Output video path')
  .option('-f, --frames <number>', 'Number of frames to compare', '8')
  .option('-t, --threshold <number>', 'Pass threshold (0.0-1.0)', '0.9')
  .option('-d, --diff', 'Generate visual diff images', false)
  .option('--output-dir <path>', 'Output directory for reports', './validation-output')
  .option('--tolerance <number>', 'Pixel difference tolerance (0.0-1.0)', '0.1')
  .option('-v, --verbose', 'Verbose logging', false)
  .option('--json <path>', 'Output JSON report to file')
  .option('--markdown <path>', 'Output Markdown report to file')
  .action(async (options) => {
    const spinner = ora('Initializing validation...').start();

    try {
      const validator = new VideoValidator({
        frameCount: parseInt(options.frames),
        passThreshold: parseFloat(options.threshold),
        pixelMatchOptions: {
          threshold: parseFloat(options.tolerance),
        },
        generateDiffs: options.diff,
        outputDir: options.outputDir,
        verbose: options.verbose,
      });

      spinner.text = 'Validating video...';
      const result = await validator.validate(options.reference, options.output);

      spinner.stop();

      // Print text report
      console.log('\n' + Reporter.generateTextReport(result));

      // Save JSON report if requested
      if (options.json) {
        await Reporter.generateJSON(result, options.json);
        console.log(chalk.blue(`\nJSON report saved to: ${options.json}`));
      }

      // Save Markdown report if requested
      if (options.markdown) {
        const md = Reporter.generateMarkdownReport(result);
        await fs.writeFile(options.markdown, md, 'utf-8');
        console.log(chalk.blue(`Markdown report saved to: ${options.markdown}`));
      }

      // Exit with appropriate code
      process.exit(result.passed ? 0 : 1);
    } catch (error) {
      spinner.fail('Validation failed');
      console.error(chalk.red('\nError:'), error.message);
      process.exit(1);
    }
  });

// Batch validation command
program
  .command('batch')
  .description('Run batch validation from config file')
  .requiredOption('-c, --config <path>', 'Batch configuration JSON file')
  .option('-f, --frames <number>', 'Number of frames to compare', '8')
  .option('-t, --threshold <number>', 'Pass threshold (0.0-1.0)', '0.9')
  .option('-d, --diff', 'Generate visual diff images', false)
  .option('--output-dir <path>', 'Output directory for reports', './validation-output')
  .option('--concurrency <number>', 'Parallel execution limit', '3')
  .option('-v, --verbose', 'Verbose logging', false)
  .option('--json <path>', 'Output JSON report to file')
  .action(async (options) => {
    const spinner = ora('Loading batch configuration...').start();

    try {
      // Load batch config
      const configData = await fs.readFile(options.config, 'utf-8');
      const batchConfig = JSON.parse(configData);

      spinner.text = 'Running batch validation...';

      const validator = new BatchValidator(
        {
          frameCount: parseInt(options.frames),
          passThreshold: parseFloat(options.threshold),
          generateDiffs: options.diff,
          outputDir: options.outputDir,
          verbose: options.verbose,
        },
        parseInt(options.concurrency),
      );

      const result = await validator.validateBatch({
        ...batchConfig,
        config: {
          frameCount: parseInt(options.frames),
          passThreshold: parseFloat(options.threshold),
          generateDiffs: options.diff,
          outputDir: options.outputDir,
          verbose: options.verbose,
        },
      });

      spinner.stop();

      // Print batch report
      console.log('\n' + Reporter.generateBatchTextReport(result));

      // Save JSON report if requested
      if (options.json) {
        await Reporter.generateBatchJSON(result, options.json);
        console.log(chalk.blue(`\nJSON report saved to: ${options.json}`));
      }

      // Exit with appropriate code
      process.exit(result.passRate === 1.0 ? 0 : 1);
    } catch (error) {
      spinner.fail('Batch validation failed');
      console.error(chalk.red('\nError:'), error.message);
      process.exit(1);
    }
  });

// CI summary command
program
  .command('ci-summary')
  .description('Generate CI/CD-friendly summary from validation result')
  .requiredOption('-j, --json <path>', 'JSON validation result file')
  .action(async (options) => {
    try {
      const data = await fs.readFile(options.json, 'utf-8');
      const result = JSON.parse(data);
      const summary = Reporter.generateCISummary(result);
      console.log(summary);
      process.exit(0);
    } catch (error) {
      console.error(chalk.red('Error:'), error.message);
      process.exit(1);
    }
  });

program.parse();
