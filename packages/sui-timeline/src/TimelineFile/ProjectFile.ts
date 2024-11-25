// eslint-disable-next-line @typescript-eslint/no-use-before-define
import { IMediaFile } from "@stoked-ui/media-selector";
import { IMimeType, MimeType } from "./MimeType";
import WebFile from "./WebFile";
import { IWebData, IWebFile, IWebFileProps } from "./WebFile.types";

export interface IProjectFileProps extends IWebFileProps {
}

export interface IProjectFile extends Omit<IWebFile, 'mimeType'> {
  get trackFiles(): IMediaFile[];
}

export default abstract class ProjectFile extends WebFile
  implements Omit<IProjectFile, 'mimeType'> {

  abstract get trackFiles(): IMediaFile[];

  outputMimeTypes: IMimeType[];

  get fileProps(): Omit<IProjectFile, 'save' | 'initialize' | 'fileMeta' | 'createBlob' | 'state' | 'trackFiles'> & { mimeType: MimeType } {
    return {
      ...super.fileProps,
    };
  }

}





