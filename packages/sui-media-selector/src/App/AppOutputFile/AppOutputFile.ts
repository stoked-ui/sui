/**
 * @typedef {Object} IAppOutputFileProps
 * @property {string} [id] - The optional id of the output file
 * @property {string} name - The name of the output file
 * @property {Blob} blob - The Blob data of the output file
 */

/**
 * @typedef {Object} IAppOutputFile
 * @property {Blob} blob - The Blob data of the output file
 * @function getSaveRequest - Overrides getSaveRequest from WebFile
 */

import { FileSaveRequest } from '@stoked-ui/common';
import WebFile, { IWebFile } from '../../WebFile';

/**
 * @description Represents an output file in the application.
 * @class
 */
export default class AppOutputFile extends WebFile implements IAppOutputFile {
  /**
   * @constructor
   * @param {IAppOutputFileProps} props - The properties of the output file
   */
  constructor(props) {
    super(props);
    this.blob = props?.blob;
  }

  /**
   * @description Overrides getSaveRequest from WebFile to return a FileSaveRequest.
   * @returns {Promise<FileSaveRequest>} A promise that resolves to a FileSaveRequest object.
   */
  async getSaveRequest() {
    return {
      ...this.createSaveRequest(),
      blob: this.blob
    };
  }
}