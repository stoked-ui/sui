/**
 * @typedef {string} MimeSubtype - A subtype of MIME type represented as `${string}-${string}`
 * @typedef {string} SUIMimeType - A MIME type represented as `${string}/${string}`
 * @typedef {string} Ext - An extension represented as `.${string}`
 * @typedef {Object} AcceptType - Accept type object with MimeType property
 */

/**
 * Interface representing a MIME type.
 * @interface IMimeType
 * @property {SUIMimeType} type - The MIME type
 * @property {MimeSubtype} subType - The MIME subtype
 * @property {string} name - The name of the MIME type
 * @property {string} application - The application associated with the MIME type
 * @property {Ext} ext - The extension of the MIME type
 * @property {string} description - Description of the MIME type
 * @property {boolean} embedded - Indicates if the MIME type is embedded
 * @property {AcceptType} accept - Accept type object
 * @property {{type: SUIMimeType}} typeObj - Type object
 */

/**
 * Class for managing MIME types.
 * @class MimeRegistry
 */
export class MimeRegistry {
  /**
   * Get the registered extensions.
   * @returns {Record<Ext, IMimeType>} - Object containing extensions and corresponding MIME types
   */
  static get exts() {
    return this._exts;
  }

  private static _exts: Record<Ext, IMimeType> = {};

  /**
   * Get the registered names.
   * @returns {Record<string, IMimeType>} - Object containing names and corresponding MIME types
   */
  static names() {
    return this._names;
  }

  private static _names: Record<string, IMimeType> = {};

  /**
   * Get the registered subtypes.
   * @returns {Record<MimeSubtype, IMimeType>} - Object containing subtypes and corresponding MIME types
   */
  static subtypes() {
    return this._subtypes;
  }

  private static _subtypes: Record<MimeSubtype, IMimeType> = {};

  /**
   * Get the registered types.
   * @returns {Record<SUIMimeType, IMimeType>} - Object containing types and corresponding MIME types
   */
  static types() {
    return this._types;
  }

  private static _types: Record<SUIMimeType, IMimeType> = {};

  /**
   * Create a new MIME type and register it.
   * @param {string} application - The application associated with the MIME type
   * @param {string} name - The name of the MIME type
   * @param {Ext} ext - The extension of the MIME type
   * @param {string} description - Description of the MIME type
   * @param {boolean} [embedded=true] - Indicates if the MIME type is embedded
   * @param {string} [type='application'] - The type of the MIME type
   * @returns {IMimeType} - The created MIME type
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
 * Get the extension from a URL.
 * @param {string} url - The URL
 * @returns {string} - The extension extracted from the URL
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