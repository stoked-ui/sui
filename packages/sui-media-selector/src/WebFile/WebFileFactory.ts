/**
 * Interface for WebFileFactory that defines methods to create files and check if a MIME type is supported.
 * @template T - Type parameter extending WebFile
 */
export interface IWebFileFactory<T extends WebFile> {
  /**
   * Creates a file of type T with the provided data.
   * @param data - The data to initialize the file with
   * @returns {T} - The created file
   */
  createFile(data: any): T;
  
  /**
   * Checks if the given MIME type is supported by the factory.
   * @param mimeType - The MIME type to check
   * @returns {boolean} - True if the MIME type is supported, false otherwise
   */
  supportsMimeType(mimeType: IMimeType): boolean;
}

/**
 * Class representing a WebFileFactory that can create files based on MIME types.
 * @template T - Type parameter extending WebFile
 */
export default class WebFileFactory<T extends WebFile> implements IWebFileFactory<T> {
  /**
   * Creates an instance of WebFileFactory.
   * @param mimeTypes - Array of supported MIME types
   * @param FileConstructor - Constructor function for creating files of type T
   */
  constructor(
    private readonly mimeTypes: IMimeType[],
    private readonly FileConstructor: new (data: any) => T
  ) {}

  /**
   * Creates a file of type T with the provided data.
   * @param data - The data to initialize the file with
   * @returns {T} - The created file
   */
  createFile(data: any): T {
    return new this.FileConstructor(data);
  }

  /**
   * Checks if the given MIME type is supported by the factory.
   * @param mimeType - The MIME type to check
   * @returns {boolean} - True if the MIME type is supported, false otherwise
   */
  supportsMimeType(mimeType: IMimeType): boolean {
    return this.mimeTypes.includes(mimeType);
  }
}