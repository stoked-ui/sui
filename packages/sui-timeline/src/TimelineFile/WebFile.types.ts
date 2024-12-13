/*
import {MediaFile, IMimeType, MimeRegistry, MimeType} from "@stoked-ui/media-selector";
import { Constructor } from "@stoked-ui/common";
import {
  FileState, ITimelineFileMetadata, ITimelineFileProps,
  SaveDialogProps
} from "./TimelineFile.types";
import WebFile from "./WebFile";
import LocalDb, {FileLoadRequest} from "../LocalDb";

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
  initialize(): Promise<void>;
  createBlob(embedded: boolean, mimeType: IMimeType): Promise<Blob>;
  readBlob(blob: Blob, searchDb: boolean): Promise<IWebFile>;
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

export async function saveFileDeprecated(options: SaveDialogProps) {
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

export async function ReadBlob<ReturnType extends WebFile>(blob: Blob , searchDb: boolean = false): Promise<IWebFile> {
  try {
    const reader = blob.stream().getReader();
    const decoder = new TextDecoder();
    let leftoverBuffer = ""; // Persistent buffer for leftover data

    // Helper function to read a portion of the stream until a delimiter
    // eslint-disable-next-line no-inner-declarations
    async function readUntilDelimiter(delimiter: string): Promise<string> {
      let done = false;
      let text = leftoverBuffer; // Start with leftover data
      leftoverBuffer = ""; // Reset leftover buffer
      let delimiterIndex = text.indexOf(delimiter);
      if (delimiterIndex !== -1) {
        const result = text.slice(0, delimiterIndex);
        leftoverBuffer = text.slice(delimiterIndex + delimiter.length);
        return result;
      }
      while (!done) {
        // eslint-disable-next-line no-await-in-loop
        const {value, done: readerDone} = await reader.read();
        if (value) {
          text += decoder.decode(value, {stream: true});
          delimiterIndex = text.indexOf(delimiter);
          if (delimiterIndex !== -1) {
            // Slice up to the delimiter and return
            const result = text.slice(0, delimiterIndex);
            leftoverBuffer = text.slice(delimiterIndex + delimiter.length);
            return result;
          }
        }
        done = readerDone;
      }
      return text;
    }

    // Read the JSON props
    const propsString = await readUntilDelimiter(WebFile.PropsDelimiter);
    const props: ITimelineFileMetadata = JSON.parse(`${propsString}`);

    console.info('props', JSON.stringify(props, null, 2));

    const mimeType = MimeRegistry.types[props.mimeType];
    const ReturnTypeConstructor: Constructor<ReturnType> = mimeType.constructor as unknown as Constructor<ReturnType>;
    if (!props.mimeType || !mimeType.embedded) {
      const newFile = new ReturnTypeConstructor(props);
      await newFile.initialize();
      return newFile;
    }

    if (searchDb) {
      const loadRequest: FileLoadRequest = {
        id: props.id, type: MimeRegistry.types[props.mimeType].name, version: props.version,
      }

      // attempt to load it from idb instead of fetching from the webs
      const dbBlob = await LocalDb.loadId(loadRequest);
      if (dbBlob !== null) {
        return this.readBlob(dbBlob.blob, false);
      }
    }

    // Read the JSON file parameters
    const fileParamsString = await readUntilDelimiter(WebFile.FilesTableDelimiter);
    const fileParams: IFileParams[] = JSON.parse(`${fileParamsString}`);

    // Read and parse file data based on fileParams
    const files: MediaFile[] = [];
    // eslint-disable-next-line no-restricted-syntax
    for (const { name, size, type } of fileParams) {
      const chunks: Uint8Array[] = [];
      let bytesRead = 0;

      // Process leftover buffer first, if any
      if (leftoverBuffer.length > 0) {
        const leftoverBytes = new TextEncoder().encode(leftoverBuffer);
        chunks.push(leftoverBytes);
        bytesRead += leftoverBytes.length;
        leftoverBuffer = ""; // Clear the leftover buffer after processing
      }

      while (bytesRead < size) {
        // eslint-disable-next-line no-await-in-loop
        const { value, done } = await reader.read();
        if (done) {
          throw new Error("Unexpected end of stream while reading file data");
        }
        const chunk = value.subarray(0, Math.min(size - bytesRead, value.length));
        chunks.push(chunk);
        bytesRead += chunk.length;
      }

      // Combine all chunks into a single Blob
      const fileData = new Blob(chunks, { type });
      const mediaFile = new MediaFile([fileData], name, { type });
      files.push(mediaFile);
    }
    return new ReturnTypeConstructor(props, files) as IWebFile;
  } catch (ex) {
    throw new Error(`[${blob.type}] WebFile: failed to read file data - ${ex}`)
  }
}
/!*

async function readFileUsingStream(file: File): Promise<void> {
  const fileStream = file.stream(); // Get a ReadableStream from the File
  const reader = fileStream.getReader();

  try {
    while (true) {
      // eslint-disable-next-line no-await-in-loop
      const { done, value } = await reader.read();

      if (done) {
        console.log("File reading completed.");
        break;
      }

      // `value` is a Uint8Array
      // console.log(new TextDecoder().decode(value)); // Decode chunk to text
    }
  } catch (err) {
    console.error("Error while reading file:", err);
  } finally {
    reader.releaseLock(); // Always release the reader's lock
  }
}

async function fullRead() {
  for (let i = 0; i < this.files.length; i += 1) {
    const file = this.files[i];
    // Create a ReadableStream for each file
    // eslint-disable-next-line no-await-in-loop
    await this.readFileUsingStream(file);
  }
} *!/
*/
