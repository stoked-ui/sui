import * as React from 'react';
import type { CdnContents } from '../utils/contents';

export type { CdnContents, CdnFolder, CdnObject } from '../utils/contents';

export interface CdnBrowserProps {
  /**
   * Base URL for CDN API endpoints (e.g. '/api/cdn').
   * @default '/api/cdn'
   */
  apiBaseUrl?: string;

  /**
   * Base URL used to build shareable public links to CDN assets.
   * @default window.location.origin
   */
  publicBaseUrl?: string;

  /**
   * URL of the auth session endpoint. When omitted auth UI is hidden entirely.
   */
  authEndpoint?: string;

  /**
   * Login URL or factory. When a string, navigated to directly.
   * When a function, receives the current `returnTo` URL.
   */
  loginUrl?: string | ((returnTo: string) => string);

  /**
   * Logout URL or factory.
   */
  logoutUrl?: string | ((returnTo: string) => string);

  /**
   * Controlled prefix (directory path). Pass together with `onPrefixChange`
   * to manage navigation externally. Omit to let the component manage it.
   */
  prefix?: string;

  /**
   * Called when the user navigates to a different directory.
   */
  onPrefixChange?: (prefix: string) => void;

  /**
   * Custom data source. Replaces the default API call.
   */
  getContents?: (prefix: string) => Promise<CdnContents>;

  /**
   * Display title shown in the hero section.
   * @default 'CDN Browser'
   */
  title?: string;

  /**
   * Subtitle / description shown under the title.
   */
  subtitle?: string;

  /**
   * When true (default), files at the root prefix are hidden from the listing.
   * The S3 bucket root often contains SPA shell files that should not be exposed.
   * @default true
   */
  hideRootFiles?: boolean;

  /**
   * Called when an upload completes successfully.
   */
  onUploadComplete?: (path: string) => void;

  /**
   * Called when an unrecoverable error occurs.
   */
  onError?: (error: Error) => void;

  className?: string;
  style?: React.CSSProperties;
}
