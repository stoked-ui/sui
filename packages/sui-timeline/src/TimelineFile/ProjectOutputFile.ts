import { IMediaFile2 } from "@stoked-ui/media-selector";
import WebFile from "./WebFile";
import { IWebFile, IWebFileProps, IFileParams } from "./WebFile.types";

export interface IProjectOutputFileProps extends IWebFileProps {
  sourceId: string;
  file: IMediaFile2;
}

export interface IProjectOutputFile extends IWebFile {
  sourceId: string;
  file: IMediaFile2;
}

export default class ProjectOutputFile
  extends WebFile
  implements IProjectOutputFile {

  sourceId: string;

  file: IMediaFile2;

  constructor(props: IProjectOutputFileProps) {
    super(props);
    this.sourceId = props.sourceId;
    this.file = props.file;
  }

  async initialize(files?: File[]) {
    this.file = files[0] as IMediaFile2;
  }

  get fileParams(): IFileParams[] {
    return [{ name: this.file.name, size: this.file.size, type: this.file.type, url: this.file.url }];
  }

  protected getDataStreams(): AsyncIterable<ReadableStream<Uint8Array>> {
    // eslint-disable-next-line consistent-this
    const instance = this; // Preserve the `this` context
    return {
      async *[Symbol.asyncIterator]() {
        // Create a ReadableStream for each file
        yield instance.file.stream() as ReadableStream<Uint8Array>;
      },
    };
  }
}
/*

export function MediaFileFromOutputBlob(outputBlob: OutputBlob): IMediaFile2 {
  const { blob } = outputBlob;
  const mediaFile: IMediaFile2 = {
    ...outputBlob,
    mediaType: 'video',
    icon: null,
    thumbnail: null,
    lastModified: undefined,
    url: URL.createObjectURL(outputBlob.blob),
    type: 'video/webm',
    arrayBuffer: blob.arrayBuffer,
    stream: blob.stream,
    text: blob.text,
    slice: blob.slice,
    webkitRelativePath: outputBlob.name,
    itemId: outputBlob.id,
    mediaFileSize: blob.size,
  };
  return MediaFile2.fromFile(mediaFile);
}
*/
