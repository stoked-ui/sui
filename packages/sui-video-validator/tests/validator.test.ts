/**
 * Integration tests for VideoValidator
 *
 * Note: These tests require FFmpeg to be installed and test video files to be present
 */

import { VideoValidator, BatchValidator, Reporter } from '../src';
import { promises as fs } from 'fs';
import path from 'path';

const TEST_VIDEOS_DIR = path.join(__dirname, 'fixtures');
const OUTPUT_DIR = path.join(__dirname, 'output');

async function setupTestEnvironment() {
  // Ensure output directory exists
  await fs.mkdir(OUTPUT_DIR, { recursive: true });

  // Check if test videos exist
  try {
    await fs.access(path.join(TEST_VIDEOS_DIR, 'reference.mp4'));
    await fs.access(path.join(TEST_VIDEOS_DIR, 'output.mp4'));
    return true;
  } catch {
    console.warn('⚠️  Test videos not found. Skipping integration tests.');
    console.warn('   Place test videos in: ' + TEST_VIDEOS_DIR);
    return false;
  }
}

async function testBasicValidation() {
  console.log('\n🧪 Test: Basic Validation');

  const validator = new VideoValidator({
    frameCount: 4,
    passThreshold: 0.9,
    outputDir: OUTPUT_DIR,
    verbose: true,
  });

  const result = await validator.validate(
    path.join(TEST_VIDEOS_DIR, 'reference.mp4'),
    path.join(TEST_VIDEOS_DIR, 'output.mp4'),
  );

  console.log(`Result: ${result.passed ? '✅ PASSED' : '❌ FAILED'}`);
  console.log(`Overall Score: ${(result.overallScore * 100).toFixed(2)}%`);
  console.log(`Frames Analyzed: ${result.frameResults.length}`);

  // Validate result structure
  if (!result.frameResults || result.frameResults.length === 0) {
    throw new Error('No frame results returned');
  }

  if (result.overallScore < 0 || result.overallScore > 1) {
    throw new Error('Invalid overall score: ' + result.overallScore);
  }

  console.log('✅ Basic validation test passed\n');
}

async function testDiffGeneration() {
  console.log('\n🧪 Test: Visual Diff Generation');

  const validator = new VideoValidator({
    frameCount: 3,
    passThreshold: 0.9,
    generateDiffs: true,
    outputDir: OUTPUT_DIR,
    verbose: true,
  });

  const result = await validator.validate(
    path.join(TEST_VIDEOS_DIR, 'reference.mp4'),
    path.join(TEST_VIDEOS_DIR, 'output.mp4'),
  );

  // Check if diff images were generated
  let diffImagesFound = 0;
  for (const frameResult of result.frameResults) {
    if (frameResult.diffImagePath) {
      try {
        await fs.access(frameResult.diffImagePath);
        diffImagesFound++;
      } catch {
        console.warn(`Diff image not found: ${frameResult.diffImagePath}`);
      }
    }
  }

  console.log(`Diff images generated: ${diffImagesFound}/${result.frameResults.length}`);

  if (diffImagesFound !== result.frameResults.length) {
    throw new Error('Not all diff images were generated');
  }

  console.log('✅ Diff generation test passed\n');
}

async function testReportGeneration() {
  console.log('\n🧪 Test: Report Generation');

  const validator = new VideoValidator({
    frameCount: 4,
    passThreshold: 0.9,
    outputDir: OUTPUT_DIR,
    verbose: false,
  });

  const result = await validator.validate(
    path.join(TEST_VIDEOS_DIR, 'reference.mp4'),
    path.join(TEST_VIDEOS_DIR, 'output.mp4'),
  );

  // Test text report
  const textReport = Reporter.generateTextReport(result);
  if (!textReport.includes('VIDEO VALIDATION REPORT')) {
    throw new Error('Text report format invalid');
  }

  // Test JSON report
  const jsonPath = path.join(OUTPUT_DIR, 'test-report.json');
  await Reporter.generateJSON(result, jsonPath);
  const jsonData = await fs.readFile(jsonPath, 'utf-8');
  const parsedResult = JSON.parse(jsonData);

  if (parsedResult.overallScore !== result.overallScore) {
    throw new Error('JSON report data mismatch');
  }

  // Test Markdown report
  const mdReport = Reporter.generateMarkdownReport(result);
  if (!mdReport.includes('# Video Validation Report')) {
    throw new Error('Markdown report format invalid');
  }

  // Test CI summary
  const ciSummary = Reporter.generateCISummary(result);
  if (!ciSummary.includes('passed=') || !ciSummary.includes('score=')) {
    throw new Error('CI summary format invalid');
  }

  console.log('Text report length:', textReport.length);
  console.log('Markdown report length:', mdReport.length);
  console.log('CI summary:', ciSummary);

  console.log('✅ Report generation test passed\n');
}

async function testBatchValidation() {
  console.log('\n🧪 Test: Batch Validation');

  // Create test batch config
  const batchConfig = {
    validations: [
      {
        name: 'Test Video 1',
        reference: path.join(TEST_VIDEOS_DIR, 'reference.mp4'),
        output: path.join(TEST_VIDEOS_DIR, 'output.mp4'),
      },
      {
        name: 'Test Video 2',
        reference: path.join(TEST_VIDEOS_DIR, 'reference.mp4'),
        output: path.join(TEST_VIDEOS_DIR, 'output.mp4'),
      },
    ],
    config: {
      frameCount: 3,
      passThreshold: 0.9,
    },
    concurrency: 2,
  };

  const batchValidator = new BatchValidator(
    {
      frameCount: 3,
      passThreshold: 0.9,
      outputDir: OUTPUT_DIR,
      verbose: false,
    },
    2,
  );

  const result = await batchValidator.validateBatch(batchConfig);

  console.log(`Total validations: ${result.totalValidations}`);
  console.log(`Passed: ${result.passedValidations}`);
  console.log(`Failed: ${result.failedValidations}`);
  console.log(`Pass rate: ${(result.passRate * 100).toFixed(2)}%`);

  if (result.results.length !== batchConfig.validations.length) {
    throw new Error('Batch validation count mismatch');
  }

  // Test batch report
  const batchReport = Reporter.generateBatchTextReport(result);
  if (!batchReport.includes('BATCH VALIDATION REPORT')) {
    throw new Error('Batch report format invalid');
  }

  console.log('✅ Batch validation test passed\n');
}

async function testErrorHandling() {
  console.log('\n🧪 Test: Error Handling');

  const validator = new VideoValidator({
    frameCount: 4,
    passThreshold: 0.9,
    outputDir: OUTPUT_DIR,
    verbose: false,
  });

  // Test with non-existent file
  const result = await validator.validate(
    'non-existent-reference.mp4',
    'non-existent-output.mp4',
  );

  if (!result.error) {
    throw new Error('Expected error for non-existent files');
  }

  if (result.passed) {
    throw new Error('Validation should fail for non-existent files');
  }

  console.log('Error message:', result.error);
  console.log('✅ Error handling test passed\n');
}

async function testCustomConfiguration() {
  console.log('\n🧪 Test: Custom Configuration');

  // Test with strict tolerance
  const strictValidator = new VideoValidator({
    frameCount: 4,
    passThreshold: 0.99,
    pixelMatchOptions: {
      threshold: 0.01,
    },
    outputDir: OUTPUT_DIR,
    verbose: true,
  });

  const strictResult = await strictValidator.validate(
    path.join(TEST_VIDEOS_DIR, 'reference.mp4'),
    path.join(TEST_VIDEOS_DIR, 'output.mp4'),
  );

  console.log(`Strict validation score: ${(strictResult.overallScore * 100).toFixed(2)}%`);

  // Test with permissive tolerance
  const permissiveValidator = new VideoValidator({
    frameCount: 4,
    passThreshold: 0.7,
    pixelMatchOptions: {
      threshold: 0.3,
    },
    outputDir: OUTPUT_DIR,
    verbose: true,
  });

  const permissiveResult = await permissiveValidator.validate(
    path.join(TEST_VIDEOS_DIR, 'reference.mp4'),
    path.join(TEST_VIDEOS_DIR, 'output.mp4'),
  );

  console.log(`Permissive validation score: ${(permissiveResult.overallScore * 100).toFixed(2)}%`);

  console.log('✅ Custom configuration test passed\n');
}

async function runAllTests() {
  console.log('🚀 Starting VideoValidator Integration Tests\n');

  const hasTestVideos = await setupTestEnvironment();

  if (!hasTestVideos) {
    console.log('\n⚠️  Skipping tests - test videos not available');
    process.exit(0);
  }

  try {
    await testBasicValidation();
    await testDiffGeneration();
    await testReportGeneration();
    await testBatchValidation();
    await testErrorHandling();
    await testCustomConfiguration();

    console.log('\n✅ All tests passed!\n');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Test failed:', error);
    process.exit(1);
  }
}

// Run tests if executed directly
if (require.main === module) {
  runAllTests();
}

export { runAllTests };
