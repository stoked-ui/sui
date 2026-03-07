import type { SxProps, Theme } from '@mui/system';
import type { ExtendedMediaItem } from '../MediaCard/MediaCard.types';
import type { IRouter, IAuth, IPayment, IQueue } from '../../abstractions';

/**
 * Data source configuration for MediaGallery
 */
export interface MediaGallerySource {
  /** 
   * Directly provide the media items as a JSON array.
   * Ideal for static content or data already fetched by the parent.
   */
  data?: ExtendedMediaItem[];

  /**
   * Fetch media items from a REST API endpoint.
   * The endpoint should return an array of MediaItems or a paginated response.
   */
  endpoint?: string;

  /**
   * Optional API key for authenticating with the endpoint.
   * Sent in the 'X-API-Key' or 'Authorization: Bearer' header.
   */
  apiKey?: string;

  /**
   * Fetch media items from an S3 bucket.
   * Requires a backend proxy or presigned URLs for direct access.
   */
  s3?: {
    bucket: string;
    prefix?: string;
    region?: string;
    /** 
     * Optional custom endpoint for S3-compatible storage (e.g., MinIO, DigitalOcean Spaces).
     */
    endpoint?: string;
  };
}

/**
 * Props for the MediaGallery component
 */
export interface MediaGalleryProps {
  /** 
   * Data source configuration. 
   * If omitted, defaults to the local Next.js proxy at '/api/sui-media'.
   */
  source?: MediaGallerySource;

  /** 
   * Optional custom title for the gallery 
   */
  title?: string;

  /**
   * Layout configuration: number of columns in the grid.
   * Can be a fixed number or a responsive object.
   * Default: { xs: 1, sm: 2, md: 3, lg: 4 }
   */
  columns?: number | { xs?: number; sm?: number; md?: number; lg?: number; xl?: number };

  /**
   * Gap between cards in pixels.
   * Default: 16
   */
  gap?: number;

  /**
   * Display mode for the media cards.
   * Default: 'otherContent'
   */
  displayMode?: 'ownContent' | 'otherContent';

  /**
   * Whether to show titles on cards.
   * Default: true
   */
  showTitles?: boolean;

  /**
   * Whether to show metadata (views, date) on cards.
   * Default: true
   */
  showMetadata?: boolean;

  /**
   * Whether to allow multiple selection.
   * Default: false
   */
  allowSelection?: boolean;

  /**
   * Callback when a media item is clicked (opens viewer by default).
   */
  onItemClick?: (item: ExtendedMediaItem) => void;

  /**
   * Callback when items are selected (if allowSelection is true).
   */
  onSelectionChange?: (selectedIds: string[]) => void;

  /** 
   * Custom router implementation (defaults to no-op)
   */
  router?: IRouter;

  /**
   * Custom auth implementation (defaults to no-op)
   */
  auth?: IAuth;

  /**
   * Custom payment implementation (defaults to no-op)
   */
  payment?: IPayment;

  /**
   * Custom queue implementation (defaults to no-op)
   */
  queue?: IQueue;

  /**
   * Material-UI sx prop for custom styling
   */
  sx?: SxProps<Theme>;

  /**
   * Optional CSS class name
   */
  className?: string;
}
