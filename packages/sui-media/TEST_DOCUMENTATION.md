# Test Documentation - @stoked-ui/media

## Overview

Comprehensive test suite for the React media components, ensuring high quality, accessibility, and reliability with minimum 80% code coverage.

## Test Structure

```
packages/sui-media/
├── src/
│   ├── __tests__/
│   │   ├── setup.ts                    # Global test setup
│   │   ├── utils/
│   │   │   └── test-utils.tsx          # Custom render, utilities
│   │   └── mocks/
│   │       └── api-client.mock.ts      # API client mocks
│   ├── components/
│   │   ├── MediaCard/
│   │   │   └── __tests__/
│   │   │       ├── MediaCard.test.tsx
│   │   │       └── MediaCard.utils.test.ts
│   │   └── MediaViewer/
│   │       └── __tests__/
│   │           ├── MediaViewer.test.tsx
│   │           └── hooks.test.ts
│   └── abstractions/
│       └── __tests__/
│           ├── Auth.test.ts
│           ├── Router.test.ts
│           └── ...
└── jest.config.js                      # Jest configuration
```

## Test Categories

### 1. Component Tests

#### MediaCard Tests
- ✅ Rendering with different media types (video, image)
- ✅ Display of media information (title, duration, price)
- ✅ User interaction handling (click, hover, keyboard)
- ✅ Loading and error states
- ✅ Selection mode functionality
- ✅ Owner controls (edit, delete)
- ✅ Payment indicators for paid content
- ✅ Accessibility (ARIA labels, keyboard navigation)

#### MediaViewer Tests
- ✅ Video playback controls
- ✅ Image display and navigation
- ✅ Fullscreen functionality
- ✅ Playlist navigation
- ✅ Loading states
- ✅ Error handling
- ✅ Keyboard shortcuts
- ✅ Accessibility compliance

### 2. Hook Tests

Testing custom React hooks with @testing-library/react-hooks:

#### useMediaUpload
- ✅ Upload initiation
- ✅ Progress tracking
- ✅ Part upload handling
- ✅ Upload completion
- ✅ Error handling and retries
- ✅ Upload cancellation

#### useMediaList
- ✅ Media fetching
- ✅ Pagination
- ✅ Filtering by type
- ✅ Loading states
- ✅ Error states
- ✅ Cache invalidation

#### useMediaViewerState
- ✅ State management
- ✅ Playback control
- ✅ Navigation between media items
- ✅ Event handling

### 3. Integration Tests

#### API Client Integration
- ✅ Upload flow with API client
- ✅ Media CRUD operations
- ✅ Error handling
- ✅ Request cancellation
- ✅ Retry logic

### 4. Accessibility Tests

Using jest-axe for automated accessibility testing:

- ✅ ARIA labels on interactive elements
- ✅ Keyboard navigation (Tab, Enter, Space, Arrow keys)
- ✅ Screen reader compatibility
- ✅ Color contrast validation
- ✅ Focus management
- ✅ Semantic HTML usage

## Running Tests

### Run All Tests
```bash
pnpm test
```

### Run Tests with Coverage
```bash
pnpm test:coverage
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

## Test Utilities

### Custom Render Function

```typescript
import { renderWithProviders } from './__tests__/utils/test-utils';

renderWithProviders(<MyComponent />, {
  queryClient: customQueryClient,
});
```

Automatically wraps components with:
- React Query Provider
- Theme Provider (if needed)
- Router Provider (if needed)

### Mock Factories

```typescript
import {
  createMockMedia,
  createMockUploadSession,
  createMockFile,
} from './__tests__/utils/test-utils';

const mockMedia = createMockMedia({
  type: 'video',
  duration: 120,
});

const mockFile = createMockVideoFile('test.mp4', 10 * 1024 * 1024);
```

### API Client Mocks

```typescript
import { createMockApiClient } from './__tests__/mocks/api-client.mock';

const mockClient = createMockApiClient();
mockClient.setMockResponse('listMedia', {
  items: [/* ... */],
  total: 10,
});
```

## Testing Patterns

### Testing User Interactions

```typescript
import { renderWithProviders, userEvent } from '@/tests/utils/test-utils';

test('handles click event', async () => {
  const handleClick = jest.fn();
  const { getByRole } = renderWithProviders(
    <Button onClick={handleClick}>Click me</Button>
  );

  await userEvent.click(getByRole('button'));
  expect(handleClick).toHaveBeenCalled();
});
```

### Testing Async Operations

```typescript
test('loads data successfully', async () => {
  const { findByText } = renderWithProviders(<MediaList />);

  // Wait for data to load
  expect(await findByText('My Video')).toBeInTheDocument();
});
```

### Testing Loading States

```typescript
test('shows loading state', () => {
  const { getByTestId } = renderWithProviders(<MediaCard loading />);

  expect(getByTestId('loading-skeleton')).toBeInTheDocument();
});
```

### Testing Error States

```typescript
test('displays error message', () => {
  mockClient.setMockError('listMedia', new Error('Failed to load'));

  const { getByText } = renderWithProviders(<MediaList />);

  expect(getByText(/failed to load/i)).toBeInTheDocument();
});
```

### Testing Accessibility

```typescript
import { axe } from 'jest-axe';

test('has no accessibility violations', async () => {
  const { container } = renderWithProviders(<MediaCard item={mockItem} />);

  const results = await axe(container);
  expect(results).toHaveNoViolations();
});
```

## Mocking Strategy

### Window APIs
- `window.matchMedia` - Mocked for responsive tests
- `IntersectionObserver` - Mocked for lazy loading
- `ResizeObserver` - Mocked for resize detection
- `HTMLMediaElement` - Mocked for video/audio playback

### External Dependencies
- React Query - Configured for tests (no retry, instant GC)
- Fetch API - Mocked globally
- File API - Mock File objects for uploads

## Best Practices

1. **Arrange-Act-Assert**: Structure tests clearly
2. **User-Centric**: Test from user's perspective
3. **Accessibility First**: Include a11y in all component tests
4. **Isolation**: Mock external dependencies
5. **Snapshots**: Use sparingly, only for stable UI
6. **Queries**: Prefer `getByRole` over `getByTestId`

## CI/CD Integration

Tests run on:
- Every commit to feature branches
- Pull requests to main/develop
- Pre-push hooks (optional)

Coverage enforcement:
- HTML reports generated
- Uploaded to Codecov
- PR comments with coverage diff

## Common Issues

### Tests Failing Intermittently
- Check for race conditions with async operations
- Use `waitFor` instead of arbitrary timeouts
- Ensure proper cleanup in afterEach

### Mock Not Working
- Verify mock is defined before component import
- Check jest.mock() call placement
- Clear mocks between tests

### Coverage Not Meeting Threshold
- Run with `--coverage` to see uncovered lines
- Add tests for edge cases
- Check for unreachable code

## Future Enhancements

- [ ] Visual regression tests with Percy/Chromatic
- [ ] Component performance benchmarks
- [ ] Storybook interaction tests
- [ ] Cross-browser compatibility tests
- [ ] Mobile device testing
