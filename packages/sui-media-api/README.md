# @stoked-ui/media-api

NestJS API service for managing media files with comprehensive CRUD operations, metadata extraction, thumbnail generation, and AWS Lambda deployment support.

## Description

A production-ready backend API built with NestJS for handling media operations in the Stoked UI ecosystem. Features file uploads, metadata extraction, thumbnail/sprite sheet generation, and storage integration.

### Key Features

- **Complete Media CRUD**: Create, read, update, delete media with filtering and search
- **File Upload Management**: Multipart file uploads with progress tracking
- **Metadata Extraction**: Automatic extraction of video and image metadata
- **Thumbnail Generation**: Server-side generation of thumbnails and sprite sheets for videos
- **S3 Integration**: AWS S3 for reliable file storage
- **Database Support**: MongoDB integration (via Mongoose)
- **Authentication**: JWT-based auth with user context
- **Query Features**: Advanced filtering, search, sorting, and pagination
- **Performance**: Caching middleware for optimization
- **Health Monitoring**: Health check endpoint for infrastructure monitoring
- **API Documentation**: Swagger/OpenAPI documentation automatically generated
- **AWS Lambda Ready**: Optimized for serverless deployment
- **CORS Support**: Configurable cross-origin resource sharing
- **TypeScript**: Full type safety with strict checking

## Quick Start (< 10 minutes)

### Installation

```bash
pnpm install
```

### Configuration

Create `.env` file from template:

```bash
cp .env.example .env
```

Key environment variables:

```env
# Server
PORT=3001
NODE_ENV=development
API_PATH_PREFIX=/v1

# Database
MONGODB_URI=mongodb://localhost:27017/media

# AWS S3
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
S3_BUCKET=your-bucket-name

# Auth
JWT_SECRET=your-secret-key
JWT_EXPIRE=7d

# Deployment
SST_STAGE=dev
```

### Run Locally

```bash
# Development with hot reload
pnpm dev

# Production
pnpm build && pnpm start:prod
```

Visit `http://localhost:3001/api` for Swagger documentation.

## Installation & Setup

### Peer Dependencies

Requires Node.js 18+ and the following services:

- **MongoDB**: For data persistence
- **AWS S3** (optional): For file storage (uses local storage fallback)
- **FFmpeg** (optional): For video processing

```bash
# macOS
brew install ffmpeg mongodb-community

# Ubuntu/Debian
sudo apt-get install ffmpeg mongodb

# Or use Docker
docker run -d -p 27017:27017 mongo
```

### Development Setup

```bash
# Install dependencies
pnpm install

# Copy environment template
cp .env.example .env

# Update .env with your settings

# Start database (if not running)
docker run -d -p 27017:27017 mongo

# Run development server
pnpm dev

# Run tests
pnpm test

# Run E2E tests
pnpm test:e2e
```

## API Documentation

### API Base URL

```
http://localhost:3001/v1
```

### Health Check Endpoint

```http
GET /health
```

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2024-01-18T00:00:00.000Z",
  "service": "@stoked-ui/media-api",
  "version": "0.1.0"
}
```

### Authentication

All media endpoints except `GET /media/api/info` require authentication:

```http
Authorization: Bearer <JWT_TOKEN>
```

### Media Endpoints

#### List Media

```http
GET /media?limit=20&offset=0&mediaType=video&search=sunset
```

**Query Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `limit` | number | 20 | Items per page |
| `offset` | number | 0 | Items to skip |
| `cursor` | string | - | Cursor for pagination |
| `mediaType` | string | - | Filter: 'image', 'video', 'album' |
| `mime` | string | - | Filter by MIME type |
| `uploadedBy` | string | - | Filter by user ID |
| `publicity` | string | - | Filter: 'public', 'private', 'paid' |
| `rating` | string | - | Filter by content rating |
| `dateFrom` | ISO date | - | Filter by start date |
| `dateTo` | ISO date | - | Filter by end date |
| `search` | string | - | Search in title, description, tags |
| `tags` | string | - | Filter by tags (comma-separated) |
| `sortBy` | string | -createdAt | Sort field (prefix with `-` for desc) |
| `includeDeleted` | boolean | false | Include soft-deleted items |

**Response:**
```json
{
  "items": [
    {
      "_id": "media_1",
      "title": "Sunset Video",
      "description": "Beautiful sunset",
      "mediaType": "video",
      "file": "https://s3.example.com/sunset.mp4",
      "thumbnail": "https://s3.example.com/sunset-thumb.jpg",
      "duration": 300,
      "width": 1920,
      "height": 1080,
      "size": 52428800,
      "mime": "video/mp4",
      "publicity": "public",
      "views": 150,
      "author": "user_123",
      "createdAt": "2024-01-18T10:00:00Z",
      "updatedAt": "2024-01-18T10:00:00Z"
    }
  ],
  "total": 45,
  "limit": 20,
  "offset": 0,
  "hasMore": true,
  "nextCursor": "media_20"
}
```

#### Get Single Media

```http
GET /media/:id
```

**Response:**
```json
{
  "_id": "media_1",
  "title": "Sunset Video",
  "description": "Beautiful sunset",
  "mediaType": "video",
  "file": "https://s3.example.com/sunset.mp4",
  "thumbnail": "https://s3.example.com/sunset-thumb.jpg",
  "duration": 300,
  "width": 1920,
  "height": 1080,
  "views": 150,
  "author": "user_123"
}
```

#### Create Media

```http
POST /media
Content-Type: application/json

{
  "title": "My Video",
  "description": "A beautiful sunset",
  "mediaType": "video",
  "file": "https://s3.example.com/video.mp4",
  "thumbnail": "https://s3.example.com/thumb.jpg",
  "duration": 300,
  "publicity": "public"
}
```

#### Update Media

```http
PATCH /media/:id
Content-Type: application/json

{
  "title": "Updated Title",
  "publicity": "private",
  "tags": ["nature", "sunset"]
}
```

#### Delete Media

```http
DELETE /media/:id
```

**Soft Delete**: Media is marked as deleted but not removed from database.

#### Extract Metadata

```http
POST /media/:id/extract-metadata
```

Extracts metadata from video/image file (duration, dimensions, etc.).

**Response:**
```json
{
  "duration": 300,
  "width": 1920,
  "height": 1080,
  "bitrate": 5000,
  "codec": "h264",
  "fps": 30
}
```

#### Generate Thumbnail

```http
POST /media/:id/thumbnail
Content-Type: application/json

{
  "timestamp": 2.5,
  "width": 320,
  "height": 180
}
```

**Response:**
```json
{
  "thumbnail": "https://s3.example.com/media_1-thumb.jpg",
  "width": 320,
  "height": 180
}
```

#### Generate Sprite Sheet

```http
POST /media/:id/sprite
Content-Type: application/json

{
  "framesPerRow": 10,
  "frameWidth": 160,
  "frameHeight": 90,
  "interval": 3
}
```

**Response:**
```json
{
  "spriteSheet": "https://s3.example.com/media_1-sprite.jpg",
  "config": {
    "totalFrames": 100,
    "framesPerRow": 10,
    "frameWidth": 160,
    "frameHeight": 90,
    "spriteSheetWidth": 1600,
    "spriteSheetHeight": 900,
    "interval": 3
  }
}
```

### Upload Endpoints

#### Upload File

```http
POST /uploads
Content-Type: multipart/form-data

{
  "file": <binary>,
  "title": "My Video",
  "description": "A test video"
}
```

**Response:**
```json
{
  "_id": "media_1",
  "title": "My Video",
  "file": "https://s3.example.com/video.mp4",
  "size": 52428800,
  "mime": "video/mp4"
}
```

#### Get Upload Progress

```http
GET /uploads/:id/progress
```

**Response:**
```json
{
  "id": "upload_123",
  "uploaded": 26214400,
  "total": 52428800,
  "percentage": 50,
  "status": "uploading"
}
```

## TypeScript API Reference

### DTOs (Data Transfer Objects)

#### CreateMediaDto

```typescript
interface CreateMediaDto {
  title: string;
  description?: string;
  mediaType: 'image' | 'video' | 'album';
  file: string;
  thumbnail?: string;
  duration?: number;
  width?: number;
  height?: number;
  mime?: string;
  size?: number;
  publicity?: 'public' | 'private' | 'paid';
  tags?: string[];
}
```

#### UpdateMediaDto

```typescript
interface UpdateMediaDto {
  title?: string;
  description?: string;
  publicity?: 'public' | 'private' | 'paid';
  tags?: string[];
  ratings?: string[];
  // Any other updatable fields
}
```

#### QueryMediaDto

```typescript
interface QueryMediaDto {
  limit?: number;
  offset?: number;
  cursor?: string;
  mediaType?: string;
  mime?: string;
  uploadedBy?: string;
  publicity?: string;
  rating?: string;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
  tags?: string;
  sortBy?: string;
  includeDeleted?: boolean;
}
```

### Entity Types

#### MediaEntity

```typescript
class MediaEntity {
  _id: string;
  title: string;
  description?: string;
  mediaType: 'image' | 'video' | 'album';
  file: string;
  thumbnail?: string;
  duration?: number;
  width?: number;
  height?: number;
  size: number;
  mime: string;
  publicity: 'public' | 'private' | 'paid';
  views: number;
  author: string;
  tags: string[];
  ratings: Map<string, number>;
  deleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

## Advanced Configuration

### Database Connection

Configure MongoDB connection in `.env`:

```env
MONGODB_URI=mongodb://user:password@host:27017/database
```

Or with connection pool:

```env
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/database
```

### S3 Storage Configuration

```env
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE
AWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
S3_BUCKET=my-media-bucket
S3_ENDPOINT=https://s3.example.com
```

### JWT Configuration

```env
JWT_SECRET=your-super-secret-key
JWT_EXPIRE=7d
JWT_REFRESH_EXPIRE=30d
```

### Video Processing

For video metadata extraction and thumbnail generation:

```env
FFMPEG_PATH=/usr/bin/ffmpeg
FFPROBE_PATH=/usr/bin/ffprobe
VIDEO_TIMEOUT=30000
```

## Development Scripts

```bash
# Start development server with hot reload
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start:prod

# Run unit tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Generate coverage report
pnpm test:cov

# Run E2E tests
pnpm test:e2e

# Format code
pnpm format

# Lint code
pnpm lint

# Type check
pnpm type-check
```

## Deployment

### Local Docker Deployment

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN pnpm install --prod

COPY dist ./dist

EXPOSE 3001

CMD ["node", "dist/main.js"]
```

Build and run:

```bash
docker build -t media-api .
docker run -p 3001:3001 -e MONGODB_URI=mongodb://host.docker.internal:27017/media media-api
```

### AWS Lambda Deployment

The API is configured for Lambda deployment via SST:

```bash
# Deploy to AWS
pnpm run sst deploy --stage prod

# View logs
pnpm run sst logs --stage prod

# Remove deployment
pnpm run sst remove --stage prod
```

### Docker Compose Setup

```yaml
version: '3.8'

services:
  mongodb:
    image: mongo:latest
    ports:
      - "27017:27017"
    volumes:
      - mongodb_data:/data/db

  api:
    build: .
    ports:
      - "3001:3001"
    environment:
      MONGODB_URI: mongodb://mongodb:27017/media
      AWS_REGION: us-east-1
    depends_on:
      - mongodb

volumes:
  mongodb_data:
```

## Performance Optimization

### Caching Middleware

Automatically caches GET requests:

```typescript
// Cache configuration in app.module.ts
CachingMiddleware.configure({
  ttl: 3600,              // 1 hour
  excludePaths: ['/health'],
  matchPatterns: ['/media'],
});
```

### Database Indexing

Create indexes for common queries:

```bash
# In MongoDB shell
db.media.createIndex({ "author": 1 })
db.media.createIndex({ "publicity": 1, "createdAt": -1 })
db.media.createIndex({ "tags": 1 })
db.media.createIndex({ "title": "text", "description": "text" })
```

### S3 Configuration

Enable CloudFront CDN for image/video delivery:

```env
CLOUDFRONT_DOMAIN=d123abc.cloudfront.net
```

## Troubleshooting

### Common Issues

**MongoDB Connection Error**

```
MongoServerError: connect ECONNREFUSED 127.0.0.1:27017
```

Solution: Ensure MongoDB is running and URI is correct in `.env`

**S3 Authentication Error**

```
The Access Key Id you provided does not exist in our records
```

Solution: Check AWS credentials in `.env` and IAM permissions

**FFmpeg Not Found**

```
Error: spawn ffmpeg ENOENT
```

Solution: Install FFmpeg and set path in `.env`:
- macOS: `brew install ffmpeg`
- Ubuntu: `sudo apt-get install ffmpeg`
- Set `FFMPEG_PATH=/usr/bin/ffmpeg`

**CORS Errors**

Solution: Configure CORS in `app.module.ts`:

```typescript
app.enableCors({
  origin: ['https://example.com'],
  credentials: true,
});
```

### Debug Mode

Enable debug logging:

```env
DEBUG=media-api:*
```

Check logs:

```bash
pnpm dev 2>&1 | grep "media-api"
```

## Testing

### Unit Tests

```bash
pnpm test
```

### E2E Tests

```bash
pnpm test:e2e
```

### Integration Tests

```bash
# Start test database
docker run -d -p 27018:27017 mongo

# Run with test database
MONGODB_URI=mongodb://localhost:27018/test pnpm test:e2e
```

## FAQ

**Q: How do I handle authentication?**

A: Implement a guard that validates JWT tokens:

```typescript
@UseGuards(AuthGuard)
@Get('media')
findAll() { ... }
```

**Q: Can I use a different database?**

A: Yes, replace Mongoose with TypeORM, Prisma, or another ORM.

**Q: How do I scale for large uploads?**

A: Use multipart upload to S3:

```typescript
const multipartUpload = new AWS.S3.ManagedUpload({
  params: { Bucket, Key, Body: fileStream }
});
```

**Q: Can I store files locally?**

A: Yes, configure local storage in `.env`:

```env
STORAGE_TYPE=local
STORAGE_PATH=/uploads
```

## Project Structure

```
src/
├── app.module.ts                 # Main app module
├── app.ts                        # Express/Fastify server
├── main.ts                       # Entry point (local)
├── lambda.bootstrap.ts           # Lambda handler
├── health/                       # Health check module
│   ├── health.controller.ts
│   ├── health.module.ts
│   └── health.controller.spec.ts
├── media/                        # Media module
│   ├── media.controller.ts       # API endpoints
│   ├── media.service.ts          # Business logic
│   ├── media.module.ts           # Module definition
│   ├── entities/
│   │   └── media.entity.ts       # Database model
│   ├── dto/
│   │   ├── create-media.dto.ts
│   │   ├── update-media.dto.ts
│   │   ├── query-media.dto.ts
│   │   ├── media-response.dto.ts
│   │   └── index.ts
│   ├── metadata/
│   │   ├── metadata-extraction.service.ts
│   │   ├── video-processing.service.ts
│   │   └── README.md
│   ├── guards/
│   │   └── auth.guard.ts
│   ├── decorators/
│   │   └── current-user.decorator.ts
│   └── __tests__/
│       ├── media.service.spec.ts
│       └── media.controller.spec.ts
├── uploads/                      # Upload module
│   ├── uploads.controller.ts
│   ├── uploads.service.ts
│   ├── uploads.module.ts
│   └── dto/
│       └── index.ts
├── s3/                           # AWS S3 module
│   ├── s3.service.ts
│   ├── s3.module.ts
│   └── s3.service.spec.ts
├── database/                     # Database module
│   └── database.module.ts
└── performance/                  # Performance features
    ├── caching.middleware.ts
    └── metadata-extraction.optimization.ts
```

## License

MIT

---

**Related Documentation:**
- [Media Package (@stoked-ui/media)](../sui-media/README.md)
- [API Client Usage Guide](../sui-media/README.md#api-client-integration)
- [Metadata Extraction Guide](./src/media/metadata/README.md)
