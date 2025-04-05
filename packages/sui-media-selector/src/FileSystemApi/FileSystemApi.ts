/**
 * Represents the props for the save file dialog.
 * @typedef {SaveFilePickerOptions & { fileBlob: Blob }} SaveDialogProps
 */

/**
 * Saves a file using the provided options.
 * @param {SaveDialogProps} options - The options for saving the file.
 */
export async function saveFileApi(options) {
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

/**
 * Represents the props for the open file dialog.
 * @typedef {{ types?: FilePickerAcceptType[] | undefined; excludeAcceptAllOption?: boolean | undefined; startIn?: WellKnownDirectory | FileSystemHandle | undefined; id?: string | undefined; multiple?: false | undefined }} OpenDialogProps
 */

/**
 * Opens one or more files based on the provided options.
 * @param {OpenDialogProps} [options] - The options for opening files.
 * @returns {Promise<File[]>} The files opened as a promise.
 */
export async function openFileApi(options) {
  const fileHandles = await window.showOpenFilePicker(options);
  return Promise.all(fileHandles.map(async (fh) =>  fh.getFile()));
}

/**
 * Saves a file using deprecated methods.
 * @param {SaveDialogProps} options - The options for saving the file.
 */
export async function saveFileDeprecated(options) {
  const { fileBlob } = options;
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

/**
 * Opens a file using deprecated methods.
 * @returns {Promise<File[]>} The files opened as a promise.
 */
export async function openFileDeprecated() {
  return new Promise((resolve, reject) => {
    try {
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

/**
 * Gets the file name from a URL.
 * @param {string} url - The URL from which to extract the file name.
 * @param {boolean} [includeExtension] - Whether to include the file extension in the result.
 * @returns {string | null} The extracted file name.
 */
export function getFileName(url, includeExtension) {
  const matches = url && typeof url.match === "function" && url.match(/\/?([^/.]*)\.?([^/]*)$/);
  if (!matches) {
    return null;
  }
  if (includeExtension && matches.length > 2 && matches[2]) {
    return matches.slice(1).join(".");
  }
  return matches[1];
}