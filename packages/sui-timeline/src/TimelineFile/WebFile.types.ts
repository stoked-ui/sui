/* eslint-disable class-methods-use-this */
/*  eslint-disable @typescript-eslint/naming-convention */
import { FileState, SaveDialogProps } from "./TimelineFile.types";
import { IMimeType, MimeType } from "./MimeType";

export interface IWebData {
  id: string,
  name: string,
  size?: number,
  url?: string;
  created: number,
  lastModified?: number,
  description?: string,
  author?: string,
  mimeType: MimeType;
  readonly version: number;
}

export type WebFileInitializer = ((files?: File[], ...arg: any[]) => Promise<void> | ((files?: File[]) => Promise<void>));

export interface IWebFile extends Omit<IWebData, 'mimeType'> {
  save(silent?: boolean): Promise<void>;
  initialize(files?: File[]): Promise<void>;
  createBlob(embedded: boolean, mimeType: IMimeType): Promise<Blob>;
  state: FileState;
}

export interface IWebFileProps extends Omit<IWebData, 'id' | 'created' | 'version' | 'mimeType'> {
  id?: string,
  created?: number,
  readonly version?: number,
}

export interface IFileParams {
  name: string,
  size: number,
  type: string,
  url: string,
}

export async function saveFileApi(options: SaveDialogProps) {
  try {

    console.info('options', options);
    // Show the save file picker
    const fileHandle = await window.showSaveFilePicker(options);

    // Create a writable stream to the selected file
    const writableStream = await fileHandle.createWritable();

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

export function isValidUrl(input: string): boolean {
  try {
    const url = new URL(input);

    // Ensure it's not a blob or data URL
    if (url.protocol === "blob:" || url.protocol === "data:") {
      return false;
    }

    // Ensure it's not a relative URL
    if (!url.host || !url.protocol) {
      return false;
    }

    return true;
  } catch {
    // If the URL constructor throws, it's not a valid URL
    return false;
  }
}
