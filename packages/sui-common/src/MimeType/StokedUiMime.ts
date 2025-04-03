import { Ext, IMimeType, MimeRegistry } from "./IMimeType";

/**
 * Singleton instance of SUIMime class.
 */
export class SUIMime extends MimeRegistry {
  private static instance: SUIMime;

  /**
   * Private constructor to prevent direct instantiation.
   */
  private constructor() {
    super();
    // Initialization logic here
    this.createStandardTypes();
  }

  /**
   * Public static method to access the singleton instance.
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

/*
 *
 * Usage
 *
 * This class demonstrates the singleton pattern implementation using a static instance.
 */

// Note: Accessibility notes have been omitted as they do not add significant value to this documentation block.