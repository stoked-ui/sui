// eslint-disable-next-line @typescript-eslint/no-use-before-define
import { IMimeType, MimeType } from "./MimeType";
import WebFile from "./WebFile";
import { IWebData, IWebFile, IWebFileProps } from "./WebFile.types";

export interface IProjectFileProps extends IWebFileProps {
}

export interface IProjectFile extends Omit<IWebFile, 'mimeType'> {
}

export default abstract class ProjectFile extends WebFile
  implements Omit<IProjectFile, 'mimeType'> {

  outputMimeTypes: IMimeType[];

  get fileProps(): Omit<IProjectFile, 'save' | 'initialize' | 'fileMeta' | 'createBlob' | 'state' > & { mimeType: MimeType } {
    return {
      ...super.fileProps,
    };
  }

}





