import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

/**
 * Create a new QueryClient for testing
 */
export function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
        staleTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
    logger: {
      log: () => {},
      warn: () => {},
      error: () => {},
    },
  });
}

/**
 * Custom render function that wraps components with necessary providers
 */
interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  queryClient?: QueryClient;
}

export function renderWithProviders(
  ui: ReactElement,
  options?: CustomRenderOptions,
) {
  const { queryClient = createTestQueryClient(), ...renderOptions } =
    options || {};

  function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    );
  }

  return {
    ...render(ui, { wrapper: Wrapper, ...renderOptions }),
    queryClient,
  };
}

/**
 * Wait for all pending promises to resolve
 */
export function flushPromises() {
  return new Promise((resolve) => setImmediate(resolve));
}

/**
 * Create a mock File object for testing
 */
export function createMockFile(
  name: string,
  size: number,
  type: string,
  content = 'test content',
): File {
  const blob = new Blob([content], { type });
  const file = new File([blob], name, { type });
  Object.defineProperty(file, 'size', { value: size });
  return file;
}

/**
 * Create a mock video File
 */
export function createMockVideoFile(
  name = 'test-video.mp4',
  size = 10 * 1024 * 1024,
): File {
  return createMockFile(name, size, 'video/mp4');
}

/**
 * Create a mock image File
 */
export function createMockImageFile(
  name = 'test-image.jpg',
  size = 1 * 1024 * 1024,
): File {
  return createMockFile(name, size, 'image/jpeg');
}

/**
 * Mock media object for testing
 */
export function createMockMedia(overrides = {}) {
  return {
    id: 'media-123',
    userId: 'user-123',
    type: 'video' as const,
    file: 'uploads/user-123/video.mp4',
    filename: 'test-video.mp4',
    mime: 'video/mp4',
    size: 10 * 1024 * 1024,
    bucket: 'test-bucket',
    region: 'us-east-1',
    publicity: 'private' as const,
    deleted: false,
    duration: 120,
    width: 1920,
    height: 1080,
    thumbnail: 'thumbs/video-thumb.jpg',
    thumbs: ['thumbs/video-thumb-1.jpg', 'thumbs/video-thumb-2.jpg'],
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    ...overrides,
  };
}

/**
 * Mock upload session for testing
 */
export function createMockUploadSession(overrides = {}) {
  return {
    sessionId: 'session-123',
    uploadId: 'upload-123',
    presignedUrls: [
      { partNumber: 1, url: 'https://test-url-1.example.com' },
    ],
    totalParts: 1,
    chunkSize: 10 * 1024 * 1024,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    ...overrides,
  };
}

/**
 * Mock upload status for testing
 */
export function createMockUploadStatus(overrides = {}) {
  return {
    sessionId: 'session-123',
    status: 'in_progress' as const,
    filename: 'test-video.mp4',
    totalSize: 10 * 1024 * 1024,
    totalParts: 1,
    completedParts: 0,
    progress: 0,
    pendingPartNumbers: [1],
    presignedUrls: [
      { partNumber: 1, url: 'https://test-url-1.example.com' },
    ],
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    ...overrides,
  };
}

// Re-export everything from @testing-library/react
export * from '@testing-library/react';
export { default as userEvent } from '@testing-library/user-event';
