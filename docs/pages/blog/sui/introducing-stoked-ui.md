---
title: Introducing Stoked UI
description: An open-source React component library featuring a File Explorer, Timeline, and Editor with professional media capabilities.
date: 2026-02-19T00:00:00.000Z
authors: ['brianstoker']
tags: ['Stoked UI', 'Announcement']
manualCard: false
---

Stoked UI is an open-source React component library built to bring professional-grade media and content management tools to the web. Designed as a complement to the broader MUI ecosystem, Stoked UI focuses on the unique challenges of building rich, interactive applications that involve file management, video editing, and timeline-based workflows. Whether you're building a digital asset manager, a video production platform, or a collaborative content editor, Stoked UI provides the foundational components you need to get started quickly without sacrificing flexibility or control.

## What Is Stoked UI?

At its core, Stoked UI is a collection of React components and hooks purpose-built for media-centric applications. The library is designed with the same attention to accessibility, customization, and developer experience that MUI users have come to expect, while extending that foundation into domains that require more specialized tooling. Stoked UI components follow a consistent API surface, support theming via MUI's `ThemeProvider`, and are fully written in TypeScript so you get first-class type safety and IDE autocompletion out of the box.

The library is structured as a monorepo with individually installable packages, meaning you can adopt only the components you need without pulling in unnecessary dependencies. Each package is independently versioned and documented, making it easy to integrate Stoked UI into an existing project incrementally.

## Key Components

**File Explorer** (`@stoked-ui/file-explorer`) is a fully featured, tree-based file browser component. It supports nested directories, drag-and-drop reorganization, multi-select, inline renaming, and a rich set of keyboard shortcuts. The File Explorer is deeply customizable — you can swap out icons, slot in custom item renderers, and hook into selection and expansion events to build fully bespoke file management experiences.

**Timeline** (`@stoked-ui/timeline`) is a frame-accurate, multi-track timeline editor designed for constructing time-based compositions. Tracks can contain media clips, text overlays, audio layers, and effect segments. The Timeline component exposes a clean imperative API for programmatic manipulation alongside a fully interactive drag-and-drop UI, making it suitable for both user-facing editors and automated composition pipelines.

**Editor** (`@stoked-ui/editor`) brings together the File Explorer and Timeline into a unified creative workspace. The Editor component is a full-featured, browser-based video and media editor that lets users import assets, arrange them on a timeline, apply basic effects, and export the result. It is designed to be embeddable in any React application with a single component import, and its extensible plugin architecture allows teams to add custom tools, panels, and export targets without forking the core library.

## Getting Started

Installing Stoked UI is straightforward. Start by adding the packages you need:

```bash
npm install @stoked-ui/file-explorer @stoked-ui/timeline @stoked-ui/editor
```

Wrap your application with the standard MUI `ThemeProvider` and you can immediately begin using Stoked UI components:

```tsx
import * as React from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { FileExplorer } from '@stoked-ui/file-explorer';

const theme = createTheme();

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <FileExplorer
        items={[
          { id: '1', label: 'Documents', children: [{ id: '2', label: 'report.pdf' }] },
          { id: '3', label: 'Images' },
        ]}
      />
    </ThemeProvider>
  );
}
```

Full documentation, live demos, and API references are available at [stokedconsulting.com](https://stokedconsulting.com). The source code is hosted on GitHub and contributions are very welcome — whether that's reporting bugs, proposing features, or submitting pull requests. We are excited to build this library in the open and look forward to growing a community around it. Stay tuned for upcoming announcements on new components, integrations, and the roadmap for Stoked UI v2.
