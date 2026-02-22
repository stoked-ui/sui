---
productId: media-api
title: Endpoints
githubLabel: 'Endpoints'
packageName: '@stoked-ui/media-api'
---

# Endpoints

<p class="description">Complete reference for the Media API endpoints.</p>

{{"component": "modules/components/ComponentLinkHeader"}}

## Base URL

```
http://localhost:3001/api
```

## Authentication

All endpoints (except health check) require a JWT bearer token:

```
Authorization: Bearer <token>
```

## Media CRUD

### List media

```bash
GET /media?page=1&limit=20&sort=createdAt&order=desc
```

**Query parameters:**

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `page` | `number` | `1` | Page number |
| `limit` | `number` | `20` | Items per page |
| `sort` | `string` | `createdAt` | Sort field |
| `order` | `asc\|desc` | `desc` | Sort order |

### Get media item

```bash
GET /media/:id
```

### Create media item

```bash
POST /media
Content-Type: application/json

{
  "title": "My Video",
  "description": "A description",
  "tags": ["demo", "tutorial"]
}
```

### Update media item

```bash
PATCH /media/:id
Content-Type: application/json

{
  "title": "Updated Title"
}
```

### Delete media item

```bash
DELETE /media/:id
```

## Search

### Full-text search

```bash
GET /media/search?q=tutorial&type=video&tags=demo
```

| Param | Type | Description |
|-------|------|-------------|
| `q` | `string` | Search query |
| `type` | `string` | Filter by media type (video, image, audio) |
| `tags` | `string` | Comma-separated tag filter |

## Metadata

### Get media metadata

```bash
GET /media/:id/metadata
```

Returns extracted metadata including dimensions, duration, codec, bitrate, and more.

## Social

### Like a media item

```bash
POST /media/:id/like
```

### Get comments

```bash
GET /media/:id/comments
```

### Add comment

```bash
POST /media/:id/comments
Content-Type: application/json

{
  "text": "Great video!"
}
```

## Upload

See the [Upload API](/media-api/docs/upload-api/) page for the multipart resumable upload flow.
