# Stoked UI Media API Documentation

This directory contains the API documentation for the Stoked UI Media API.

## Files

- **openapi.json** - OpenAPI 3.0 specification in JSON format
- **openapi.yaml** - OpenAPI 3.0 specification in YAML format
- **postman-collection.json** - Postman collection for importing and testing endpoints

## Swagger UI

The API documentation is available via Swagger UI at:

**Development:** `http://localhost:3001/api/docs`
**Production:** `https://api.stoked-ui.com/api/docs`

## API Endpoints

The API includes 16 documented endpoints across 3 main categories:

### Health
- `GET /v1/health` - Health check

### Media (8 endpoints)
- `GET /v1/media/api/info` - Get API information and statistics
- `GET /v1/media` - List media with filtering, search, sorting, and pagination
- `GET /v1/media/{id}` - Get a single media item by ID
- `POST /v1/media` - Create a new media entry
- `PATCH /v1/media/{id}` - Update media metadata
- `DELETE /v1/media/{id}` - Delete media (soft or hard delete)
- `POST /v1/media/{id}/restore` - Restore a soft-deleted media item
- `POST /v1/media/{id}/extract-metadata` - Extract metadata from media file
- `POST /v1/media/{id}/generate-thumbnail` - Generate video thumbnail
- `POST /v1/media/{id}/generate-sprites` - Generate video sprite sheet

### Uploads (7 endpoints)
- `POST /v1/uploads/initiate` - Initiate multipart upload
- `GET /v1/uploads/{sessionId}/status` - Get upload status
- `POST /v1/uploads/{sessionId}/sync` - Sync upload with S3
- `POST /v1/uploads/{sessionId}/urls` - Get more presigned URLs
- `POST /v1/uploads/{sessionId}/parts/{partNumber}/complete` - Mark part as completed
- `POST /v1/uploads/{sessionId}/complete` - Complete multipart upload
- `DELETE /v1/uploads/{sessionId}` - Abort upload
- `GET /v1/uploads/active` - List active uploads

## Authentication

Most endpoints require JWT authentication. To authenticate:

1. Obtain a JWT token from your authentication provider
2. Include the token in the `Authorization` header:
   ```
   Authorization: Bearer YOUR_JWT_TOKEN
   ```

In Swagger UI, click the "Authorize" button and enter your JWT token.

## Using Postman

1. Import `postman-collection.json` into Postman
2. Set the `baseUrl` variable to your API URL (default: `http://localhost:3001/v1`)
3. Set the `jwt_token` variable to your JWT token
4. Start making requests!

## Generating Documentation

To regenerate the API documentation files, run:

```bash
pnpm run openapi:export
```

This will update:
- `docs/openapi.json`
- `docs/openapi.yaml`
- `docs/postman-collection.json`

## API Features

### Media Management
- Full CRUD operations for media items
- Support for images, videos, and albums
- Soft delete and restore functionality
- Metadata extraction from media files
- Thumbnail and sprite sheet generation for videos

### File Uploads
- Resumable multipart uploads
- Large file support (up to 5TB)
- Deduplication via SHA-256 hashing
- Upload progress tracking
- Session management with expiration

### Query & Filtering
- Pagination (offset and cursor-based)
- Full-text search
- Multiple filter options:
  - Media type (image/video/album)
  - MIME type
  - Author/uploader
  - Publicity level (public/private/paid/subscription)
  - Content rating (ga/nc17)
  - Date range
  - Tags
  - Media class
- Sorting by multiple fields (createdAt, size, views, etc.)

## Response Formats

All endpoints return JSON responses with consistent structure:

### Success Response
```json
{
  "_id": "media_123",
  "author": "user_123",
  "title": "My Video",
  "mediaType": "video",
  "mime": "video/mp4",
  // ... other fields
  "createdAt": "2024-01-15T00:00:00.000Z",
  "updatedAt": "2024-01-15T12:00:00.000Z"
}
```

### Error Response
```json
{
  "statusCode": 404,
  "message": "Media not found",
  "error": "Not Found"
}
```

### Paginated Response
```json
{
  "data": [...],
  "total": 100,
  "limit": 20,
  "offset": 0,
  "hasMore": true,
  "cursor": "eyJpZCI6Im1lZGlhXzEyMyJ9"
}
```

## Rate Limiting

Rate limiting may be applied to prevent abuse. Check the response headers for rate limit information:

- `X-RateLimit-Limit` - Maximum requests allowed
- `X-RateLimit-Remaining` - Requests remaining
- `X-RateLimit-Reset` - Time when the limit resets

## Support

For issues, questions, or contributions:

- GitHub: https://github.com/stoked-ui/sui
- Email: brian@stoked-ui.com
- Documentation: https://stoked-ui.com/docs

## License

MIT License - See LICENSE file for details.
