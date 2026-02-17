# Video Compositor Benchmarks

This directory contains benchmarking tools for the video compositor library.

## Criterion Benchmarks (Rust)

The main benchmark suite is located in `../compositor/benches/frame_composition.rs` and uses Criterion.rs for accurate performance measurements.

### Running Benchmarks

```bash
cd ../compositor
cargo bench --bench frame_composition
```

### Benchmark Suites

1. **Simple Composition** - 3 layers at 1080p
2. **Complex Composition** - 10 layers with multiple blend modes at 1080p
3. **High Resolution** - 5 layers at 4K resolution
4. **Parallel Composition** - Batch processing of multiple frames
5. **Text Rendering** - 3 text layers with different font sizes
6. **Blend Modes** - Individual benchmarks for all 18 blend modes
7. **Effects Pipeline** - Benchmarks for blur, shadow, and color filter effects
8. **Animated Composition** - Keyframe animation resolution and composition
9. **Layer Count Scaling** - Performance scaling from 1 to 50 layers

### Benchmark Results

Results are saved in `../compositor/target/criterion/` with HTML reports.

## Browser Benchmarks (WASM vs Canvas)

Compare WASM compositor performance against native Canvas 2D API.

### Running Browser Benchmarks

1. Build the WASM module (if available):
   ```bash
   cd ../compositor
   wasm-pack build --target web
   ```

2. Open `wasm-vs-canvas.html` in a web browser

3. Click "Run Benchmark" to execute the test

### Benchmark Configuration

- **Resolution**: 1920x1080 (1080p)
- **Layers**: 10 solid color layers with various opacities
- **Iterations**: 100 frames per method

### Output Format

Results are provided in JSON format:

```json
{
  "wasm": {
    "avgMs": 12.345,
    "minMs": 10.123,
    "maxMs": 15.678,
    "fps": 81.00
  },
  "canvas": {
    "avgMs": 8.456,
    "minMs": 7.234,
    "maxMs": 10.123,
    "fps": 118.25
  }
}
```

## Regression Detection

The `check-regression.sh` script automatically detects performance regressions.

### Usage

```bash
./check-regression.sh
```

### How It Works

1. Runs the full benchmark suite using `cargo bench`
2. Compares results against baseline (stored in `baseline.json`)
3. Flags any regressions > 10%
4. Offers to update baseline if no regressions detected

### First Run

On the first run, no baseline exists. The script will create one automatically:

```bash
./check-regression.sh
# Output: "No baseline file found. Creating new baseline..."
```

### Interpreting Results

- **IMPROVEMENT**: Performance improved by > 10%
- **STABLE**: Performance change within ±10%
- **REGRESSION**: Performance degraded by > 10% (flags warning)

### Baseline Format

The baseline is stored in `baseline.json`:

```json
{
  "simple_composition_3_layers_1080p": 1234567,
  "complex_composition_10_layers_1080p": 2345678,
  ...
}
```

Values are in nanoseconds per iteration.

## CI/CD Integration

To integrate regression detection in CI:

```yaml
- name: Run benchmarks and check for regressions
  run: |
    cd packages/sui-video-renderer/benchmark
    ./check-regression.sh
```

The script exits with code 1 if regressions are detected, failing the CI build.

## Notes

- Benchmarks should be run on a quiet system with consistent load
- Results can vary between machines - use the same machine for comparisons
- The regression threshold (10%) can be adjusted in `check-regression.sh`
- Browser benchmarks require a modern browser with Canvas 2D support
- WASM benchmarks are optional and gracefully degrade if WASM is not built
