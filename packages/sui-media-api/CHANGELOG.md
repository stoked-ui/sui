# Changelog

All notable changes to the @stoked-ui/media-api package will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-01-21

### Initial Release

This is the first stable release of @stoked-ui/media-api, a production-ready NestJS API service for comprehensive media management.

### Added

#### Core API Features

- **Media CRUD Operations**
  - Create media entries with metadata
  - Read single media by ID
  - List media with advanced filtering and pagination
  - Update media metadata
  - Delete media (soft delete by default)
  - Restore deleted media

- **Advanced Query Capabilities**
  - Pagination (offset-based and cursor-based)
  - Filtering by mediaType, mime, publicity, uploadedBy, rating
  - Date range filtering (dateFrom, dateTo)
  - Full-text search across title, description, and tags
  - Tag-based filtering
  - Sorting (any field, ascending or descending)
  - Include deleted items option

#### File Management

- **Upload Endpoints**
  - Multipart file upload
  - Upload progress tracking
  - File type validation
  - File size limits
  - Direct upload to S3
  - Automatic metadata extraction on upload

- **S3 Integration**
  - AWS S3 service for reliable file storage
  - Presigned URL generation for secure uploads
  - Presigned URL generation for downloads
  - Automatic file cleanup on deletion
  - Configurable bucket and region
  - Local storage fallback for development

#### Media Processing

- **Metadata Extraction Service**
  - Video metadata extraction using FFmpeg
  - Duration, dimensions, codec, bitrate detection
  - Frame rate and aspect ratio extraction
  - Image metadata extraction
  - EXIF data parsing for images
  - Automatic metadata updates in database

- **Thumbnail Generation**
  - Server-side thumbnail generation for videos
  - Configurable thumbnail dimensions
  - Timestamp-based frame extraction
  - Sharp image processing for optimization
  - Automatic upload to S3
  - Fallback to first frame if timestamp invalid

- **Sprite Sheet Generation**
  - Video sprite sheet creation for scrubber previews
  - Configurable frames per row
  - Configurable frame dimensions
  - Configurable interval between frames
  - Optimized sprite sheet layout
  - Automatic configuration generation
  - Upload to S3 with metadata

#### Database

- **MongoDB Integration**
  - Mongoose ODM for data modeling
  - Schema validation
  - Indexes for optimized queries
  - Soft delete support
  - Timestamps (createdAt, updatedAt)
  - Connection pooling

- **Media Entity Schema**
  - Title, description, mediaType
  - File URL and thumbnail URL
  - Video metadata (duration, width, height, codec, bitrate, fps)
  - File metadata (size, mime type)
  - Publicity settings (public, private, paid)
  - View count tracking
  - Author/uploader tracking
  - Tags array
  - Ratings map
  - Soft delete flag
  - Timestamps

#### Authentication & Authorization

- **JWT Authentication**
  - JWT token validation
  - User context extraction
  - Protected endpoints
  - Current user decorator
  - Token expiration handling

- **Authorization Guards**
  - Auth guard for protected routes
  - Owner-only operations (edit, delete)
  - Permission-based access control

#### Performance

- **Caching Middleware**
  - Automatic response caching for GET requests
  - Configurable TTL (time to live)
  - Cache invalidation on updates
  - Exclude patterns for specific routes
  - In-memory cache implementation

- **Query Optimization**
  - Database indexes on common query fields
  - Cursor-based pagination for large datasets
  - Lazy loading support
  - Efficient sorting and filtering

#### Deployment

- **AWS Lambda Support**
  - Serverless deployment via SST
  - Lambda handler with @codegenie/serverless-express
  - Optimized cold start performance
  - Environment variable configuration
  - Stage-based deployment (dev, staging, prod)

- **Local Development**
  - Hot reload with Nest CLI
  - Development mode with watch
  - Debug mode support
  - Local MongoDB connection
  - Environment file support

#### API Documentation

- **Swagger/OpenAPI**
  - Automatically generated API documentation
  - Interactive API explorer at /api
  - Request/response schemas
  - Authentication documentation
  - Example requests and responses
  - Export OpenAPI spec to JSON/YAML

#### Health & Monitoring

- **Health Check Endpoint**
  - Service health status
  - Timestamp and version information
  - Database connection check
  - Dependency health checks

#### Developer Experience

- **TypeScript**
  - Full TypeScript support
  - Strict type checking
  - Type-safe DTOs with class-validator
  - Type-safe database models

- **Testing**
  - Unit tests for services and controllers
  - E2E tests for API endpoints
  - Test utilities and fixtures
  - Mocked dependencies for isolated testing
  - Coverage reporting

- **Code Quality**
  - ESLint configuration
  - Prettier formatting
  - Pre-commit hooks
  - Type checking

#### Configuration

- **Environment Variables**
  - PORT (server port)
  - NODE_ENV (environment)
  - API_PATH_PREFIX (API route prefix)
  - MONGODB_URI (database connection)
  - AWS_REGION, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY (S3 config)
  - S3_BUCKET (storage bucket)
  - JWT_SECRET, JWT_EXPIRE (authentication)
  - SST_STAGE (deployment stage)
  - FFMPEG_PATH, FFPROBE_PATH (video processing)

- **CORS Configuration**
  - Configurable allowed origins
  - Credentials support
  - Custom headers

### API Endpoints

#### Media Endpoints

- `GET /media` - List media with filtering
- `GET /media/:id` - Get single media
- `POST /media` - Create media entry
- `PATCH /media/:id` - Update media
- `DELETE /media/:id` - Delete media
- `POST /media/:id/extract-metadata` - Extract metadata from file
- `POST /media/:id/thumbnail` - Generate thumbnail
- `POST /media/:id/sprite` - Generate sprite sheet
- `GET /media/api/info` - Get API information

#### Upload Endpoints

- `POST /uploads` - Upload file
- `GET /uploads/:id/progress` - Get upload progress

#### Health Endpoint

- `GET /health` - Health check

### DTOs (Data Transfer Objects)

- **CreateMediaDto**: Media creation
- **UpdateMediaDto**: Media updates
- **QueryMediaDto**: List query parameters
- **MediaResponseDto**: Standardized response
- **MediaListResponseDto**: Paginated list response
- **MetadataDto**: Extracted metadata
- **ThumbnailDto**: Thumbnail generation parameters
- **SpriteSheetDto**: Sprite sheet configuration

### Services

- **MediaService**: Core business logic for media CRUD
- **MetadataExtractionService**: Video/image metadata extraction
- **VideoProcessingService**: Thumbnail and sprite generation
- **S3Service**: AWS S3 file operations
- **UploadsService**: File upload handling

### Dependencies

- **Core Dependencies**:
  - @nestjs/common: ^10.3.0
  - @nestjs/core: ^10.3.0
  - @nestjs/config: ^4.0.0
  - @nestjs/mongoose: ^10.0.0
  - @nestjs/platform-express: ^10.3.0
  - @nestjs/swagger: ^7.4.2
  - mongoose: ^8.0.0
  - express: ^5.0.1

- **AWS Integration**:
  - @aws-sdk/client-s3: ^3.42.0
  - @aws-sdk/s3-request-presigner: ^3.830.0
  - @codegenie/serverless-express: ^4.16.0

- **Media Processing**:
  - fluent-ffmpeg: ^2.1.3
  - sharp: ^0.34.5

- **Utilities**:
  - class-transformer: ^0.5.1
  - class-validator: ^0.14.3
  - dotenv: ^16.4.7
  - cookie-parser: ^1.4.7
  - reflect-metadata: ^0.2.1
  - rxjs: ^7.8.1

### Deployment Platforms

- **AWS Lambda**: Serverless deployment with SST
- **Docker**: Containerized deployment
- **Traditional Servers**: Node.js deployment on VPS/EC2
- **Platform-as-a-Service**: Heroku, Render, Railway, etc.

### Development Requirements

- Node.js 18+
- MongoDB 5.0+
- FFmpeg (for video processing)
- AWS S3 account (optional, has local fallback)

### Browser Support

This is a backend API, browser support is N/A. The API is designed to work with any HTTP client.

### Security

- JWT authentication for protected endpoints
- Input validation with class-validator
- CORS configuration
- Environment variable protection
- Secure file upload validation
- SQL injection protection via Mongoose
- XSS protection

### Performance Benchmarks

- Metadata extraction: < 5s for typical videos
- Thumbnail generation: < 3s
- Sprite sheet generation: < 10s for 100 frames
- API response time: < 100ms for cached requests
- Database query time: < 50ms with indexes

### Known Limitations

- FFmpeg required for video processing (optional)
- Large file uploads may timeout on serverless platforms (use multipart)
- Sprite sheet generation can be memory-intensive for high-resolution videos
- MongoDB required (no other database adapters yet)

### Future Enhancements

Planned for future releases:
- Support for other databases (PostgreSQL, MySQL)
- Real-time upload progress via WebSockets
- Advanced video transcoding
- Content delivery network (CDN) integration
- Advanced analytics and usage tracking
- Rate limiting and quota management

### Contributors

- Brian Stoker (Author)

---

For more information, see the [README](./README.md).
