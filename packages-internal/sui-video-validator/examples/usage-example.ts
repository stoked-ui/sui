import { VideoValidator, BatchValidator, Reporter } from '@stoked-ui/video-validator';

/**
 * Example 1: Basic single video validation
 */
async function basicValidation() {
  const validator = new VideoValidator({
    frameCount: 8,
    passThreshold: 0.9,
    verbose: true,
  });

  const result = await validator.validate(
    './reference-video.mp4',
    './output-video.mp4',
  );

  console.log(`Validation ${result.passed ? 'PASSED' : 'FAILED'}`);
  console.log(`Overall Score: ${(result.overallScore * 100).toFixed(2)}%`);

  // Generate text report
  const report = Reporter.generateTextReport(result);
  console.log(report);

  // Save JSON report
  await Reporter.generateJSON(result, './validation-report.json');
}

/**
 * Example 2: Validation with visual diff generation
 */
async function validationWithDiffs() {
  const validator = new VideoValidator({
    frameCount: 8,
    passThreshold: 0.9,
    generateDiffs: true,
    outputDir: './validation-output',
    pixelMatchOptions: {
      threshold: 0.1,
      diffColor: [255, 0, 0, 255], // Red diff highlighting
    },
    verbose: true,
  });

  const result = await validator.validate(
    './reference-video.mp4',
    './output-video.mp4',
  );

  // Visual diffs are saved in ./validation-output/diff_frame_*.png
  console.log('Diff images generated:', result.frameResults.length);
}

/**
 * Example 3: Batch validation
 */
async function batchValidation() {
  const batchValidator = new BatchValidator(
    {
      frameCount: 8,
      passThreshold: 0.9,
      generateDiffs: false,
      verbose: false,
    },
    3, // concurrency
  );

  const batchResult = await batchValidator.validateBatch({
    validations: [
      {
        name: 'Video 1',
        reference: './ref1.mp4',
        output: './out1.mp4',
      },
      {
        name: 'Video 2',
        reference: './ref2.mp4',
        output: './out2.mp4',
      },
      {
        name: 'Video 3',
        reference: './ref3.mp4',
        output: './out3.mp4',
      },
    ],
    config: {},
    concurrency: 3,
  });

  console.log(`Batch Results: ${batchResult.passedValidations}/${batchResult.totalValidations} passed`);
  console.log(`Pass Rate: ${(batchResult.passRate * 100).toFixed(2)}%`);

  // Generate batch report
  const report = Reporter.generateBatchTextReport(batchResult);
  console.log(report);

  // Save batch JSON
  await Reporter.generateBatchJSON(batchResult, './batch-results.json');
}

/**
 * Example 4: Custom pixel tolerance
 */
async function customTolerance() {
  const validator = new VideoValidator({
    frameCount: 8,
    passThreshold: 0.95, // Stricter threshold
    pixelMatchOptions: {
      threshold: 0.05, // More strict pixel matching
      includeAA: true,
      alpha: 0.05,
    },
    verbose: true,
  });

  const result = await validator.validate(
    './reference-video.mp4',
    './output-video.mp4',
  );

  console.log('Strict validation result:', result.passed);
}

/**
 * Example 5: CI/CD integration
 */
async function cicdIntegration() {
  const validator = new VideoValidator({
    frameCount: 8,
    passThreshold: 0.9,
    outputDir: './ci-validation',
    verbose: false,
  });

  const result = await validator.validate(
    process.env.REFERENCE_VIDEO!,
    process.env.OUTPUT_VIDEO!,
  );

  // Save JSON for CI system
  await Reporter.generateJSON(result, './validation-result.json');

  // Generate CI summary
  const summary = Reporter.generateCISummary(result);
  console.log(summary);

  // Exit with appropriate code
  process.exit(result.passed ? 0 : 1);
}

// Run examples
if (require.main === module) {
  const example = process.argv[2] || 'basic';

  switch (example) {
    case 'basic':
      basicValidation().catch(console.error);
      break;
    case 'diffs':
      validationWithDiffs().catch(console.error);
      break;
    case 'batch':
      batchValidation().catch(console.error);
      break;
    case 'tolerance':
      customTolerance().catch(console.error);
      break;
    case 'ci':
      cicdIntegration().catch(console.error);
      break;
    default:
      console.log('Available examples: basic, diffs, batch, tolerance, ci');
  }
}
