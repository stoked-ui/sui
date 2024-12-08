/*
// eslint-disable-next-line @typescript-eslint/no-use-before-define
import {  IMimeType, MimeType } from "@stoked-ui/media-selector";
import WebFile from "./WebFile";
import { IWebData, IWebFile, IWebFileProps } from "./WebFile.types";

export interface IProjectFileProps extends IWebFileProps {
}

export interface IProjectFile extends Omit<IWebFile, 'mimeType'> {
}

export default abstract class ProjectFile extends WebFile
  implements Omit<IProjectFile, 'mimeType'> {

    outputMimeTypes: IMimeType[];

  async initialize() {
    await super.initialize();
  }

  get fileData(): Omit<IProjectFile, 'save' | 'initialize' | 'fileMeta' | 'createBlob' | 'state' | 'trackFiles' | 'readBlob'> & { mimeType: MimeType } {
    return {
      ...super.fileData,
    };
  }

}





*/
