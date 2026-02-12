---
productId: video-validator
title: Video Validator
githubLabel: 'Video Validator'
packageName: '@stoked-ui/video-validator'
---

# Overview

<p class="description">Video rendering validation test harness with frame-by-frame comparison for verifying video output accuracy.</p>

{{"component": "modules/components/ComponentLinkHeader"}}

## Introduction

`@stoked-ui/video-validator` is a testing tool that validates video rendering output by comparing rendered frames against reference frames. It uses pixel-level comparison to detect visual regressions in video rendering pipelines.

## Installation

```bash
npm install @stoked-ui/video-validator
# or
pnpm add @stoked-ui/video-validator
```

## Features

- **Frame extraction** — Extract frames from video files at specified intervals
- **Pixel comparison** — Compare frames using configurable pixel matching with tolerance thresholds
- **Batch validation** — Validate multiple videos in a single run
- **Reporting** — Generate detailed HTML and JSON reports with visual diffs
- **CI integration** — Exit codes and machine-readable output for CI/CD pipelines

## Core classes

### VideoValidator

The main validator for single video comparisons.

```ts
import { VideoValidator } from '@stoked-ui/video-validator';

const validator = new VideoValidator({
  referenceVideo: './reference/output.mp4',
  testVideo: './test/output.mp4',
  threshold: 0.1,
  frameInterval: 1000, // ms
});

const result = await validator.validate();
console.log(result.passed ? 'PASS' : 'FAIL');
```

### BatchValidator

Run validation across multiple video pairs.

```ts
import { BatchValidator } from '@stoked-ui/video-validator';

const batch = new BatchValidator({
  pairs: [
    { reference: './ref/a.mp4', test: './test/a.mp4' },
    { reference: './ref/b.mp4', test: './test/b.mp4' },
  ],
  threshold: 0.1,
});

const results = await batch.validate();
```

### Reporter

Generate reports from validation results.

```ts
import { Reporter } from '@stoked-ui/video-validator';

const reporter = new Reporter(results);
await reporter.generateHtml('./reports/validation.html');
await reporter.generateJson('./reports/validation.json');
```

## What's next

- See the [CLI Usage](/video-validator/docs/cli-usage/) guide for command-line usage
- Check the [Roadmap](/video-validator/docs/roadmap/) for planned features
