/**
 * Performance Metrics Collection and Tracking
 *
 * Collects timing metrics for critical operations in the media package.
 * Useful for performance debugging and optimization verification.
 */

/**
 * Performance metric event types
 */
export enum MetricType {
  // Component render times
  MEDIACARD_RENDER = 'mediacard.render',
  MEDIAVIEWER_RENDER = 'mediaviewer.render',

  // Component interaction times
  COMPONENT_INTERACTION = 'component.interaction',

  // API operations
  API_REQUEST = 'api.request',
  API_RESPONSE = 'api.response',

  // Metadata extraction
  METADATA_EXTRACTION = 'metadata.extraction',
  METADATA_EXTRACTION_CLIENT = 'metadata.extraction.client',
  METADATA_EXTRACTION_SERVER = 'metadata.extraction.server',

  // Bundle loading
  CHUNK_LOAD = 'chunk.load',
  MODULE_LOAD = 'module.load',

  // Memory operations
  MEMORY_ALLOCATION = 'memory.allocation',
  MEMORY_CLEANUP = 'memory.cleanup',
}

/**
 * Represents a single performance metric
 */
export interface PerformanceMetric {
  type: MetricType;
  duration: number; // milliseconds
  startTime: number; // DOMHighResTimeStamp
  endTime: number; // DOMHighResTimeStamp
  metadata?: Record<string, any>;
  error?: Error;
}

/**
 * Performance metrics collector
 */
export class PerformanceCollector {
  private static instance: PerformanceCollector;
  private metrics: PerformanceMetric[] = [];
  private enabled = true;
  private maxMetrics = 1000; // Prevent memory leaks

  private constructor() {}

  /**
   * Get singleton instance
   */
  static getInstance(): PerformanceCollector {
    if (!PerformanceCollector.instance) {
      PerformanceCollector.instance = new PerformanceCollector();
    }
    return PerformanceCollector.instance;
  }

  /**
   * Enable or disable metrics collection
   */
  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }

  /**
   * Mark the start of a performance measurement
   *
   * @example
   * const mark = perf.markStart('fetch-metadata');
   * // ... do work ...
   * const metric = perf.markEnd(mark, MetricType.METADATA_EXTRACTION);
   */
  markStart(label: string): string {
    if (!this.enabled) return '';
    const markName = `${label}-start-${Date.now()}`;
    if (typeof performance !== 'undefined' && performance.mark) {
      performance.mark(markName);
    }
    return markName;
  }

  /**
   * Mark the end of a performance measurement and collect the metric
   */
  markEnd(
    startMark: string,
    type: MetricType,
    metadata?: Record<string, any>
  ): PerformanceMetric | null {
    if (!this.enabled || !startMark) return null;

    try {
      const endMark = `${startMark}-end`;
      if (typeof performance !== 'undefined' && performance.mark) {
        performance.mark(endMark);
        const measureName = `${startMark}-measure`;
        performance.measure(measureName, startMark, endMark);

        const entries = performance.getEntriesByName(measureName);
        if (entries.length > 0) {
          const entry = entries[0];
          const metric: PerformanceMetric = {
            type,
            duration: entry.duration,
            startTime: entry.startTime,
            endTime: entry.startTime + entry.duration,
            metadata,
          };
          this.addMetric(metric);
          return metric;
        }
      }
    } catch (error) {
      console.error('Performance measurement error:', error);
    }

    return null;
  }

  /**
   * Measure a synchronous function's execution time
   *
   * @example
   * const result = perf.measure('render-card', () => {
   *   return renderCardComponent(props);
   * }, MetricType.MEDIACARD_RENDER);
   */
  measure<T>(
    label: string,
    fn: () => T,
    type: MetricType,
    metadata?: Record<string, any>
  ): T {
    const mark = this.markStart(label);
    try {
      const result = fn();
      this.markEnd(mark, type, metadata);
      return result;
    } catch (error) {
      const endMark = `${mark}-end`;
      const metric: PerformanceMetric = {
        type,
        duration: 0,
        startTime: 0,
        endTime: 0,
        metadata,
        error: error as Error,
      };
      this.addMetric(metric);
      throw error;
    }
  }

  /**
   * Measure an async function's execution time
   *
   * @example
   * const data = await perf.measureAsync('fetch-metadata', async () => {
   *   return await fetchMetadata(file);
   * }, MetricType.METADATA_EXTRACTION_SERVER);
   */
  async measureAsync<T>(
    label: string,
    fn: () => Promise<T>,
    type: MetricType,
    metadata?: Record<string, any>
  ): Promise<T> {
    const mark = this.markStart(label);
    try {
      const result = await fn();
      this.markEnd(mark, type, metadata);
      return result;
    } catch (error) {
      const endMark = `${mark}-end`;
      const metric: PerformanceMetric = {
        type,
        duration: 0,
        startTime: 0,
        endTime: 0,
        metadata,
        error: error as Error,
      };
      this.addMetric(metric);
      throw error;
    }
  }

  /**
   * Add a metric directly
   */
  addMetric(metric: PerformanceMetric): void {
    if (!this.enabled) return;

    this.metrics.push(metric);

    // Prevent unbounded memory growth
    if (this.metrics.length > this.maxMetrics) {
      this.metrics = this.metrics.slice(-this.maxMetrics / 2);
    }
  }

  /**
   * Get all collected metrics
   */
  getMetrics(): PerformanceMetric[] {
    return [...this.metrics];
  }

  /**
   * Get metrics by type
   */
  getMetricsByType(type: MetricType): PerformanceMetric[] {
    return this.metrics.filter((m) => m.type === type);
  }

  /**
   * Get performance statistics for a metric type
   */
  getStats(type: MetricType): MetricStats | null {
    const metrics = this.getMetricsByType(type);
    if (metrics.length === 0) return null;

    const durations = metrics.map((m) => m.duration);
    const sorted = durations.sort((a, b) => a - b);

    return {
      count: metrics.length,
      min: Math.min(...durations),
      max: Math.max(...durations),
      avg: durations.reduce((a, b) => a + b, 0) / durations.length,
      p50: sorted[Math.floor(sorted.length * 0.5)],
      p95: sorted[Math.floor(sorted.length * 0.95)],
      p99: sorted[Math.floor(sorted.length * 0.99)],
    };
  }

  /**
   * Get all performance statistics
   */
  getAllStats(): Record<MetricType, MetricStats | null> {
    const stats: Record<MetricType, MetricStats | null> = {} as any;
    Object.values(MetricType).forEach((type) => {
      stats[type as MetricType] = this.getStats(type as MetricType);
    });
    return stats;
  }

  /**
   * Clear all metrics
   */
  clear(): void {
    this.metrics = [];
    if (typeof performance !== 'undefined' && performance.clearMarks) {
      performance.clearMarks();
    }
  }

  /**
   * Print a summary of metrics to console
   */
  printSummary(): void {
    const stats = this.getAllStats();
    console.group('Performance Metrics Summary');
    Object.entries(stats).forEach(([type, stat]) => {
      if (stat) {
        console.log(`${type}:`, {
          count: stat.count,
          avg: `${stat.avg.toFixed(2)}ms`,
          p95: `${stat.p95.toFixed(2)}ms`,
          p99: `${stat.p99.toFixed(2)}ms`,
        });
      }
    });
    console.groupEnd();
  }
}

/**
 * Performance statistics
 */
export interface MetricStats {
  count: number;
  min: number;
  max: number;
  avg: number;
  p50: number; // Median
  p95: number; // 95th percentile
  p99: number; // 99th percentile
}

/**
 * React hook for performance measurement
 *
 * @example
 * const { measure, measureAsync } = usePerformance();
 *
 * function Component() {
 *   const render = () => {
 *     return measure('component-render', () => {
 *       return <div>Content</div>;
 *     }, MetricType.MEDIACARD_RENDER);
 *   };
 *
 *   return render();
 * }
 */
export function usePerformance() {
  const collector = PerformanceCollector.getInstance();

  return {
    measure: collector.measure.bind(collector),
    measureAsync: collector.measureAsync.bind(collector),
    markStart: collector.markStart.bind(collector),
    markEnd: collector.markEnd.bind(collector),
  };
}

// Export singleton instance
export const performanceCollector = PerformanceCollector.getInstance();
