/* eslint-disable class-methods-use-this */
/*  eslint-disable @typescript-eslint/naming-convention */
import { SaveDialogProps, SaveOptions } from "./TimelineFile.types";

export abstract class BaseFile {

  protected lastChecksum: null | string = null;

  protected _version: number = 0;

  id?: string;

  get version() {
    return this._version;
  };

  primaryType: FilePickerAcceptType = {
    description: 'Timeline Project Files',
    accept: {
      'application/stoked-ui-timeline': ['.sut'],
    },
  };

  primaryExt: string = '.sut';

  types: FilePickerAcceptType[] = [];

  async hashString(canonicalString: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(canonicalString);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  async checksum(): Promise<string> {
    return 'default';
  }

  async isDirty(): Promise<boolean> {
    const checksum = await this.checksum();
    if (this.lastChecksum === checksum || checksum === 'default') {
      return true;
    }
    this.lastChecksum = checksum;
    return false;
  }
}
