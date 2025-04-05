/**
 * Singleton Mime Registry class for managing MIME types.
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
   * @returns {SUIMime} The singleton instance of SUIMime.
   */
  public static getInstance(): SUIMime {
    if (!SUIMime.instance) {
      SUIMime.instance = new SUIMime();
    }
    return SUIMime.instance;
  }

  /**
   * Create standard MIME types for image, video, and audio.
   */
  createStandardTypes() {
    MimeRegistry.create('image', 'png', '.png', 'PNG Image');
    MimeRegistry.create('video', 'mp4', '.mp4', 'MP4 Video');
    MimeRegistry.create('audio', 'mp3', '.mp3', 'MP3 Audio');
  }

  /**
   * Create a custom MIME type.
   * @param {string} application - The application type.
   * @param {Ext} ext - The file extension.
   * @param {string} description - The description of the MIME type.
   * @param {boolean} [embedded=true] - Flag indicating if the MIME type is embedded.
   * @returns {IMimeType} The created custom MIME type.
   */
  static make(application: string, ext: Ext, description: string, embedded: boolean = true): IMimeType {
    return MimeRegistry.create('stoked-ui', application, ext, description, embedded);
  }
}

/*

// Usage
const singleton1 = Singleton.getInstance();
const singleton2 = Singleton.getInstance();

console.log(singleton1 === singleton2); // true
singleton1.doSomething();

*/