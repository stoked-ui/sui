import { getMimeType } from "@stoked-ui/media-selector";

export default abstract class FileTypeMeta {

  description: string;

  ext: `.${string}`;

  name: string;

  applicationName: string = 'stoked-ui'

  get mimeSubtype() {
    return `${this.applicationName}-${this.name}`;
  }

  get mimeType(): `${string}/${string}` {
    return `application/${this.mimeSubtype}`;
  }

  get acceptTypes(): Record<`${string}/${string}`, `.${string}` | `.${string}`[]> {
    return {
      [this.mimeType]: [this.ext],
    }
  }

  get MimeType() {
    return getMimeType({
      type: 'application',
      subType: this.applicationName,
      subTypePrefix: this.name
    });
  }

  get primaryType() {
    return {
      description: this.description,
      accept: this.acceptTypes
    }
  }
}
