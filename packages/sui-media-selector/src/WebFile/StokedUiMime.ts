import {Ext, IMimeType, MimeRegistry} from "./IMimeType";

// @ts-ignore
export class SUIMime extends MimeRegistry {
  static make(application: string, ext: Ext, description: string, embedded: boolean = true): IMimeType {
    return MimeRegistry.create('stoked-ui', application, ext, description, embedded);
  }
}
