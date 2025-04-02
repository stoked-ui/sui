export interface Blob {
  /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/Blob/size) */
  readonly size: number;
  /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/Blob/type) */
  readonly type: string;
  /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/Blob/arrayBuffer) */
  arrayBuffer(): Promise<ArrayBuffer>;
  /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/Blob/slice) */
  slice(start?: number, end?: number, contentType?: string): Blob;
  /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/Blob/stream) */
  stream(): ReadableStream<Uint8Array>;
  /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/Blob/text) */
  text(): Promise<string>;
}

interface File extends Blob {
  /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/File/lastModified) */
  readonly lastModified: number;
  /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/File/name) */
  readonly name: string;
  /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/File/webkitRelativePath) */
  readonly webkitRelativePath: string;
}

// @ts-ignore
type EndingType = "native" | "transparent";

export interface BlobPropertyBag {
  endings?: EndingType;
  type?: string;
}

export interface FilePropertyBag extends BlobPropertyBag {
  lastModified?: number;
}

// @ts-ignore
type BlobPart = BufferSource | Blob | string;

// eslint-disable-next-line @typescript-eslint/no-redeclare,no-var,vars-on-top
declare const File: {
  prototype: File;
  new(fileBits: BlobPart[], fileName: string, options?: FilePropertyBag): File;
};

export { File };



