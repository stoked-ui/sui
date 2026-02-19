export type MimeSubtype = `${string}-${string}`;
export type SUIMimeType = `${string}/${string}`;
export type Ext = `.${string}`;
export type AcceptType =  { MimeType: Ext };

// TODO: move this file to @stoked-ui/common

export interface IMimeType {
  get type(): SUIMimeType;

  get subType(): MimeSubtype;

  get name(): string;

  get application(): string;

  get ext(): Ext;

  get description(): string;

  get embedded(): boolean;

  get accept(): AcceptType;

  get typeObj(): { type: SUIMimeType };
}

export class MimeRegistry {
  static get exts() {
    return this._exts;
  }

  private static _exts: Record<Ext, IMimeType> = {};

  static get names() {
    return this._names;
  }

  private static _names: Record<string, IMimeType> = {};

  static get subtypes() {
    return this._subtypes;
  }

  private static _subtypes: Record<MimeSubtype, IMimeType> = {};

  static get types() {
    return this._types;
  }

  private static _types: Record<SUIMimeType, IMimeType> = {};

  static create(application: string, name: string, ext: Ext, description: string, embedded: boolean = true, type: string = 'application'): IMimeType {
    const subType = `${application}-${name}` as MimeSubtype;
    const fullType = `${type}/${subType}` as SUIMimeType;
    const mimeType: IMimeType = {
      get type() {
        return fullType;
      },
      get subType() {
        return subType;
      },
      get application() {
        return application;
      },
      get name() {
        return name;
      },
      get ext() {
        return ext;
      },
      get description() {
        return description;
      },
      get embedded() {
        return embedded;
      },
      get accept() {
        return {
          [fullType]: ext
        } as AcceptType;
      },
      get typeObj() {
        return { type: fullType };
      }
    };
    (this.exts as Record<string, IMimeType>)[ext] = mimeType;
    (this.names as Record<string, IMimeType>)[name] = mimeType;
    (this.subtypes as Record<string, IMimeType>)[subType] = mimeType;
    (this.types as Record<string, IMimeType>)[fullType] = mimeType;
    return mimeType;
  }
}

export function getExtension(url: string) {
  const urlObj = new URL(url);
  const pathname = urlObj.pathname;
  const lastIndex = pathname.lastIndexOf(".");
  if (lastIndex === -1) {
    return ""; // No extension found
  }
  return pathname.substring(lastIndex);
}
