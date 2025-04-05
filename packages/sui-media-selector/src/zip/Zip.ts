import JSZip from "jszip";

/**
 * Array containing metadata keys for zip files.
 * @type {string[]}
 */
export const ZipMetadata: string[] = ['id', 'name', 'description', 'created', 'lastModified', 'author', 'size', 'url'];

/**
 * Interface representing metadata for zip files.
 * @typedef {Object} IZipMetadata
 * @property {string} id - The ID of the zip file.
 * @property {string} name - The name of the zip file.
 * @property {string} [description] - The description of the zip file.
 * @property {number} created - The timestamp when the zip file was created.
 * @property {number} [lastModified] - The timestamp when the zip file was last modified.
 * @property {string} [author] - The author of the zip file.
 * @property {number} [size] - The size of the zip file.
 * @property {string} [url] - The URL for the zip file.
 */
export interface IZipMetadata {
  id: string,
  name: string,
  description?: string,
  created: number,
  lastModified?: number,
  author?: string,
  size?: number,
  url?: string;
}

/**
 * Picks specified properties from an object.
 * @param {object} source - The source object to pick properties from.
 * @param {string[]} keys - The keys of the properties to pick.
 * @returns {object} - An object containing only the specified properties.
 */
function pickProperties<TSource extends object, TKeys extends keyof TSource>(
  source: TSource,
  keys: Array<TKeys>
): Pick<TSource, TKeys> {
  const result = {} as Pick<TSource, TKeys>;

  keys.forEach((key) => {
    if (key in source) {
      result[key] = source[key];
    }
  });

  return result;
}

/**
 * Picks properties from an object based on the root object keys.
 * @param {object} data - The data object to extract properties from.
 * @returns {object} - An object containing the properties based on the root keys.
 */
export function pickProps<TRoot extends object, TExtractor extends TRoot>(data: TExtractor): TRoot {
  const rootKeys = Object.keys(data).filter((key) => key in data) as (keyof TRoot)[];
  return pickProperties(data, rootKeys);
}

/**
 * Splits properties of an object into two separate objects based on the root object keys.
 * @param {object} source - The source object to split properties from.
 * @returns {[object, object]} - An array containing two objects with split properties.
 */
export function splitProps<TRoot extends object, TSource extends TRoot>(
  source: TSource
): [Pick<TSource, Extract<keyof TSource, keyof TRoot>>, Omit<TSource, keyof TRoot>] {
  const root = {} as TSource;
  const remaining = {} as TSource;

  // Create an instance of TRoot to use hasOwnProperty safely
  const rootInstance = {} as TRoot;

  (Object.keys(source) as Array<keyof TSource>).forEach((key) => {
    if (rootInstance.hasOwnProperty(key)) {
      root[key] = source[key];
    } else {
      remaining[key] = source[key];
    }
  });

  return [root, remaining];
}

/**
 * Extracts metadata properties from an object based on predefined metadata keys.
 * @param {object} source - The source object to extract metadata properties from.
 * @returns {[object, object]} - An array containing two objects with extracted metadata properties.
 */
export function extractMeta<TSource extends object>(source: TSource): [object, TSource]  {
  const root = {} as TSource;
  const remaining = {} as TSource;

  (Object.keys(source) as Array<keyof TSource>).forEach((key) => {
    if (ZipMetadata.includes(key as string)) {
      root[key] = source[key];
    } else {
      remaining[key] = source[key];
    }
  });
  return [root, remaining];
}

/**
 * Creates a zip file containing the provided file.
 * @param {File} file - The file to include in the zip.
 * @returns {Promise<File>} - A promise that resolves to a zip file.
 */
export async function createZip(file: File): Promise<File> {
  const zip = new JSZip();
  zip.file(file.name, file);
  const blob = await zip.generateAsync({ type: "blob" });

  // Convert Blob to a File if needed for further handling
  return new File([blob], file.name, { type: file.type });
}

/**
 * Represents the type of JSON MIME.
 * @typedef {Object} JSONMimeType
 * @property {string} type - The type of JSON MIME.
 */

/**
 * Represents the props needed to get the MIME type.
 * @typedef {Object} getMimeTypeProps
 * @property {string} type - The main type for the MIME.
 * @property {string} subTypePrefix - The sub-type prefix for the MIME.
 * @property {string} subType - The sub-type for the MIME.
 */

/**
 * Gets the MIME type based on the provided props.
 * @param {getMimeTypeProps} props - The props to determine the MIME type.
 * @returns {JSONMimeType} - The JSON MIME type object.
 */
export function getMimeType({ subType, type = 'application', subTypePrefix = 'stoked-ui-timeline' }: getMimeTypeProps): JSONMimeType {
  return { type: `${type}/${subTypePrefix ? `${subTypePrefix}-` : ''}${subType}` };
}