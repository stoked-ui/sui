/**
 * MimeSubtype type represents a MIME subtype in the format of 'sub-type/sub-mime-type'.
 */
export type MimeSubtype = `${string}-${string}`;

/**
 * SUIMimeType type represents a MIME subtype in the format of '/sub-mime-type/sub-type'.
 */
export type SUIMimeType = `${string}/${string}`;

/**
 * Ext type represents an extension with a dot prefix, e.g. '.txt'.
 */
export type Ext = `.${string}`;

/**
 * AcceptType interface represents an accept type with a MimeType property.
 */
export interface IMimeType {
  /**
   * Gets the MIME subtype of this type.
   */
  get type(): SUIMimeType;

  /**
   * Gets the sub-type of this type.
   */
  get subType(): MimeSubtype;

  /**
   * Gets the name of this type.
   */
  get name(): string;

  /**
   * Gets the application associated with this type.
   */
  get application(): string;

  /**
   * Gets the extension associated with this type.
   */
  get ext(): Ext;

  /**
   * Gets a brief description of this type.
   */
  get description(): string;

  /**
   * Gets a boolean indicating whether this type is embedded or not.
   */
  get embedded(): boolean;

  /**
   * Gets an object containing the MIME subtype and extension for accept purposes.
   */
  get accept(): AcceptType;

  /**
   * Gets an object containing the MIME subtype for this type.
   */
  get typeObj(): { type: SUIMimeType };
}

/**
 * MimeRegistry class manages a registry of MIME types.
 */
export class MimeRegistry {
  /**
   * Gets an array of all extensions in the registry.
   */
  static get exts() {
    return this._exts;
  }

  private static _exts: Record<Ext, IMimeType> = {};

  /**
   * Gets an object mapping MIME type names to their corresponding objects.
   */
  static names() {
    return this._names;
  }

  private static _names: Record<string, IMimeType> = {};

  /**
   * Gets an object mapping MIME sub-types to their corresponding objects.
   */
  static subtypes() {
    return this._subtypes;
  }

  private static _subtypes: Record<MimeSubtype, IMimeType> = {};

  /**
   * Gets an object mapping MIME types (in SUIMimeType format) to their corresponding objects.
   */
  static types() {
    return this._types;
  }

  private static _types: Record<SUIMimeType, IMimeType> = {};

  /**
   * Creates a new MIME type object and adds it to the registry.
   * 
   * @param application The application associated with this type.
   * @param name The name of this type.
   * @param ext The extension associated with this type.
   * @param description A brief description of this type.
   * @param embedded A boolean indicating whether this type is embedded or not. Defaults to true.
   * @param type The MIME subtype of this type. Defaults to 'application'.
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
 * Gets the extension from a URL.
 * 
 * @param url The URL to get the extension from.
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