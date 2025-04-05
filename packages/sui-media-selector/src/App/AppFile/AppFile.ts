/**
 * @typedef {Object} IAppFileProps
 * @property {File[]} [files] - Array of files
 */

/**
 * @typedef {Object} IAppFileConstructor<AppFileType extends AppFile = AppFile>
 * @property {Function} fromUrl - Creates an AppFileType instance from a URL
 * @property {Function} fromLocalFile - Creates an AppFileType instance from a local file
 */

/**
 * @typedef {Object} IAppFileMeta
 * @property {string} id - Unique identifier
 * @property {number} size - Size of the file
 * @property {string} name - Name of the file
 * @property {string} type - Type of the file
 */

/**
 * @typedef {Object} IAppFileData
 * @property {IAppFileMeta[]} filesMeta - Array of metadata for files
 */

/**
 * @typedef {Object} IAppFile
 * @property {File[]} files - Array of files
 * @property {Versions} versions - Array of versions
 * @property {IDBVideo[]} videos - Array of videos
 * @property {Function} addFile - Adds a file to the collection
 * @property {Function} removeFile - Removes a file by ID
 * @property {Function} toBlob - Converts the AppFile to a Blob
 * @property {Function} stream - Streams the AppFile
 */

/**
 * Represents an application file.
 * @extends WebFile
 * @class
 */
class AppFile extends WebFile {
  /**
   * Creates an instance of AppFile.
   * @param {IAppFileProps} appFileProps - Props for the AppFile
   */
  constructor(appFileProps) {
    super(appFileProps);
    this._files = appFileProps?.files ?? [];
  }

  /**
   * Adds a file to the collection.
   * @param {File | File[]} file - File(s) to add
   */
  addFile(file) {
    if (Array.isArray(file)) {
      this._files = this._files.concat(file);
    } else {
      this._files.push(file);
    }
  }

  /**
   * Removes a file by its ID.
   * @param {string} name - ID of the file to remove
   */
  removeFile(name) {
    this._files = this._files.filter((file) => file.name !== name);
  }

  /**
   * Loads an AppFile instance from a URL.
   * @param {string} url - URL to load the file from
   * @param {Constructor<AppFileType>} FileConstructor
   * @returns {Promise<AppFileType | null>} - Promise resolving to the loaded AppFile instance or null
   */
  static async fromUrl(url, FileConstructor) {
    // Implementation details omitted for brevity
  }

  /**
   * Loads an AppFile instance from the local file system.
   * @param {Blob} file - File object from an attached drive
   * @param {Constructor<AppFileType>} FileConstructor
   * @returns {Promise<AppFileType>} - Promise resolving to the loaded AppFile instance
   */
  static async fromLocalFile(file, FileConstructor) {
    // Implementation details omitted for brevity
  }

  /**
   * Opens a file dialog to select multiple files.
   * @param {Constructor<AppFileType>} FileConstructor
   * @returns {Promise<AppFileType[]>} - Promise resolving to an array of loaded AppFile instances
   */
  static async fromOpenDialog(FileConstructor) {
    // Implementation details omitted for brevity
  }

  /**
   * Converts the AppFile to a Blob.
   * @returns {Promise<Blob>} - Promise resolving to the Blob representation of the AppFile
   */
  async toBlob() {
    // Implementation details omitted for brevity
  }

  /**
   * Streams the AppFile.
   * @returns {ReadableStream<Uint8Array>} - ReadableStream of the AppFile
   */
  stream() {
    // Implementation details omitted for brevity
  }

  /**
   * Generates a unique ID for the instance.
   * @private
   * @returns {string} - Unique ID
   */
  generateId() {
    // Implementation details omitted for brevity
  }

  /**
   * Gets data for the AppFile.
   * @returns {FileDataType} - Data for the AppFile
   */
  get data() {
    // Implementation details omitted for brevity
  }
}

export default AppFile;