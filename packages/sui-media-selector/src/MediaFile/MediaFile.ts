import {
  createSettings,
  namedId,
  FetchBackoff,
  Settings,
  ExtensionMimeTypeMap
} from "@stoked-ui/common";
import { File, Blob } from 'formdata-node';

import {
  DropFile,
  getInputFiles,
  FileArray,
  FileValue,
  FromEventInput,
  FILES_TO_IGNORE,
  isChangeEvt,
  isDataTransfer,
  isObject,
  PragmaticDndEvent
} from "./MediaFile.types";
import IMediaFile from "./IMediaFile";
import WebFile from "../WebFile/WebFile";
import ScreenshotStore from "./Metadata/ScreenshotStore";
import {getMediaType, MediaType} from "../MediaType";
import { FileSystemFileEntry } from './FileSystem';
import {saveFileApi, saveFileDeprecated} from "../FileSystemApi";
import {IAppFileMeta} from "../App";

export interface IAudioMetadata {
  duration: number;
  format: string;
  name: string;
  size: number;
  artist?: string;
  trackTitle?: string;
}

export interface IAudioPreloadResult {
  element: HTMLAudioElement,
  objectUrl: string,
  metadata: IAudioMetadata,
}

interface WaveformOptions {
  width?: number;
  height?: number;
  backgroundColor?: string;
  waveformColor?: string;
  outputType?: 'dataurl' | 'blob';
}

export interface IAudioPreloadExtractResult {
  element: HTMLAudioElement,
  objectUrl: string,
  metadata: IAudioMetadata,
  backgroundImage: string,
}

export interface IAudioWaveImageOptions {
  width: number;
  height: number;
  objectUrl: string;
  duration: number;
  waveformColor: string;
  backgroundColor: string;
}


export default class MediaFile extends File implements IMediaFile {
  readonly created: number;

  readonly mediaType: MediaType;

  readonly path: string;

  url: string;

  media: Settings;

  readonly id: string;

  children: IMediaFile[];

  static cache: { [key: string]: IMediaFile} = {};

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

  private static get generateId(): string {
    return namedId('mediafile');
  }

  get metadataBlob(): Blob {
    return new Blob(
      [JSON.stringify(this.mediaProps)], { type: 'application/json' }
    );
  }

  async toBlob(): Promise<Blob> {
    return new Blob([this], { type: this.type });
  }

  getUrl() {
    if (this.url.length > 0) {
      return this.url;
    }
    return URL.createObjectURL(this);
  }

  async arrayBuffer(): Promise<ArrayBuffer> {
    const blob = await this.toBlob();
    return blob.arrayBuffer();
  }

  async text(): Promise<string> {
    const blob = await this.toBlob();
    return blob.text();
  }

  stream(): ReadableStream<Uint8Array> {
    const streamBlob = new Blob([JSON.stringify(this.mediaProps), this], { type: this.type });
    return streamBlob.stream();
  }

  slice(start?: number, end?: number, contentType?: string): Blob {
    const combinedBlob = new Blob([JSON.stringify(this.mediaProps), this], { type: this.type });
    return combinedBlob.slice(start, end, contentType);
  }

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

  static withMimeType(file: File) {
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

  getBackgroundImage() {
    if (this.mediaType === 'audio') {
      return this.media.backgroundImage;
    }
    return {};
  }

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

  static async fromUrls(urls: string[]) {
    const mediaFiles = await Promise.all(
      urls.map(async (url) => {
        try {
          return url ? await this.fromUrl(url) : null;
        } catch (error) {
          console.error(`Failed to fetch MediaFile from URL: ${url}`, error);
          return null; // Handle failure by returning null
        }
      })
    );

    // Filter out any null results caused by failed fetches
    return mediaFiles.filter((file): file is MediaFile => file !== null);
  }

  static async  getDropFiles(input: PragmaticDndEvent): Promise<MediaFile[]> {
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
  static async getFsHandleFiles(handles: FileSystemFileHandle[]) {
    const files = await Promise.all(handles.map(h => h.getFile()));
    return files.map(file => MediaFile.fromFile(file as MediaFile));
  }

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

  static fromFileArray(files: File[]) {
    return files.map(file => MediaFile.fromFile(file as MediaFile));
  }

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
      if ((Array.isArray(inputWrapper) && inputWrapper.every(item => 'getFile' in item && typeof item.getFile === 'function')) || (inputWrapper as FileSystemFileHandle[] !== undefined)) {
        return this.getFsHandleFiles(input as FileSystemFileHandle[])
      }
      return [];
    }
    const files = await fromWrapper(input) as MediaFile[]
    return this.noIgnoredFiles(files);
  }

  static noIgnoredFiles(files: MediaFile[]) {
    return files.flat(Infinity).filter(file => {
      // console.log('ignore name: ', file.name, FILES_TO_IGNORE.indexOf(file.name) );
      return FILES_TO_IGNORE.indexOf(file.name) === -1
    });
  }

  static fromDataTransferItem(item: DataTransferItem) {
    const file = item.getAsFile();
    if (!file) {
      return Promise.reject(new Error(`${item} is not a File`));
    }
    const fwp = MediaFile.fromFile(file as MediaFile);
    return Promise.resolve(fwp);
  }

  static async fromFileEntry(entry: FileSystemFileEntry) {
    return new Promise<MediaFile>((resolve, reject) => {
      entry.file((file: any) => {
        MediaFile.from(file).then((mediaFiles) =>
        {
          if (mediaFiles.length === 0) {
            reject(new Error('Failed to create MediaFile from file entry'));
          }
          resolve(mediaFiles[0]);
        })
      },  (err: unknown) => {
        reject(err);
      });
    });
  }

  // https://developer.mozilla.org/en-US/docs/Web/API/FileSystemEntry
  static async fromEntry(entry: FileSystemEntry) {
    return entry.isDirectory ? this.fromDirEntry(entry as FileSystemDirectoryEntry) : this.fromFileEntry(entry as FileSystemFileEntry);
  }

  static fromDirEntry(entry: FileSystemDirectoryEntry) {
    const reader = entry.createReader();

    return new Promise<FileArray[]>((resolve, reject) => {
      const entries: Promise<FileValue[]>[] = [];

      function readEntries() {
        // https://developer.mozilla.org/en-US/docs/Web/API/FileSystemDirectoryEntry/createReader
        // https://developer.mozilla.org/en-US/docs/Web/API/FileSystemDirectoryReader/readEntries
        reader.readEntries(async (batch: unknown[]) => {
          if (!batch.length) {
            // Done reading directory
            try {
              const files = await Promise.all(entries);
              resolve(files);
            } catch (err) {
              reject(err);
            }
          } else {
            const items = Promise.all((batch as FileSystemEntry[]).map(MediaFile.fromEntry));
            entries.push(items);

            // Continue reading
            readEntries();
          }
        }, (err: unknown) => {
          reject(err);
        });
      }

      readEntries();
    });
  }

  static toFilePromises(item: DataTransferItem) {
    if (typeof item.webkitGetAsEntry !== 'function') {
      return this.fromDataTransferItem(item);
    }

    const entry = item.webkitGetAsEntry();

    // Safari supports dropping an image node from a different window and can be retrieved using
    // the DataTransferItem.getAsFile() API
    // NOTE: FileSystemEntry.file() throws if trying to get the file
    if (entry && entry.isDirectory) {
      return this.fromDirEntry(entry as FileSystemDirectoryEntry);
    }

    return this.fromDataTransferItem(item);
  }

  // IE11 does not support Array.from()
  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/from#Browser_compatibility
  // https://developer.mozilla.org/en-US/docs/Web/API/FileList
  // https://developer.mozilla.org/en-US/docs/Web/API/DataTransferItemList
  static fromList(items: DataTransferItemList | FileList | null): (MediaFile | DataTransferItem)[] {
    if (items === null) {
      return [];
    }

    const files : (MediaFile | DataTransferItem)[] = [];

    // tslint:disable: prefer-for-of
    for (let i = 0; i < items.length; i += 1) {
      const file = items[i] as MediaFile | DataTransferItem
      files.push(file);
    }
    return files as (MediaFile | DataTransferItem)[];
  }

  static async fromDataTransfer(dt: DataTransfer, type: string) {
    // IE11 does not support dataTransfer.items
    // See https://developer.mozilla.org/en-US/docs/Web/API/DataTransfer/items#Browser_compatibility
    if (dt.items) {
      const items = this.fromList(dt.items)
      .filter(item => (item as DataTransferItem).kind === 'file');
      // According to https://html.spec.whatwg.org/multipage/dnd.html#dndevents,
      // only 'dragstart' and 'drop' has access to the data (source node)
      if (type !== 'drop') {
        return [];
      }
      const files = await Promise.all((items as DataTransferItem[]).map(this.toFilePromises));
      return this.noIgnoredFiles(files.flat() as MediaFile[]);
    }

    return this.noIgnoredFiles(this.fromList(dt.files).map((file) => MediaFile.fromFile(file as MediaFile)));
  }

  static async openDialog(): Promise<MediaFile[]> {
    const options: OpenFilePickerOptions & {multiple?: false | undefined} = {
      types: [
        {
          description: "Video",
          accept: {
            "video/*": [] as any,
          },
        },{
          description: "Audio",
          accept: {
            "audio/*": [] as any,
          },
        },{
          description: "Images",
          accept: {
            "image/*": [] as any,
          },
        },
      ],
      excludeAcceptAllOption: true,
      multiple: false,
    }
    const files = await WebFile.open(options)
    return MediaFile.from(files);
  }

  static async createVideoElement(file: File): Promise<{
    duration: number; // Video duration in seconds
    format: string;   // MIME type
    name: string;     // File name
    size: number;
    video: HTMLVideoElement;
    width: number;
    height: number;
  }> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      try {
        if (!file.type.startsWith('video/')) {
          reject(new Error('File is not a video file.'));
          return;
        }


        reader.onload = (event) => {
          if (!event.target?.result) {
            reject(new Error('Failed to read file.'));
            return;
          }

          const video = document.createElement('video');

          video.crossOrigin = 'anonymous';
          video.src = URL.createObjectURL(new Blob([event.target.result], {type: file.type}));
          video.preload = 'auto';
          video.id = `${file.name}-video`;
          console.info('duration', file.name, video.readyState, video.duration, video);
          video.onloadedmetadata = () => {
            resolve({
              duration: video.duration, // Duration in seconds
              format: file.type,        // MIME type
              name: file.name,          // File name
              size: file.size,  // File size in bytes
              video, width: video.videoWidth, height: video.videoHeight
            });
          }
        }

        reader.onerror = () => {
          reject(new Error('Failed to read file.'));
        };
        reader.readAsArrayBuffer(file);
      } catch (ex) {
        reject(ex);
      }
    });
  }

  static async extractVideoMetadata(
    file: MediaFile
  ): Promise<void> {
    try {
      const id = `${file.name}-video`;
      const cached = this.cache[id];
      if (cached) {
        file.media = { ...file.media, ...cached };
        return;
      }
      const { video, ...videoData} = await this.createVideoElement(file);
      const screenshotStore = new ScreenshotStore({ threshold: 1, video, file });
      file.media = { ...file.media, screenshotStore, ...videoData, element: video };
      this.cache[id] = file;
    } catch (ex) {
      throw new Error(`Failed to read file: ${ex}`);
    }
  }

  static async extractAudioMetadata(file: MediaFile): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!file.type.startsWith('audio/')) {
        reject(new Error('File is not an audio file.'));
        return;
      }

      const audioContext = new AudioContext();
      const reader = new FileReader();

      reader.onload = async (event) => {
        try {
          if (!event.target?.result) {
            reject(new Error('Failed to read file.'));
            return;
          }

          const arrayBuffer = event.target.result as ArrayBuffer;

          // Decode the audio data to extract metadata
          const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

          // Basic metadata extraction
          const metadata = {
            duration: audioBuffer.duration, // Duration in seconds
            format: file.type, // MIME type
            name: file.name, // File name
            size: file.size, // File size in bytes
          };

          // Attempt to extract additional metadata (artist/title from file name or ID3 tags if supported)
          const additionalMetadata = this.extractMetadataFromAudioFileName(file.name);

          file.media = { ...file.media, ...metadata, ...additionalMetadata };
          resolve();
        } catch (error) {
          reject(error);
        } finally {
          await audioContext.close();
        }
      };

      reader.onerror = () => {
        reject(new Error('Failed to read file.'));
      };

      reader.readAsArrayBuffer(file);
    });
  }

// Helper function to extract basic metadata from file name
  static extractMetadataFromAudioFileName(fileName: string): {
    artist?: string;
    trackTitle?: string;
  } {
    const parts = fileName.split('-').map((part) => part.trim());
    if (parts.length === 2) {
      return {
        artist: parts[0],
        trackTitle: parts[1].replace(/\.\w+$/, ''), // Remove file extension
      };
    }
    return { trackTitle: fileName.replace(/\.\w+$/, '') };
  }

  static async preloadAudio(file: MediaFile): Promise<IAudioPreloadResult> {
    if (!file.type.startsWith('audio/')) {
      throw new Error('File is not an audio file.');
    }

    // Create a new audio element
    const blob = await file.toBlob();

    // Create a Blob URL for the file
    const objectUrl = URL.createObjectURL(blob as globalThis.Blob);
    return new Promise((resolve) => {
      const element = document.createElement('audio') as HTMLAudioElement;
      element.addEventListener("durationchange", () => {
        // console.info("Audio duration:", element.duration); // Outputs the duration in seconds
        const metadata = { duration: element.duration, format: file.type, name: file.name, size: file.size, objectUrl };
        if ('media' in file) {
          file.media = { ...file.media, duration: element.duration };
        }
        resolve( { element, objectUrl, metadata});
      });
      element.src = objectUrl;
      // Set up the audio element
      element.preload = 'metadata'; // Ensures the audio is preloaded
    })
  }

  static async  decodeAudioData(context: OfflineAudioContext, arrayBuffer: ArrayBuffer): Promise<AudioBuffer> {
    return new Promise((resolve, reject) => {
      context.decodeAudioData(
        arrayBuffer,
        buffer => {
          resolve(buffer);
        },
        error => {
          console.info('Audio data size:', arrayBuffer.byteLength);
          console.error('Error decoding audio data:', error);
          reject(new Error(`Error decoding audio data: ${error}`));
        }
      );
    });
  }

  static async processAudioBuffer(audioBuffer: AudioBuffer, options: WaveformOptions): Promise<string> {
    const canvas = document.createElement('canvas');
    const width = options.width || 800;
    const height = options.height || 400;
    canvas.width = width;
    canvas.height = height;
    const canvasContext = canvas.getContext('2d');
    if (!canvasContext) {
      throw new Error('Canvas context not found.');
    }

    const waveform = audioBuffer.getChannelData(0);
    const samplesPerPixel = Math.floor(waveform.length / width);

    canvasContext.fillStyle = options.backgroundColor || '#FFFFFF';
    canvasContext.fillRect(0, 0, width, height);

    canvasContext.strokeStyle = options.waveformColor || '#0000FF';
    canvasContext.lineWidth = 2;
    canvasContext.beginPath();

    const halfHeight = height / 2;
    let maxY = 0;
    let minY = 0;
    let total = 0;
    const plots: [number, number][] = [];
    for (let i = 0; i < width; i += 1) {
      const start = i * samplesPerPixel;
      const end = start + samplesPerPixel;
      const min = Math.min(...waveform.slice(start, end));
      const max = Math.max(...waveform.slice(start, end));
      plots.push([min, max]);
      if (min < minY) {
        minY = min;
      }
      if (max > maxY) {
        maxY = max;
      }
      const totalMax = (min * halfHeight) + (max * halfHeight);
      if (totalMax > total) {
        total = totalMax;
      }
    }

    const modifier = (300 / (total) - 1) * .5;
    for (let i = 0; i < width; i += 1) {
      const min = plots[i][0];
      const max = plots[i][1];


      const yMin = halfHeight + min * halfHeight * modifier;
      const yMax = halfHeight + max * halfHeight * modifier;

      canvasContext.moveTo(i, yMin);
      canvasContext.lineTo(i, yMax);
    }
    canvasContext.stroke();

    if (options.outputType === 'blob') {
      return new Promise<string>((resolve) => {
        canvas.toBlob((blob) => {
          if (blob) {
            const blobUrl = URL.createObjectURL(blob);
            resolve(blobUrl);
          }
        }, 'image/png');
      });
    }

    return Promise.resolve(canvas.toDataURL('image/png'));
  }

  static generateWaveformImage(
    audioSource: MediaFile | string,
    options: WaveformOptions = {}
  ): Promise<string> {
    const offlineAudioContext = new OfflineAudioContext(1, 44100 * 40, 44100);

    if (typeof audioSource === 'string') {
      // Fetch the audio file from the URL using XMLHttpRequest
      return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('GET', audioSource, true);
        xhr.responseType = 'arraybuffer';

        xhr.onload = async () => {
          if (xhr.status === 200) {
            try {
              if (xhr.response.byteLength === 0) {
                reject(new Error('Fetched audio data is empty.'));
              }
              const contentType = xhr.getResponseHeader('Content-Type');
              if (!contentType || !contentType.startsWith('audio/')) {
                reject(new Error(`Invalid audio data type: ${contentType}`));
              }
              // console.log('Fetched audio data size:', xhr.response.byteLength);
              // console.log('Fetched audio data type:', contentType);
              const decodedData = await this.decodeAudioData(offlineAudioContext, xhr.response);
              const result = await this.processAudioBuffer(decodedData, options);
              resolve(result);
            } catch (error) {
              // console.log('Error decoding audio data:', error);
              // console.log('Audio data size:', xhr.response.byteLength);
              reject(error);
            }
          } else {
            reject(new Error(`HTTP error! status: ${xhr.status}`));
          }
        };

        xhr.onerror = function onError() {
          reject(new Error('Network error occurred'));
        };

        xhr.send();
      });
    }

    // Read the local file as an ArrayBuffer
    return new Promise<string>((resolve, reject) => {
      const fileReader = new FileReader();
      fileReader.onload = async (e: ProgressEvent<FileReader>) => {
        try {
          const arrayBuffer = e.target?.result as ArrayBuffer;
          if (arrayBuffer.byteLength === 0) {
            reject(new Error('Read audio data is empty.'));
          }
          // console.log('Read audio data size:', arrayBuffer.byteLength);
          const decodedData = await this.decodeAudioData(offlineAudioContext, arrayBuffer);
          const result = await this.processAudioBuffer(decodedData, options);
          resolve(result);
        } catch (error) {
          console.info('Audio data size:', (e.target?.result as ArrayBuffer).byteLength);
          console.error('Error decoding audio data:', error);
          reject(error);
        }
      };
      fileReader.onerror = reject;
      fileReader.readAsArrayBuffer(audioSource);
    });
  }

  static async getAudioWaveImage (imageOptions: IAudioWaveImageOptions) {
    if (!imageOptions.duration) {
      throw new Error('attempting to generate a wave image for an audio file and the duration was not supplied')
    }
    const width = imageOptions.duration * 100;
    // return `url(${blobUrl})`;
    return MediaFile.generateWaveformImage(imageOptions.objectUrl as string, {
      width,
      height: 300,
      backgroundColor: imageOptions.backgroundColor, // Black
      waveformColor: imageOptions.waveformColor,   // Green waveform
      outputType: 'dataurl'          // Output a Blob URL
    })
  }

  static async preloadExtractAudio(file: MediaFile): Promise<void> {
    const id = `${file.name}-audio`;
    const cached = this.cache[id];
    if (cached) {
      file.media = cached.media;
      return;
    }
    const preloadRes = await this.preloadAudio(file);
    const { metadata, objectUrl } = preloadRes;

    const imageOptions = {
      width: metadata.duration * 100,
      height: 300,
      objectUrl,
      duration: metadata.duration,
      backgroundColor: '#0000',
      waveformColor:  '#2bd797'
    }
    const backgroundImage = await this.getAudioWaveImage(imageOptions);
    file.media = { ...file.media, ...preloadRes, backgroundImage }
    this.cache[id] = file;
  }

  static toFileBaseArray(files: IMediaFile[]) {
    return files.map((file, index) => {
      const mediaFile = file as IMediaFile;
      return {
        id: mediaFile.id,
        name: mediaFile.name,
        lastModified: mediaFile.lastModified,
        children: mediaFile.children,
        mediaType: mediaFile.mediaType as MediaType,
        type: mediaFile.type,
        size: mediaFile.size,
        media: mediaFile.media,
        created: mediaFile.created,
        path: mediaFile.path,
        visibleIndex: index,
      }
    })
  }
}


