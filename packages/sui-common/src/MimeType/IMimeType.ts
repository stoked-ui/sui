/**
 * Type definitions for mime types.
 */
export type MimeSubtype = `${string}-${string}`;
export type SUIMimeType = `${string}/${string}`;
export type Ext = `.${string}`;
export type AcceptType =  { MimeType: Ext };

/**
 * Interface representing a mime type.
 */
export interface IMimeType {
  /**
   * Gets the MIME type of this object.
   *
   * @returns The MIME type as an SUIMimeType.
   */
  get type(): SUIMimeType;

  /**
   * Gets the subtype of this object.
   *
   * @returns The subtype as a MimeSubtype.
   */
  get subType(): MimeSubtype;

  /**
   * Gets the name of this object.
   *
   * @returns The name as a string.
   */
  get name(): string;

  /**
   * Gets the application associated with this object.
   *
   * @returns The application as a string.
   */
  get application(): string;

  /**
   * Gets the extension of this object.
   *
   * @returns The extension as an Ext.
   */
  get ext(): Ext;

  /**
   * Gets the description of this object.
   *
   * @returns The description as a string.
   */
  get description(): string;

  /**
   * Gets whether this object is embedded or not.
   *
   * @returns True if embedded, false otherwise.
   */
  get embedded(): boolean;

  /**
   * Gets the accept type of this object.
   *
   * @returns The accept type as an AcceptType.
   */
  get accept(): AcceptType;

  /**
   * Gets the type object of this mime type.
   *
   * @returns The type object with type property set to SUIMimeType.
   */
  get typeObj(): { type: SUIMimeType };
}

/**
 * Class representing a registry for mime types.
 */
export class MimeRegistry {
  /**
   * Gets an array of all extensions in the registry.
   *
   * @returns An array of Ext values.
   */
  static get exts() {
    return this._exts;
  }

  private static _exts: Record<Ext, IMimeType> = {};

  /**
   * Gets an array of names for mime types in the registry.
   *
   * @returns An array of string values representing the mime type names.
   */
  static names() {
    return this._names;
  }

  private static _names: Record<string, IMimeType> = {};

  /**
   * Gets an object mapping MimeSubtype to its corresponding IMimeType.
   *
   * @returns An object with MimeSubtype as keys and IMimeType as values.
   */
  static subtypes() {
    return this._subtypes;
  }

  private static _subtypes: Record<MimeSubtype, IMimeType> = {};

  /**
   * Gets an object mapping SUIMimeType to its corresponding IMimeType.
   *
   * @returns An object with SUIMimeType as keys and IMimeType as values.
   */
  static types() {
    return this._types;
  }

  private static _types: Record<SUIMimeType, IMimeType> = {};

  /**
   * Creates a new mime type in the registry.
   *
   * @param application The application associated with the mime type.
   * @param name The name of the mime type.
   * @param ext The extension of the mime type.
   * @param description The description of the mime type.
   * @param embedded Whether the mime type is embedded or not. Defaults to true.
   * @param type The type of the mime type. Defaults to 'application'.
   *
   * @returns The created IMimeType.
   */
  static create(application: string, name: string, ext: Ext, description: string, embedded: boolean = true, type: string = 'application'): IMimeType {
    const mimeType = {
      get type() {
        return `${type}/${this.subType}` as SUIMimeType;
      },
      get subType() {
        return `${application}-${name}` as MimeSubtype;
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
          [this.type]: this.ext
        } as AcceptType;
      },
      get typeObj() {
        return { type: this.type };
      }
    }
    this.exts[ext] = mimeType;
    this.names[name] = mimeType;
    this.subtypes[mimeType.subType] = mimeType;
    this.types[mimeType.type] = mimeType;
    return mimeType as IMimeType;
  }
}

/**
 * Function to extract the extension from a URL.
 *
 * @param url The URL from which to extract the extension.
 *
 * @returns The extracted extension. If no extension is found, an empty string is returned.
 */
export function getExtension(url) {
  const urlObj = new URL(url);
  const pathname = urlObj.pathname;
  const lastIndex = pathname.lastIndexOf(".");
  if (lastIndex === -1) {
    return ""; // No extension found
  }
  return pathname.substring(lastIndex);
}