export type SaveDialogProps = SaveFilePickerOptions & { fileBlob: Blob }

export async function saveFileApi(options: SaveDialogProps) {
  try {

    console.info('saveFileApi options:', options);
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

export type OpenDialogProps = {
  types?: FilePickerAcceptType[] | undefined;
  excludeAcceptAllOption?: boolean | undefined;
  startIn?: WellKnownDirectory | FileSystemHandle | undefined;
  id?: string | undefined;
  multiple?: false | undefined
}

export async function openFileApi(options?: OpenDialogProps): Promise<File[]> {
  const fileHandles = await window.showOpenFilePicker(options);
  return Promise.all(fileHandles.map(async (fh) =>  fh.getFile()));
}

export async function saveFileDeprecated(options: SaveDialogProps) {
  const { fileBlob } = options;
  throw new Error('saveFileDeprecated')

  const mainDiv = document.querySelector('main') as HTMLDivElement
  const link = document.createElement('a');
  link.href = URL.createObjectURL(fileBlob);
  link.download = options.suggestedName || 'saved-file';
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

export async function openFileDeprecated(): Promise<File[]> {
  return new Promise((resolve, reject) => {
    try {
      throw new Error('openFileDeprecated')

      const input = document.createElement('input') as HTMLInputElement;
      input.type = 'file';

      const handleFiles = async () => {
        if (!input.files) {
          return;
        }
        resolve(Array.from(input.files));
      }

      input.addEventListener('change', handleFiles, false);
      input.click();
    } catch (ex) {
      reject(ex);
    }
  });
}

export function getFileName(url: string, includeExtension?: boolean) {
  const matches = url && typeof url.match === "function" && url.match(/\/?([^/.]*)\.?([^/]*)$/);
  if (!matches) {
    return null;
  }
  if (includeExtension && matches.length > 2 && matches[2]) {
    return matches.slice(1).join(".");
  }
  return matches[1];
}
