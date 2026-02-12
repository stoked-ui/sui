---
productId: media
title: MediaFile
githubLabel: 'MediaFile'
packageName: '@stoked-ui/media'
---

# MediaFile

<p class="description">Enhanced file handling class with automatic metadata extraction for images, video, and audio files.</p>

{{"component": "modules/components/ComponentLinkHeader"}}

## Introduction

`MediaFile` extends the standard browser `File` API with additional path data and type-specific metadata. It automatically detects the media type and extracts relevant information such as dimensions, duration, and codec details.

## Usage

### Creating a MediaFile from input

```tsx
import { MediaFile } from '@stoked-ui/media';

const input = document.getElementById('myInput');
input.addEventListener('change', async (evt) => {
  const files = await MediaFile.from(evt);
  console.log(files);
});
```

### Creating from a drop event

```tsx
import { MediaFile } from '@stoked-ui/media';

const dropTarget = document.getElementById('dropZone');
dropTarget.addEventListener('drop', async (evt) => {
  evt.preventDefault();
  const files = await MediaFile.from(evt);
  files.forEach((file) => {
    console.log(file.name, file.type, file.path);
  });
});
```

### WebFile for persistent storage

```tsx
import { WebFile, WebFileFactory } from '@stoked-ui/media';

// Create a WebFile from a standard File
const webFile = WebFileFactory.create(standardFile, {
  persist: true,
});

// Access file metadata
console.log(webFile.mediaType);
console.log(webFile.metadata);
```

## API

### MediaFile

| Property | Type | Description |
|----------|------|-------------|
| `name` | `string` | File name |
| `path` | `string` | File path (when available) |
| `type` | `string` | MIME type |
| `size` | `number` | File size in bytes |
| `mediaType` | `MediaType` | Detected media type category |

### Static Methods

| Method | Description |
|--------|-------------|
| `MediaFile.from(event)` | Create MediaFile instances from input change or drop events |
