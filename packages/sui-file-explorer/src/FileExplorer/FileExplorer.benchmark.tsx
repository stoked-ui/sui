/**
 * Performance benchmark suite for FileExplorer migration validation
 * Tests render times and memory usage with varying file counts
 */

import * as React from 'react';
import { render, cleanup } from '@testing-library/react';
import { FileExplorer } from './FileExplorer';
import type { FileExplorerBasicProps } from '../FileExplorerBasic';

interface BenchmarkResult {
  fileCount: number;
  renderTime: number;
  memoryBefore: number;
  memoryAfter: number;
  memoryDelta: number;
}

interface PerformanceMetrics {
  results: BenchmarkResult[];
  averageRenderTime: number;
  averageMemoryDelta: number;
  timestamp: string;
}

// Generate test data with specified file count
function generateFileData(count: number): any[] {
  const files: any[] = [];
  const foldersCount = Math.floor(count * 0.3); // 30% folders
  const filesCount = count - foldersCount;

  // Create folder structure
  for (let i = 0; i < foldersCount; i++) {
    files.push({
      id: `folder-${i}`,
      label: `Folder ${i}`,
      children: []
    });
  }

  // Create files and distribute into folders
  for (let i = 0; i < filesCount; i++) {
    const file = {
      id: `file-${i}`,
      label: `File ${i}.tsx`
    };

    // Distribute files across folders
    if (foldersCount > 0) {
      const folderIndex = i % foldersCount;
      files[folderIndex].children.push(file);
    } else {
      files.push(file);
    }
  }

  return files;
}

// Measure memory usage
function measureMemory(): number {
  if (typeof performance !== 'undefined' && (performance as any).memory) {
    return (performance as any).memory.usedJSHeapSize / 1024 / 1024; // MB
  }
  return 0;
}

// Run single benchmark iteration
async function runBenchmark(fileCount: number): Promise<BenchmarkResult> {
  const items = generateFileData(fileCount);

  // Force garbage collection if available
  if (global.gc) {
    global.gc();
  }

  const memoryBefore = measureMemory();
  const startTime = performance.now();

  const { container } = render(
    <FileExplorer items={items} />
  );

  const endTime = performance.now();
  const memoryAfter = measureMemory();

  const result: BenchmarkResult = {
    fileCount,
    renderTime: endTime - startTime,
    memoryBefore,
    memoryAfter,
    memoryDelta: memoryAfter - memoryBefore
  };

  cleanup();

  return result;
}

// Run comprehensive benchmark suite
export async function runPerformanceBenchmarks(): Promise<PerformanceMetrics> {
  const fileCounts = [100, 1000, 5000];
  const iterations = 3; // Run each test 3 times for average
  const results: BenchmarkResult[] = [];

  console.log('🚀 Starting FileExplorer performance benchmarks...\n');

  for (const count of fileCounts) {
    console.log(`📊 Testing with ${count} files...`);
    const iterationResults: BenchmarkResult[] = [];

    for (let i = 0; i < iterations; i++) {
      const result = await runBenchmark(count);
      iterationResults.push(result);

      // Wait between iterations
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    // Calculate average for this file count
    const avgResult: BenchmarkResult = {
      fileCount: count,
      renderTime: iterationResults.reduce((sum, r) => sum + r.renderTime, 0) / iterations,
      memoryBefore: iterationResults.reduce((sum, r) => sum + r.memoryBefore, 0) / iterations,
      memoryAfter: iterationResults.reduce((sum, r) => sum + r.memoryAfter, 0) / iterations,
      memoryDelta: iterationResults.reduce((sum, r) => sum + r.memoryDelta, 0) / iterations
    };

    results.push(avgResult);
    console.log(`   Render time: ${avgResult.renderTime.toFixed(2)}ms`);
    console.log(`   Memory delta: ${avgResult.memoryDelta.toFixed(2)}MB\n`);
  }

  const metrics: PerformanceMetrics = {
    results,
    averageRenderTime: results.reduce((sum, r) => sum + r.renderTime, 0) / results.length,
    averageMemoryDelta: results.reduce((sum, r) => sum + r.memoryDelta, 0) / results.length,
    timestamp: new Date().toISOString()
  };

  console.log('✅ Benchmark suite complete!\n');

  return metrics;
}

// Export for CLI usage
export { generateFileData, measureMemory, runBenchmark };
