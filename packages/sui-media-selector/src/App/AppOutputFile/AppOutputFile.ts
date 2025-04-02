import { FileSaveRequest } from '@stoked-ui/common';
import WebFile, { IWebFile } from '../../WebFile';

export interface IAppOutputFileProps { id?: string; name: string; blob: Blob }

export interface IAppOutputFile extends IWebFile {

  // Overrides getSaveRequest from WebFile
  getSaveRequest(): Promise<FileSaveRequest>;
}

export default class AppOutputFile extends WebFile implements IAppOutputFile {
  blob: Blob;

  constructor(props: { id?: string; name: string; blob: Blob }) {
    super(props);
    this.blob = props?.blob;
  }

  async getSaveRequest(): Promise<FileSaveRequest> {
    return {
      ...this.createSaveRequest(),
      blob: this.blob
    };
  }
}

