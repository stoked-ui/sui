import { promises as fs } from 'fs';
import path from 'path';
import {
  ValidationResult,
  BatchValidationResult,
  FrameComparisonResult,
} from './types';

/**
 * Validation result reporter with multiple output formats
 */
export class Reporter {
  /**
   * Generate JSON report for single validation
   */
  static async generateJSON(
    result: ValidationResult,
    outputPath: string,
  ): Promise<void> {
    const json = JSON.stringify(result, null, 2);
    await fs.writeFile(outputPath, json, 'utf-8');
  }

  /**
   * Generate JSON report for batch validation
   */
  static async generateBatchJSON(
    result: BatchValidationResult,
    outputPath: string,
  ): Promise<void> {
    const json = JSON.stringify(result, null, 2);
    await fs.writeFile(outputPath, json, 'utf-8');
  }

  /**
   * Generate human-readable text report
   */
  static generateTextReport(result: ValidationResult): string {
    const lines: string[] = [];

    lines.push('═'.repeat(80));
    lines.push('VIDEO VALIDATION REPORT');
    lines.push('═'.repeat(80));
    lines.push('');

    lines.push(`Reference Video: ${result.referenceVideo}`);
    lines.push(`Output Video:    ${result.outputVideo}`);
    lines.push(`Timestamp:       ${result.timestamp.toISOString()}`);
    lines.push(`Duration:        ${(result.duration / 1000).toFixed(2)}s`);
    lines.push('');

    lines.push('─'.repeat(80));
    lines.push('OVERALL RESULT');
    lines.push('─'.repeat(80));
    lines.push(`Status:          ${result.passed ? '✓ PASSED' : '✗ FAILED'}`);
    lines.push(`Overall Score:   ${(result.overallScore * 100).toFixed(2)}%`);
    lines.push(`Pass Threshold:  ${(result.threshold * 100).toFixed(2)}%`);

    if (result.error) {
      lines.push('');
      lines.push(`Error: ${result.error}`);
    }

    if (result.frameResults.length > 0) {
      lines.push('');
      lines.push('─'.repeat(80));
      lines.push('FRAME COMPARISON DETAILS');
      lines.push('─'.repeat(80));

      result.frameResults.forEach((frame, index) => {
        const status = frame.matchScore >= result.threshold ? '✓' : '✗';
        lines.push(
          `Frame ${(index + 1).toString().padStart(2)} ${status} ` +
            `${(frame.matchScore * 100).toFixed(2)}% ` +
            `(${frame.differentPixels.toLocaleString()} diff pixels, ` +
            `${frame.differencePercentage.toFixed(4)}%)`,
        );
      });

      // Statistics
      lines.push('');
      lines.push('─'.repeat(80));
      lines.push('STATISTICS');
      lines.push('─'.repeat(80));

      const scores = result.frameResults.map((f) => f.matchScore);
      const minScore = Math.min(...scores);
      const maxScore = Math.max(...scores);
      const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length;
      const passedFrames = scores.filter((s) => s >= result.threshold).length;

      lines.push(`Frames Analyzed: ${result.frameResults.length}`);
      lines.push(`Frames Passed:   ${passedFrames}/${result.frameResults.length}`);
      lines.push(`Min Score:       ${(minScore * 100).toFixed(2)}%`);
      lines.push(`Max Score:       ${(maxScore * 100).toFixed(2)}%`);
      lines.push(`Avg Score:       ${(avgScore * 100).toFixed(2)}%`);

      const totalDiff = result.frameResults.reduce((sum, f) => sum + f.differentPixels, 0);
      const totalPixels = result.frameResults.reduce((sum, f) => sum + f.totalPixels, 0);
      lines.push(
        `Total Diff:      ${totalDiff.toLocaleString()}/${totalPixels.toLocaleString()} pixels ` +
          `(${((totalDiff / totalPixels) * 100).toFixed(4)}%)`,
      );
    }

    lines.push('');
    lines.push('═'.repeat(80));

    return lines.join('\n');
  }

  /**
   * Generate batch validation text report
   */
  static generateBatchTextReport(result: BatchValidationResult): string {
    const lines: string[] = [];

    lines.push('═'.repeat(80));
    lines.push('BATCH VALIDATION REPORT');
    lines.push('═'.repeat(80));
    lines.push('');

    lines.push(`Timestamp:       ${result.timestamp.toISOString()}`);
    lines.push(`Duration:        ${(result.duration / 1000).toFixed(2)}s`);
    lines.push(`Total Tests:     ${result.totalValidations}`);
    lines.push(`Passed:          ${result.passedValidations}`);
    lines.push(`Failed:          ${result.failedValidations}`);
    lines.push(`Pass Rate:       ${(result.passRate * 100).toFixed(2)}%`);
    lines.push('');

    lines.push('─'.repeat(80));
    lines.push('INDIVIDUAL RESULTS');
    lines.push('─'.repeat(80));

    result.results.forEach((r, index) => {
      const status = r.passed ? '✓ PASS' : '✗ FAIL';
      const fileName = path.basename(r.outputVideo);
      const score = (r.overallScore * 100).toFixed(2);

      lines.push(
        `${(index + 1).toString().padStart(2)}. ${status} ${score.padStart(6)}% - ${fileName}`,
      );

      if (r.error) {
        lines.push(`    Error: ${r.error}`);
      }
    });

    lines.push('');
    lines.push('═'.repeat(80));

    return lines.join('\n');
  }

  /**
   * Generate CI/CD-friendly summary
   */
  static generateCISummary(result: ValidationResult | BatchValidationResult): string {
    if ('results' in result) {
      // Batch result
      return [
        `total=${result.totalValidations}`,
        `passed=${result.passedValidations}`,
        `failed=${result.failedValidations}`,
        `pass_rate=${(result.passRate * 100).toFixed(2)}`,
      ].join(' ');
    } else {
      // Single result
      return [
        `passed=${result.passed ? 1 : 0}`,
        `score=${(result.overallScore * 100).toFixed(2)}`,
        `threshold=${(result.threshold * 100).toFixed(2)}`,
      ].join(' ');
    }
  }

  /**
   * Generate markdown report
   */
  static generateMarkdownReport(result: ValidationResult): string {
    const lines: string[] = [];

    lines.push('# Video Validation Report');
    lines.push('');

    lines.push('## Overview');
    lines.push('');
    lines.push(`- **Reference Video:** \`${result.referenceVideo}\``);
    lines.push(`- **Output Video:** \`${result.outputVideo}\``);
    lines.push(`- **Timestamp:** ${result.timestamp.toISOString()}`);
    lines.push(`- **Duration:** ${(result.duration / 1000).toFixed(2)}s`);
    lines.push('');

    lines.push('## Result');
    lines.push('');
    const statusEmoji = result.passed ? '✅' : '❌';
    lines.push(
      `**Status:** ${statusEmoji} ${result.passed ? 'PASSED' : 'FAILED'}`,
    );
    lines.push(
      `**Overall Score:** ${(result.overallScore * 100).toFixed(2)}%`,
    );
    lines.push(
      `**Pass Threshold:** ${(result.threshold * 100).toFixed(2)}%`,
    );

    if (result.error) {
      lines.push('');
      lines.push(`**Error:** ${result.error}`);
    }

    if (result.frameResults.length > 0) {
      lines.push('');
      lines.push('## Frame Analysis');
      lines.push('');
      lines.push('| Frame | Status | Match Score | Different Pixels | Difference % |');
      lines.push('|-------|--------|-------------|------------------|--------------|');

      result.frameResults.forEach((frame, index) => {
        const status = frame.matchScore >= result.threshold ? '✅' : '❌';
        lines.push(
          `| ${index + 1} | ${status} | ${(frame.matchScore * 100).toFixed(2)}% | ` +
            `${frame.differentPixels.toLocaleString()} | ` +
            `${frame.differencePercentage.toFixed(4)}% |`,
        );
      });

      lines.push('');
      lines.push('## Statistics');
      lines.push('');

      const scores = result.frameResults.map((f) => f.matchScore);
      const minScore = Math.min(...scores);
      const maxScore = Math.max(...scores);
      const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length;
      const passedFrames = scores.filter((s) => s >= result.threshold).length;

      lines.push(`- **Frames Analyzed:** ${result.frameResults.length}`);
      lines.push(
        `- **Frames Passed:** ${passedFrames}/${result.frameResults.length}`,
      );
      lines.push(`- **Min Score:** ${(minScore * 100).toFixed(2)}%`);
      lines.push(`- **Max Score:** ${(maxScore * 100).toFixed(2)}%`);
      lines.push(`- **Avg Score:** ${(avgScore * 100).toFixed(2)}%`);
    }

    return lines.join('\n');
  }
}
