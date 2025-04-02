import {Ext, IMimeType, MimeRegistry} from "./IMimeType";

/**
 * SUIMime is a singleton class that extends MimeRegistry.
 * It provides methods to access the singleton instance and create standard MIME types.
 */
export class SUIMime extends MimeRegistry {
  /**
   * The private static instance of SUIMime.
   */
  private static instance: SUIMime;

  /**
   * Private constructor to prevent direct instantiation.
   * Initializes the standard types upon construction.
   */
  private constructor() {
    super();
    this.createStandardTypes();
  }

  /**
   * Public static method to access the singleton instance.
   * Returns the instance of SUIMime if it doesn't exist, otherwise returns the existing instance.
   */
  public static getInstance(): SUIMime {
    if (!SUIMime.instance) {
      SUIMime.instance = new SUIMime();
    }
    return SUIMime.instance;
  }

  /**
   * Creates standard MIME types for images, videos, and audio files.
   */
  createStandardTypes() {
    MimeRegistry.create('image', 'png', '.png', 'PNG Image');
    MimeRegistry.create('video', 'mp4', '.mp4', 'MP4 Video');
    MimeRegistry.create('audio', 'mp3', '.mp3', 'MP3 Audio');
  }

  /**
   * Creates a new MIME type with the specified application, extension, and description.
   * @param application The application associated with the MIME type.
   * @param ext The file extension of the MIME type.
   * @param description A brief description of the MIME type.
   * @param embedded Whether the MIME type is embedded. Defaults to true.
   * @returns The created MIME type.
   */
  static make(application: string, ext: Ext, description: string, embedded: boolean = true): IMimeType {
    return MimeRegistry.create('stoked-ui', application, ext, description, embedded);
  }
}