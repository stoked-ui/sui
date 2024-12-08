import { Settings } from "@stoked-ui/common";

export default interface MediaFile extends File {
  /**
   * The timestamp when the file was created.
   */
  readonly created: number;

  /**
   * The media type (e.g., 'video', 'image', 'audio').
   */
  readonly mediaType: string;

  /**
   * The path of the file.
   */
  readonly path: string;

  /**
   * The URL associated with the file.
   */
  readonly url: string;

  /**
   * Additional metadata or media-related properties.
   */
  media: Settings;

  /**
   * A unique identifier for the file.
   */
  readonly id: string;

  readonly children?: MediaFile[];

  /**
   * Retrieves a url for the file if one isn't available it will create one
   */
  getUrl(): string;

  /**
   * Retrieves the combined metadata and file content as a `Blob`.
   */
  toBlob(): Promise<Blob>;

  /**
   * Reads the file and metadata as an `ArrayBuffer`.
   */
  arrayBuffer(): Promise<ArrayBuffer>;

  /**
   * Reads the file and metadata as a `string`.
   */
  text(): Promise<string>;

  /**
   * Streams the file and metadata as a `ReadableStream`.
   */
  stream(): ReadableStream<Uint8Array>;

  /**
   * Creates a new `Blob` containing the specified portion of the file and metadata.
   * @param start The start byte index.
   * @param end The end byte index.
   * @param contentType The MIME type of the slice.
   */
  slice(start?: number, end?: number, contentType?: string): Blob;

  /**
   * Retrieves metadata for the media file.
   */
  readonly metadata: {
    id: string;
    name: string;
    type: string;
    size: number;
    created: number;
    lastModified: number;
    mediaType: string;
    path: string;
    url: string;
    media: any;
  };
}
