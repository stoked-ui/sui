---
productId: media
title: API Client
githubLabel: 'API Client'
packageName: '@stoked-ui/media'
---

# API Client

<p class="description">React hooks and client for communicating with @stoked-ui/media-api, built on TanStack Query.</p>

{{"component": "modules/components/ComponentLinkHeader"}}

## Introduction

The Media API client provides a set of React hooks for interacting with a `@stoked-ui/media-api` backend. Built on TanStack Query, it handles caching, background refetching, and optimistic updates out of the box.

## Setup

```tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <MyApp />
    </QueryClientProvider>
  );
}
```

## Hooks

### useMediaUpload

Upload media files with progress tracking and resumable support.

```tsx
import { useMediaUpload } from '@stoked-ui/media';

function UploadForm() {
  const { mutate: upload, isLoading, progress } = useMediaUpload();

  const handleUpload = (file: File) => {
    upload({ file, metadata: { title: file.name } });
  };

  return (
    <div>
      <input type="file" onChange={(e) => handleUpload(e.target.files[0])} />
      {isLoading && <p>Uploading: {progress}%</p>}
    </div>
  );
}
```

### useMediaList

Fetch a paginated list of media items.

```tsx
import { useMediaList } from '@stoked-ui/media';

function MediaLibrary() {
  const { data, isLoading, error } = useMediaList({ page: 1, limit: 20 });

  if (isLoading) return <p>Loading...</p>;
  if (error) return <p>Error loading media</p>;

  return (
    <ul>
      {data.items.map((item) => (
        <li key={item.id}>{item.title}</li>
      ))}
    </ul>
  );
}
```

### useMediaItem

Fetch a single media item by ID.

```tsx
import { useMediaItem } from '@stoked-ui/media';

function MediaDetail({ id }) {
  const { data: item, isLoading } = useMediaItem(id);

  if (isLoading) return <p>Loading...</p>;

  return <h1>{item.title}</h1>;
}
```

### useMediaUpdate

Update media item metadata.

```tsx
import { useMediaUpdate } from '@stoked-ui/media';

function EditForm({ id }) {
  const { mutate: update } = useMediaUpdate();

  const handleSave = (title: string) => {
    update({ id, data: { title } });
  };

  return <button onClick={() => handleSave('New Title')}>Save</button>;
}
```

### useMediaDelete

Delete a media item.

```tsx
import { useMediaDelete } from '@stoked-ui/media';

function DeleteButton({ id }) {
  const { mutate: remove } = useMediaDelete();

  return <button onClick={() => remove(id)}>Delete</button>;
}
```
