import { IMediaFile, MediaFile } from "@stoked-ui/media-selector";
import WebFile from "./WebFile";
import { IWebFile, IWebFileProps } from "./WebFile.types";
import { OutputBlob } from "./TimelineFile.types";

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
}

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
