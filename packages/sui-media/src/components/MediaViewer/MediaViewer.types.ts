/**
 * MediaViewer Types
 *
 * Type definitions for the MediaViewer component and its sub-components.
 * These types are framework-agnostic and define the data structures needed
 * for media viewing functionality.
 */

import type { IRouter } from '../../abstractions/Router';
import type { IAuth } from '../../abstractions/Auth';
import type { IQueue } from '../../abstractions/Queue';
import type { IKeyboardShortcuts } from '../../abstractions/KeyboardShortcuts';
import type { IPayment } from '../../abstractions/Payment';
import type { MediaApiClient } from '../../api';

// ============================================================================
// Media Item Types
// ============================================================================

/**
 * Publicity levels for media items
 */
export type MediaPublicity = 'public' | 'private' | 'paid' | 'subscription' | 'deleted';

/**
 * Media item data structure
 */
export interface MediaItem {
  id: string;
  title?: string;
  description?: string;
  url?: string;
  file?: string;
  thumbnail?: string;
  width?: number;
  height?: number;
  duration?: number;
  views?: number;
  publicity?: MediaPublicity;
  adult?: boolean;
  public?: boolean;
  createdAt?: string;
  updatedAt?: string;
  userId?: string;
  starring?: string[];
  tags?: string[];
  mediaType?: 'image' | 'video';
}

// ============================================================================
// MediaViewer State Types
// ============================================================================

/**
 * Viewer display modes
 */
export enum MediaViewerMode {
  /** Default embedded view (90vw max, preview cards visible) */
  NORMAL = 'NORMAL',
  /** Viewport-maximized (100vw, 95vh max, no preview cards) */
  THEATER = 'THEATER',
  /** Browser fullscreen API active (100vw, 100vh) */
  FULLSCREEN = 'FULLSCREEN',
}

/**
 * Actions that trigger state transitions
 */
export type ViewerAction =
  | 'CYCLE'           // Double-click: cycle through states
  | 'ENTER_THEATER'   // Enter theater mode directly
  | 'ENTER_FULLSCREEN'// Enter fullscreen mode directly
  | 'EXIT_TO_NORMAL'  // Return to normal from any state
  | 'EXIT_FULLSCREEN' // Exit fullscreen to theater (for ESC in fullscreen)
  | 'RESET';          // Force reset to initial state

/**
 * Viewer state configuration
 */
export interface ViewerStateConfig {
  mode: MediaViewerMode;
  isFullscreenApiActive: boolean;
  previousMode?: MediaViewerMode;
  lastTransitionTime: number;
}

// ============================================================================
// MediaClass Playback Types
// ============================================================================

/**
 * Playback phase in MediaClass sequence
 */
export type PlaybackPhase = 'beforeIdent' | 'main' | 'afterIdent' | 'complete';

/**
 * Ident (bumper) video reference
 */
export interface IdentRef {
  id: string;
  thumbnail?: string;
  duration?: number;
}

/**
 * Video bug (watermark) configuration
 */
export interface VideoBugConfig {
  imageId: string;
  imageUrl?: string;
  position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  sizePercent: number;
  opacity: number;
  intervalSeconds: number;
  durationSeconds: number;
  initialDelaySeconds: number;
}

/**
 * MediaClass configuration for branded playback
 */
export interface MediaClassConfig {
  id: string;
  name: string;
  beforeIdent?: IdentRef;
  afterIdent?: IdentRef;
  videoBug?: VideoBugConfig;
}

// ============================================================================
// Layout Types
// ============================================================================

/**
 * Layout calculation result from useMediaViewerLayout
 */
export interface MediaViewerLayoutResult {
  containerWidth: number;
  containerHeight: number;
  mediaWidth: number;
  mediaHeight: number;
  mediaSectionHeight: number;
  previewHeight: number;
  previewItems: MediaItem[];
  previewColumns: number;
  previewRows: number;
  visibleCardsCount: number;
  navbarOffset: number;
  isPortrait: boolean;
  isMobile: boolean;
}

// ============================================================================
// Component Props Types
// ============================================================================

/**
 * Main MediaViewer component props
 */
export interface MediaViewerProps {
  // Core data
  /** Current media item to display */
  item: MediaItem;
  /** All media items in the gallery/collection */
  mediaItems?: MediaItem[];
  /** Index of current item in mediaItems array */
  currentIndex?: number;
  /** Whether the viewer is currently open */
  open: boolean;

  // Callbacks
  /** Handler for closing the viewer */
  onClose: () => void;
  /** Handler for navigating to a different item */
  onNavigate?: (item: MediaItem, index: number) => void;
  /** Handler when media item is edited */
  onEdit?: (item: MediaItem) => void;
  /** Handler when media item is deleted */
  onDelete?: (item: MediaItem) => void;

  // Abstraction layer injections
  /** Router abstraction for navigation */
  router?: IRouter;
  /** Auth abstraction for user info and permissions */
  auth?: IAuth;
  /** Queue abstraction for Next Up functionality */
  queue?: IQueue;
  /** Keyboard shortcuts abstraction */
  keyboard?: IKeyboardShortcuts;
  /** Payment abstraction for paid content */
  payment?: IPayment;

  // Configuration
  /** Whether to hide the navbar/header */
  hideNavbar?: boolean;
  /** Whether to show preview cards at bottom */
  showPreviewCards?: boolean;
  /** Initial viewer mode */
  initialMode?: MediaViewerMode;
  /** MediaClass configuration for branded playback */
  mediaClass?: MediaClassConfig | null;
  /** Whether to enable autoplay */
  autoplay?: boolean;
  /** Initial muted state */
  initialMuted?: boolean;

  // Feature flags
  /** Whether to enable queue management */
  enableQueue?: boolean;
  /** Whether to enable keyboard shortcuts */
  enableKeyboardShortcuts?: boolean;
  /** Whether to enable owner controls (edit/delete) */
  enableOwnerControls?: boolean;
  /** Whether to enable MediaClass playback sequences */
  enableMediaClass?: boolean;

  // API Integration (Work Item 4.2)
  /** API client for server-side operations */
  apiClient?: MediaApiClient;
  /** Enable server-side features (metadata, thumbnails) - default: true */
  enableServerFeatures?: boolean;
  /** Callback when media is loaded from API */
  onMediaLoaded?: (media: MediaItem) => void;
  /** Callback when metadata is loaded from server */
  onMetadataLoaded?: (metadata: { duration?: number; width?: number; height?: number }) => void;
}

/**
 * Props for the MediaCard component (used in preview grid)
 */
export interface MediaCardProps {
  item: MediaItem;
  onClick?: () => void;
  onEditClick?: (item: MediaItem) => void;
  onDeleteClick?: (item: MediaItem) => void;
  onTogglePublic?: (item: MediaItem) => void;
  onToggleAdult?: (item: MediaItem) => void;
  minimalMode?: boolean;
  nextUpCard?: boolean;
  className?: string;
  sx?: any; // MUI sx prop
}

// ============================================================================
// Utility Types
// ============================================================================

/**
 * Color mapping for publicity states
 */
export type PublicityColor = 'primary' | 'secondary' | 'info' | 'default' | 'error';

/**
 * Sprite configuration for video thumbnail previews
 */
export interface SpriteConfig {
  rows: number;
  cols: number;
  totalFrames: number;
  frameWidth: number;
  frameHeight: number;
  interval: number;
}

/**
 * Media mode state for MediaCard
 */
export interface MediaModeState {
  mode: 'browse' | 'select';
}
