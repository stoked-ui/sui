/**
 * MediaCard Component Stories
 *
 * Storybook stories demonstrating the MediaCard component with various
 * configurations and abstraction layer integrations.
 *
 * @storybook-ignore
 */

// @ts-ignore - Storybook types are optional dev dependency
import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { Box } from '@mui/material';
import { MediaCard } from './MediaCard';
import { createMockAuth, createMockPayment, noOpRouter, createInMemoryQueue } from '../../abstractions';
import type { ExtendedMediaItem, MediaCardModeState } from './MediaCard.types';

/**
 * Sample media items for stories
 */
const sampleVideoItem: ExtendedMediaItem = {
  _id: 'video-1',
  title: 'Sample Video',
  description: 'A sample video for demonstration',
  mediaType: 'video',
  file: '/videos/sample.mp4',
  thumbnail: '/images/video-thumb.jpg',
  duration: 300,
  publicity: 'public',
  views: 1234,
  likes: ['user1', 'user2'],
  dislikes: [],
  author: 'content-creator-1',
  url: 'https://example.com/videos/sample.mp4',
};

const sampleImageItem: ExtendedMediaItem = {
  _id: 'image-1',
  title: 'Sample Image',
  mediaType: 'image',
  file: '/images/sample.jpg',
  thumbnail: '/images/sample-thumb.jpg',
  publicity: 'public',
  views: 567,
  author: 'photographer-1',
  url: 'https://example.com/images/sample.jpg',
  width: 1920,
  height: 1080,
};

const paidVideoItem: ExtendedMediaItem = {
  _id: 'paid-video-1',
  title: 'Premium Video Content',
  mediaType: 'video',
  file: '/videos/premium.mp4',
  thumbnail: '/images/premium-thumb.jpg',
  paidThumbnail: '/images/premium-locked.jpg',
  duration: 1200,
  publicity: 'paid',
  price: 500, // satoshis
  views: 89,
  author: 'premium-creator-1',
  url: 'https://example.com/videos/premium.mp4',
};

const videoWithProgress: ExtendedMediaItem = {
  ...sampleVideoItem,
  _id: 'video-progress-1',
  title: 'Video with Progress Tracking',
  scrubberGenerated: true,
  scrubberSprite: '/sprites/sample-sprite.jpg',
  scrubberSpriteConfig: {
    totalFrames: 100,
    framesPerRow: 10,
    frameWidth: 160,
    frameHeight: 90,
    spriteSheetWidth: 1600,
    spriteSheetHeight: 900,
    interval: 3,
  },
};

// ============================================================================
// Component Metadata
// ============================================================================

// @ts-ignore - Storybook meta type
const meta = {
  title: 'Media/MediaCard',
  component: MediaCard,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Interactive media card for displaying images and videos with selection and control capabilities.',
      },
    },
  },
  tags: ['autodocs'],
};

export default meta;
// @ts-ignore - Storybook story type
type Story = StoryObj<typeof meta>;

// ============================================================================
// Helper Component for Stateful Stories
// ============================================================================

interface MediaCardWrapperProps {
  item: ExtendedMediaItem;
  [key: string]: any;
}

function MediaCardWrapper({ item, ...props }: MediaCardWrapperProps) {
  const [modeState, setModeState] = useState<MediaCardModeState>({ mode: 'view' });

  return (
    <Box sx={{ width: 320, display: 'flex', flexDirection: 'column', gap: 1 }}>
      <MediaCard
        item={item}
        modeState={modeState}
        setModeState={setModeState}
        {...props}
      />
      <Box sx={{ fontSize: '0.875rem', color: '#666' }}>
        <p>Mode: {modeState.mode}</p>
      </Box>
    </Box>
  );
}

// ============================================================================
// Basic Stories
// ============================================================================

/**
 * Basic video card with default settings using no-op abstractions
 */
export const BasicVideo: Story = {
  render: () => (
    <MediaCardWrapper
      item={sampleVideoItem}
      info={true}
    />
  ),
};

/**
 * Basic image card with default settings
 */
export const BasicImage: Story = {
  render: () => (
    <MediaCardWrapper
      item={sampleImageItem}
      info={true}
    />
  ),
};

/**
 * Card in square mode (1:1 aspect ratio) suitable for grid views
 */
export const SquareMode: Story = {
  render: () => (
    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 2 }}>
      <MediaCardWrapper
        item={sampleVideoItem}
        squareMode={true}
        info={true}
      />
      <MediaCardWrapper
        item={sampleImageItem}
        squareMode={true}
        info={true}
      />
      <MediaCardWrapper
        item={paidVideoItem}
        squareMode={true}
        info={true}
      />
    </Box>
  ),
};

// ============================================================================
// Authentication & Ownership Stories
// ============================================================================

/**
 * Card showing owner controls when user owns the content
 */
export const OwnerContent: Story = {
  render: () => {
    const currentUserId = 'content-creator-1';
    const mockAuth = createMockAuth(
      {
        id: currentUserId,
        email: 'creator@example.com',
        name: 'Content Creator',
      },
      { isOwnerOfAll: true }
    );

    const [modeState, setModeState] = useState<MediaCardModeState>({ mode: 'view' });

    return (
      <Box sx={{ width: 320 }}>
        <MediaCard
          item={sampleVideoItem}
          modeState={modeState}
          setModeState={setModeState}
          auth={mockAuth}
          info={true}
          onViewClick={(item) => console.log('View clicked:', item.title)}
          onEditClick={(item) => console.log('Edit clicked:', item.title)}
          onDeleteClick={(item) => console.log('Delete clicked:', item.title)}
          onTogglePublic={(item) => console.log('Toggle public clicked:', item.title)}
        />
        <Box sx={{ fontSize: '0.875rem', color: '#666', mt: 1 }}>
          <p>Current user owns this content - edit/delete controls shown on hover</p>
        </Box>
      </Box>
    );
  },
};

/**
 * Card showing viewer mode when user doesn't own the content
 */
export const ViewerContent: Story = {
  render: () => {
    const mockAuth = createMockAuth(
      {
        id: 'viewer-user-1',
        email: 'viewer@example.com',
        name: 'Viewer User',
      },
      { isOwnerOfAll: false }
    );

    const [modeState, setModeState] = useState<MediaCardModeState>({ mode: 'view' });

    return (
      <Box sx={{ width: 320 }}>
        <MediaCard
          item={sampleVideoItem}
          modeState={modeState}
          setModeState={setModeState}
          auth={mockAuth}
          info={true}
          onViewClick={(item) => console.log('View clicked:', item.title)}
        />
        <Box sx={{ fontSize: '0.875rem', color: '#666', mt: 1 }}>
          <p>Different user viewing content - only play button shown</p>
        </Box>
      </Box>
    );
  },
};

// ============================================================================
// Payment & Access Control Stories
// ============================================================================

/**
 * Paid content card showing lock indicator and price
 */
export const PaidContent: Story = {
  render: () => {
    const [modeState, setModeState] = useState<MediaCardModeState>({ mode: 'view' });

    // Simulate non-owner viewing paid content
    const viewerAuth = createMockAuth(
      {
        id: 'viewer-user-1',
        email: 'viewer@example.com',
        name: 'Viewer User',
      },
      { isOwnerOfAll: false }
    );

    return (
      <Box sx={{ width: 320 }}>
        <MediaCard
          item={paidVideoItem}
          modeState={modeState}
          setModeState={setModeState}
          auth={viewerAuth}
          info={true}
        />
        <Box sx={{ fontSize: '0.875rem', color: '#666', mt: 1 }}>
          <p>Paid content - locked thumbnail and price displayed (500 sats)</p>
        </Box>
      </Box>
    );
  },
};

/**
 * Owner viewing their own paid content (unlocked)
 */
export const OwnPaidContent: Story = {
  render: () => {
    const [modeState, setModeState] = useState<MediaCardModeState>({ mode: 'view' });

    const ownerAuth = createMockAuth(
      {
        id: 'premium-creator-1',
        email: 'creator@example.com',
        name: 'Premium Creator',
      },
      { isOwnerOfAll: true }
    );

    return (
      <Box sx={{ width: 320 }}>
        <MediaCard
          item={paidVideoItem}
          modeState={modeState}
          setModeState={setModeState}
          auth={ownerAuth}
          info={true}
          onEditClick={(item) => console.log('Edit clicked:', item.title)}
        />
        <Box sx={{ fontSize: '0.875rem', color: '#666', mt: 1 }}>
          <p>Owner of paid content - full thumbnail displayed with edit controls</p>
        </Box>
      </Box>
    );
  },
};

/**
 * Payment integration showing purchase request
 */
export const WithPaymentIntegration: Story = {
  render: () => {
    const [modeState, setModeState] = useState<MediaCardModeState>({ mode: 'view' });

    const viewerAuth = createMockAuth(
      {
        id: 'viewer-user-1',
        email: 'viewer@example.com',
        name: 'Viewer User',
      },
      { isOwnerOfAll: false }
    );

    // @ts-ignore - createMockPayment optional config
    const mockPayment = createMockPayment({
      autoVerify: true,
    });

    return (
      <Box sx={{ width: 320 }}>
        <MediaCard
          item={paidVideoItem}
          modeState={modeState}
          setModeState={setModeState}
          auth={viewerAuth}
          payment={mockPayment}
          info={true}
          onViewClick={(item) => console.log('Purchase flow initiated for:', item.title)}
        />
        <Box sx={{ fontSize: '0.875rem', color: '#666', mt: 1 }}>
          <p>Payment abstraction integrated - click play to trigger purchase flow</p>
        </Box>
      </Box>
    );
  },
};

// ============================================================================
// Queue Integration Stories
// ============================================================================

/**
 * Card with queue integration for adding to playlist
 */
export const WithQueueIntegration: Story = {
  render: () => {
    const [modeState, setModeState] = useState<MediaCardModeState>({ mode: 'view' });
    const mockQueue = createInMemoryQueue();

    const [queueState, setQueueState] = useState('Empty');

    const handleViewClick = (item: ExtendedMediaItem) => {
      mockQueue.addItem({
        id: item._id!,
        type: item.mediaType,
        title: item.title,
        src: item.file,
        thumbnail: item.thumbnail,
        duration: item.duration,
        metadata: item,
      });
      setQueueState(`Added: ${item.title} (${mockQueue.items.length} items in queue)`);
    };

    return (
      <Box sx={{ width: 320 }}>
        <MediaCard
          item={sampleVideoItem}
          modeState={modeState}
          setModeState={setModeState}
          queue={mockQueue}
          info={true}
          onViewClick={handleViewClick}
        />
        <Box sx={{ fontSize: '0.875rem', color: '#666', mt: 1 }}>
          <p>Queue State: {queueState}</p>
        </Box>
      </Box>
    );
  },
};

// ============================================================================
// Selection Mode Stories
// ============================================================================

/**
 * Card in selection mode for batch operations
 */
export const SelectionMode: Story = {
  render: () => {
    const [modeState, setModeState] = useState<MediaCardModeState>({
      mode: 'select',
      selectState: { selected: [] },
    });

    const mediaItems = [
      { ...sampleVideoItem, _id: 'v1' },
      { ...sampleImageItem, _id: 'v2' },
      { ...paidVideoItem, _id: 'v3' },
    ];

    return (
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 2 }}>
        {mediaItems.map((item) => (
          <Box key={item._id}>
            <MediaCard
              item={item}
              modeState={modeState}
              setModeState={setModeState}
              globalSelectionMode={true}
              isSelected={modeState.selectState?.selected.includes(item._id!) || false}
              info={true}
            />
          </Box>
        ))}
        <Box sx={{ gridColumn: '1 / -1', fontSize: '0.875rem', color: '#666' }}>
          <p>Selected: {modeState.selectState?.selected.length || 0} items</p>
        </Box>
      </Box>
    );
  },
};

// ============================================================================
// Display Mode Stories
// ============================================================================

/**
 * Minimal mode without overlay controls
 */
export const MinimalMode: Story = {
  render: () => (
    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 2 }}>
      <Box>
        <MediaCardWrapper
          item={sampleVideoItem}
          minimalMode={true}
          info={true}
        />
        <Box sx={{ fontSize: '0.75rem', color: '#666', mt: 1 }}>
          Regular mode
        </Box>
      </Box>
      <Box>
        <MediaCardWrapper
          item={sampleVideoItem}
          minimalMode={false}
          info={true}
        />
        <Box sx={{ fontSize: '0.75rem', color: '#666', mt: 1 }}>
          Minimal mode
        </Box>
      </Box>
      <Box>
        <MediaCardWrapper
          item={sampleVideoItem}
          minimalMode={true}
          info={false}
        />
        <Box sx={{ fontSize: '0.75rem', color: '#666', mt: 1 }}>
          Minimal + no info
        </Box>
      </Box>
    </Box>
  ),
};

// ============================================================================
// Video Progress Tracking Stories
// ============================================================================

/**
 * Video with scrubber sprite for frame preview on hover
 */
export const VideoWithProgressTracking: Story = {
  render: () => (
    <Box sx={{ width: 320 }}>
      <MediaCardWrapper
        item={videoWithProgress}
        info={true}
      />
      <Box sx={{ fontSize: '0.875rem', color: '#666', mt: 1 }}>
        <p>Hover over video to see progress bar with sprite preview</p>
      </Box>
    </Box>
  ),
};

// ============================================================================
// Responsive & Styling Stories
// ============================================================================

/**
 * Custom styling with sx prop
 */
export const CustomStyling: Story = {
  render: () => (
    <Box sx={{ width: 320 }}>
      <MediaCardWrapper
        item={sampleVideoItem}
        info={true}
        sx={{
          borderRadius: '12px',
          boxShadow: '0 8px 16px rgba(0, 0, 0, 0.3)',
          transition: 'transform 0.2s, boxShadow 0.2s',
          '&:hover': {
            transform: 'scale(1.02)',
            boxShadow: '0 12px 24px rgba(0, 0, 0, 0.4)',
          },
        }}
      />
    </Box>
  ),
};

/**
 * Grid layout with multiple cards
 */
export const GridLayout: Story = {
  render: () => {
    const [modeState, setModeState] = useState<MediaCardModeState>({ mode: 'view' });

    const items = [
      sampleVideoItem,
      sampleImageItem,
      paidVideoItem,
      videoWithProgress,
      { ...sampleVideoItem, _id: 'v2' },
      { ...sampleImageItem, _id: 'i2' },
    ];

    return (
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 2, maxWidth: '1200px' }}>
        {items.map((item) => (
          <MediaCard
            key={item._id}
            item={item}
            modeState={modeState}
            setModeState={setModeState}
            squareMode={true}
            info={true}
          />
        ))}
      </Box>
    );
  },
};

// ============================================================================
// Router Integration Story
// ============================================================================

/**
 * Card with router integration for navigation
 */
export const WithRouterIntegration: Story = {
  render: () => {
    const [modeState, setModeState] = useState<MediaCardModeState>({ mode: 'view' });
    const [lastNavigation, setLastNavigation] = useState('');

    // @ts-ignore - partial router implementation
    const customRouter = {
      ...noOpRouter,
      navigate: (path: string) => {
        setLastNavigation(path);
        console.log('Navigating to:', path);
      },
      getQueryParam: (key: string) => undefined,
      getAllQueryParams: () => ({}),
      getPathname: () => '/',
    };

    return (
      <Box sx={{ width: 320 }}>
        <MediaCard
          item={sampleVideoItem}
          modeState={modeState}
          setModeState={setModeState}
          router={customRouter}
          info={true}
        />
        <Box sx={{ fontSize: '0.875rem', color: '#666', mt: 1 }}>
          <p>Last navigation: {lastNavigation || 'None'}</p>
        </Box>
      </Box>
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
    const [modeState, setModeState] = useState<MediaCardModeState>({ mode: 'view' });
    const [logs, setLogs] = useState<string[]>([]);

    const addLog = (msg: string) => {
      setLogs((prev) => [...prev.slice(-4), msg]);
    };

    const ownerAuth = createMockAuth(
      {
        id: 'premium-creator-1',
        email: 'creator@example.com',
        name: 'Premium Creator',
      },
      { isOwnerOfAll: true }
    );

    // @ts-ignore - createMockPayment optional config
    const mockPayment = createMockPayment({ autoVerify: true });
    const mockQueue = createInMemoryQueue();

    // @ts-ignore - partial router implementation
    const customRouter = {
      ...noOpRouter,
      navigate: (path: string) => {
        addLog(`✓ Navigated to: ${path}`);
      },
      getQueryParam: (key: string) => undefined,
      getAllQueryParams: () => ({}),
      getPathname: () => '/',
    };

    return (
      <Box sx={{ width: 400 }}>
        <MediaCard
          item={paidVideoItem}
          modeState={modeState}
          setModeState={setModeState}
          router={customRouter}
          auth={ownerAuth}
          payment={mockPayment}
          queue={mockQueue}
          info={true}
          onViewClick={(item) => {
            addLog(`▶ View clicked: ${item.title}`);
          }}
          onEditClick={(item) => {
            addLog(`✎ Edit clicked: ${item.title}`);
          }}
          onDeleteClick={(item) => {
            addLog(`🗑 Delete clicked: ${item.title}`);
          }}
          onTogglePublic={(item) => {
            addLog(`🔓 Toggle public: ${item.title}`);
          }}
        />
        <Box
          sx={{
            fontSize: '0.875rem',
            color: '#666',
            mt: 2,
            p: 1,
            backgroundColor: '#f5f5f5',
            borderRadius: '4px',
            fontFamily: 'monospace',
            minHeight: '100px',
            maxHeight: '150px',
            overflowY: 'auto',
          }}
        >
          <strong>Events Log:</strong>
          {logs.length === 0 ? (
            <p>Interact with the card above...</p>
          ) : (
            logs.map((log, i) => (
              <div key={i}>{log}</div>
            ))
          )}
        </Box>
      </Box>
    );
  },
};

// ============================================================================
// API Integration Stories (Work Item 4.2)
// ============================================================================

/**
 * MediaCard with API client integration for server-side features
 * Demonstrates:
 * - Server-generated thumbnails
 * - Server-side metadata extraction
 * - Hybrid metadata strategy
 * - Loading and error states
 */
export const WithAPIIntegration: Story = {
  render: () => {
    const [modeState, setModeState] = useState<MediaCardModeState>({ mode: 'view' });
    const [logs, setLogs] = useState<string[]>([]);

    const addLog = (msg: string) => {
      setLogs((prev) => [...prev.slice(-5), `[${new Date().toLocaleTimeString()}] ${msg}`]);
    };

    // Mock API client for demonstration
    const mockApiClient = {
      extractMetadata: async (id: string) => {
        addLog(`📊 Extracting metadata for ${id}...`);
        // Simulate API delay
        await new Promise((resolve) => setTimeout(resolve, 1000));
        addLog(`✓ Metadata extraction complete`);
        return {
          duration: 305,
          width: 1920,
          height: 1080,
          codec: 'h264',
          bitrate: 5000,
        };
      },
      generateThumbnail: async (id: string, timestamp: number) => {
        addLog(`🖼 Generating thumbnail at ${timestamp}s...`);
        await new Promise((resolve) => setTimeout(resolve, 800));
        addLog(`✓ Thumbnail generated`);
        return {
          thumbnailUrl: '/images/server-generated-thumb.jpg',
          thumbnailKey: 's3://thumbnails/video-1-thumb.jpg',
          timestamp,
          width: 320,
          height: 180,
        };
      },
    } as any;

    // Video item without thumbnail or dimensions (needs server processing)
    const videoNeedingProcessing: ExtendedMediaItem = {
      _id: 'video-api-1',
      title: 'Video Requiring Server Processing',
      description: 'Demonstrates API integration for metadata and thumbnails',
      mediaType: 'video',
      file: '/videos/sample.mp4',
      // No thumbnail or duration - will be fetched from API
      publicity: 'public',
      views: 42,
      author: 'content-creator-1',
      url: 'https://example.com/videos/sample.mp4',
    };

    return (
      <Box sx={{ width: 500 }}>
        <MediaCard
          item={videoNeedingProcessing}
          modeState={modeState}
          setModeState={setModeState}
          apiClient={mockApiClient}
          enableServerFeatures={true}
          info={true}
          onMetadataLoaded={(metadata) => {
            addLog(
              `📥 Metadata loaded: ${metadata.width}x${metadata.height}, ${metadata.duration}s`,
            );
          }}
          metadataStrategy={{
            preferServer: true,
            fallbackToClient: true,
            serverTimeout: 5000,
          }}
        />
        <Box
          sx={{
            fontSize: '0.875rem',
            color: '#666',
            mt: 2,
            p: 1,
            backgroundColor: '#f5f5f5',
            borderRadius: '4px',
            fontFamily: 'monospace',
            minHeight: '120px',
            maxHeight: '180px',
            overflowY: 'auto',
          }}
        >
          <strong>API Integration Log:</strong>
          {logs.length === 0 ? (
            <p>Loading server features...</p>
          ) : (
            logs.map((log, i) => (
              <div key={i}>{log}</div>
            ))
          )}
        </Box>
        <Box sx={{ fontSize: '0.75rem', color: '#999', mt: 1 }}>
          <p>
            • Server thumbnail generation kicks in when no thumbnail is available
            <br />
            • Metadata extraction runs automatically for accurate duration/dimensions
            <br />
            • Hybrid strategy: client-side for preview, server-side for accuracy
            <br />• Loading states and error handling with retry built-in
          </p>
        </Box>
      </Box>
    );
  },
};

/**
 * Backward compatibility - MediaCard works without API client
 */
export const BackwardCompatibility: Story = {
  render: () => {
    const [modeState, setModeState] = useState<MediaCardModeState>({ mode: 'view' });

    return (
      <Box sx={{ display: 'flex', gap: 2 }}>
        <Box sx={{ width: 320 }}>
          <MediaCard
            item={sampleVideoItem}
            modeState={modeState}
            setModeState={setModeState}
            info={true}
            // No apiClient prop - works in client-only mode
          />
          <Box sx={{ fontSize: '0.75rem', color: '#666', mt: 1, textAlign: 'center' }}>
            Without API client (client-only mode)
          </Box>
        </Box>
        <Box sx={{ width: 320 }}>
          <MediaCard
            item={sampleVideoItem}
            modeState={modeState}
            setModeState={setModeState}
            info={true}
            apiClient={undefined}
            enableServerFeatures={false}
          />
          <Box sx={{ fontSize: '0.75rem', color: '#666', mt: 1, textAlign: 'center' }}>
            With server features explicitly disabled
          </Box>
        </Box>
      </Box>
    );
  },
};
