/** 
 * Interface representing a Blob object with optional bytes property.
 * @interface
 * @property {any} [bytes] - Optional property representing the bytes of the Blob object.
 */

declare interface Blob {
  bytes?: any;
}

/** 
 * Interface extending Blob to represent a File object with additional properties.
 * @interface
 * @extends Blob
 */

declare interface File extends Blob {
  // Add any missing properties that might be expected
}