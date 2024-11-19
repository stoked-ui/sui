// eslint-disable-next-line @typescript-eslint/no-use-before-define
import { IMimeType } from "./MimeType";
import WebFile from "./WebFile";
import { IWebFile, IWebFileProps } from "./WebFile.types";

export interface IProjectFileProps extends IWebFileProps {
}

export interface IProjectFile extends IWebFile {
}

export default abstract class ProjectFile extends WebFile
  implements IProjectFile {

  outputMimeTypes: [IMimeType];

  get fileProps(): Omit<IProjectFile, 'save' | 'initialize' | 'fileMeta' | 'createBlob' | 'state'>  {
    return {
      ...super.fileProps,
    };
  }

}





