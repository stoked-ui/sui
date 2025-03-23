# Media Selector Examples

The following examples demonstrate various features and use cases of the @stoked-ui/media-selector package.

## Basic Examples

- [Basic Media Selection](./Basic.md) - Fundamental usage of the media selector component
- [File System Access API Integration](./FileSystemAPI.md) - Using the modern File System Access API
- [Zip File Creation and Extraction](./ZipExample.md) - Working with zip archives

## Implementation Details

The media-selector package provides several key components and utilities:

- **MediaFile** - A class for handling media files with metadata
- **WebFile** - Abstract base class for file objects
- **App** - Abstract class for creating applications that handle media files
- **Zip Utilities** - Functions for creating and extracting zip archives

## Getting Started

To use the media-selector in your project, install it along with its peer dependencies:

```bash
npm install @stoked-ui/media-selector @stoked-ui/common
```

Then import the components you need:

```tsx
import { MediaFile, WebFile } from '@stoked-ui/media-selector';
import { zipFiles, unzipFiles } from '@stoked-ui/media-selector/zip';
```

## Additional Resources

For more detailed information, see:

- [API Documentation](../api/media-selector.md)
- [README](../../README.md)
- [GitHub Repository](https://github.com/stoked-ui/sui/tree/main/packages/sui-media-selector) 
