/*
import { IMediaFile } from "@stoked-ui/media-selector";
import WebFile from "./WebFile";
import { IWebFile, IWebFileProps, IFileParams } from "./WebFile.types";

export interface IProjectOutputFileProps extends IWebFileProps {
  sourceId: string;
  file: IMediaFile;
}

export interface IProjectOutputFile extends IWebFile {
  sourceId: string;
  file: IMediaFile;
}

export default class ProjectOutputFile
  extends WebFile
  implements IProjectOutputFile {

  sourceId: string;

  file: IMediaFile;

  constructor(props: IProjectOutputFileProps) {
    super(props);
    this.sourceId = props.sourceId;
    this.file = props.file;
  }

  // eslint-disable-next-line class-methods-use-this
  async initialize() {
    await super.initialize();
  }

  get fileParams(): IFileParams[] {
    return [{ name: this.file.name, size: this.file.size, type: this.file.type }];
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
/!*

export function MediaFileFromOutputBlob(outputBlob: OutputBlob): IMediaFile {
  const { blob } = outputBlob;
  const mediaFile: IMediaFile = {
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
  return MediaFile.fromFile(mediaFile);
}
*!/
*/
