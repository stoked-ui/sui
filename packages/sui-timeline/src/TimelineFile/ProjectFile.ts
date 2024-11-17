// eslint-disable-next-line @typescript-eslint/no-use-before-define
import FileTypeMeta from "./FileTypeMeta";
import WebFile from "./WebFile";
import { TimelineOutputFileMeta } from "./TimelineFile.types";
import { Constructor, IWebFile, IWebFileProps } from "./WebFile.types";

export interface IProjectFileProps extends IWebFileProps {}

export interface IProjectFile extends IWebFile {}

export default class ProjectFile<
  MimeType extends FileTypeMeta,
  OutputMimeType extends FileTypeMeta
> extends WebFile<MimeType>
  implements IProjectFile {

  constructor(props: IProjectFileProps) {
    super(props);
  }

  protected OutputFileTypeConstructor: Constructor<OutputMimeType> = TimelineOutputFileMeta as Constructor<OutputMimeType>;

  outputFileMeta: OutputMimeType = new this.OutputFileTypeConstructor();
}





