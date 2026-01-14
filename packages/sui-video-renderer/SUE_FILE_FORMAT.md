# SUE File Format Specification

The `.sue` format supports two variants for storing video editing projects:

## 1. JSON Format (External References)

Plain JSON file that references external media files:

```json
{
  "id": "project-id",
  "name": "My Project",
  "version": 2,
  "filesMeta": [
    { "name": "video.mp4", "size": 12345, "type": "video/mp4" }
  ],
  "tracks": [
    {
      "controllerName": "video",
      "fileId": "file-1",
      "id": "track-1",
      "name": "Main Video",
      "url": "/static/editor/video.mp4",
      "actions": [...]
    }
  ],
  "backgroundColor": "transparent",
  "width": 1920,
  "height": 1080
}
```

**File References:** The `url` field can be:
- **Absolute path:** `/Users/name/videos/file.mp4`
- **Relative path:** `./media/file.mp4`
- **Web path:** `/static/editor/file.mp4` (requires `publicDir` parameter)
- **HTTP URL:** `https://example.com/file.mp4` (downloaded to temp)

## 2. Binary Format (Embedded Media)

Binary container with embedded media files:

```
[4 bytes: metadata length (uint32, little-endian)]
[N bytes: JSON metadata (UTF-8)]
[file 1 data: size from filesMeta[0].size]
[file 2 data: size from filesMeta[1].size]
...
```

### Structure

1. **Header (4 bytes):** Metadata length as uint32 little-endian
2. **Metadata (N bytes):** JSON project definition (same as JSON format)
3. **Embedded Files:** Raw binary data for each file in `filesMeta` order

### Example

```typescript
// Read binary .sue file
const buffer = await fs.readFile('project.sue');
const dataView = new DataView(buffer.buffer);

// Read metadata length
const metadataLength = dataView.getUint32(0, true);

// Extract JSON
const metadataStart = 4;
const metadataEnd = metadataStart + metadataLength;
const metadata = JSON.parse(
  new TextDecoder().decode(buffer.slice(metadataStart, metadataEnd))
);

// Extract files
let offset = metadataEnd;
for (const fileMeta of metadata.filesMeta) {
  const fileData = buffer.slice(offset, offset + fileMeta.size);
  await fs.writeFile(fileMeta.name, fileData);
  offset += fileMeta.size;
}
```

## Usage with Video Renderer

### Automatic Detection

The `SueParserService` automatically detects the format:

```typescript
import { SueParserService } from '@stoked-ui/video-renderer';

const parser = new SueParserService();

// Works with both JSON and binary .sue files
const manifest = await parser.parseFile('project.sue');
```

### JSON with Web Paths

If your JSON uses web paths like `/static/...`, provide `publicDir`:

```typescript
const publicDir = '/Users/name/work/stoked-ui/docs/public';
const manifest = await parser.parseFile('project.sue', publicDir);

// Resolves: /static/editor/video.mp4
//        → /Users/name/work/stoked-ui/docs/public/static/editor/video.mp4
```

### Binary with Embedded Media

Binary `.sue` files automatically extract embedded media to temp directory:

```typescript
// Automatically extracts to /tmp/sue-media-xxxxx/
const manifest = await parser.parseFile('multiverse.sue');

// Media files are ready for FFmpeg
console.log(manifest.mediaFiles);
// Map { '/tmp/sue-media-abc123/video.mp4' => '[0:v]', ... }
```

## Creating Binary .sue Files

The editor (`@stoked-ui/editor`) creates binary `.sue` files when you save projects:

```typescript
import { EditorFile } from '@stoked-ui/editor';

const editorFile = new EditorFile({...});
const blob = await editorFile.toBlob(); // Binary format with embedded media
```

## Extracting Media Manually

Use the extraction script if you need to convert binary to JSON:

```bash
npx tsx extract-sue-media.ts ~/multiverse.sue ~/multiverse-extracted

# Creates:
# ~/multiverse-extracted/
#   ├── project.sue.json    (JSON with updated paths)
#   ├── vast-multiverse.mp4
#   ├── background-alpha.webm
#   ├── stoked-ui.webm
#   └── funeral.mp3
```

## Benefits

| Feature | JSON Format | Binary Format |
|---------|-------------|---------------|
| **Size** | Small (~1KB) | Large (includes media) |
| **Portability** | Requires external files | Fully self-contained |
| **Editing** | Human-readable | Requires extraction |
| **Sharing** | Share folder | Single file |
| **Performance** | Fast to parse | Extraction overhead |

## Best Practices

### Use JSON Format When:
- Working on active projects
- Media files are large (>100MB)
- Collaborating via Git
- Media is hosted on CDN

### Use Binary Format When:
- Archiving completed projects
- Sharing self-contained projects
- Distributing templates
- Offline workflows

## Format Detection

Binary format detection:
```typescript
const buffer = await fs.readFile('file.sue');
const isBinary = buffer[0] !== 0x7B && // Not '{'
                 buffer[0] !== 0x20 && // Not space
                 buffer[0] !== 0x0A;   // Not newline
```

If the file starts with `{`, whitespace, or newline, it's JSON.
Otherwise, it's the binary format with embedded media.
