/**
 * MediaApiProvider - React Context for Media API Client
 *
 * Provides MediaApiClient and UploadClient instances to React components
 * through context, enabling easy access to API methods throughout the app.
 */

import React, { createContext, useContext, useMemo } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MediaApiClient, createMediaApiClient } from '../api/media-api-client';
import { UploadClient, createUploadClient } from '../api/upload-client';
import type { MediaApiClientConfig } from '../api/types';

interface MediaApiContextValue {
  mediaClient: MediaApiClient;
  uploadClient: UploadClient;
  config: MediaApiClientConfig;
}

const MediaApiContext = createContext<MediaApiContextValue | null>(null);

export interface MediaApiProviderProps {
  config: MediaApiClientConfig;
  children: React.ReactNode;
  queryClient?: QueryClient;
}

/**
 * Provider component that sets up Media API clients and React Query
 */
export function MediaApiProvider({
  config,
  children,
  queryClient: customQueryClient,
}: MediaApiProviderProps) {
  // Create or use provided query client
  const queryClient = useMemo(
    () =>
      customQueryClient ||
      new QueryClient({
        defaultOptions: {
          queries: {
            retry: 1,
            refetchOnWindowFocus: false,
            staleTime: 5 * 60 * 1000, // 5 minutes
          },
          mutations: {
            retry: 0,
          },
        },
      }),
    [customQueryClient],
  );

  // Create API clients
  const value = useMemo(
    () => ({
      mediaClient: createMediaApiClient(config),
      uploadClient: createUploadClient(config),
      config,
    }),
    [config],
  );

  return (
    <QueryClientProvider client={queryClient}>
      <MediaApiContext.Provider value={value}>
        {children}
      </MediaApiContext.Provider>
    </QueryClientProvider>
  );
}

/**
 * Hook to access Media API clients
 */
export function useMediaApiContext(): MediaApiContextValue {
  const context = useContext(MediaApiContext);

  if (!context) {
    throw new Error(
      'useMediaApiContext must be used within a MediaApiProvider',
    );
  }

  return context;
}

/**
 * Hook to access MediaApiClient directly
 */
export function useMediaClient(): MediaApiClient {
  return useMediaApiContext().mediaClient;
}

/**
 * Hook to access UploadClient directly
 */
export function useUploadClient(): UploadClient {
  return useMediaApiContext().uploadClient;
}
