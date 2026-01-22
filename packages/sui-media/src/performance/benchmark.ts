/**
 * Performance Benchmarking Suite for @stoked-ui/media
 *
 * Provides comprehensive benchmarking and performance testing utilities
 * with performance budgets and regression detection.
 *
 * Usage:
 * ```typescript
 * import { BenchmarkSuite, PerformanceBudget } from '@stoked-ui/media/performance';
 *
 * const suite = new BenchmarkSuite('MediaCard', {
 *   renderTime: { target: 100, threshold: 110 },
 *   bundleSize: { target: 50000, threshold: 55000 },
 * });
 *
 * suite.addTest('renders in <100ms', async () => {
 *   const start = performance.now();
 *   await render(<MediaCard />);
 *   return performance.now() - start;
 * });
 *
 * const results = await suite.run();
 * console.log(results.summary);
 * ```
 */

/**
 * Performance budget configuration
 */
export interface PerformanceBudget {
  // Target value in milliseconds or bytes
  target: number;
  // Maximum acceptable value (threshold)
  threshold: number;
  // Whether to fail tests that exceed threshold
  strict?: boolean;
}

/**
 * Benchmark test result
 */
export interface BenchmarkResult {
  name: string;
  duration: number; // milliseconds
  passed: boolean;
  message?: string;
  budget?: {
    target: number;
    threshold: number;
    value: number;
    exceeded: boolean;
  };
}

/**
 * Benchmark suite results
 */
export interface BenchmarkSuiteResults {
  name: string;
  duration: number;
  total: number;
  passed: number;
  failed: number;
  summary: string;
  results: BenchmarkResult[];
}

/**
 * Benchmark configuration
 */
export interface BenchmarkConfig {
  // Number of iterations per test
  iterations?: number;
  // Warm-up iterations before measuring
  warmupIterations?: number;
  // Show detailed output
  verbose?: boolean;
  // Store results
  storeResults?: boolean;
}

/**
 * Performance metric thresholds
 *
 * These are the target and threshold values for different operations
 */
export const PERFORMANCE_BUDGETS = {
  // Frontend bundle sizes
  bundleSize: {
    mediaCard: { target: 50000, threshold: 55000 }, // 50KB target, 55KB max
    mediaViewer: { target: 80000, threshold: 88000 }, // 80KB target, 88KB max
    lazySplit: { target: 40000, threshold: 44000 }, // Lazy-loaded chunk, 40KB target
    total: { target: 150000, threshold: 165000 }, // 150KB target for all
  },

  // Component render times
  renderTime: {
    mediaCard: { target: 100, threshold: 150 }, // <100ms typical, <150ms max
    mediaViewer: { target: 200, threshold: 300 }, // <200ms typical, <300ms max
    mediaCardList100Items: { target: 500, threshold: 750 }, // 100 items
  },

  // API response times
  apiResponseTime: {
    metadata: { target: 100, threshold: 200 }, // 95th percentile target: <100ms
    thumbnail: { target: 150, threshold: 300 }, // Thumbnail fetch
    search: { target: 200, threshold: 400 }, // Search results
  },

  // Metadata extraction
  metadataExtraction: {
    client: { target: 500, threshold: 1000 }, // Client-side extraction
    server: { target: 200, threshold: 500 }, // Server-side extraction
    large10MB: { target: 1000, threshold: 2000 }, // Large files (server)
  },

  // Interaction performance
  interaction: {
    thumbnailStripScroll: { target: 16, threshold: 33 }, // <60fps = 16ms
    galleryPan: { target: 16, threshold: 33 }, // <60fps
    playerSeek: { target: 100, threshold: 200 }, // Seek operation
  },

  // Memory usage
  memory: {
    mediaCard: { target: 5242880, threshold: 6291456 }, // 5MB target, 6MB max
    mediaViewer: { target: 10485760, threshold: 12582912 }, // 10MB target, 12MB max
  },
};

/**
 * Benchmark suite for comprehensive performance testing
 */
export class BenchmarkSuite {
  private name: string;
  private tests: Array<{
    name: string;
    fn: () => Promise<number> | number;
    budget?: PerformanceBudget;
  }> = [];
  private config: BenchmarkConfig;
  private results: BenchmarkResult[] = [];

  constructor(
    name: string,
    budgets?: Record<string, PerformanceBudget>,
    config?: BenchmarkConfig
  ) {
    this.name = name;
    this.config = {
      iterations: 10,
      warmupIterations: 3,
      verbose: false,
      storeResults: true,
      ...config,
    };
  }

  /**
   * Add a benchmark test
   */
  addTest(
    name: string,
    fn: () => Promise<number> | number,
    budget?: PerformanceBudget
  ): this {
    this.tests.push({ name, fn, budget });
    return this;
  }

  /**
   * Run all benchmarks
   */
  async run(): Promise<BenchmarkSuiteResults> {
    const startTime = performance.now();

    if (this.config.verbose) {
      console.group(`Benchmark Suite: ${this.name}`);
    }

    for (const test of this.tests) {
      await this.runTest(test);
    }

    const duration = performance.now() - startTime;
    const passed = this.results.filter((r) => r.passed).length;
    const failed = this.results.length - passed;

    const summary = `${this.name}: ${passed}/${this.results.length} tests passed in ${duration.toFixed(2)}ms`;

    if (this.config.verbose) {
      console.log(summary);
      console.groupEnd();
    }

    return {
      name: this.name,
      duration,
      total: this.results.length,
      passed,
      failed,
      summary,
      results: this.results,
    };
  }

  /**
   * Run a single test
   */
  private async runTest(test: {
    name: string;
    fn: () => Promise<number> | number;
    budget?: PerformanceBudget;
  }): Promise<void> {
    // Warm up
    for (let i = 0; i < (this.config.warmupIterations || 3); i++) {
      await test.fn();
    }

    // Measure
    const measurements: number[] = [];
    for (let i = 0; i < (this.config.iterations || 10); i++) {
      const start = performance.now();
      await test.fn();
      const duration = performance.now() - start;
      measurements.push(duration);
    }

    // Calculate statistics
    const avgDuration = measurements.reduce((a, b) => a + b, 0) / measurements.length;

    // Check budget
    let passed = true;
    let budget: {
      target: number;
      threshold: number;
      value: number;
      exceeded: boolean;
    } | undefined = undefined;

    if (test.budget) {
      const exceeded = avgDuration > test.budget.threshold;
      const strictFail = test.budget.strict && exceeded;

      passed = !strictFail;
      budget = {
        target: test.budget.target,
        threshold: test.budget.threshold,
        value: avgDuration,
        exceeded,
      };
    }

    const result: BenchmarkResult = {
      name: test.name,
      duration: avgDuration,
      passed,
      message: budget
        ? `${avgDuration.toFixed(2)}ms (target: ${budget.target}ms, threshold: ${budget.threshold}ms)`
        : `${avgDuration.toFixed(2)}ms`,
      budget,
    };

    this.results.push(result);

    if (this.config.verbose) {
      const status = passed ? '✓' : '✗';
      console.log(`${status} ${test.name}: ${result.message}`);
    }
  }

  /**
   * Get results
   */
  getResults(): BenchmarkResult[] {
    return [...this.results];
  }

  /**
   * Get results as JSON
   */
  toJSON(): BenchmarkSuiteResults {
    const duration = this.results.reduce((sum, r) => sum + r.duration, 0);
    const passed = this.results.filter((r) => r.passed).length;
    const failed = this.results.length - passed;

    return {
      name: this.name,
      duration,
      total: this.results.length,
      passed,
      failed,
      summary: `${this.name}: ${passed}/${this.results.length} tests passed`,
      results: this.results,
    };
  }
}

/**
 * Bundle size analyzer
 */
export class BundleSizeAnalyzer {
  /**
   * Parse bundle size from webpack stats
   */
  static analyzeStats(stats: any): BundleStats {
    const assets = stats.assetsByChunkName || {};
    let totalSize = 0;
    const chunks: ChunkStats[] = [];

    for (const [name, files] of Object.entries(assets)) {
      const fileArray = Array.isArray(files) ? files : [files];
      let chunkSize = 0;

      for (const file of fileArray) {
        const asset = stats.assets?.find((a: any) => a.name === file);
        if (asset) {
          chunkSize += asset.size;
          totalSize += asset.size;
        }
      }

      chunks.push({
        name,
        size: chunkSize,
        files: fileArray,
      });
    }

    return {
      total: totalSize,
      chunks,
      entryPoint: chunks.find((c) => c.name === 'main'),
    };
  }

  /**
   * Compare bundle sizes and detect regressions
   */
  static compareStats(
    current: BundleStats,
    baseline: BundleStats
  ): BundleSizeComparison {
    const totalDelta = current.total - baseline.total;
    const totalDeltaPercent = (totalDelta / baseline.total) * 100;

    const chunkComparisons = current.chunks.map((currentChunk) => {
      const baselineChunk = baseline.chunks.find((c) => c.name === currentChunk.name);
      const delta = baselineChunk ? currentChunk.size - baselineChunk.size : currentChunk.size;
      const deltaPercent = baselineChunk ? (delta / baselineChunk.size) * 100 : 0;

      return {
        name: currentChunk.name,
        current: currentChunk.size,
        baseline: baselineChunk?.size || 0,
        delta,
        deltaPercent,
        regression: delta > 0,
      };
    });

    return {
      totalCurrent: current.total,
      totalBaseline: baseline.total,
      totalDelta,
      totalDeltaPercent,
      chunks: chunkComparisons,
      hasRegression: totalDeltaPercent > 5, // 5% threshold
    };
  }
}

export interface BundleStats {
  total: number;
  chunks: ChunkStats[];
  entryPoint?: ChunkStats;
}

export interface ChunkStats {
  name: string;
  size: number;
  files: string[];
}

export interface BundleSizeComparison {
  totalCurrent: number;
  totalBaseline: number;
  totalDelta: number;
  totalDeltaPercent: number;
  chunks: Array<{
    name: string;
    current: number;
    baseline: number;
    delta: number;
    deltaPercent: number;
    regression: boolean;
  }>;
  hasRegression: boolean;
}

/**
 * Lighthouse integration for performance scoring
 */
export interface LighthouseResults {
  performance: number;
  accessibility: number;
  bestPractices: number;
  seo: number;
  pwa?: number;
}

/**
 * Get performance score guide
 */
export function getPerformanceScoreGuide(): Record<string, string> {
  return {
    '90-100': 'Good',
    '50-89': 'Needs Improvement',
    '0-49': 'Poor',
  };
}

export default {
  PERFORMANCE_BUDGETS,
  BenchmarkSuite,
  BundleSizeAnalyzer,
  getPerformanceScoreGuide,
};
