# @stoked-ui/media-selector

A versatile media selection component for the Stoked UI ecosystem that simplifies file handling, media selection, and file system interactions in web applications.

## Features

- 📁 Easy file and media selection with customizable filters
- 📦 Zip file creation and extraction utilities
- 🌐 Modern Web File System API support
- 🔄 Type-safe abstract classes for consistent file handling
- 📱 Responsive design that integrates with MUI components

## Installation

```bash
npm install @stoked-ui/media-selector @stoked-ui/common

# or with yarn
yarn add @stoked-ui/media-selector @stoked-ui/common

# or with pnpm
pnpm add @stoked-ui/media-selector @stoked-ui/common
```

## Usage

### Basic Example

```tsx
import * as React from 'react';
import { useState } from 'react';
import { Box, Button, Typography } from '@mui/material';
import { MediaFile } from '@stoked-ui/media-selector';

function BasicExample() {
  const [selectedFiles, setSelectedFiles] = useState<MediaFile[]>([]);
  
  const handleFileSelection = () => {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.multiple = true;
    fileInput.accept = 'image/*,video/*,audio/*';
    
    fileInput.onchange = (e) => {
      const target = e.target as HTMLInputElement;
      if (target.files) {
        const mediaFiles = Array.from(target.files).map(file => {
          return new MediaFile({
            name: file.name,
            type: file.type,
            size: file.size,
            lastModified: file.lastModified,
            file
          });
        });
        
        setSelectedFiles(mediaFiles);
      }
    };
    
    fileInput.click();
  };
  
  return (
    <Box>
      <Button onClick={handleFileSelection}>
        Select Files
      </Button>
      
      {selectedFiles.length > 0 && (
        <Typography>
          Selected {selectedFiles.length} files
        </Typography>
      )}
    </Box>
  );
}
```

### Advanced File System API Usage

```tsx
import * as React from 'react';
import { useState, useEffect } from 'react';
import { Button, Alert } from '@mui/material';
import { MediaFile } from '@stoked-ui/media-selector';

function FileSystemAPIExample() {
  const [fsApiSupported, setFsApiSupported] = useState(false);
  
  useEffect(() => {
    setFsApiSupported('showOpenFilePicker' in window);
  }, []);
  
  const selectFilesUsingFsAPI = async () => {
    if (!fsApiSupported) {
      return;
    }
    
    try {
      // @ts-ignore - TypeScript might not recognize showOpenFilePicker
      const fileHandles = await window.showOpenFilePicker({
        multiple: true,
        types: [
          {
            description: 'Images',
            accept: {
              'image/*': ['.png', '.jpg', '.jpeg', '.gif']
            }
          }
        ]
      });
      
      // Process the file handles
      const files = await Promise.all(
        fileHandles.map(handle => handle.getFile())
      );
      
      console.log('Selected files:', files);
    } catch (error) {
      console.error('Error selecting files:', error);
    }
  };
  
  return (
    <div>
      {!fsApiSupported && (
        <Alert severity="warning">
          File System API not supported in this browser
        </Alert>
      )}
      
      <Button 
        onClick={selectFilesUsingFsAPI}
        disabled={!fsApiSupported}
      >
        Select Files (File System API)
      </Button>
    </div>
  );
}
```

### Using the Zip Functionality

```tsx
import * as React from 'react';
import { Button } from '@mui/material';
import { zipFiles, unzipFiles } from '@stoked-ui/media-selector/zip';

async function handleZipCreation(files: File[]) {
  try {
    // Create zip file from array of Files
    const zipBlob = await zipFiles(files);
    
    // Create download link
    const url = URL.createObjectURL(zipBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'archive.zip';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error creating zip:', error);
  }
}

async function handleUnzip(zipFile: File) {
  try {
    // Extract files from zip
    const extractedFiles = await unzipFiles(zipFile);
    console.log('Extracted files:', extractedFiles);
    
    // Do something with the extracted files...
  } catch (error) {
    console.error('Error extracting zip:', error);
  }
}
```

## API Reference

### MediaFile

The `MediaFile` class represents a media file with metadata and content.

```tsx
interface MediaFileOptions {
  name: string;
  type: string;
  size: number;
  lastModified: number;
  file: File;
}

const mediaFile = new MediaFile(options);
```

### WebFile

Abstract base class for file objects.

```tsx
abstract class WebFile {
  readonly name: string;
  readonly type: string;
  readonly size: number;
  readonly lastModified: number;
  readonly file: File;
  
  constructor(options: WebFileOptions);
  
  // Methods to implement
  abstract toJSON(): any;
}
```

### App

Abstract class for creating apps that handle files.

```tsx
abstract class App {
  readonly name: string;
  
  constructor(name: string);
  
  registerInputFactory(factory: AppFileFactory, isDefault?: boolean): void;
  registerOutputFactory(factory: AppOutputFileFactory, isDefault?: boolean): void;
  supportsInputMimeType(mimeType: IMimeType): boolean;
  supportsOutputMimeType(mimeType: IMimeType): boolean;
  createInputFile(data?: any, mimeType?: IMimeType): AppFile | null;
  createOutputFile(data?: any, mimeType?: IMimeType): AppOutputFile | null;
}
```

### Zip Utilities

```tsx
// Create a zip file from an array of File objects
zipFiles(files: File[]): Promise<Blob>;

// Extract files from a zip file
unzipFiles(zipFile: File): Promise<File[]>;
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
