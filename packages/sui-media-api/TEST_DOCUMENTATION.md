# Test Documentation - @stoked-ui/media-api

## Overview

Comprehensive test suite for the NestJS media API backend, ensuring high quality and reliability with minimum 80% code coverage.

## Test Structure

```
packages/sui-media-api/
├── src/
│   ├── s3/
│   │   └── s3.service.spec.ts          # S3 service unit tests
│   ├── uploads/
│   │   ├── uploads.service.spec.ts     # Upload service unit tests
│   │   └── uploads.controller.spec.ts  # Upload controller integration tests
│   ├── media/
│   │   ├── media.service.spec.ts       # Media service unit tests
│   │   └── ...
│   └── health/
│       └── health.controller.spec.ts   # Health check tests
└── test/
    ├── jest-e2e.json                   # E2E test configuration
    └── uploads-e2e.spec.ts             # Complete upload flow E2E tests
```

## Test Categories

### 1. Unit Tests

Unit tests for all services ensuring business logic correctness:

#### S3Service Tests (`s3.service.spec.ts`)
- ✅ Object existence checks
- ✅ Object metadata retrieval
- ✅ Object download operations
- ✅ Object upload operations
- ✅ Single file deletion
- ✅ Batch file deletion
- ✅ Media and thumbnail deletion
- ✅ S3 key extraction from URLs
- ✅ Multipart upload initiation
- ✅ Presigned URL generation
- ✅ Multipart upload completion
- ✅ Multipart upload abortion
- ✅ Upload parts listing
- ✅ Error handling for all operations

#### UploadsService Tests (`uploads.service.spec.ts`)
- ✅ Upload initiation with custom chunk sizes
- ✅ Duplicate detection by hash
- ✅ Upload status retrieval
- ✅ Part completion tracking
- ✅ Upload completion with media creation
- ✅ Upload abortion
- ✅ Active uploads listing
- ✅ S3 synchronization
- ✅ Presigned URL regeneration
- ✅ Error handling (forbidden, not found, conflict)
- ✅ Edge cases (expired uploads, invalid parts)

### 2. Integration Tests

Integration tests for controllers ensuring proper API behavior:

#### UploadsController Tests (`uploads.controller.spec.ts`)
- ✅ Upload initiation endpoint
- ✅ Upload status retrieval
- ✅ Part completion endpoint
- ✅ Upload completion endpoint
- ✅ Upload abortion endpoint
- ✅ Active uploads listing
- ✅ Presigned URL generation
- ✅ S3 synchronization
- ✅ User authentication handling
- ✅ Request/response validation

### 3. E2E Tests

End-to-end tests for critical user flows:

#### Complete Upload Flow (`uploads-e2e.spec.ts`)
- ✅ Full upload workflow (initiate → upload → complete)
- ✅ Upload resume functionality
- ✅ Upload abortion flow
- ✅ Active uploads management
- ✅ Duplicate detection
- ✅ Error handling scenarios
- ✅ Multi-part upload coordination
- ✅ Status tracking and progress

## Running Tests

### Run All Tests
```bash
pnpm test
```

### Run Tests with Coverage
```bash
pnpm test:cov
```

### Run E2E Tests
```bash
pnpm test:e2e
```

### Run Tests in Watch Mode
```bash
pnpm test:watch
```

### Run Tests in CI
```bash
pnpm test:ci
```

## Coverage Requirements

Minimum coverage thresholds enforced:

- **Branches**: 80%
- **Functions**: 80%
- **Lines**: 80%
- **Statements**: 80%

Critical paths require 100% coverage:
- Upload operations (initiate, upload, complete)
- CRUD operations for media
- Authentication and authorization

## Mocking Strategy

### S3 Client Mocks
- AWS SDK S3 commands are mocked
- Presigned URL generation is mocked
- Error scenarios are simulated

### Database Mocks
- In-memory storage for development
- MongoDB will be mocked in tests when integrated
- Consistent data state across tests

### External Service Mocks
- FFmpeg for video processing
- Sharp for image processing
- S3 for file storage

## Test Utilities

### Mock Factories
Located in test files for creating consistent test data:

```typescript
// Create mock upload session
const mockSession = createMockSession({
  totalSize: 10 * 1024 * 1024,
  chunkSize: 5 * 1024 * 1024,
});

// Create mock media item
const mockMedia = createMockMedia({
  type: 'video',
  duration: 120,
});
```

## Best Practices

1. **Isolation**: Each test is independent with proper setup/teardown
2. **Clarity**: Test names clearly describe what is being tested
3. **Coverage**: Aim for edge cases and error paths
4. **Speed**: Unit tests run in milliseconds
5. **Reliability**: No flaky tests; deterministic results
6. **Maintainability**: Tests are easy to understand and update

## CI/CD Integration

Tests are automatically run on:
- Push to main/develop branches
- Pull requests
- Pre-commit hooks (optional)

Coverage reports are:
- Generated in HTML format (coverage/index.html)
- Sent to Codecov for tracking
- Enforced via CI checks

## Troubleshooting

### Common Issues

**Tests timing out:**
- Increase timeout in jest.config.json
- Check for unresolved promises
- Ensure mocks are properly configured

**Coverage below threshold:**
- Run `pnpm test:cov` to see uncovered lines
- Add tests for missing scenarios
- Check if files are excluded in jest.config

**E2E tests failing:**
- Ensure all services are properly started
- Check environment variables
- Verify database connections

## Future Enhancements

- [ ] Visual regression tests for error pages
- [ ] Performance benchmarks
- [ ] Load testing for upload endpoints
- [ ] Contract testing with frontend
- [ ] Mutation testing for test quality
