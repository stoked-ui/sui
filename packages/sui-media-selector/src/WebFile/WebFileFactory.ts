import WebFile from './index';
import { IMimeType } from './IMimeType';
/*

export default class WebFileFactory {
  private static mimeTypeToFileClass: Map<string, new (...args: any[]) => WebFile> = new Map();

  static registerMimeType(
    mimeType: string,
    fileClass: new (...args: any[]) => WebFile
  ) {
    this.mimeTypeToFileClass.set(mimeType, fileClass);
  }

  static createFile(mimeType: string, options: any): WebFile {
    const FileClass = this.mimeTypeToFileClass.get(mimeType);
    if (!FileClass) {
      throw new Error(`No WebFile class registered for MIME type: ${mimeType}`);
    }
    return new FileClass(options);
  }
}
*/

export interface IWebFileFactory<T extends WebFile> {
  createFile(data: any): T;
  supportsMimeType(mimeType: IMimeType): boolean;
}

export default class WebFileFactory<T extends WebFile> implements IWebFileFactory<T> {
  constructor(
    private readonly mimeTypes: IMimeType[],
    private readonly FileConstructor: new (data: any) => T
  ) {}

  createFile(data: any): T {
    return new this.FileConstructor(data);
  }

  supportsMimeType(mimeType: IMimeType): boolean {
    return this.mimeTypes.includes(mimeType);
  }
}

// Register the AppFile class for its MIME type
// WebFileFactory.registerMimeType(AppFile.MimeClass.type, AppFile);
