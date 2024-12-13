import {Ext, IMimeType, MimeRegistry} from "./IMimeType";

// @ts-ignore
export class SUIMime extends MimeRegistry {
  private static instance: SUIMime;

  // Private constructor to prevent direct instantiation
  private constructor() {
    super();
    // Initialization logic here
    this.createStandardTypes();
  }

  // Public static method to access the singleton instance
  public static getInstance(): SUIMime {
    if (!SUIMime.instance) {
      SUIMime.instance = new SUIMime();
    }
    return SUIMime.instance;
  }

  // eslint-disable-next-line class-methods-use-this
  createStandardTypes() {
    MimeRegistry.create('image', 'png', '.png', 'PNG Image');
    MimeRegistry.create('video', 'mp4', '.mp4', 'MP4 Video');
    MimeRegistry.create('audio', 'mp3', '.mp3', 'MP3 Audio');
  }

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
