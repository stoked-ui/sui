/**
 * MediaViewer Component Stories
 *
 * Storybook stories demonstrating the MediaViewer component with various
 * configurations and abstraction layer integrations.
 *
 * @storybook-ignore
 */

// @ts-ignore - Storybook types are optional dev dependency
import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { Box, Button } from '@mui/material';
import { MediaViewer } from './index';
import { createMockAuth, noOpRouter, createInMemoryQueue, createInMemoryKeyboardShortcuts } from '../../abstractions';
import type { MediaItem, MediaViewerProps, MediaViewerMode } from './MediaViewer.types';

// Use as string values since enum is type-only
const VIEWER_MODES = {
  NORMAL: 'NORMAL' as const,
  THEATER: 'THEATER' as const,
  FULLSCREEN: 'FULLSCREEN' as const,
};

/**
 * Sample media items for stories
 */
const sampleMediaItems: MediaItem[] = [
  {
    id: 'video-1',
    title: 'Introduction Video',
    description: 'Welcome to our channel',
    mediaType: 'video',
    file: '/videos/intro.mp4',
    url: 'https://example.com/videos/intro.mp4',
    thumbnail: '/images/intro-thumb.jpg',
    duration: 120,
    views: 5234,
    publicity: 'public',
    userId: 'creator-1',
  },
  {
    id: 'image-1',
    title: 'Beautiful Landscape',
    mediaType: 'image',
    file: '/images/landscape.jpg',
    url: 'https://example.com/images/landscape.jpg',
    thumbnail: '/images/landscape-thumb.jpg',
    publicity: 'public',
    views: 1234,
    userId: 'photographer-1',
  },
  {
    id: 'video-2',
    title: 'Tutorial Part 1',
    mediaType: 'video',
    file: '/videos/tutorial-1.mp4',
    url: 'https://example.com/videos/tutorial-1.mp4',
    thumbnail: '/images/tutorial-1-thumb.jpg',
    duration: 600,
    views: 3421,
    publicity: 'public',
    userId: 'creator-1',
  },
  {
    id: 'video-3',
    title: 'Tutorial Part 2',
    mediaType: 'video',
    file: '/videos/tutorial-2.mp4',
    url: 'https://example.com/videos/tutorial-2.mp4',
    thumbnail: '/images/tutorial-2-thumb.jpg',
    duration: 720,
    views: 2156,
    publicity: 'public',
    userId: 'creator-1',
  },
  {
    id: 'image-2',
    title: 'Sunset Photography',
    mediaType: 'image',
    file: '/images/sunset.jpg',
    url: 'https://example.com/images/sunset.jpg',
    thumbnail: '/images/sunset-thumb.jpg',
    publicity: 'public',
    views: 876,
    userId: 'photographer-1',
  },
];

const paidVideoItem: MediaItem = {
  id: 'premium-video-1',
  title: 'Premium Content',
  mediaType: 'video',
  file: '/videos/premium.mp4',
  url: 'https://example.com/videos/premium.mp4',
  thumbnail: '/images/premium-thumb.jpg',
  duration: 1200,
  views: 89,
  publicity: 'paid',
  userId: 'creator-premium-1',
};

// ============================================================================
// Component Metadata
// ============================================================================

// @ts-ignore - Storybook meta type
const meta = {
  title: 'Media/MediaViewer',
  component: MediaViewer,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'Full-screen media viewer with multiple view modes, queue management, and keyboard shortcuts.',
      },
    },
  },
  tags: ['autodocs'],
};

export default meta;
// @ts-ignore - Storybook story type
type Story = StoryObj<typeof meta>;

// ============================================================================
// Helper Component for Stories
// ============================================================================

interface MediaViewerWrapperProps {
  initialItem?: MediaItem;
  mediaItems?: MediaItem[];
  [key: string]: any;
}

function MediaViewerWrapper({
  initialItem = sampleMediaItems[0],
  mediaItems = sampleMediaItems,
  ...props
}: MediaViewerWrapperProps) {
  const [open, setOpen] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(
    mediaItems.findIndex((item) => item.id === initialItem.id) || 0
  );

  const currentItem = mediaItems[currentIndex];

  return (
    <Box>
      <Box sx={{ p: 2, backgroundColor: '#f0f0f0', borderBottom: '1px solid #ddd' }}>
        <Button
          variant="contained"
          onClick={() => setOpen(!open)}
          sx={{ mr: 2 }}
        >
          {open ? 'Close Viewer' : 'Open Viewer'}
        </Button>
        <Box sx={{ display: 'inline-block', fontSize: '0.875rem', color: '#666' }}>
          {mediaItems.length > 0 && (
            <>
              Current: {currentItem.title} ({currentIndex + 1}/{mediaItems.length})
            </>
          )}
        </Box>
      </Box>

      {open && (
        <MediaViewer
          item={currentItem}
          mediaItems={mediaItems}
          currentIndex={currentIndex}
          open={open}
          onClose={() => setOpen(false)}
          onNavigate={(item, index) => {
            setCurrentIndex(index);
          }}
          {...props}
        />
      )}
    </Box>
  );
}

// ============================================================================
// Basic Stories
// ============================================================================

/**
 * Basic video viewer with default settings
 */
export const BasicVideo: Story = {
  render: () => (
    <MediaViewerWrapper
      initialItem={sampleMediaItems[0]}
      mediaItems={[sampleMediaItems[0]]}
    />
  ),
};

/**
 * Basic image viewer
 */
export const BasicImage: Story = {
  render: () => (
    <MediaViewerWrapper
      initialItem={sampleMediaItems[1]}
      mediaItems={[sampleMediaItems[1]]}
    />
  ),
};

// ============================================================================
// Media Collection Stories
// ============================================================================

/**
 * Media collection with navigation between items
 */
export const MediaCollection: Story = {
  render: () => (
    <MediaViewerWrapper
      initialItem={sampleMediaItems[0]}
      mediaItems={sampleMediaItems}
      showPreviewCards={true}
    />
  ),
};

/**
 * Media collection with preview cards hidden
 */
export const CollectionWithoutPreview: Story = {
  render: () => (
    <MediaViewerWrapper
      initialItem={sampleMediaItems[0]}
      mediaItems={sampleMediaItems}
      showPreviewCards={false}
    />
  ),
};

// ============================================================================
// View Mode Stories
// ============================================================================

/**
 * Viewer in NORMAL mode (embedded view with preview cards)
 */
export const NormalMode: Story = {
  render: () => (
    <MediaViewerWrapper
      initialItem={sampleMediaItems[0]}
      mediaItems={sampleMediaItems}
      initialMode={VIEWER_MODES.NORMAL}
      showPreviewCards={true}
    />
  ),
};

/**
 * Viewer in THEATER mode (maximized without preview cards)
 */
export const TheaterMode: Story = {
  render: () => (
    <MediaViewerWrapper
      initialItem={sampleMediaItems[0]}
      mediaItems={sampleMediaItems}
      initialMode={VIEWER_MODES.THEATER}
      showPreviewCards={false}
    />
  ),
};

/**
 * Viewer in FULLSCREEN mode (browser fullscreen)
 */
export const FullscreenMode: Story = {
  render: () => (
    <MediaViewerWrapper
      initialItem={sampleMediaItems[0]}
      mediaItems={sampleMediaItems}
      initialMode={VIEWER_MODES.FULLSCREEN}
      showPreviewCards={false}
    />
  ),
};

// ============================================================================
// Authentication & Ownership Stories
// ============================================================================

/**
 * Viewer with owner controls enabled
 */
export const WithOwnerControls: Story = {
  render: () => {
    const [logs, setLogs] = useState<string[]>([]);

    const addLog = (msg: string) => {
      setLogs((prev) => [...prev.slice(-5), msg]);
    };

    const ownerAuth = createMockAuth(
      {
        id: 'creator-1',
        email: 'creator@example.com',
        name: 'Content Creator',
      },
      { isOwnerOfAll: true }
    );

    return (
      <Box>
        <MediaViewerWrapper
          initialItem={sampleMediaItems[0]}
          mediaItems={sampleMediaItems}
          auth={ownerAuth}
          enableOwnerControls={true}
          onEdit={(item) => addLog(`✎ Edit: ${item.title}`)}
          onDelete={(item) => addLog(`🗑 Delete: ${item.title}`)}
        />
        <Box
          sx={{
            position: 'fixed',
            bottom: 20,
            right: 20,
            backgroundColor: '#fff',
            border: '1px solid #ddd',
            borderRadius: '8px',
            p: 2,
            fontSize: '0.875rem',
            fontFamily: 'monospace',
            maxWidth: '300px',
            maxHeight: '150px',
            overflowY: 'auto',
            zIndex: 9999,
          }}
        >
          <strong>Events:</strong>
          {logs.map((log, i) => (
            <div key={i}>{log}</div>
          ))}
        </Box>
      </Box>
    );
  },
};

/**
 * Viewer with viewer (non-owner) mode
 */
export const ViewerMode: Story = {
  render: () => {
    const viewerAuth = createMockAuth(
      {
        id: 'viewer-user-1',
        email: 'viewer@example.com',
        name: 'Viewer',
      },
      { isOwnerOfAll: false }
    );

    return (
      <MediaViewerWrapper
        initialItem={sampleMediaItems[0]}
        mediaItems={sampleMediaItems}
        auth={viewerAuth}
        enableOwnerControls={true}
      />
    );
  },
};

// ============================================================================
// Queue Integration Stories
// ============================================================================

/**
 * Viewer with queue management enabled
 */
export const WithQueueIntegration: Story = {
  render: () => {
    const mockQueue = createInMemoryQueue();

    return (
      <MediaViewerWrapper
        initialItem={sampleMediaItems[0]}
        mediaItems={sampleMediaItems}
        queue={mockQueue}
        enableQueue={true}
        showPreviewCards={true}
      />
    );
  },
};

// ============================================================================
// Keyboard Shortcuts Stories
// ============================================================================

/**
 * Viewer with keyboard shortcuts enabled
 */
export const WithKeyboardShortcuts: Story = {
  render: () => {
    const keyboard = createInMemoryKeyboardShortcuts();

    return (
      <Box>
        <MediaViewerWrapper
          initialItem={sampleMediaItems[0]}
          mediaItems={sampleMediaItems}
          keyboard={keyboard}
          enableKeyboardShortcuts={true}
        />
        <Box
          sx={{
            position: 'fixed',
            bottom: 20,
            left: 20,
            backgroundColor: '#fff',
            border: '1px solid #ddd',
            borderRadius: '8px',
            p: 2,
            fontSize: '0.75rem',
            zIndex: 9999,
          }}
        >
          <strong>Keyboard Shortcuts:</strong>
          <div>← → : Previous/Next</div>
          <div>f : Cycle view modes</div>
          <div>Esc : Close/Exit fullscreen</div>
        </Box>
      </Box>
    );
  },
};

// ============================================================================
// Configuration Stories
// ============================================================================

/**
 * Viewer with autoplay enabled
 */
export const WithAutoplay: Story = {
  render: () => (
    <MediaViewerWrapper
      initialItem={sampleMediaItems[0]}
      mediaItems={sampleMediaItems}
      autoplay={true}
      showPreviewCards={true}
    />
  ),
};

/**
 * Viewer with header hidden
 */
export const HideNavbar: Story = {
  render: () => (
    <MediaViewerWrapper
      initialItem={sampleMediaItems[0]}
      mediaItems={sampleMediaItems}
      hideNavbar={true}
      showPreviewCards={true}
    />
  ),
};

/**
 * Viewer with initially muted audio
 */
export const InitiallyMuted: Story = {
  render: () => (
    <MediaViewerWrapper
      initialItem={sampleMediaItems[0]}
      mediaItems={sampleMediaItems}
      initialMuted={true}
      showPreviewCards={true}
    />
  ),
};

// ============================================================================
// Router Integration Story
// ============================================================================

/**
 * Viewer with router integration
 */
export const WithRouterIntegration: Story = {
  render: () => {
    const [logs, setLogs] = useState<string[]>([]);

    const addLog = (msg: string) => {
      setLogs((prev) => [...prev.slice(-4), msg]);
    };

    const customRouter = {
      navigate: (path: string) => {
        addLog(`Navigated: ${path}`);
      },
      currentPath: () => '/media/viewer',
      query: () => new URLSearchParams(),
    };

    return (
      <Box>
        <MediaViewerWrapper
          initialItem={sampleMediaItems[0]}
          mediaItems={sampleMediaItems}
          router={customRouter}
          showPreviewCards={true}
        />
        <Box
          sx={{
            position: 'fixed',
            bottom: 20,
            right: 20,
            backgroundColor: '#fff',
            border: '1px solid #ddd',
            borderRadius: '8px',
            p: 2,
            fontSize: '0.875rem',
            fontFamily: 'monospace',
            zIndex: 9999,
          }}
        >
          <strong>Navigation Log:</strong>
          {logs.map((log, i) => (
            <div key={i}>{log}</div>
          ))}
        </Box>
      </Box>
    );
  },
};

// ============================================================================
// Payment Integration Story
// ============================================================================

/**
 * Viewer with paid content
 */
export const WithPaidContent: Story = {
  render: () => {
    const viewerAuth = createMockAuth(
      {
        id: 'viewer-1',
        email: 'viewer@example.com',
        name: 'Viewer',
      },
      { isOwnerOfAll: false }
    );

    return (
      <MediaViewerWrapper
        initialItem={paidVideoItem}
        mediaItems={[paidVideoItem, sampleMediaItems[0]]}
        auth={viewerAuth}
        showPreviewCards={true}
      />
    );
  },
};

// ============================================================================
// Media Class / Branding Story
// ============================================================================

/**
 * Viewer with MediaClass branding configuration
 */
export const WithMediaClassBranding: Story = {
  render: () => {
    const mediaClass = {
      id: 'premium-class',
      name: 'Premium Channel',
      beforeIdent: {
        id: 'ident-before',
        thumbnail: '/idents/before.jpg',
        duration: 3,
      },
      afterIdent: {
        id: 'ident-after',
        thumbnail: '/idents/after.jpg',
        duration: 3,
      },
      videoBug: {
        imageId: 'bug-logo',
        imageUrl: '/logos/watermark.png',
        position: 'bottom-right' as const,
        sizePercent: 10,
        opacity: 0.8,
        intervalSeconds: 5,
        durationSeconds: 2,
        initialDelaySeconds: 1,
      },
    };

    return (
      <MediaViewerWrapper
        initialItem={sampleMediaItems[0]}
        mediaItems={sampleMediaItems}
        mediaClass={mediaClass}
        enableMediaClass={true}
        autoplay={true}
        showPreviewCards={true}
      />
    );
  },
};

// ============================================================================
// Complete Integration Story
// ============================================================================

/**
 * Complete example with all abstraction layers integrated
 */
export const CompleteIntegration: Story = {
  render: () => {
    const [logs, setLogs] = useState<string[]>([]);

    const addLog = (msg: string) => {
      setLogs((prev) => [...prev.slice(-6), msg]);
    };

    const ownerAuth = createMockAuth(
      {
        id: 'creator-1',
        email: 'creator@example.com',
        name: 'Content Creator',
      },
      { isOwnerOfAll: true }
    );

    // @ts-ignore - partial router implementation
    const customRouter = {
      navigate: (path: string) => {
        addLog(`🔗 Navigated: ${path}`);
      },
      getQueryParam: (key: string) => undefined,
      getAllQueryParams: () => ({}),
      getPathname: () => '/media/viewer',
    };

    const mockQueue = createInMemoryQueue();
    const keyboard = createInMemoryKeyboardShortcuts();

    return (
      <Box>
        <MediaViewerWrapper
          initialItem={sampleMediaItems[0]}
          mediaItems={sampleMediaItems}
          router={customRouter}
          auth={ownerAuth}
          queue={mockQueue}
          keyboard={keyboard}
          enableOwnerControls={true}
          enableQueue={true}
          enableKeyboardShortcuts={true}
          showPreviewCards={true}
          autoplay={true}
          onEdit={(item) => addLog(`✎ Edit: ${item.title}`)}
          onDelete={(item) => addLog(`🗑 Delete: ${item.title}`)}
          onNavigate={(item, index) => addLog(`→ Navigate: ${item.title}`)}
        />
        <Box
          sx={{
            position: 'fixed',
            bottom: 20,
            right: 20,
            backgroundColor: '#fff',
            border: '1px solid #ddd',
            borderRadius: '8px',
            p: 2,
            fontSize: '0.75rem',
            fontFamily: 'monospace',
            maxWidth: '350px',
            maxHeight: '200px',
            overflowY: 'auto',
            zIndex: 9999,
          }}
        >
          <strong>Events Log:</strong>
          <div style={{ marginTop: '8px' }}>
            {logs.length === 0 ? (
              <div>Interact with viewer...</div>
            ) : (
              logs.map((log, i) => (
                <div key={i}>{log}</div>
              ))
            )}
          </div>
          <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #ddd', fontSize: '0.65rem' }}>
            <strong>Controls:</strong>
            <div>← → : Prev/Next</div>
            <div>f : View modes</div>
            <div>Esc : Close</div>
          </div>
        </Box>
      </Box>
    );
  },
};

// ============================================================================
// Single Item Stories
// ============================================================================

/**
 * Single video viewer (no navigation)
 */
export const SingleVideo: Story = {
  render: () => (
    <MediaViewerWrapper
      initialItem={sampleMediaItems[0]}
      mediaItems={[sampleMediaItems[0]]}
      showPreviewCards={false}
    />
  ),
};

/**
 * Single image viewer
 */
export const SingleImage: Story = {
  render: () => (
    <MediaViewerWrapper
      initialItem={sampleMediaItems[1]}
      mediaItems={[sampleMediaItems[1]]}
      showPreviewCards={false}
    />
  ),
};

// ============================================================================
// Edge Cases
// ============================================================================

/**
 * Viewer with minimal configuration
 */
export const MinimalConfiguration: Story = {
  render: () => {
    const [open, setOpen] = useState(true);

    return (
      <Box>
        <Box sx={{ p: 2, backgroundColor: '#f0f0f0' }}>
          <Button variant="contained" onClick={() => setOpen(!open)}>
            {open ? 'Close' : 'Open'} Viewer
          </Button>
        </Box>
        {open && (
          <MediaViewer
            item={sampleMediaItems[0]}
            open={true}
            onClose={() => setOpen(false)}
          />
        )}
      </Box>
    );
  },
};

/**
 * Viewer with all features disabled
 */
export const AllFeaturesDisabled: Story = {
  render: () => (
    <MediaViewerWrapper
      initialItem={sampleMediaItems[0]}
      mediaItems={sampleMediaItems}
      enableQueue={false}
      enableKeyboardShortcuts={false}
      enableOwnerControls={false}
      enableMediaClass={false}
      showPreviewCards={false}
      hideNavbar={false}
    />
  ),
};
