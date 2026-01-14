---
productId: editor
title: Customize
---

# Customize

<p class="description">Customize the Editor component appearance and behavior.</p>

## Overview

The Editor component offers extensive customization options through props, theming, and styling to match your application's design system.

## Theme Customization

### Using MUI Theme

Customize the Editor using MUI's theming system:

```jsx
import { createTheme, ThemeProvider } from '@mui/material/styles';

const theme = createTheme({
  components: {
    MuiEditor: {
      styleOverrides: {
        root: {
          backgroundColor: '#1e1e1e',
          color: '#ffffff',
        },
        timeline: {
          backgroundColor: '#2d2d2d',
        },
        track: {
          borderColor: '#404040',
        },
      },
    },
  },
});

<ThemeProvider theme={theme}>
  <Editor />
</ThemeProvider>
```

## Style Overrides

### Using sx Prop

Apply custom styles directly:

```jsx
<Editor
  sx={{
    height: '100%',
    '& .MuiEditor-timeline': {
      backgroundColor: 'background.default',
    },
    '& .MuiEditor-track': {
      minHeight: 60,
    },
    '& .MuiEditor-action': {
      borderRadius: 2,
    },
  }}
/>
```

### Custom Class Names

Apply custom CSS classes:

```jsx
<Editor
  className="custom-editor"
  classes={{
    timeline: 'custom-timeline',
    track: 'custom-track',
    action: 'custom-action',
  }}
/>
```

## Layout Customization

### Panel Visibility

Control which panels are visible:

```jsx
<Editor
  fileView={true}        // Show file explorer
  labels={true}          // Show track labels
  controls={true}        // Show playback controls
  preview={true}         // Show preview area
/>
```

### Panel Sizes

Customize panel dimensions:

```jsx
<Editor
  fileViewWidth={300}    // File explorer width
  labelWidth={150}       // Track label width
  previewHeight={400}    // Preview area height
  timelineHeight={200}   // Timeline height
/>
```

## Color Schemes

### Dark Mode

```jsx
<Editor
  sx={{
    colorScheme: 'dark',
    '& .MuiEditor-root': {
      backgroundColor: '#1a1a1a',
    },
  }}
/>
```

### Light Mode

```jsx
<Editor
  sx={{
    colorScheme: 'light',
    '& .MuiEditor-root': {
      backgroundColor: '#ffffff',
    },
  }}
/>
```

## Custom Components

Replace default components with custom implementations:

```jsx
<Editor
  components={{
    Timeline: CustomTimeline,
    Track: CustomTrack,
    Action: CustomAction,
    FileExplorer: CustomFileExplorer,
  }}
/>
```

## Icons and Assets

Customize icons and visual elements:

```jsx
<Editor
  icons={{
    play: <CustomPlayIcon />,
    pause: <CustomPauseIcon />,
    stop: <CustomStopIcon />,
  }}
/>
```

## Best Practices

- Use theme tokens for consistent styling
- Avoid inline styles for better performance
- Test customizations across different screen sizes
- Maintain accessibility when customizing colors
- Document custom styles for team collaboration
