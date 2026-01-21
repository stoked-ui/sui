# Media API Client - Frontend Integration Guide

This document provides comprehensive examples for using the Media API Client in your React applications.

## Table of Contents

- [Installation](#installation)
- [Setup](#setup)
- [Basic Usage](#basic-usage)
  - [Without React](#without-react)
  - [With React Hooks](#with-react-hooks)
- [API Reference](#api-reference)
  - [MediaApiClient](#mediaapiclient)
  - [UploadClient](#uploadclient)
  - [React Hooks](#react-hooks)
- [Examples](#examples)
  - [Upload with Progress](#upload-with-progress)
  - [Resume Interrupted Upload](#resume-interrupted-upload)
  - [List and Filter Media](#list-and-filter-media)
  - [Update Media Metadata](#update-media-metadata)
  - [Delete Media](#delete-media)

---

## Installation

The API client is included in `@stoked-ui/media`. Ensure you have the peer dependencies installed:

```bash
pnpm add @stoked-ui/media @stoked-ui/common @tanstack/react-query react
```

---

## Setup

### Without React

Create API client instances directly:

```typescript
import { createMediaApiClient, createUploadClient } from '@stoked-ui/media';

const mediaClient = createMediaApiClient({
  baseUrl: 'https://api.example.com',
  authToken: 'your-auth-token',
  timeout: 30000, // Optional: request timeout in ms
  headers: {      // Optional: additional headers
    'X-Custom-Header': 'value',
  },
});

const uploadClient = createUploadClient({
  baseUrl: 'https://api.example.com',
  authToken: 'your-auth-token',
});

// Use the clients
const media = await mediaClient.getMedia('media-id');
const result = await uploadClient.upload({
  file: myFile,
  onProgress: (progress) => console.log(`${progress}%`),
});
```

### With React Hooks

Wrap your app with `MediaApiProvider`:

```tsx
import { MediaApiProvider } from '@stoked-ui/media';

function App() {
  return (
    <MediaApiProvider
      config={{
        baseUrl: 'https://api.example.com',
        authToken: localStorage.getItem('authToken') || undefined,
      }}
    >
      <YourApp />
    </MediaApiProvider>
  );
}
```

---

## Basic Usage

### Without React

```typescript
import { createMediaApiClient } from '@stoked-ui/media';

const client = createMediaApiClient({
  baseUrl: 'https://api.example.com',
  authToken: 'your-token',
});

// Get a media item
const media = await client.getMedia('media-id');
console.log(media.title, media.url);

// List media with filters
const mediaList = await client.listMedia({
  page: 1,
  limit: 20,
  publicity: 'public',
  sortBy: 'createdAt',
  sortOrder: 'desc',
});

console.log(mediaList.items, mediaList.totalPages);

// Update media
const updated = await client.updateMedia('media-id', {
  title: 'New Title',
  description: 'New description',
  tags: ['tag1', 'tag2'],
});

// Delete media (soft delete)
await client.deleteMedia('media-id');
```

### With React Hooks

```tsx
import {
  useMediaList,
  useMediaItem,
  useMediaUpdate,
  useMediaDelete,
} from '@stoked-ui/media';

function MediaGallery() {
  const { data: mediaList, isLoading } = useMediaList({
    page: 1,
    limit: 20,
    publicity: 'public',
  });

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      {mediaList?.items.map((media) => (
        <MediaItem key={media.id} media={media} />
      ))}
    </div>
  );
}

function MediaItem({ media }: { media: MediaDocument }) {
  const { mutate: updateMedia } = useMediaUpdate(media.id);
  const { mutate: deleteMedia } = useMediaDelete();

  return (
    <div>
      <h3>{media.title}</h3>
      <button onClick={() => updateMedia({ title: 'New Title' })}>
        Rename
      </button>
      <button onClick={() => deleteMedia(media.id)}>
        Delete
      </button>
    </div>
  );
}
```

---

## API Reference

### MediaApiClient

#### Methods

| Method | Description | Parameters | Returns |
|--------|-------------|------------|---------|
| `getMedia(id, signal?)` | Get a single media item | `id: string`, `signal?: AbortSignal` | `Promise<MediaDocument>` |
| `listMedia(params?, signal?)` | List media with filters | `params?: MediaListParams`, `signal?: AbortSignal` | `Promise<MediaListResponse>` |
| `updateMedia(id, data, signal?)` | Update media metadata | `id: string`, `data: UpdateMediaDto`, `signal?: AbortSignal` | `Promise<MediaDocument>` |
| `deleteMedia(id, signal?)` | Soft delete media | `id: string`, `signal?: AbortSignal` | `Promise<void>` |
| `permanentlyDeleteMedia(id, signal?)` | Permanently delete media | `id: string`, `signal?: AbortSignal` | `Promise<void>` |
| `searchMedia(query, params?, signal?)` | Search media | `query: string`, `params?: MediaListParams`, `signal?: AbortSignal` | `Promise<MediaListResponse>` |
| `likeMedia(id, signal?)` | Like a media item | `id: string`, `signal?: AbortSignal` | `Promise<MediaDocument>` |
| `viewMedia(id, signal?)` | Record a view | `id: string`, `signal?: AbortSignal` | `Promise<MediaDocument>` |

### UploadClient

#### Methods

| Method | Description | Parameters | Returns |
|--------|-------------|------------|---------|
| `upload(options)` | Upload a file with progress tracking | `options: UploadOptions` | `Promise<UploadResult>` |
| `resumeUpload(options)` | Resume an interrupted upload | `options: ResumeUploadOptions` | `Promise<UploadResult>` |
| `initiateUpload(file, options?)` | Start an upload session | `file: File`, `options?: {...}` | `Promise<InitiateUploadResponseDto>` |
| `getUploadStatus(sessionId, signal?)` | Get upload status | `sessionId: string`, `signal?: AbortSignal` | `Promise<UploadStatusResponseDto>` |
| `abortUpload(sessionId, signal?)` | Abort an upload | `sessionId: string`, `signal?: AbortSignal` | `Promise<void>` |
| `getActiveUploads(signal?)` | Get list of active uploads | `signal?: AbortSignal` | `Promise<ActiveUploadsResponseDto>` |

### React Hooks

| Hook | Description | Returns |
|------|-------------|---------|
| `useMediaList(options?)` | Fetch paginated media list | `UseQueryResult<MediaListResponse>` |
| `useMediaItem(id, options?)` | Fetch single media item | `UseQueryResult<MediaDocument>` |
| `useMediaUpdate(id, options?)` | Update media metadata | `UseMutationResult<MediaDocument, UpdateMediaDto>` |
| `useMediaDelete(options?)` | Delete media | `UseMutationResult<void, string>` |
| `useMediaUpload(options?)` | Upload with progress | `{ upload, isUploading, progress, cancel, error, result }` |
| `useActiveUploads(options?)` | Get active uploads | `UseQueryResult<ActiveUploadsResponseDto>` |

---

## Examples

### Upload with Progress

```tsx
import { useMediaUpload } from '@stoked-ui/media';

function MediaUploader() {
  const {
    upload,
    isUploading,
    progress,
    cancel,
    error,
    result,
  } = useMediaUpload({
    onSuccess: (result) => {
      console.log('Upload complete!', result.mediaId);
      // Navigate to the media page
      navigate(`/media/${result.mediaId}`);
    },
    onError: (error) => {
      console.error('Upload failed:', error.message);
    },
  });

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      upload(file);
    }
  };

  return (
    <div>
      <input
        type="file"
        accept="video/*,image/*"
        onChange={handleFileSelect}
        disabled={isUploading}
      />

      {isUploading && (
        <div>
          <div>
            Uploading: {progress.completedParts} / {progress.totalParts} parts
          </div>
          <progress value={progress.progress} max={100} />
          <div>{progress.progress}%</div>
          {progress.speed && (
            <div>
              Speed: {(progress.speed / 1024 / 1024).toFixed(2)} MB/s
            </div>
          )}
          {progress.estimatedTimeRemaining && (
            <div>
              Time remaining: {Math.round(progress.estimatedTimeRemaining / 1000)}s
            </div>
          )}
          <button onClick={cancel}>Cancel</button>
        </div>
      )}

      {error && <div style={{ color: 'red' }}>Error: {error.message}</div>}

      {result && <div>Upload complete! Media ID: {result.mediaId}</div>}
    </div>
  );
}
```

### Resume Interrupted Upload

```tsx
import { useActiveUploads, useUploadClient } from '@stoked-ui/media';

function ResumeUploadManager() {
  const { data: activeUploads, isLoading } = useActiveUploads();
  const uploadClient = useUploadClient();
  const [resuming, setResuming] = useState<string | null>(null);

  const handleResume = async (sessionId: string, file: File) => {
    setResuming(sessionId);
    try {
      const result = await uploadClient.resumeUpload({
        sessionId,
        file,
        onProgress: (progress) => {
          console.log(`Resuming: ${progress}%`);
        },
      });
      console.log('Upload completed:', result.mediaId);
    } catch (error) {
      console.error('Failed to resume:', error);
    } finally {
      setResuming(null);
    }
  };

  if (isLoading) return <div>Loading active uploads...</div>;

  return (
    <div>
      <h2>Active Uploads</h2>
      {activeUploads?.uploads.map((upload) => (
        <div key={upload.sessionId}>
          <p>{upload.filename}</p>
          <p>Progress: {upload.progress}%</p>
          <p>Size: {(upload.totalSize / 1024 / 1024).toFixed(2)} MB</p>
          <p>Expires: {new Date(upload.expiresAt).toLocaleString()}</p>
          <input
            type="file"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleResume(upload.sessionId, file);
            }}
            disabled={resuming === upload.sessionId}
          />
        </div>
      ))}
    </div>
  );
}
```

### List and Filter Media

```tsx
import { useMediaList } from '@stoked-ui/media';
import { useState } from 'react';

function MediaGallery() {
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({
    mediaType: undefined,
    publicity: 'public',
    search: '',
  });

  const { data, isLoading, error } = useMediaList({
    page,
    limit: 20,
    ...filters,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      <div>
        <input
          type="text"
          placeholder="Search..."
          value={filters.search}
          onChange={(e) => setFilters({ ...filters, search: e.target.value })}
        />
        <select
          value={filters.mediaType || ''}
          onChange={(e) => setFilters({
            ...filters,
            mediaType: e.target.value as any,
          })}
        >
          <option value="">All Types</option>
          <option value="video">Videos</option>
          <option value="image">Images</option>
        </select>
      </div>

      <div>
        {data?.items.map((media) => (
          <div key={media.id}>
            <img src={media.thumbnail} alt={media.title} />
            <h3>{media.title}</h3>
            <p>{media.description}</p>
          </div>
        ))}
      </div>

      <div>
        <button
          disabled={!data?.hasPrev}
          onClick={() => setPage(page - 1)}
        >
          Previous
        </button>
        <span>Page {page} of {data?.totalPages}</span>
        <button
          disabled={!data?.hasNext}
          onClick={() => setPage(page + 1)}
        >
          Next
        </button>
      </div>
    </div>
  );
}
```

### Update Media Metadata

```tsx
import { useMediaItem, useMediaUpdate } from '@stoked-ui/media';
import { useState } from 'react';

function MediaEditor({ mediaId }: { mediaId: string }) {
  const { data: media, isLoading } = useMediaItem(mediaId);
  const { mutate: updateMedia, isPending } = useMediaUpdate(mediaId, {
    onSuccess: () => {
      alert('Media updated successfully!');
    },
  });

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    tags: [] as string[],
  });

  // Initialize form when media loads
  useEffect(() => {
    if (media) {
      setFormData({
        title: media.title,
        description: media.description || '',
        tags: media.tags || [],
      });
    }
  }, [media]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMedia(formData);
  };

  if (isLoading) return <div>Loading...</div>;
  if (!media) return <div>Media not found</div>;

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>Title</label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
        />
      </div>

      <div>
        <label>Description</label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
        />
      </div>

      <div>
        <label>Tags (comma-separated)</label>
        <input
          type="text"
          value={formData.tags.join(', ')}
          onChange={(e) => setFormData({
            ...formData,
            tags: e.target.value.split(',').map(t => t.trim()).filter(Boolean),
          })}
        />
      </div>

      <button type="submit" disabled={isPending}>
        {isPending ? 'Saving...' : 'Save'}
      </button>
    </form>
  );
}
```

### Delete Media

```tsx
import { useMediaDelete } from '@stoked-ui/media';
import { useNavigate } from 'react-router-dom';

function MediaActions({ mediaId }: { mediaId: string }) {
  const navigate = useNavigate();

  const { mutate: deleteMedia, isPending } = useMediaDelete({
    onSuccess: () => {
      navigate('/media');
      alert('Media deleted successfully');
    },
    onError: (error) => {
      alert(`Failed to delete: ${error.message}`);
    },
  });

  const { mutate: permanentlyDelete, isPending: isPermanentlyDeleting } = useMediaDelete({
    permanent: true,
    onSuccess: () => {
      navigate('/media');
      alert('Media permanently deleted');
    },
  });

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this media?')) {
      deleteMedia(mediaId);
    }
  };

  const handlePermanentDelete = () => {
    if (confirm('Are you sure? This action cannot be undone!')) {
      permanentlyDelete(mediaId);
    }
  };

  return (
    <div>
      <button
        onClick={handleDelete}
        disabled={isPending}
      >
        {isPending ? 'Deleting...' : 'Delete'}
      </button>
      <button
        onClick={handlePermanentDelete}
        disabled={isPermanentlyDeleting}
        style={{ color: 'red' }}
      >
        {isPermanentlyDeleting ? 'Deleting...' : 'Permanently Delete'}
      </button>
    </div>
  );
}
```

---

## Advanced Features

### Request Cancellation

All API methods support `AbortSignal` for cancellation:

```typescript
const controller = new AbortController();

// Start a request
const promise = mediaClient.listMedia({ page: 1 }, controller.signal);

// Cancel it
controller.abort();

// The promise will reject with an error
try {
  await promise;
} catch (error) {
  console.log(error.message); // "Request was cancelled"
}
```

### Custom Headers and Authentication

```typescript
// Update auth token dynamically
mediaClient.setAuthToken('new-token');

// Clear auth token
mediaClient.clearAuthToken();

// Create client with custom headers
const client = createMediaApiClient({
  baseUrl: 'https://api.example.com',
  headers: {
    'X-Client-Version': '1.0.0',
    'X-Custom-Header': 'value',
  },
});
```

### Error Handling

```typescript
import { MediaApiError } from '@stoked-ui/media';

try {
  const media = await mediaClient.getMedia('invalid-id');
} catch (error) {
  if (error instanceof MediaApiError) {
    console.log('Status:', error.statusCode);
    console.log('Message:', error.message);
    console.log('Response:', error.response);
  }
}
```

---

## TypeScript Support

All methods and hooks are fully typed. Import types as needed:

```typescript
import type {
  MediaDocument,
  MediaListParams,
  MediaListResponse,
  UpdateMediaDto,
  UploadOptions,
  UploadResult,
  UploadProgress,
} from '@stoked-ui/media';
```

---

## Best Practices

1. **Use MediaApiProvider** - Wrap your app to enable React hooks
2. **Enable caching** - React Query caches responses automatically
3. **Handle errors gracefully** - Always provide error callbacks
4. **Show upload progress** - Users appreciate knowing upload status
5. **Support resume** - Allow users to continue interrupted uploads
6. **Validate files client-side** - Check file type and size before uploading
7. **Use AbortSignal** - Cancel requests when components unmount

---

## Need Help?

- Check the [API documentation](https://api.example.com/docs)
- Review the [source code](https://github.com/stoked-ui/sui)
- File an issue on [GitHub](https://github.com/stoked-ui/sui/issues)
