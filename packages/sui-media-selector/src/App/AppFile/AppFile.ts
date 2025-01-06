import {namedId, Constructor, FileSaveRequest, Versions, IDBVideo,} from '@stoked-ui/common';
import { File, Blob } from 'formdata-node';
import MediaFile from '../../MediaFile';
import WebFile, {
  IWebFile,
  IWebFileData,
  IWebFileProps,
} from '../../WebFile';

export type IAppFileProps = IWebFileProps & {
  mediaFiles?: MediaFile[];
}

export interface IAppFileConstructor<AppFileType extends AppFile = AppFile>  {
  fromUrl(url: string): Promise<AppFileType>;
  fromLocalFile(file: File): Promise<AppFileType>;
}

export interface IAppFileMeta { id: string, size: number, name: string, type: string }
export interface IAppFileData extends IWebFileData {
  mediaFilesMeta: IAppFileMeta[];
}

export interface IAppFile extends IWebFile {
  mediaFiles: MediaFile[];
  versions: Versions;
  videos: IDBVideo[];

  addMediaFile(mediaFile: MediaFile): void;
  removeMediaFile(id: string): void;

  toBlob(): Promise<Blob>;
  stream(): ReadableStream<Uint8Array>;
}

export default class AppFile<FileDataType extends IAppFileData = IAppFileData> extends WebFile implements IAppFile {

  protected _mediaFiles: MediaFile[];

  versions: Versions = [];

  videos: IDBVideo[] = [];

  constructor(appFileProps: IAppFileProps) {
    super(appFileProps);
    this._mediaFiles = appFileProps?.mediaFiles ?? [];
  }

  get mediaFiles(): MediaFile[] {
    return this._mediaFiles;
  }

  async getSaveRequest(): Promise<FileSaveRequest> {
    const saveRequest =  this.createSaveRequest();
    return {
      ...saveRequest,
      blob: await this.toBlob(),
    };
  }

  /**
   * Adds a MediaFile to the collection.
   * @param mediaFile MediaFile instance to add.
   */
  addMediaFile(mediaFile: MediaFile | MediaFile[]) {
    if (Array.isArray(mediaFile)) {
      this._mediaFiles = this._mediaFiles.concat(mediaFile);
    } else {
      this._mediaFiles.push(mediaFile);
    }
  }

  /**
   * Removes a MediaFile by its ID.
   * @param id The ID of the MediaFile to remove.
   */
  removeMediaFile(id: string) {
    this._mediaFiles = this._mediaFiles.filter((file) => file.id !== id);
  }

  /**
   * Loads a AppFile instance from a URL.
   * @param url The URL to load the file from.
   * @param FileConstructor
   */
  static async fromUrl<AppFileType = AppFile>(url: string, FileConstructor: Constructor<AppFileType>): Promise<AppFileType | null> {
    const response = await fetch(url);
    if (response.ok) {
      const blob = await response.blob();
      return this.fromLocalFile<AppFileType>(blob as Blob, FileConstructor);
    }
    console.error(`Failed to fetch file from ${url}`);
    return null;
  }

  /**
   * Loads a AppFile instance from the local file system.
   * @param file A File object from an attached drive.
   * @param FileConstructor
   */
  static async fromLocalFile<AppFileType = AppFile>(file: Blob, FileConstructor: Constructor<AppFileType>): Promise<AppFileType> {
    const arrayBuffer = await file.arrayBuffer();
    const dataView = new DataView(arrayBuffer);

    // Read the first 4 bytes as the metadata length
    const metadataLength = dataView.getUint32(0, /* littleEndian= */ true);

    // Extract metadata
    const metadataStart = 4; // Metadata length occupies the first 4 bytes
    const metadataEnd = metadataStart + metadataLength;
    const metadataBuffer = arrayBuffer.slice(metadataStart, metadataEnd);
    const metadataText = new TextDecoder().decode(metadataBuffer);
    const jsonData = JSON.parse(metadataText);
    const { mediaFilesMeta, ...metadata } = jsonData;

    // Extract binary data for media files
    const binaryData = arrayBuffer.slice(metadataEnd);
    const mediaFilesInstances = mediaFilesMeta.map((fileMeta: IAppFileMeta, index: number) => {
      const mediaFileBlob = new Blob([binaryData.slice(index, index + fileMeta.size)], { type: fileMeta.type });
      return new MediaFile([mediaFileBlob], fileMeta.name, { type: fileMeta.type });
    });

    return new FileConstructor({
      mediaFiles: mediaFilesInstances,
      ...metadata
    });
  }

  /**
   * Opens a file dialog to select multiple files.
   */
  static async fromOpenDialog<AppFileType = AppFile>(FileConstructor: Constructor<AppFileType>): Promise<AppFileType[]> {
    const files = await this.open();
    return Promise.all(files.map( async (file) => {
      return this.fromLocalFile<AppFileType>(file as File, FileConstructor);
    }));
  }

  /**
   * Serializes the AppFile to a Blob.
   */
  async toBlob(): Promise<Blob> {
    const metadata = JSON.stringify(this.data);
    const metadataBlob = new Blob([metadata], { type: 'application/json' });
    const metadataLengthBuffer = new Uint32Array([metadataBlob.size]); // Store metadata size as a 4-byte buffer

    const fileBlobs = await Promise.all(this.mediaFiles.map((file) => file.toBlob()));

    // Combine metadata length, metadata, and file blobs
    return new Blob([metadataLengthBuffer.buffer, metadataBlob, ...fileBlobs], { type: 'application/octet-stream' });
  }

  /**
   * Streams the AppFile as a ReadableStream.
   */
  stream(): ReadableStream<Uint8Array> {
    const metadataBlob = new Blob([JSON.stringify(this.data)], { type: 'application/json' });
    const fileStreams = this.mediaFiles.map((file) => file.stream());
    const metadataStream = metadataBlob.stream();

    return new ReadableStream({
      async start(controller) {
        // Helper function to enqueue data from a ReadableStream
        async function enqueueStream(stream: ReadableStream<Uint8Array>) {
          const reader = stream.getReader();
          try {
            // eslint-disable-next-line no-constant-condition
            while (true) {
              // eslint-disable-next-line no-await-in-loop
              const { done, value } = await reader.read();
              if (done) {
                break;
              }
              if (value) {
                controller.enqueue(value);
              }
            }
          } finally {
            reader.releaseLock();
          }
        }

        // Enqueue metadataStream
        await enqueueStream(metadataStream);

        // Enqueue each file's stream
        // eslint-disable-next-line no-restricted-syntax
        for (const stream of fileStreams) {
          // eslint-disable-next-line no-await-in-loop
          await enqueueStream(stream);
        }

        // Signal the stream is complete
        controller.close();
      },
    });
  }

  /**
   * Generates a unique ID for the instance.
   */
  // eslint-disable-next-line class-methods-use-this
  private generateId(): string {
    return namedId(this.name);
  }

  /**
   * Gets data for the AppFile.
   */
  get data(): FileDataType {
    const baseData = super.data;
    return {
      ...baseData,
      mediaFilesMeta: this.mediaFiles.map((file) => { return { size: file.size, name: file.name, type: file.type }}),
    } as FileDataType
  }
}
