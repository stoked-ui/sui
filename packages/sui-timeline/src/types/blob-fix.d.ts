/**
 * Fixes for Blob and File compatibility issues.
 */

/**
 * Interface representing a Blob, with the added property to support 'bytes' attribute.
 */
declare interface Blob {
  /**
   * The byte string content of the blob.
   */
  bytes?: any;
}

/**
 * Interface extending Blob to provide additional properties expected in File objects.
 */
declare interface File extends Blob {
  // Add any missing properties that might be expected
}