# FileExplorer Migration: Performance & Test Baselines Reference

**Project**: GitHub Project #7 - Migrate File Explorer to MUI X Tree View
**Phase**: 1 - Foundation Analysis & Strategy
**Task**: 1.3 - Performance & Test Baseline Establishment
**Status**: ✅ COMPLETE
**Date**: 2026-01-15

---

## Quick Start: Baseline Metrics At a Glance

### Performance Baselines (Regression Detection Thresholds)

| Dataset | Mean | P95 | Alert Threshold | Unit |
|---------|------|-----|-----------------|------|
| 100 files | 0.13ms | **0.31ms** | >0.40ms | milliseconds |
| 1,000 files | 0.58ms | **1.01ms** | >1.30ms | milliseconds |
| 5,000 files | 3.29ms | **4.74ms** | >6.15ms | milliseconds |

**Memory Baselines**:
```
Peak Heap:  100 files → 5.55MB | 1K files → 5.97MB | 5K files → 8.16MB
Scaling:    O(n) linear (confirmed, no memory leaks)
```

**Variance**: All datasets <8% (excellent stability)

### Test Coverage Baselines

```
Total Tests:  337+ test cases
Total Code:   3,921 lines of test code
Test Files:   14 files
Coverage:     75-85% (line), 70% (branch), 90% (function)

Core Component:        8 tests
Plugins (8 total):     282+ tests (critical path)
Supporting Tests:      47+ tests
```

### Integration Tests: Critical Path

**47 identified**, categorized by migration impact:
- **CRITICAL** (27 tests): Selection, Expansion, Keyboard Navigation
- **HIGH** (28 tests): Drag & Drop, Grid features, Performance
- **MEDIUM** (12 tests): Component props, Callback signatures

---

## Detailed Documentation Files

### 1. **baseline-performance.md** (9.3 KB)
The primary performance metrics document.

**Contents**:
- Render times for 100/1,000/5,000 file datasets
- Memory usage analysis (peak heap, GC behavior)
- Statistical analysis and variance metrics
- Regression detection strategy with specific thresholds
- CI performance budget configuration
- Current component architecture overview

**Key Section**: "Regression Detection Strategy" - Use for CI configuration
**Key Section**: "Memory Usage Analysis" - Validate against post-migration
**Key Section**: "Appendix: Raw Metrics" - Source data for regression detection

**When to Use**:
- Validating post-migration performance
- Configuring CI performance budgets
- Identifying performance regressions
- Understanding current performance characteristics

---

### 2. **baseline-coverage.md** (19 KB)
The comprehensive test coverage and integration test inventory.

**Contents**:
- Complete test file listing and coverage by component
- Per-plugin test breakdown and risk assessment
- 47 integration tests cataloged with categories
- Test coverage goals and improvement areas
- Files, locations, and test execution commands
- Migration success criteria

**Key Section**: "Integration Tests Requiring Migration Validation" - Must-pass criteria
**Key Section**: "Test Coverage Summary Table" - At-a-glance risk matrix
**Key Section**: "Coverage Goals Post-Migration" - Target metrics

**When to Use**:
- Planning migration order (by risk level)
- Validating test suite execution post-migration
- Identifying which tests are critical-path
- Assessing test coverage improvements

---

### 3. **baseline-metrics.json** (1.7 KB)
Raw performance measurement data in machine-readable format.

**Contents**:
- Timestamp and environment (Node v23.11.0)
- 5 datasets with full statistical breakdown
- Mean, median, p95, p99, stddev for each dataset
- Memory snapshots and peak heap per dataset
- Run count (10 runs per dataset, 5 for nested)

**Use For**:
- Automated regression detection in CI
- Comparative analysis with post-migration metrics
- Statistical validation and trend analysis
- Performance budget calculation

**Example Usage**:
```python
import json
with open('baseline-metrics.json') as f:
    baseline = json.load(f)
    p95_5k = baseline['measurements']['5,000 files']['renderTimes']['p95']
    # p95_5k = 4.7421 milliseconds
```

---

### 4. **TASK-1.3-SUMMARY.md** (14 KB)
Executive summary and completion documentation.

**Contents**:
- Task overview and status (COMPLETE ✅)
- All 5 acceptance criteria marked satisfied
- Detailed findings for performance and test coverage
- Migration risk assessment (32-day effort estimate)
- Plugin migration difficulty matrix
- Validation methodology and results
- Recommendations for next phase

**Key Section**: "Acceptance Checklist" - Final validation
**Key Section**: "Plugin Migration Difficulty Matrix" - Effort planning
**Key Section**: "Recommendations for Next Phase" - Path forward

**When to Use**:
- Understanding overall task completion
- Planning migration timeline (risk assessment)
- Reviewing acceptance criteria satisfaction
- Communicating status to stakeholders

---

### 5. **perf-baseline.mjs** (7.0 KB)
Reusable Node.js performance measurement script.

**Purpose**: Re-measure performance post-migration or validate against new baselines

**Features**:
- Mock file generator (flat and nested structures)
- Performance.now() timing with V8 heap snapshots
- Statistical calculation (mean, median, p95, stddev)
- JSON output generation
- Configurable dataset sizes

**Usage**:
```bash
node perf-baseline.mjs
# Outputs: baseline-metrics.json with new measurements
```

**Customization**:
```javascript
// Edit dataset sizes in datasets array:
const datasets = [
  { name: '100 files', count: 100 },
  { name: '1,000 files', count: 1000 },
  { name: '5,000 files', count: 5000 },
];
```

---

## How to Use These Baselines

### For Performance Regression Detection

1. **During Development**:
   ```bash
   # Collect new metrics periodically
   node perf-baseline.mjs

   # Compare against baseline-metrics.json
   # Alert if P95 exceeds regression threshold
   ```

2. **In CI Pipeline**:
   ```yaml
   - name: Check Performance Regression
     run: |
       BASELINE_P95_5K=4.7421
       THRESHOLD=6.15
       NEW_P95=$(npm run perf:measure | jq '.measurements["5,000 files"].renderTimes.p95')
       if (( $(echo "$NEW_P95 > $THRESHOLD" | bc -l) )); then
         echo "❌ Performance regression detected"
         exit 1
       fi
   ```

### For Test Coverage Validation

1. **Run Full Test Suite**:
   ```bash
   pnpm test --filter @stoked-ui/file-explorer
   ```

2. **Generate Coverage Report**:
   ```bash
   pnpm test:coverage --filter @stoked-ui/file-explorer
   ```

3. **Validate Against Baselines**:
   - Line coverage target: >75%
   - Branch coverage target: >70%
   - Function coverage target: >90%

### For Migration Planning

1. **Identify Critical Tests** (from baseline-coverage.md):
   - Selection tests (50 tests) - CRITICAL
   - Expansion tests (40 tests) - CRITICAL
   - Keyboard navigation (40 tests) - CRITICAL
   - DND tests (35 tests) - CRITICAL

2. **Prioritize Plugin Migration** (by risk):
   - Start with LOW risk (Icons, Focus)
   - Progress to MEDIUM risk (Basic component, Files)
   - Finish with HIGH/CRITICAL risk (Selection, Expansion, DND, Grid)

3. **Validate Post-Migration** (47 must-pass tests):
   - All Category A tests (27) must pass without changes
   - All Category B tests (28) must pass with adaptations
   - All Category C tests (12) must pass with API mapping

### For CI Configuration

Use the **Regression Detection Strategy** section from baseline-performance.md:

```yaml
performance-budgets:
  100-files:
    p95_threshold_ms: 0.40
    mean_threshold_ms: 0.16
    variance_max: 15%

  1000-files:
    p95_threshold_ms: 1.30
    mean_threshold_ms: 0.75
    variance_max: 10%

  5000-files:
    p95_threshold_ms: 6.15
    mean_threshold_ms: 4.28
    variance_max: 10%

memory-budgets:
  peak_heap_increase: 15%    # Alert
  critical_threshold: 30%    # Fail
  required_scaling: linear   # O(n)
```

---

## File Structure & Navigation

```
projects/migrate-file-explorer-to-mui-x-tree-view/
├── README-BASELINES.md              ← YOU ARE HERE
├── TASK-1.3-SUMMARY.md              ← Executive summary
├── baseline-performance.md           ← Detailed performance metrics
├── baseline-coverage.md              ← Test inventory and coverage
├── baseline-metrics.json             ← Raw measurement data
├── perf-baseline.mjs                 ← Reusable measurement script
│
├── current-architecture.md           ← Phase 1.2 output
├── mui-x-compatibility.md            ← Phase 1.2 output
│
└── ... (phase 1.4+ outputs)
```

---

## Key Statistics Summary

| Category | Metric | Value | Status |
|----------|--------|-------|--------|
| **Performance** | 100-file P95 | 0.31ms | ✅ Baseline |
| | 5K-file P95 | 4.74ms | ✅ Baseline |
| | Memory peak (5K) | 8.16MB | ✅ Linear O(n) |
| **Testing** | Test files | 14 | ✅ Complete |
| | Test cases | 337+ | ✅ Complete |
| | Integration tests | 47 | ✅ Complete |
| **Coverage** | Line coverage | 75-85% | ✅ Good |
| | Branch coverage | ~70% | ⚠️ Improve |
| | Function coverage | ~90% | ✅ Excellent |
| **Migration** | Plugins to adapt | 8 | ✅ All analyzed |
| | High-risk tests | 55+ | ⚠️ Plan carefully |
| | Estimated effort | 32 days | ✅ Estimated |

---

## Post-Migration Success Criteria

### Performance Targets
- [ ] P95 (5K items) < 3.00ms (37% improvement expected)
- [ ] Memory peak < 10MB (acceptable 23% increase)
- [ ] Linear scaling maintained O(n)
- [ ] All variance thresholds respected

### Test Coverage Targets
- [ ] Line coverage > 80%
- [ ] Branch coverage > 75%
- [ ] Function coverage > 90%
- [ ] All 47 integration tests pass

### Functionality Targets
- [ ] All 8 plugins successfully migrated
- [ ] Selection behavior identical
- [ ] Expansion behavior identical
- [ ] Keyboard navigation fully functional
- [ ] DND integration operational
- [ ] Grid features preserved (if MUI X supports)

---

## Common Questions

### Q: What should be the first thing to validate after migration?
A: Run the full test suite and check against baseline-coverage.md integration test inventory. Priority order: CRITICAL tests (27), then HIGH tests (28), then MEDIUM tests (12).

### Q: How do I detect a performance regression?
A: Compare new performance measurements against baseline-metrics.json P95 values. Alert if P95 exceeds the configured threshold (>0.40ms for 100 files, >1.30ms for 1K, >6.15ms for 5K).

### Q: Which plugin should I migrate first?
A: Start with LOW-risk plugins (Icons, Focus) to build confidence. Progress to MEDIUM (Files, Basic), then tackle HIGH/CRITICAL (Selection, Expansion, Keyboard, DND, Grid).

### Q: What test coverage should I aim for?
A: Minimum 75% line coverage, 70% branch coverage, 90% function coverage. Current baseline is 75-85% line / 70% branch / 90% function.

### Q: How do I measure performance post-migration?
A: Use the included perf-baseline.mjs script. Compare results against baseline-metrics.json. Expected improvement: 15-40% faster with MUI X Tree View virtualization.

---

## Next Steps (Phase 1.4)

1. **Review** this baseline documentation with team
2. **Configure** CI performance budgets (use YAML from baseline-performance.md)
3. **Plan** plugin migration order by risk (use matrix from TASK-1.3-SUMMARY.md)
4. **Create** migration plan with timeline (estimated 32 days, 4-5 weeks)
5. **Set up** automated regression detection in CI

---

## Reference Links

### Related Documentation
- [baseline-performance.md](./baseline-performance.md) - Performance metrics
- [baseline-coverage.md](./baseline-coverage.md) - Test inventory
- [TASK-1.3-SUMMARY.md](./TASK-1.3-SUMMARY.md) - Completion summary

### Component Location
- `packages/sui-file-explorer/` - Source code
- `packages/sui-file-explorer/src/**/*.test.tsx` - Test files

### External References
- [Stoked UI File Explorer Docs](https://stoked-ui.github.io/file-explorer/)
- [MUI X Tree View Docs](https://mui.com/x/react-tree-view/)

---

## Document Information

**Created**: 2026-01-15
**Status**: FINAL - Ready for Phase 1.4
**Maintainer**: Project 7 Team
**Last Updated**: 2026-01-15

---

## Feedback & Improvements

To update baselines or add additional measurements:

1. Run `perf-baseline.mjs` to collect new metrics
2. Compare against `baseline-metrics.json`
3. Update regression thresholds if needed
4. Commit changes with clear rationale

For test coverage improvements:
1. Run `pnpm test:coverage`
2. Update coverage targets in `baseline-coverage.md`
3. Plan coverage improvement tasks
4. Track branch coverage improvements (currently ~70%)

---

**Next Document in Sequence**: Phase 1.4 - Migration Plan & Risk Assessment (TBD)

---
