---
productId: media-api
title: Upload API
githubLabel: 'Upload API'
packageName: '@stoked-ui/media-api'
---

# Upload API

<p class="description">Resumable multipart upload flow for large media files.</p>

{{"component": "modules/components/ComponentLinkHeader"}}

## Overview

The Upload API supports resumable multipart uploads, allowing large files to be uploaded in chunks. If a connection drops, the upload can be resumed from the last completed chunk.

## Upload flow

### 1. Initialize upload

```bash
POST /media/upload/init
Content-Type: application/json

{
  "filename": "video.mp4",
  "contentType": "video/mp4",
  "size": 104857600,
  "chunkSize": 5242880
}
```

**Response:**

```json
{
  "uploadId": "abc123",
  "chunkSize": 5242880,
  "totalChunks": 20,
  "presignedUrls": [
    "https://s3.../chunk-0?...",
    "https://s3.../chunk-1?..."
  ]
}
```

### 2. Upload chunks

Upload each chunk to its presigned URL:

```bash
PUT <presignedUrl>
Content-Type: application/octet-stream

<binary chunk data>
```

### 3. Report chunk completion

```bash
POST /media/upload/:uploadId/chunk
Content-Type: application/json

{
  "chunkIndex": 0,
  "etag": "\"abc123def456\""
}
```

### 4. Complete upload

```bash
POST /media/upload/:uploadId/complete
Content-Type: application/json

{
  "title": "My Video",
  "description": "Optional description"
}
```

### 5. Check upload status

```bash
GET /media/upload/:uploadId/status
```

**Response:**

```json
{
  "uploadId": "abc123",
  "completedChunks": 15,
  "totalChunks": 20,
  "status": "in_progress"
}
```

## Using the client hook

The `@stoked-ui/media` package provides `useMediaUpload` which handles this flow automatically:

```tsx
import { useMediaUpload } from '@stoked-ui/media';

function UploadForm() {
  const { mutate: upload, isLoading, progress } = useMediaUpload();

  return (
    <input
      type="file"
      onChange={(e) => {
        const file = e.target.files?.[0];
        if (file) upload({ file });
      }}
    />
  );
}
```

## Limits

| Constraint | Value |
|-----------|-------|
| Max file size | 10 GB |
| Chunk size | 5 MB (default) |
| Max concurrent chunks | 4 |
| Upload expiry | 24 hours |
