/**
 * The StokedUiTimelineApp class represents a media selector app for timeline files.
 */
export default class StokedUiTimelineApp extends App implements IApp {

  /**
   * The default input file type used by the app.
   */
  defaultInputFileType: IMimeType;

  /**
   * The default output file type used by the app.
   */
  defaultOutputFileType: IMimeType;

  /**
   * Creates a new instance of StokedUiTimelineApp.
   */
  constructor() {
    super('stoked-ui-timeline');

    /**
     * Creates an input mime type for timeline project files.
     */
    const inputMimeType = SUIMime.make(
      'timeline-project',
      '.sut',
      'Timeline Project File'
    );

    /**
     * Sets the default input file type.
     */
    this.defaultInputFileType = inputMimeType;

    /**
     * Creates an output mime type for timeline audio files.
     */
    const outputMimeType = SUIMime.make(
      'timeline-project-audio',
      '.sua',
      'Timeline Audio'
    );

    /**
     * Sets the default output file type.
     */
    this.defaultOutputFileType = outputMimeType;

    /**
     * Creates factories for input and output files.
     */
    const inputFactory = new AppFileFactory([inputMimeType], AppFile);
    const outputFactory = new AppOutputFileFactory([outputMimeType], AppOutputFile);

    /**
     * Registers the input factory with the app.
     */
    this.registerInputFactory(inputFactory);

    /**
     * Registers the output factory with the app.
     */
    this.registerOutputFactory(outputFactory);
  }
}