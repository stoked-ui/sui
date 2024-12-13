import { FileSaveRequest } from '@stoked-ui/common';
import WebFile, { IWebFile } from '../../WebFile';

export interface IAppOutputFileProps { id?: string; name: string; outputData: Blob }

export interface IAppOutputFile extends IWebFile {

  // Overrides getSaveRequest from WebFile
  getSaveRequest(): Promise<FileSaveRequest>;
}

export default class AppOutputFile extends WebFile implements IAppOutputFile {
  private outputData: Blob;

  constructor(props: { id?: string; name: string; outputData: Blob }) {
    super(props);
    this.outputData = props?.outputData;
  }

  async getSaveRequest(): Promise<FileSaveRequest> {
    return {
      ...this.createSaveRequest(),
      blob: this.outputData
    };
  }
}
