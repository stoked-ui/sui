---
title: Video Renderer Overview
productId: video-renderer
---

# Video Renderer

<p class="description">High-performance video composition and rendering system with Rust backend and WASM frontend preview capabilities.</p>

## Introduction

The Stoked UI Video Renderer is a hybrid architecture combining:

- **Rust Backend** - Lightning-fast frame composition (10-50x faster than Node.js)
- **WASM Preview** - Real-time browser preview at 60 FPS
- **Node.js Integration** - Seamless integration with existing infrastructure
- **FFmpeg Pipeline** - Professional video encoding

## Key Features

### 🚀 Performance

- **10-50x faster** than Node.js-based solutions
- **50-70% less memory** usage
- Process **1000+ frames/minute** at 1080p
- Sustained **60 FPS preview** in the browser

### 🎨 Composition Features

- Multi-layer composition with z-indexing
- 8 blend modes (normal, multiply, screen, overlay, add, subtract, lighten, darken)
- Transform operations (position, scale, rotation, opacity)
- Effects (blur, brightness, contrast, saturation, hue rotate)
- Parallel frame processing

### 🌐 Deployment Options

- **Server-side**: Rust CLI integrated with NestJS
- **Browser**: WASM module for instant preview
- **Hybrid**: Best of both worlds

## Architecture

```
┌─────────────────────────────────────────┐
│         Frontend (Browser)              │
│  ┌───────────────────────────────────┐  │
│  │  React Video Editor UI            │  │
│  └───────────────┬───────────────────┘  │
│                  │                       │
│  ┌───────────────▼───────────────────┐  │
│  │  WASM Preview Renderer            │  │
│  │  • 60 FPS real-time preview       │  │
│  │  • ~95KB gzipped bundle           │  │
│  └───────────────────────────────────┘  │
└─────────────────┬───────────────────────┘
                  │ Export request
                  ▼
┌─────────────────────────────────────────┐
│         Backend (Server)                │
│  ┌───────────────────────────────────┐  │
│  │  NestJS API Gateway               │  │
│  │  • Job queue (Bull + Redis)       │  │
│  │  • MongoDB persistence            │  │
│  └───────────────┬───────────────────┘  │
│                  │                       │
│  ┌───────────────▼───────────────────┐  │
│  │  Rust Rendering Engine            │  │
│  │  • Frame composition              │  │
│  │  • 10-50x faster than Node.js     │  │
│  └───────────────┬───────────────────┘  │
│                  │                       │
│  ┌───────────────▼───────────────────┐  │
│  │  FFmpeg Video Encoder             │  │
│  │  • H.264/H.265 encoding           │  │
│  │  • Audio mixing                   │  │
│  └───────────────────────────────────┘  │
└─────────────────────────────────────────┘
```

## Use Cases

### Video Editing SaaS

Real-time preview in browser + high-quality server-side rendering

### Social Media Content

Fast turnaround for user-generated content with effects and overlays

### Marketing Automation

Template-based video generation at scale

### Educational Platforms

Interactive video creation with live preview

## Quick Start

```bash
# Install Rust (if not already installed)
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# Clone and build
cd packages/sui-video-renderer-rust/compositor
cargo build --release

# Run benchmarks
cargo bench
```

## Performance Comparison

| Scenario | Node.js | Rust | Speedup |
|----------|---------|------|---------|
| Simple (3 layers, 1080p) | 45ms | 4ms | **11x** |
| Complex (10 layers, 1080p) | 120ms | 12ms | **10x** |
| High-res (5 layers, 4K) | 280ms | 25ms | **11x** |

## Getting Started

Choose your integration path:

- [Rust Backend Examples](/video-renderer/rust-backend/) - Server-side high-performance rendering
- [WASM Frontend Examples](/video-renderer/wasm-frontend/) - Browser-based real-time preview
- [Node.js Integration](/video-renderer/nodejs-integration/) - Integrate with existing infrastructure
- [API Reference](/video-renderer/api-reference/) - Complete API documentation

## Installation

```bash
# For Rust backend
cargo add video-compositor

# For WASM frontend
npm install @stoked-ui/wasm-preview

# For Node.js integration
npm install @stoked-ui/video-renderer
```

## Community & Support

- [GitHub Repository](https://github.com/stokedconsulting/stoked-ui)
- [Discord Community](https://discord.gg/stoked-ui)
- [Stack Overflow](https://stackoverflow.com/questions/tagged/stoked-ui)

## What's Next?

- Explore [Rust Backend Examples](/video-renderer/rust-backend/)
- Try the [WASM Preview Demo](/video-renderer/wasm-frontend/)
- Read the [Quick Start Guide](/video-renderer/quick-start/)
