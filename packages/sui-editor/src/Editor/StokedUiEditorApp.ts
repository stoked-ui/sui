/**
 * StokedUiEditorApp class representing the Stoked UI Editor application.
 * Extends App and implements IApp interface.
 */
export default class StokedUiEditorApp extends App implements IApp {
  private static instance: StokedUiEditorApp | null = null;

  defaultInputFileType: IMimeType;
  defaultOutputFileType: IMimeType;
  videoFileType: IMimeType;
  audioFileType: IMimeType;

  /**
   * Constructor for StokedUiEditorApp class.
   * Initializes default input/output file types.
   */
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

    this.registerInputFactory(inputFactory);
    this.registerOutputFactory(outputFactory);
  }

  /**
   * Get the singleton instance of StokedUiEditorApp.
   * @returns {StokedUiEditorApp} The singleton instance of StokedUiEditorApp.
   */
  static getInstance(): StokedUiEditorApp {
    if (!StokedUiEditorApp.instance) {
      StokedUiEditorApp.instance = new StokedUiEditorApp();
    }
    return StokedUiEditorApp.instance;
  }
}