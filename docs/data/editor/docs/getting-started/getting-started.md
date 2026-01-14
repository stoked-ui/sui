---
productId: editor
title: Getting Started
---

# Getting Started with the Editor

<p class="description">Learn how to install and use the Editor component in your React application.</p>

## Installation

Install the package in your project directory with:

```bash
npm install @stoked-ui/editor
```

or with pnpm:

```bash
pnpm add @stoked-ui/editor
```

The Editor component requires the following peer dependencies:

```bash
npm install @mui/material @emotion/react @emotion/styled
```

## Quick Start

Here's a basic example to get you started:

```jsx
import * as React from 'react';
import { Editor, EditorProvider, Controllers } from '@stoked-ui/editor';

function App() {
  return (
    <div style={{ height: '600px', width: '100%' }}>
      <EditorProvider controllers={Controllers}>
        <Editor />
      </EditorProvider>
    </div>
  );
}

export default App;
```

## Basic Usage

The Editor component must be wrapped in an `EditorProvider` to function properly:

```jsx
import { Editor, EditorProvider, Controllers } from '@stoked-ui/editor';

<EditorProvider controllers={Controllers}>
  <Editor
    fileView={true}
    labels={true}
  />
</EditorProvider>
```

### Key Props

- `fileView` - Shows the file explorer panel
- `labels` - Displays track labels in the timeline
- `minimal` - Enables a simplified editor interface
- `fullscreen` - Displays the editor in fullscreen mode

## Next Steps

- Explore the [Editor component](/editor/components/editor/) for detailed usage examples
- Learn about [customization options](/editor/docs/customize/)
- Check out the [API reference](/editor/docs/api/editor-group/)
