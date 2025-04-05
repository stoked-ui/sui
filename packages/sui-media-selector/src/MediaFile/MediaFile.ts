/**
 * @typedef {Object} IAudioMetadata
 * @property {number} duration - Duration of the audio file
 * @property {string} format - Format of the audio file
 * @property {string} name - Name of the audio file
 * @property {number} size - Size of the audio file
 * @property {string} [artist] - Artist of the audio file
 * @property {string} [trackTitle] - Title of the audio track
 */

/**
 * @typedef {Object} IAudioPreloadResult
 * @property {HTMLAudioElement} element - HTML audio element for preloading
 * @property {string} objectUrl - Object URL for the audio file
 * @property {IAudioMetadata} metadata - Metadata of the audio file
 */

/**
 * @typedef {Object} WaveformOptions
 * @property {number} [width] - Width of the waveform image
 * @property {number} [height] - Height of the waveform image
 * @property {string} [backgroundColor] - Background color of the waveform image
 * @property {string} [waveformColor] - Color of the waveform in the image
 * @property {'dataurl' | 'blob'} [outputType] - Output type of the waveform image
 */

/**
 * @typedef {Object} IAudioPreloadExtractResult
 * @property {HTMLAudioElement} element - HTML audio element for preloading
 * @property {string} objectUrl - Object URL for the audio file
 * @property {IAudioMetadata} metadata - Metadata of the audio file
 * @property {string} backgroundImage - Background image for the audio waveform
 */

/**
 * @typedef {Object} IAudioWaveImageOptions
 * @property {number} width - Width of the waveform image
 * @property {number} height - Height of the waveform image
 * @property {string} objectUrl - Object URL for the audio file
 * @property {number} duration - Duration of the audio file
 * @property {string} waveformColor - Color of the waveform in the image
 * @property {string} backgroundColor - Background color of the waveform image
 */

/**
 * Represents a MediaFile class that extends File and implements IMediaFile interface
 */
export default class MediaFile extends File implements IMediaFile {
  readonly created: number;
  readonly mediaType: MediaType;
  readonly path: string;
  url: string;
  media: Settings;
  readonly id: string;
  children: IMediaFile[];

  static cache: { [key: string]: IMediaFile } = {};

  /**
   * Creates an instance of MediaFile.
   * @param {BlobPart[]} fileBits - Array of BlobPart objects
   * @param {string} fileName - Name of the file
   * @param {FilePropertyBag & { created?: number; path?: string; url?: string; media?: Record<string, any>; id?: string; children?: MediaFile[] }} options - File property bag with additional options
   */
  constructor(
    fileBits: BlobPart[],
    fileName: string,
    options: FilePropertyBag & {
      created?: number;
      path?: string;
      url?: string;
      media?: Record<string, any>;
      id?: string;
      children?: MediaFile[];
    }
  ) {
    super(fileBits, fileName, options);

    this.created = options.created ?? Date.now();
    this.mediaType = getMediaType(options.type ?? this.type); // Automatically assign mediaType
    this.path = options.path ?? '';
    this.url = options.url ?? '';
    this.media = createSettings(options.media);
    this.children = options.children ?? [];
    this.id = options.id ?? MediaFile.generateId;
  }

  /**
   * Generates a unique ID for a media file
   * @returns {string} - Unique ID
   */
  private static get generateId(): string {
    return namedId('mediafile');
  }

  /**
   * Returns the metadata blob of the media file
   * @returns {Blob} - Metadata blob
   */
  get metadataBlob(): Blob {
    return new Blob(
      [JSON.stringify(this.mediaProps)], { type: 'application/json' }
    );
  }

  /**
   * Converts the media file to a blob
   * @returns {Promise<Blob>} - Blob representation of the media file
   */
  async toBlob(): Promise<Blob> {
    return new Blob([this], { type: this.type });
  }

  /**
   * Retrieves the URL for the media file
   * @returns {string} - URL of the media file
   */
  getUrl() {
    if (this.url.length > 0) {
      return this.url;
    }
    return URL.createObjectURL(this);
  }

  /**
   * Retrieves the array buffer of the media file
   * @returns {Promise<ArrayBuffer>} - ArrayBuffer representation of the media file
   */
  async arrayBuffer(): Promise<ArrayBuffer> {
    const blob = await this.toBlob();
    return blob.arrayBuffer();
  }

  /**
   * Retrieves the text content of the media file
   * @returns {Promise<string>} - Text content of the media file
   */
  async text(): Promise<string> {
    const blob = await this.toBlob();
    return blob.text();
  }

  /**
   * Retrieves a readable stream of the media file
   * @returns {ReadableStream<Uint8Array>} - Readable stream of the media file
   */
  stream(): ReadableStream<Uint8Array> {
    const streamBlob = new Blob([JSON.stringify(this.mediaProps), this], { type: this.type });
    return streamBlob.stream();
  }

  /**
   * Slices the media file based on start and end positions
   * @param {number} [start] - Start position for slicing
   * @param {number} [end] - End position for slicing
   * @param {string} [contentType] - Content type for the sliced blob
   * @returns {Blob} - Sliced blob of the media file
   */
  slice(start?: number, end?: number, contentType?: string): Blob {
    const combinedBlob = new Blob([JSON.stringify(this.mediaProps), this], { type: this.type });
    return combinedBlob.slice(start, end, contentType);
  }

  /**
   * Retrieves the media properties of the media file
   * @returns {Record<string, any>} - Media properties object
   */
  private get mediaProps() {
    const { screenshotStore, ...mediaProps } = this.media;
    return {
      created: this.created,
      mediaType: this.mediaType,
      path: this.path,
      url: this.url,
      media: {...mediaProps, screenshots: screenshotStore?.screenshots || [] },
      id: this.id,
      children: this.children,
    };
  }

  /**
   * Retrieves the metadata of the media file
   * @returns {Record<string, any>} - Metadata object of the media file
   */
  get metadata() {
    return {
      id: this.id,
      name: this.name,
      type: this.type,
      size: this.size,
      created: this.created,
      lastModified: this.lastModified,
      mediaType: this.mediaType,
      children: this.children,
      path: this.path,
      url: this.url,
      media: this.media,
    };
  }

  /**
   * Adds MIME type and media type to the file
   * @param {File} file - File object
   * @returns {MediaFile} - MediaFile instance with MIME and media type
   */
  static withMimeType(file: File): MediaFile {
    const {name} = file;
    const hasExtension = name && name.lastIndexOf('.') !== -1;
    if (hasExtension) {
      const ext = name.split('.')
      .pop()!.toLowerCase();

      const type = ExtensionMimeTypeMap.get(ext);
      if (type) {
        Object.defineProperty(file, 'type', {
          value: type,
          writable: false,
          configurable: false,
          enumerable: true
        });
        Object.defineProperty(file, 'mediaType', {
          value: getMediaType(type),
          writable: false,
          configurable: false,
          enumerable: true
        })
      }
    }

    return file as MediaFile;
  }

  /**
   * Creates a MediaFile instance from a File object
   * @param {File} file - File object
   * @param {string} [path] - Path for the file
   * @returns {MediaFile} - MediaFile instance created from the File object
   */
  static fromFile(file: File, path?: string): MediaFile {
    const f = this.withMimeType(file);
    const {webkitRelativePath} = file;
    let pathValue = file.name;
    if (typeof path === 'string') {
      pathValue = path;
    } else if (webkitRelativePath && webkitRelativePath.length > 0) {
      pathValue = webkitRelativePath
    }
    if (typeof f.path !== 'string') { // on electron, path is already set to the absolute path
      Object.defineProperty(f, 'path', {
        value: pathValue,
        writable: false,
        configurable: false,
        enumerable: true
      });
    }
    const mediaFileOptions = {
      type: file.type,
      created: file.lastModified, // Using lastModified date as the creation time
      path: `/files/${file.name}`, // Example path
      url: URL.createObjectURL(file),
      media: {
        description: "Automatically generated file metadata",
        tags: [],
      },
      id: this.generateId, // Generate a unique ID
      mediaType: getMediaType(file.type),
    };

    // Create MediaFile instance
    return new MediaFile([file], file.name, mediaFileOptions);
  }

  /**
   * Creates a MediaFile instance from a URL
   * @param {string} url - URL of the media file
   * @param {boolean} [throwOnError=false] - Whether to throw an error on failure
   * @returns {Promise<MediaFile | null>} - Promise resolving to MediaFile instance or null
   */
  static async fromUrl(url: string, throwOnError: boolean = false): Promise<MediaFile | null> {
    // Attempt to fetch the data from the provided URL
    try {
      console.info(`MediaFile::fromUrl(${url})`)
      const response = await FetchBackoff(url, {
        method: "GET",
      }, {
        retries: 5,
        initialDelay: 1000,
        backoffFactor: 2,
        retryCondition: (res: any, error: Error) => {
          if (error) {
            return true; // Retry on network errors
          }
          return res?.status === 503; // Retry on service unavailable
        },
      });

      // Check if the response status is OK (status code 2xx)
      if (!response.ok) {
        // Log the response status and potentially the response body for debugging
        const errorMessage = await response.text();
        console.error(`Failed to fetch data from URL: ${url} - Status: ${response.status} - Message: ${errorMessage}`);
        if (throwOnError) {
          throw new Error(`Network response was not ok. Status: ${response.status}`);
        }
        return null;
      }
      const blob = await response.blob();
      console.info('@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@')
      console.info('blob', blob.type);
      console.info('@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@')
      const fileName = url.split('/').pop() || 'downloaded-file';
      const options = {
        type: blob.type,
        created: Date.now(),
        path: url,
        url,
        media: {
          description: "Fetched from URL",
          tags: [],
        },
        id: this.generateId,
      };

      const mediaFile = new MediaFile([blob], fileName, options);
      await mediaFile.extractMetadata();
      return mediaFile;
    } catch (err) {
      console.error('fromUrl error', err);
    }
    return null;
  }

  /**
   * Extracts metadata from the media file based on its media type
   */
  async extractMetadata() {
    try {
      const extract = async () => {
        switch (this.mediaType) {
          case 'video':
            return MediaFile.extractVideoMetadata(this as MediaFile);
          case 'audio':
            return MediaFile.preloadExtractAudio(this as MediaFile);
          default:
            return {}
        }
      }
      if (typeof window !== 'undefined') {
        console.info('extract', this.name);
        await extract();
      }
    } catch(ex) {
      console.error('Failed to extract metadata', ex);
    }
  }

  /**
   * Retrieves the background image of the media file (specific to audio files)
   * @returns {string | {}} - Background image URL or empty object
   */
  getBackgroundImage() {
    if (this.mediaType === 'audio') {
      return this.media.backgroundImage;
    }
    return {};
  }

  /**
   * Calculates the action style for the media file
   * @param {Settings} settings - Settings for the action style
   * @param {{ start: number, end: number }} fileTimespan - Timespan for the file
   * @returns {Record<string, any>} - Action style properties
   */
  actionStyle(settings: Settings, fileTimespan: { start: number, end: number }) {
    this.getBackgroundImage();
    if (this.mediaType === 'audio' && this?.media?.duration) {
      const adjustedScale = settings.scaleWidth / settings.scale;
      return {
        backgroundImage: `url(${this.media.backgroundImage})`,
        backgroundPosition: `${-adjustedScale * fileTimespan.start}px 0px`,
        backgroundSize: `${adjustedScale * this.media.duration}px 100%`
      }
    }
    return {};
  }

  /**
   * Saves the media file to the local file system
   */
  async save() {
    const saveOptions = {
      suggestedName: this.name,
      fileBlob: new Blob([this], { type: this.type })
    };

    if ('showSaveFilePicker' in window) {
      await saveFileApi(saveOptions);
    } else {
      await saveFileDeprecated(saveOptions);
    }
  }

  /**
   * Creates MediaFile instances from multiple URLs
   * @param {string[]} urls - Array of URLs
   * @returns {Promise<MediaFile[]>} - Promise resolving to an array of MediaFile instances
   */
  static async fromUrls(urls: string[]) {
    const mediaFiles = await Promise.all(
      urls.map(async (url) => {
        try {
          return url ? await this.fromUrl(url) : null;
        } catch (error) {
          console.error(`Failed to fetch MediaFile from URL: ${url}`, error);
          return null; // Handle failure by returning null
        }
      }
    );

    // Filter out any null results caused by failed fetches
    return mediaFiles.filter((file): file is MediaFile => file !== null);
  }

  /**
   * Retrieves drop files from a PragmaticDndEvent
   * @param {PragmaticDndEvent} input - PragmaticDndEvent input
   * @returns {Promise<MediaFile[]>} - Promise resolving to an array of MediaFile instances
   */
  static async getDropFiles(input: PragmaticDndEvent): Promise<MediaFile[]> {
    if (!input?.source?.items) {
      return [] as MediaFile[];
    }
    // console.log('input', JSON.stringify(input.source, null, 2));
    const files = input.source.items;
    const finalizedFiles = await Promise.all(files.map(async (item: DropFile) =>  {
      if (item as DataTransferItem) {
        const dti = item as DataTransferItem;
        return this.toFilePromises(dti);
      }
      return MediaFile.fromFile(item as MediaFile);
    }));
    return this.noIgnoredFiles(finalizedFiles.flat() as MediaFile[]);
  }

  // Ee expect each handle to be https://developer.mozilla.org/en-US/docs/Web/API/FileSystemFileHandle
  /**
   * Retrieves MediaFile instances from an array of FileSystemFileHandle
   * @param {FileSystemFileHandle[]} handles - Array of FileSystemFileHandle
   * @returns {Promise<MediaFile[]>} - Promise resolving to an array of MediaFile instances
   */
  static async getFsHandleFiles(handles: FileSystemFileHandle[]) {
    const files = await Promise.all(handles.map(h => h.getFile()));
    return files.map(file => MediaFile.fromFile(file as MediaFile));
  }

  /**
   * Checks if the given object is an array of File objects
   * @param {unknown} obj - Object to check
   * @returns {boolean} - True if the object is an array of File objects, false otherwise
   */
  static isFileArray(obj) {
    if (!Array.isArray(obj)) {
      return false;
    }

    for (let i = 0; i < obj.length; i += 1) {
      const file = obj[i];
      if (!(file instanceof File)) {
        return false;
      }
    }

    return true;
  }

  /**
   * Creates MediaFile instances from an array of File objects
   * @param {File[]} files - Array of File objects
   * @returns {MediaFile[]} - Array of MediaFile instances
   */
  static fromFileArray(files: File[]) {
    return files.map(file => MediaFile.fromFile(file as MediaFile));
  }

  /**
   * Creates MediaFile instances from different types of input sources
   * @param {FromEventInput | { source?: { items: unknown[] } }} input - Input source for creating MediaFile instances
   * @returns {Promise<MediaFile[]>} - Promise resolving to an array of MediaFile instances
   */
  static async from(input: FromEventInput | { source?: { items: unknown[] } }): Promise<MediaFile[]> {
    const fromWrapper = (inputWrapper: FromEventInput | { source?: { items: unknown[] } }) => {
      if (isObject<DragEvent>(inputWrapper) && isDataTransfer(inputWrapper.dataTransfer)) {
        return this.fromDataTransfer(inputWrapper.dataTransfer, inputWrapper.type);
      }
      if (this.isFileArray(inputWrapper)) {
        return this.fromFileArray(inputWrapper as File[]);
      }
      if (isChangeEvt(inputWrapper)) {
        return getInputFiles(inputWrapper);
      }
      if ('source' in inputWrapper && inputWrapper.source && 'items' in inputWrapper.source && Array.isArray(inputWrapper.source.items) && inputWrapper.source.items.length > 0) {
        return this.getDropFiles(input as PragmaticDndEvent);
      }
      if ((Array.isArray(inputWrapper)