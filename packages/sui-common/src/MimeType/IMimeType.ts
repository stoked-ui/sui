/**
 * Type definitions for mime types.
 */
export type MimeSubtype = `${string}-${string}`;
export type SUIMimeType = `${string}/${string}`;
export type Ext = `.${string}`;
export type AcceptType = { MimeType: Ext };

/**
 * Interface representing a mime type.
 *
 * @description The IMimeType interface provides access to the properties of a mime type.
 */
export interface IMimeType {
  /**
   * Returns the type of the mime type, including its subtype and extension.
   *
   * @returns {SUIMimeType} The mime type as a SUIMimeType object.
   */
  get type(): SUIMimeType;

  /**
   * Returns the subtype of the mime type, which is a combination of the application and name properties.
   *
   * @returns {MimeSubtype} The mime type's subtype.
   */
  get subType(): MimeSubtype;

  /**
   * Returns the application associated with the mime type.
   *
   * @returns {string} The application.
   */
  get application(): string;

  /**
   * Returns the name of the mime type.
   *
   * @returns {string} The name.
   */
  get name(): string;

  /**
   * Returns the extension of the mime type.
   *
   * @returns {Ext} The extension.
   */
  get ext(): Ext;

  /**
   * Returns the description of the mime type.
   *
   * @returns {string} The description.
   */
  get description(): string;

  /**
   * Returns whether the mime type is embedded or not.
   *
   * @returns {boolean} True if the mime type is embedded, false otherwise.
   */
  get embedded(): boolean;

  /**
   * Returns an object with the mime type as its value, used for accepting the extension in an AcceptType object.
   *
   * @returns {AcceptType} An object with the mime type as its key and the extension as its value.
   */
  get accept(): AcceptType;
}

/**
 * Object mapping MimeSubtype to its corresponding IMimeType.
 */
export const subtypes: Record<MimeSubtype, IMimeType> = {};

/**
 * Object mapping SUIMimeType to its corresponding IMimeType.
 */
export const types: Record<SUIMimeType, IMimeType> = {};

/**
 * Object mapping Ext to its corresponding IMimeType.
 */
export const exts: Record<Ext, IMimeType> = {};

/**
 * Object mapping string to its corresponding IMimeType.
 */
export const names: Record<string, IMimeType> = {};

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
 * @returns {IMimeType} The created IMimeType.
 */
export function create(application: string, name: string, ext: Ext, description: string, embedded: boolean = true, type: string = 'application'): IMimeType {
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
  };
  exts[ext] = mimeType;
  names[name] = mimeType;
  subtypes[mimeType.subType] = mimeType;
  types[mimeType.type] = mimeType;
  return mimeType as IMimeType;
}

/**
 * Function to extract the extension from a URL.
 *
 * @param url The URL from which to extract the extension.
 *
 * @returns {string} The extracted extension. If no extension is found, an empty string is returned.
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