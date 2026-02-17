/**
 * WASM vs Canvas 2D Benchmark
 * Compares performance of compositing 10 solid color layers at 1080p
 */

let benchmarkResults = null;
let wasmModule = null;

// Layer configuration for benchmarking
const LAYER_CONFIG = [
    { color: [50, 50, 50, 255], x: 0, y: 0, width: 1920, height: 1080, opacity: 1.0 },
    { color: [255, 0, 0, 255], x: 100, y: 100, width: 800, height: 600, opacity: 0.8 },
    { color: [0, 255, 0, 255], x: 200, y: 200, width: 700, height: 500, opacity: 0.7 },
    { color: [0, 0, 255, 255], x: 300, y: 300, width: 600, height: 400, opacity: 0.6 },
    { color: [255, 255, 0, 255], x: 400, y: 400, width: 500, height: 300, opacity: 0.5 },
    { color: [255, 0, 255, 255], x: 500, y: 500, width: 400, height: 250, opacity: 0.4 },
    { color: [0, 255, 255, 255], x: 600, y: 600, width: 300, height: 200, opacity: 0.3 },
    { color: [128, 128, 128, 255], x: 700, y: 700, width: 250, height: 150, opacity: 0.25 },
    { color: [200, 100, 50, 255], x: 800, y: 800, width: 200, height: 100, opacity: 0.2 },
    { color: [100, 200, 150, 255], x: 900, y: 900, width: 150, height: 80, opacity: 0.15 }
];

const ITERATIONS = 100;

/**
 * Show status message
 */
function showStatus(message, type = 'running') {
    const statusDiv = document.getElementById('status');
    statusDiv.className = `status ${type}`;
    statusDiv.textContent = message;
    statusDiv.style.display = 'block';
}

/**
 * Hide status message
 */
function hideStatus() {
    document.getElementById('status').style.display = 'none';
}

/**
 * Benchmark Canvas 2D rendering
 */
async function benchmarkCanvas() {
    const canvas = document.getElementById('benchCanvas');
    const ctx = canvas.getContext('2d');
    const times = [];

    for (let i = 0; i < ITERATIONS; i++) {
        const startTime = performance.now();

        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Render each layer
        for (const layer of LAYER_CONFIG) {
            ctx.globalAlpha = layer.opacity;
            ctx.fillStyle = `rgba(${layer.color[0]}, ${layer.color[1]}, ${layer.color[2]}, ${layer.color[3] / 255})`;
            ctx.fillRect(layer.x, layer.y, layer.width, layer.height);
        }

        const endTime = performance.now();
        times.push(endTime - startTime);

        // Allow UI to update periodically
        if (i % 10 === 0) {
            await new Promise(resolve => setTimeout(resolve, 0));
        }
    }

    return calculateStats(times);
}

/**
 * Benchmark WASM compositor rendering
 */
async function benchmarkWasm() {
    // Check if WASM module is available
    if (!wasmModule) {
        try {
            // Try to load WASM module (this would be the actual path to the built WASM)
            // For now, we'll simulate it not being available
            throw new Error('WASM module not loaded');
        } catch (error) {
            console.warn('WASM module not available:', error.message);
            return null;
        }
    }

    const times = [];

    for (let i = 0; i < ITERATIONS; i++) {
        const startTime = performance.now();

        // Call WASM compositor
        // This is a placeholder - actual implementation would call the WASM module
        // wasmModule.compose(LAYER_CONFIG);

        const endTime = performance.now();
        times.push(endTime - startTime);

        // Allow UI to update periodically
        if (i % 10 === 0) {
            await new Promise(resolve => setTimeout(resolve, 0));
        }
    }

    return calculateStats(times);
}

/**
 * Calculate statistics from timing array
 */
function calculateStats(times) {
    const avgMs = times.reduce((a, b) => a + b, 0) / times.length;
    const minMs = Math.min(...times);
    const maxMs = Math.max(...times);
    const fps = 1000 / avgMs;

    return {
        avgMs: parseFloat(avgMs.toFixed(3)),
        minMs: parseFloat(minMs.toFixed(3)),
        maxMs: parseFloat(maxMs.toFixed(3)),
        fps: parseFloat(fps.toFixed(2))
    };
}

/**
 * Display results in the UI
 */
function displayResults(canvasResults, wasmResults) {
    const resultsContainer = document.getElementById('resultsContainer');
    resultsContainer.style.display = 'block';

    // Canvas results
    document.getElementById('canvasAvg').textContent = `${canvasResults.avgMs} ms`;
    document.getElementById('canvasMin').textContent = `${canvasResults.minMs} ms`;
    document.getElementById('canvasMax').textContent = `${canvasResults.maxMs} ms`;
    document.getElementById('canvasFps').textContent = `${canvasResults.fps} fps`;

    // WASM results
    if (wasmResults) {
        document.getElementById('wasmAvg').textContent = `${wasmResults.avgMs} ms`;
        document.getElementById('wasmMin').textContent = `${wasmResults.minMs} ms`;
        document.getElementById('wasmMax').textContent = `${wasmResults.maxMs} ms`;
        document.getElementById('wasmFps').textContent = `${wasmResults.fps} fps`;

        // Determine winner
        const canvasBox = document.getElementById('canvasBox');
        const wasmBox = document.getElementById('wasmBox');
        canvasBox.classList.remove('winner');
        wasmBox.classList.remove('winner');

        if (wasmResults.avgMs < canvasResults.avgMs) {
            wasmBox.classList.add('winner');
        } else {
            canvasBox.classList.add('winner');
        }
    } else {
        document.getElementById('wasmAvg').textContent = 'N/A (WASM not built)';
        document.getElementById('wasmMin').textContent = 'N/A';
        document.getElementById('wasmMax').textContent = 'N/A';
        document.getElementById('wasmFps').textContent = 'N/A';
        document.getElementById('canvasBox').classList.add('winner');
    }

    // Build results object
    benchmarkResults = {
        wasm: wasmResults || { avgMs: null, minMs: null, maxMs: null, fps: null },
        canvas: canvasResults
    };

    // Display JSON
    document.getElementById('jsonOutput').textContent = JSON.stringify(benchmarkResults, null, 2);
}

/**
 * Run the benchmark
 */
async function runBenchmark() {
    const runBtn = document.getElementById('runBtn');
    runBtn.disabled = true;

    try {
        showStatus('Warming up...', 'running');
        await new Promise(resolve => setTimeout(resolve, 500));

        showStatus(`Running Canvas 2D benchmark (${ITERATIONS} iterations)...`, 'running');
        const canvasResults = await benchmarkCanvas();

        showStatus(`Running WASM benchmark (${ITERATIONS} iterations)...`, 'running');
        const wasmResults = await benchmarkWasm();

        displayResults(canvasResults, wasmResults);

        if (wasmResults) {
            showStatus('Benchmark complete!', 'success');
        } else {
            showStatus('Benchmark complete! (WASM module not available - Canvas 2D results only)', 'success');
        }

        console.log('Benchmark Results:', benchmarkResults);

    } catch (error) {
        showStatus(`Error: ${error.message}`, 'error');
        console.error('Benchmark error:', error);
    } finally {
        runBtn.disabled = false;
    }
}

/**
 * Export results as JSON file
 */
function exportResults() {
    if (!benchmarkResults) {
        alert('Please run the benchmark first');
        return;
    }

    const dataStr = JSON.stringify(benchmarkResults, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);

    const link = document.createElement('a');
    link.href = url;
    link.download = `benchmark-results-${new Date().toISOString()}.json`;
    link.click();

    URL.revokeObjectURL(url);
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    console.log('Benchmark page loaded. Click "Run Benchmark" to start.');
    console.log('Configuration:', {
        iterations: ITERATIONS,
        layers: LAYER_CONFIG.length,
        resolution: '1920x1080'
    });
});
