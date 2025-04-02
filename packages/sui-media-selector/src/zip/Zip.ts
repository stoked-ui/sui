import JSZip from "jszip";

export const ZipMetadata: string[] = ['id', 'name', 'description', 'created', 'lastModified', 'author', 'size', 'url'];

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

export function pickProps<TRoot extends object, TExtractor extends TRoot>(data: TExtractor): TRoot {
  const rootKeys = Object.keys(data).filter((key) => key in data) as (keyof TRoot)[];
  return pickProperties(data, rootKeys);
}

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

export async function createZip(file: File): Promise<File> {
  const zip = new JSZip();
  zip.file(file.name, file);
  const blob = await zip.generateAsync({ type: "blob" });

  // Convert Blob to a File if needed for further handling
  return new File([blob], file.name, { type: file.type });
}

export type JSONMimeType = { type: string };

export type getMimeTypeProps = { type: string, subTypePrefix: string, subType: string };

export function getMimeType({ subType, type = 'application', subTypePrefix = 'stoked-ui-timeline' }: getMimeTypeProps): JSONMimeType {
  return { type: `${type}/${subTypePrefix ? `${subTypePrefix}-` : ''}${subType}` };
}

