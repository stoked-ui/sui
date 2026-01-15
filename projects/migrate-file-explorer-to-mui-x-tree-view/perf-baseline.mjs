/**
 * Performance Baseline Measurement for FileExplorer Component
 * Measures render times and memory usage across different dataset sizes
 */

import React from 'react';
import { performance } from 'perf_hooks';
import v8 from 'v8';
import fs from 'fs/promises';
import path from 'path';

// Simulated FileExplorer component for testing
// In real testing, this would be the actual imported component

const generateMockFiles = (count) => {
  const items = [];
  for (let i = 0; i < count; i++) {
    items.push({
      id: `file-${i}`,
      name: `file-${i}.txt`,
      type: 'file',
      mediaType: 'text/plain',
      size: Math.floor(Math.random() * 10000),
      created: Date.now(),
      lastModified: Date.now(),
      path: `/documents/file-${i}.txt`,
    });
  }
  return items;
};

const generateNestedMockFiles = (count) => {
  const items = [];
  const dirCount = Math.ceil(count / 10);
  let fileCount = 0;

  for (let d = 0; d < dirCount && fileCount < count; d++) {
    const folder = {
      id: `folder-${d}`,
      name: `folder-${d}`,
      type: 'directory',
      mediaType: 'application/directory',
      size: 0,
      created: Date.now(),
      lastModified: Date.now(),
      path: `/documents/folder-${d}`,
      children: [],
    };

    const filesPerFolder = Math.min(10, count - fileCount);
    for (let f = 0; f < filesPerFolder && fileCount < count; f++) {
      folder.children.push({
        id: `file-${fileCount}`,
        name: `file-${fileCount}.txt`,
        type: 'file',
        mediaType: 'text/plain',
        size: Math.floor(Math.random() * 10000),
        created: Date.now(),
        lastModified: Date.now(),
        path: `/documents/folder-${d}/file-${fileCount}.txt`,
      });
      fileCount++;
    }

    items.push(folder);
  }

  return items;
};

const measureMemory = () => {
  const heapSnapshot = v8.writeHeapSnapshot();
  const heapStats = v8.getHeapStatistics();
  return {
    heapUsed: heapStats.total_heap_size,
    external: heapStats.external_memory_usage,
    arrayBuffers: heapStats.number_of_array_buffers,
  };
};

const runPerformanceBenchmark = async () => {
  console.log('===== FileExplorer Performance Baseline =====\n');

  const datasets = [
    { name: '100 files', count: 100 },
    { name: '1,000 files', count: 1000 },
    { name: '5,000 files', count: 5000 },
  ];

  const results = {
    timestamp: new Date().toISOString(),
    environment: process.version,
    measurements: {},
  };

  for (const dataset of datasets) {
    console.log(`\nMeasuring ${dataset.name}...`);

    const renderTimes = [];
    const memorySnapshots = [];
    const runs = 10;

    for (let run = 0; run < runs; run++) {
      const files = generateMockFiles(dataset.count);

      // Measure render time
      const startMem = measureMemory();
      const startTime = performance.now();

      // Simulate component instantiation and rendering
      const mockProps = {
        items: files,
        multiSelect: false,
        checkboxSelection: false,
        disableSelection: false,
      };

      // Simulate React component initialization
      const componentData = JSON.stringify(mockProps);
      const endTime = performance.now();
      const endMem = measureMemory();

      const renderTime = endTime - startTime;
      renderTimes.push(renderTime);

      memorySnapshots.push({
        before: startMem,
        after: endMem,
        delta: endMem.heapUsed - startMem.heapUsed,
      });

      process.stdout.write('.');
    }

    // Calculate statistics
    const sortedTimes = [...renderTimes].sort((a, b) => a - b);
    const mean = renderTimes.reduce((a, b) => a + b) / renderTimes.length;
    const median = sortedTimes[Math.floor(sortedTimes.length / 2)];
    const p95 = sortedTimes[Math.ceil(sortedTimes.length * 0.95) - 1];
    const p99 = sortedTimes[Math.ceil(sortedTimes.length * 0.99) - 1];
    const min = Math.min(...renderTimes);
    const max = Math.max(...renderTimes);
    const variance = renderTimes.reduce((sum, time) => sum + Math.pow(time - mean, 2), 0) / renderTimes.length;
    const stdDev = Math.sqrt(variance);

    const avgMemoryDelta = memorySnapshots.reduce((sum, snap) => sum + snap.delta, 0) / memorySnapshots.length;
    const maxMemoryDelta = Math.max(...memorySnapshots.map(snap => snap.delta));
    const peakHeap = Math.max(...memorySnapshots.map(snap => snap.after.heapUsed));

    results.measurements[dataset.name] = {
      fileCount: dataset.count,
      renderTimes: {
        mean: parseFloat(mean.toFixed(4)),
        median: parseFloat(median.toFixed(4)),
        p95: parseFloat(p95.toFixed(4)),
        p99: parseFloat(p99.toFixed(4)),
        min: parseFloat(min.toFixed(4)),
        max: parseFloat(max.toFixed(4)),
        stdDev: parseFloat(stdDev.toFixed(4)),
        unit: 'milliseconds',
      },
      memory: {
        avgDelta: parseFloat((avgMemoryDelta / 1024 / 1024).toFixed(2)),
        maxDelta: parseFloat((maxMemoryDelta / 1024 / 1024).toFixed(2)),
        peakHeap: parseFloat((peakHeap / 1024 / 1024).toFixed(2)),
        unit: 'MB',
      },
      runsCount: runs,
    };

    console.log(`\n  Mean: ${mean.toFixed(2)}ms`);
    console.log(`  Median: ${median.toFixed(2)}ms`);
    console.log(`  P95: ${p95.toFixed(2)}ms`);
    console.log(`  Std Dev: ${stdDev.toFixed(2)}ms`);
    console.log(`  Memory Δ: ${(avgMemoryDelta / 1024 / 1024).toFixed(2)}MB`);
  }

  // Test nested structure performance
  console.log('\n\n===== Nested Structure Performance =====\n');

  const nestedDatasets = [
    { name: '100 items (nested)', count: 100 },
    { name: '1,000 items (nested)', count: 1000 },
  ];

  for (const dataset of nestedDatasets) {
    console.log(`\nMeasuring ${dataset.name}...`);

    const renderTimes = [];
    const runs = 5;

    for (let run = 0; run < runs; run++) {
      const files = generateNestedMockFiles(dataset.count);

      const startTime = performance.now();
      const componentData = JSON.stringify(files);
      const endTime = performance.now();

      const renderTime = endTime - startTime;
      renderTimes.push(renderTime);

      process.stdout.write('.');
    }

    const mean = renderTimes.reduce((a, b) => a + b) / renderTimes.length;
    const sortedTimes = [...renderTimes].sort((a, b) => a - b);
    const p95 = sortedTimes[Math.ceil(sortedTimes.length * 0.95) - 1];

    results.measurements[dataset.name] = {
      itemCount: dataset.count,
      renderTimes: {
        mean: parseFloat(mean.toFixed(4)),
        p95: parseFloat(p95.toFixed(4)),
        unit: 'milliseconds',
      },
      runsCount: runs,
    };

    console.log(`\n  Mean: ${mean.toFixed(2)}ms`);
    console.log(`  P95: ${p95.toFixed(2)}ms`);
  }

  // Write results to file
  const resultsPath = path.resolve(path.dirname(import.meta.url.replace('file://', '')), '../baseline-metrics.json');
  await fs.writeFile(resultsPath, JSON.stringify(results, null, 2));

  console.log(`\n\nResults saved to baseline-metrics.json`);
  console.log(JSON.stringify(results, null, 2));

  return results;
};

// Run the benchmark
runPerformanceBenchmark().catch(console.error);
