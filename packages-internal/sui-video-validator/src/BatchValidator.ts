import { VideoValidator } from './VideoValidator';
import {
  BatchValidationConfig,
  BatchValidationResult,
  ValidationResult,
  ValidationConfig,
} from './types';

/**
 * Batch video validation with parallel execution support
 */
export class BatchValidator {
  private validator: VideoValidator;
  private concurrency: number;

  constructor(config: Partial<ValidationConfig> = {}, concurrency: number = 3) {
    this.validator = new VideoValidator(config);
    this.concurrency = concurrency;
  }

  /**
   * Run batch validation on multiple video pairs
   */
  async validateBatch(config: BatchValidationConfig): Promise<BatchValidationResult> {
    const startTime = Date.now();
    const results: ValidationResult[] = [];

    // Process validations in batches based on concurrency limit
    for (let i = 0; i < config.validations.length; i += this.concurrency) {
      const batch = config.validations.slice(i, i + this.concurrency);

      const batchResults = await Promise.all(
        batch.map(async (validation) => {
          try {
            console.log(`\nValidating: ${validation.name || validation.output}`);
            return await this.validator.validate(validation.reference, validation.output);
          } catch (error) {
            console.error(
              `Error validating ${validation.name || validation.output}:`,
              error instanceof Error ? error.message : String(error),
            );

            return {
              referenceVideo: validation.reference,
              outputVideo: validation.output,
              frameResults: [],
              overallScore: 0,
              passed: false,
              threshold: config.config.passThreshold || 0.9,
              timestamp: new Date(),
              duration: 0,
              error: error instanceof Error ? error.message : String(error),
            } as ValidationResult;
          }
        }),
      );

      results.push(...batchResults);
    }

    const passedValidations = results.filter((r) => r.passed).length;
    const failedValidations = results.filter((r) => !r.passed).length;
    const passRate = passedValidations / results.length;

    return {
      results,
      passRate,
      totalValidations: results.length,
      passedValidations,
      failedValidations,
      timestamp: new Date(),
      duration: Date.now() - startTime,
    };
  }
}
