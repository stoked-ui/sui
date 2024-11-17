/* eslint-disable class-methods-use-this */
/*  eslint-disable @typescript-eslint/naming-convention */
import { SaveDialogProps } from "./TimelineFile.types";
import FileTypeMeta from "./FileTypeMeta";

export type NoArgsConstructor<T> = new () => T;

export type ArgsConstructor<T> = new (...args: any[]) => T;

export type Constructor<T> = (NoArgsConstructor<T> | ArgsConstructor<T>);

export interface IWebData {
  id: string,
  name: string,
  size?: number,
  url?: string;
  created: number,
  lastModified?: number,
  description?: string,
  author?: string,
  readonly version: number;
}

export type WebFileInitializer = ((files?: File[], ...arg: any[]) => Promise<void> | ((files?: File[]) => Promise<void>));

export interface IWebFile extends IWebData {
  save(silent?: boolean): Promise<void>;
  initialize(files: File[], ...arg: any[]): Promise<void>;
  fileMeta: FileTypeMeta;
  createBlob(): Promise<Blob>;
}

export interface IWebFileProps extends Omit<IWebData, 'id' | 'created' | 'version'> {
  id?: string,
  created?: number,
  readonly version?: number,
}

export interface IBaseDecodedFile {
    name: string,
    size: number,
    type: `${string}/${string}`,
}

export function hasFileApiSupport() {
  return 'showSaveFilePicker' in window;
}

export async function saveFileApi(options: SaveDialogProps) {
  if (!hasFileApiSupport()) {
    return;
  }

  try {

    if ('hasbeenActive' in UserActivation) {
      console.info('hasbeenActive', UserActivation.hasbeenActive);
    }

    if ('isActive' in UserActivation) {
      console.info('isActive', UserActivation.isActive);
    }

    // Show the save file picker
    const fileHandle = await window.showSaveFilePicker(options);

    if ('hasbeenActive' in UserActivation) {
      console.info('hasbeenActive 2', UserActivation.hasbeenActive);
    }

    if ('isActive' in UserActivation) {
      console.info('isActive', UserActivation.isActive);
    }
    // Create a writable stream to the selected file
    const writableStream = await fileHandle.createWritable();

    if ('hasbeenActive' in UserActivation) {
      console.info('hasbeenActive 3', UserActivation.hasbeenActive);
    }

    if ('isActive' in UserActivation) {
      console.info('isActive', UserActivation.isActive);
    }
    // Write the Blob to the file
    await writableStream.write(options.fileBlob);

    // Close the writable stream
    await writableStream.close();

    console.info('File saved successfully!');
  } catch (error) {
    console.error('Error saving file:', error);
  }
}

export async function saveFileHack(options: SaveDialogProps) {
  const { fileBlob } = options;
  const mainDiv = document.querySelector('main') as HTMLDivElement
  const link = document.createElement('a');
  link.href = URL.createObjectURL(fileBlob);
  link.download = options.suggestedName;
  link.style.width = '200px';
  link.style.height = '200px';
  link.style.color = 'black';
  link.innerText = 'hello';
  link.style.display = 'flex';
  mainDiv.appendChild(link);
  link.click();
  URL.revokeObjectURL(link.href)
  link.remove();
}
