import {
  App, AppFile,
  AppFileFactory,
  AppOutputFile, AppOutputFileFactory,
  IApp
} from "@stoked-ui/media-selector";
import { IMimeType, SUIMime } from '@stoked-ui/common';

/**
 * StokedUiEditorApp is the main application class for the Stoked UI editor.
 * It extends the App class and implements the IApp interface.
 *
 * @description Provides functionality for creating and managing files,
 *              including input and output file types, factories, and a singleton instance.
 */
export default class StokedUiEditorApp extends App implements IApp {
  /**
   * The singleton instance of StokedUiEditorApp.
   * @type {StokedUiEditorApp | null}
   */
  private static instance: StokedUiEditorApp | null = null;

  /**
   * The default input file type for the editor.
   * @type {IMimeType}
   */
  defaultInputFileType: IMimeType;

  /**
   * The default output file type for the editor, which is also the video file type.
   * @type {IMimeType}
   */
  defaultOutputFileType: IMimeType;

  /**
   * The file type for videos in the editor.
   * @type {IMimeType}
   */
  videoFileType: IMimeType;

  /**
   * The file type for audio files in the editor.
   * @type {IMimeType}
   */
  audioFileType: IMimeType;

  private constructor() {
    super('stoked-ui-editor');

    this.defaultInputFileType = SUIMime.make(
      'editor-project',
      '.sue',
      'Editor Video Project File'
    );

    this.videoFileType = SUIMime.make(
      'editor-video',
      '.suvid',
      'Editor Video'
    );
    this.defaultOutputFileType = this.videoFileType;
    this.audioFileType = SUIMime.make(
      'editor-audio',
      '.sua',
      'Editor Audio'
    );

    // Create factories
    const inputFactory = new AppFileFactory([this.defaultInputFileType], AppFile);
    const outputFactory = new AppOutputFileFactory([this.videoFileType, this.audioFileType], AppOutputFile);

    /**
     * Registers the input factory with the application.
     */
    this.registerInputFactory(inputFactory);
    /**
     * Registers the output factory with the application.
     */
    this.registerOutputFactory(outputFactory);
  }

  /**
   * Returns the singleton instance of StokedUiEditorApp.
   *
   * @returns {StokedUiEditorApp} The singleton instance.
   */
  static getInstance(): StokedUiEditorApp {
    if (!StokedUiEditorApp.instance) {
      StokedUiEditorApp.instance = new StokedUiEditorApp();
    }
    return StokedUiEditorApp.instance;
  }
}