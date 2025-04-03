/**
 * @packageDocumentation SUIMime Class
 *
 * The SUIMime class implements the Singleton design pattern to manage MIME types.
 * It provides methods for creating standard types and making new IMimeType instances.
 */

import { Ext, IMimeType, MimeRegistry } from "./IMimeType";

/**
 * Singleton instance of SUIMime class.
 */
export class SUIMime extends MimeRegistry {
  /**
   * Private static instance variable to hold the singleton instance of SUIMime class.
   *
   * @private
   */
  private static instance: SUIMime;

  /**
   * Private constructor to prevent direct instantiation of the SUIMime class.
   * This ensures that only one instance is created and maintains the singleton pattern.
   *
   * @private
   */
  private constructor() {
    super();
    // Initialization logic here
    this.createStandardTypes();
  }

  /**
   * Public static method to access the singleton instance of SUIMime class.
   * This method returns the existing instance if it has been created, or creates a new one if not.
   *
   * @returns {SUIMime} The singleton instance of SUIMime class.
   */
  public static getInstance(): SUIMime {
    if (!SUIMime.instance) {
      SUIMime.instance = new SUIMime();
    }
    return SUIMime.instance;
  }

  /**
   * Creates standard types for the SUIMime registry.
   * This method populates the mime registry with common image, video, and audio MIME types.
   */
  createStandardTypes() {
    MimeRegistry.create('image', 'png', '.png', 'PNG Image');
    MimeRegistry.create('video', 'mp4', '.mp4', 'MP4 Video');
    MimeRegistry.create('audio', 'mp3', '.mp3', 'MP3 Audio');
  }

  /**
   * Creates a new IMimeType instance based on the given application, extension,
   * description, and embedded status.
   *
   * @param {string} application The application name.
   * @param {Ext} ext The file extension.
   * @param {string} description A brief description of the MIME type.
   * @param {boolean} [embedded=true] Whether the MIME type is embedded or not. Defaults to true.
   * @returns {IMimeType} The created IMimeType instance.
   */
  static make(application: string, ext: Ext, description: string, embedded: boolean = true): IMimeType {
    return MimeRegistry.create('stoked-ui', application, ext, description, embedded);
  }
}

/**
 * @typedef {object} SUIMimeInstance
 * @property {SUIMime} instance The singleton instance of SUIMime class.
 */

/**
 * Example usage:
 *
 * const suimime = SUIMime.getInstance();
 */