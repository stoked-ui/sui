# Media CRUD and Query API Documentation

## Overview

This document describes the RESTful API endpoints for media CRUD operations with comprehensive query, filtering, and search capabilities.

**Implementation Status:** Work Item 3.5 - Complete
**Base URL:** `/media`
**Authentication:** Required for all endpoints except `/api/info`

## Authentication

All endpoints require authentication via the `AuthGuard`. Currently supports:

- **x-user-id header**: `x-user-id: user_123` (development/testing)
- **Query parameter**: `?userId=user_123` (development/testing)
- **Production**: Will use JWT tokens from `Authorization: Bearer <token>` header

### Authorization

Endpoints that modify or delete media enforce ownership checks:
- Only the media owner (matching `author` field) can update or delete their media
- Returns `403 Forbidden` if user tries to modify media they don't own

## Endpoints

### 1. List Media (GET /media)

Get paginated list of media with filtering, search, and sorting.

**Request:**
```http
GET /media?limit=20&offset=0&mediaType=video&sortBy=-createdAt
Headers:
  x-user-id: user_123
```

**Query Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `limit` | number | 20 | Number of items per page |
| `offset` | number | 0 | Number of items to skip |
| `cursor` | string | - | Cursor for cursor-based pagination |
| `mediaType` | enum | - | Filter by type: `image`, `video`, `album` |
| `mime` | string | - | Filter by MIME type (e.g., `video/mp4`) |
| `uploadedBy` | string | - | Filter by author user ID |
| `publicity` | enum | - | Filter by publicity: `public`, `private`, `paid`, `subscription` |
| `rating` | enum | - | Filter by rating: `ga`, `nc17` |
| `dateFrom` | ISO date | - | Filter by date range start |
| `dateTo` | ISO date | - | Filter by date range end |
| `search` | string | - | Search in title, description, filename, tags |
| `tags` | string | - | Comma-separated tags to filter (e.g., `nature,sunset`) |
| `sortBy` | string | `-createdAt` | Sort field: `createdAt`, `-createdAt`, `size`, `-size`, `title`, `views`, etc. |
| `includeDeleted` | boolean | false | Include soft-deleted items |
| `mediaClass` | string | - | Filter by MediaClass ID |
| `uploadSessionId` | string | - | Filter by upload session |

**Response:**
```json
{
  "data": [
    {
      "_id": "media_1",
      "author": "user_123",
      "title": "Beautiful Sunset",
      "description": "A stunning sunset over the ocean",
      "mediaType": "image",
      "mime": "image/jpeg",
      "file": "https://cdn.example.com/media/sunset.jpg",
      "width": 1920,
      "height": 1080,
      "size": 2048000,
      "thumbnail": "https://cdn.example.com/thumbnails/sunset_thumb.jpg",
      "publicity": "public",
      "rating": "ga",
      "views": 42,
      "tags": ["nature", "sunset", "ocean"],
      "createdAt": "2026-01-15T10:00:00.000Z",
      "updatedAt": "2026-01-15T10:00:00.000Z"
    }
  ],
  "total": 3,
  "limit": 20,
  "offset": 0,
  "hasMore": false,
  "cursor": "media_1"
}
```

**Examples:**

```bash
# Get all public videos, newest first
GET /media?mediaType=video&publicity=public&sortBy=-createdAt

# Search for sunset images
GET /media?search=sunset&mediaType=image

# Get media with specific tags
GET /media?tags=nature,ocean

# Get media uploaded in January 2026
GET /media?dateFrom=2026-01-01&dateTo=2026-01-31

# Get specific user's media
GET /media?uploadedBy=user_123&limit=10
```

### 2. Get Single Media (GET /media/:id)

Get a single media item by ID. Increments view count on each access.

**Request:**
```http
GET /media/media_1
Headers:
  x-user-id: user_123
```

**Response:**
```json
{
  "_id": "media_1",
  "author": "user_123",
  "title": "Beautiful Sunset",
  "description": "A stunning sunset over the ocean",
  "mediaType": "image",
  "mime": "image/jpeg",
  "file": "https://cdn.example.com/media/sunset.jpg",
  "width": 1920,
  "height": 1080,
  "size": 2048000,
  "thumbnail": "https://cdn.example.com/thumbnails/sunset_thumb.jpg",
  "publicity": "public",
  "rating": "ga",
  "views": 43,
  "tags": ["nature", "sunset", "ocean"],
  "createdAt": "2026-01-15T10:00:00.000Z",
  "updatedAt": "2026-01-21T10:00:00.000Z"
}
```

**Errors:**
- `404 Not Found`: Media doesn't exist or is soft-deleted

### 3. Create Media (POST /media)

Create a new media entry. Typically called after file upload to create database record.

**Request:**
```http
POST /media
Headers:
  x-user-id: user_123
  Content-Type: application/json

Body:
{
  "author": "user_123",
  "title": "My Video",
  "description": "An awesome video",
  "mediaType": "video",
  "mime": "video/mp4",
  "file": "s3://bucket/uploads/video.mp4",
  "width": 1920,
  "height": 1080,
  "duration": 120,
  "size": 52428800,
  "thumbnail": "s3://bucket/thumbnails/video_thumb.jpg",
  "publicity": "private",
  "rating": "ga",
  "tags": ["video", "awesome"]
}
```

**Required Fields:**
- `author`: User ID (owner)
- `mediaType`: `image`, `video`, or `album`
- `mime`: MIME type
- `file`: S3 key or URL

**Optional Fields:**
- `title`, `description`
- `width`, `height`, `duration`, `size`
- `thumbnail`, `paidThumbnail`, `thumbnailKeys`
- `publicity`, `rating`, `price`
- `tags`, `starring`
- `mediaClass`, `videoBug`
- `uploadSessionId`, `processingStatus`

**Response:**
```json
{
  "_id": "media_4",
  "author": "user_123",
  "title": "My Video",
  ...
}
```

### 4. Update Media (PATCH /media/:id)

Update media metadata. Only the owner can update their media.

**Request:**
```http
PATCH /media/media_1
Headers:
  x-user-id: user_123
  Content-Type: application/json

Body:
{
  "title": "Updated Title",
  "description": "New description",
  "tags": ["new", "tags"],
  "publicity": "public"
}
```

**Updatable Fields:**
- `title`, `description`
- `width`, `height`, `duration`
- `thumbnail`, `paidThumbnail`, `thumbnailKeys`
- `publicity`, `rating`, `price`
- `tags`, `starring`
- `mediaClass`, `videoBug`
- `processingStatus`

**Response:**
```json
{
  "_id": "media_1",
  "author": "user_123",
  "title": "Updated Title",
  "description": "New description",
  ...
}
```

**Errors:**
- `404 Not Found`: Media doesn't exist or is soft-deleted
- `403 Forbidden`: User is not the owner

### 5. Delete Media (DELETE /media/:id)

Delete media file and database record. Only the owner can delete their media.

**Soft Delete (default):**
```http
DELETE /media/media_1
Headers:
  x-user-id: user_123
```

Marks media as deleted but preserves data. Can be restored with `/media/:id/restore`.

**Hard Delete:**
```http
DELETE /media/media_1?hardDelete=true
Headers:
  x-user-id: user_123
```

Permanently deletes:
- Main media file from S3
- All thumbnails from S3
- Database record

**Response:**
- `204 No Content` on success

**Errors:**
- `404 Not Found`: Media doesn't exist or is already deleted
- `403 Forbidden`: User is not the owner

### 6. Restore Media (POST /media/:id/restore)

Restore a soft-deleted media item. Only the owner can restore their media.

**Request:**
```http
POST /media/media_1/restore
Headers:
  x-user-id: user_123
```

**Response:**
```json
{
  "_id": "media_1",
  "author": "user_123",
  "deleted": false,
  ...
}
```

**Errors:**
- `404 Not Found`: Media doesn't exist
- `403 Forbidden`: User is not the owner

### 7. API Info (GET /media/api/info)

Get API information and statistics. Does not require authentication.

**Request:**
```http
GET /media/api/info
```

**Response:**
```json
{
  "name": "@stoked-ui/media-api",
  "version": "0.1.0",
  "description": "NestJS API for Stoked UI Media Components",
  "mediaCount": 3
}
```

## Security Features

### 1. Authentication
- All endpoints except `/api/info` require authentication
- Currently uses `x-user-id` header for development
- Production will use JWT tokens

### 2. Authorization
- Owner-based access control for updates and deletes
- Users can only modify/delete their own media
- Read access controlled by media `publicity` field (future enhancement)

### 3. Rate Limiting
- Not yet implemented (planned for future work item)
- Will use NestJS throttler module

### 4. Input Validation
- All DTOs use `class-validator` decorators
- Automatic validation via `ValidationPipe`
- Validates types, ranges, enums, and required fields

## Query Features

### Filtering
- **Media Type**: Filter by `image`, `video`, `album`
- **MIME Type**: Exact match filtering
- **Publicity**: Filter by access level
- **Rating**: Filter by content rating
- **Author**: Filter by user ID
- **Date Range**: Filter by creation date
- **Tags**: Match all specified tags
- **MediaClass**: Filter by branded content class
- **Upload Session**: Filter by upload session ID

### Search
Full-text search across:
- Title
- Description
- Filename (file path)
- Tags

Case-insensitive substring matching.

### Sorting
Sort by any field:
- `createdAt` / `-createdAt` (newest/oldest first)
- `updatedAt` / `-updatedAt`
- `size` / `-size` (smallest/largest first)
- `title` / `-title` (alphabetical)
- `views` / `-views` (most/least viewed)

Prefix with `-` for descending order.

### Pagination
Two modes supported:

**Offset-based:**
```
?limit=20&offset=40
```

**Cursor-based:**
```
?limit=20&cursor=media_123
```

Response includes:
- `total`: Total matching items
- `hasMore`: Whether more items exist
- `cursor`: Next cursor value (last item's ID)

## Data Model

### MediaEntity
```typescript
{
  _id: string;              // Unique identifier
  author: string;           // Owner user ID

  // Basic metadata
  title?: string;
  description?: string;

  // Media properties
  mediaType: 'image' | 'video' | 'album';
  mime: string;
  file: string;             // S3 URL or key
  bucket?: string;          // S3 bucket name

  // Dimensions
  width?: number;
  height?: number;
  duration?: number;        // Video duration in seconds
  size?: number;            // File size in bytes

  // Thumbnails
  thumbnail?: string;
  paidThumbnail?: string;   // Blurred preview for paid content
  thumbnailKeys?: string[]; // S3 keys for cleanup

  // Access control
  publicity: 'public' | 'private' | 'paid' | 'subscription';
  rating?: 'ga' | 'nc17';

  // Pricing
  price?: number;           // Price in satoshis

  // Social
  starring?: string[];      // Tagged user IDs
  views?: number;
  tags?: string[];

  // MediaClass integration
  mediaClass?: string;
  videoBug?: string;

  // Processing
  processingStatus?: 'pending' | 'processing' | 'complete' | 'failed';
  processingTasks?: {
    thumbnails?: boolean;
    duration?: boolean;
    dimensions?: boolean;
    blurredThumbnail?: boolean;
    sprites?: boolean;
  };

  // Upload tracking
  uploadSessionId?: string;

  // Soft delete
  deleted?: boolean;
  deletedAt?: Date;

  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}
```

## Implementation Notes

### Current Storage
- In-memory Map storage for development
- 3 mock items seeded on startup
- Will be replaced with DynamoDB/PostgreSQL in Work Item 3.1

### S3 Integration
- Delete operations integrated with S3Service
- Handles CloudFront URLs, S3 direct URLs, and relative paths
- Batch deletion for media + thumbnails
- URL key extraction for various formats

### Future Enhancements
1. **Database Integration** (Work Item 3.1)
   - DynamoDB or PostgreSQL backend
   - Persistence across restarts
   - Proper indexing for queries

2. **Rate Limiting**
   - Throttle requests per user
   - Prevent abuse

3. **Caching**
   - Redis cache for frequently accessed media
   - Cache invalidation on updates

4. **Advanced Search**
   - Elasticsearch integration
   - Full-text search with relevance scoring
   - Fuzzy matching

5. **Access Control**
   - Purchase verification for paid content
   - Subscription checks
   - Payment integration

## Testing

### Manual Testing
```bash
# Get API info
curl http://localhost:3000/media/api/info

# List all media
curl -H "x-user-id: user_123" http://localhost:3000/media

# Get specific media
curl -H "x-user-id: user_123" http://localhost:3000/media/media_1

# Create media
curl -X POST http://localhost:3000/media \
  -H "x-user-id: user_123" \
  -H "Content-Type: application/json" \
  -d '{
    "author": "user_123",
    "title": "Test Media",
    "mediaType": "image",
    "mime": "image/jpeg",
    "file": "test.jpg"
  }'

# Update media
curl -X PATCH http://localhost:3000/media/media_1 \
  -H "x-user-id: user_123" \
  -H "Content-Type: application/json" \
  -d '{"title": "Updated Title"}'

# Soft delete
curl -X DELETE http://localhost:3000/media/media_1 \
  -H "x-user-id: user_123"

# Hard delete
curl -X DELETE "http://localhost:3000/media/media_1?hardDelete=true" \
  -H "x-user-id: user_123"

# Restore
curl -X POST http://localhost:3000/media/media_1/restore \
  -H "x-user-id: user_123"
```

## Error Responses

All endpoints return consistent error responses:

```json
{
  "statusCode": 404,
  "message": "Media with ID media_999 not found",
  "error": "Not Found"
}
```

**Status Codes:**
- `200 OK`: Successful GET/PATCH/POST
- `201 Created`: Successful POST (create)
- `204 No Content`: Successful DELETE
- `400 Bad Request`: Validation error
- `401 Unauthorized`: Missing authentication
- `403 Forbidden`: Not authorized (not owner)
- `404 Not Found`: Resource doesn't exist
- `500 Internal Server Error`: Server error

## Migration from V3

This API follows v3 patterns:
- Uses `ExtendedMediaItem` interface structure
- Compatible with v3 Redux `mediaSlice`
- Supports v3 query parameters
- Maintains v3 response format

**Breaking Changes:**
- Field names match v3 exactly
- Pagination metadata structure enhanced
- Added cursor-based pagination option
- Authorization enforcement added
