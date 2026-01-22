import type { SxProps, Theme } from '@mui/system';
import type { IRouter } from '../../abstractions/Router';
import type { IAuth } from '../../abstractions/Auth';
import type { IPayment } from '../../abstractions/Payment';
import type { IQueue } from '../../abstractions/Queue';
import type { MediaApiClient } from '../../api';

/**
 * Sprite configuration for video scrubber thumbnails
 */
export interface SpriteConfig {
  totalFrames: number;
  framesPerRow: number;
  frameWidth: number;
  frameHeight: number;
  spriteSheetWidth: number;
  spriteSheetHeight: number;
  interval: number;
}

/**
 * Interface for tracking playback issues
 */
export interface PlaybackIssue {
  reportedBy: string;
  issueType: string;
  errorInfo: string;
  userAgent: string;
  timestamp: Date;
}

/**
 * Scene information for video content
 */
export interface Scene {
  sceneNumber: string;
  startFrame: string;
  startTimeCode: string;
  startTime: string;
  endFrame: string;
  endTimeCode: string;
  endTime: string;
  lengthFrames: string;
  lengthTimeCode: string;
  lengthSeconds: string;
}

/**
 * MediaClass branding configuration
 */
export interface MediaClass {
  id: string;
  name: string;
  beforeIdent?: {
    id: string;
    thumbnail?: string;
    duration?: number;
  };
  afterIdent?: {
    id: string;
    thumbnail?: string;
    duration?: number;
  };
  videoBug?: {
    imageId: string;
    imageUrl?: string;
    position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
    sizePercent: number;
    opacity: number;
    intervalSeconds: number;
    durationSeconds: number;
    initialDelaySeconds: number;
  };
}

/**
 * Extended media item type with all fields from API
 */
export interface ExtendedMediaItem {
  _id?: string; // MongoDB document ID
  likes?: string[];
  dislikes?: string[];
  denyAccess?: string[];
  canEdit?: string[];
  uniqueViews?: string[];
  owners?: string[];
  location?: string[];
  author?: string;
  mime?: string;
  starring?: string[]; // Can include user IDs
  file?: string;
  filename?: string;
  bucket?: string; // S3 bucket where the file is stored
  thumb?: string;
  thumbs?: string[];
  paidThumbnail?: string;
  paidPreview?: string;
  tags?: string[];
  description?: string;
  title?: string;
  createdAt?: string;
  updatedAt?: string;
  scenes?: Scene[];
  sceneTimeCodes?: string[];
  duration?: number;
  views?: number;
  publicity?: 'public' | 'private' | 'paid' | 'subscription' | 'deleted';
  public?: boolean; // Backend boolean flag for public/private
  tokens?: number; // @deprecated - use price instead (Lightning payments)
  price?: number; // Price in satoshis for Lightning payments
  minTierLevel?: number; // Minimum subscription tier level required (for subscription-gated content)
  canAccess?: string[];
  adult?: boolean; // Legacy field, will be deprecated
  rating?: 'ga' | 'nc17' | string; // New rating field
  mediaType?: 'image' | 'video' | 'album';
  thumbnail?: string;
  hasThumbnail?: boolean; // Explicit boolean from API indicating if thumbnail exists (avoids 404s)
  url?: string;
  posterTransform?: string;
  width?: number; // Media width in pixels
  height?: number; // Media height in pixels
  aspectRatio?: number; // Pre-calculated aspect ratio (width/height format)
  size?: number; // File size in bytes - useful for cost calculations and user info

  // Video codec metadata (extracted by client-side or server-side processing)
  codec?: string; // Video codec (e.g., 'h264', 'vp9', 'av1')
  container?: 'mp4' | 'mov' | 'webm' | 'mkv' | string; // Container format
  bitrate?: number; // Estimated bitrate in kbps

  // Fields for tracking video playback issues
  playbackIssues?: PlaybackIssue[];
  hasPlaybackIssues?: boolean;

  // Field to track failed thumbnail generation
  thumbnailGenerationFailed?: boolean;

  // Fields for video scrubber sprite sheet (hover preview)
  scrubberGenerated?: boolean; // Whether sprite sheet has been generated
  scrubberSprite?: string; // S3 path to sprite sheet image
  scrubberSpriteConfig?: SpriteConfig; // Sprite sheet configuration (grid layout, frame info)

  // Fields for local upload preview (before server upload completes)
  localBlobUrl?: string; // Local blob URL from URL.createObjectURL() for preview during upload
  isUploading?: boolean; // Whether this item is currently being uploaded
  uploadPercent?: number; // Upload progress percentage (0-100)

  // MediaClass branding configuration (before/after idents, video bug overlay)
  mediaClass?: MediaClass;

  // Stream Recording Metadata
  /** Flag indicating this video is from a stream recording */
  isStreamRecording?: boolean;
  /** Original stream date (may differ from video upload date) */
  streamRecordedAt?: Date | string;
  /** Peak concurrent viewers during live stream */
  streamPeakViewers?: number;
  /** Aggregate watch time during live stream (in minutes) */
  streamTotalViewMinutes?: number;
  /** Reference to StreamRecording session */
  recordingSessionId?: string;
  /** Featured users (co-stars) in this video/stream recording */
  featuredUsers?: string[];
}

/**
 * Display mode for the media card
 */
export enum MediaCardDisplayMode {
  /** User viewing their own content */
  OWN_CONTENT = 'ownContent',

  /** User viewing someone else's content */
  OTHER_CONTENT = 'otherContent'
}

/**
 * Mode state for MediaCard selection behavior
 */
export interface MediaCardModeState {
  mode: 'view' | 'select';
  selectState?: {
    selected: string[];
  };
}

/**
 * Global editing state for coordinating poster edits across cards
 */
export interface GlobalEditingState {
  isEditing: boolean;
  editingCardId: string | null;
}

/**
 * Drag offset reference for poster editing
 */
export interface DragOffset {
  x: number;
  y: number;
  initialPosition: { x: number; y: number };
}

/**
 * Position coordinates
 */
export interface Position {
  x: number;
  y: number;
}

/**
 * Position bounds for constraining poster position
 */
export interface PositionBounds {
  x: { min: number; max: number };
  y: { min: number; max: number };
}

/**
 * Props for the MediaCard component
 *
 * This component uses abstraction layers to decouple from framework-specific
 * dependencies (Next.js router, Redux, etc.)
 */
export interface MediaCardProps {
  /** The media item to display */
  item: ExtendedMediaItem;

  /** Selection mode state */
  modeState: MediaCardModeState;

  /** Callback to update selection mode state */
  setModeState: React.Dispatch<React.SetStateAction<MediaCardModeState>>;

  /** Optional CSS class name */
  className?: string;

  /** Show additional info overlays */
  info?: boolean;

  /** Visibility optimization - only render content when in viewport */
  isVisible?: boolean;

  /** Minimal mode - compact card without overlay controls */
  minimalMode?: boolean;

  /** Display mode for the card */
  displayMode?: MediaCardDisplayMode;

  /** Global selection mode - lifted to parent for batch optimization */
  globalSelectionMode?: boolean;

  /** Whether this card is selected */
  isSelected?: boolean;

  /** Material-UI sx prop for custom styling */
  sx?: SxProps<Theme>;

  /** Grid view mode - force 1:1 aspect ratio */
  squareMode?: boolean;

  // Callback handlers
  /** Callback when view/play is clicked */
  onViewClick?: (item: ExtendedMediaItem) => void;

  /** Callback when edit is clicked */
  onEditClick?: (item: ExtendedMediaItem) => void;

  /** Callback when delete is clicked */
  onDeleteClick?: (item: ExtendedMediaItem) => void;

  /** Callback when toggle public/private is clicked */
  onTogglePublic?: (item: ExtendedMediaItem) => void;

  /** Callback when toggle rating (adult/ga) is clicked */
  onToggleAdult?: (item: ExtendedMediaItem) => void;

  /** Callback when hide is clicked */
  onHide?: (item: ExtendedMediaItem) => void;

  // Abstraction layer dependencies
  /** Router abstraction for navigation */
  router?: IRouter;

  /** Authentication abstraction for user info and permissions */
  auth?: IAuth;

  /** Payment abstraction for handling purchases */
  payment?: IPayment;

  /** Queue abstraction for managing media playback queue */
  queue?: IQueue;

  // Optional configuration
  /** Base URL for media files (e.g., CDN or S3 bucket URL) */
  mediaBaseUrl?: string;

  /** Base URL for thumbnails */
  thumbnailBaseUrl?: string;

  /** Enable keyboard shortcuts for media controls */
  enableKeyboardShortcuts?: boolean;

  // API Integration (Work Item 4.2)
  /** API client for server-side operations */
  apiClient?: MediaApiClient;

  /** Enable server-side features (thumbnails, metadata) - default: true */
  enableServerFeatures?: boolean;

  /** Callback for upload progress tracking */
  onUploadProgress?: (progress: {
    loaded: number;
    total: number;
    percentage: number;
  }) => void;

  /** Callback when server metadata is loaded */
  onMetadataLoaded?: (metadata: {
    duration?: number;
    width?: number;
    height?: number;
    codec?: string;
    bitrate?: number;
  }) => void;

  /** Hybrid metadata options */
  metadataStrategy?: {
    /** Prefer server-side extraction (default: true for files >10MB) */
    preferServer?: boolean;
    /** Timeout for client-side extraction (ms) */
    clientTimeout?: number;
    /** Timeout for server-side extraction (ms) */
    serverTimeout?: number;
    /** Fallback to client if server fails */
    fallbackToClient?: boolean;
  };
}
