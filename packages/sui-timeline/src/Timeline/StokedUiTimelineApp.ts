import { IMimeType, SUIMime } from '@stoked-ui/common';
import {
  App, IApp, AppFile, AppFileFactory, AppOutputFile, AppOutputFileFactory,
} from "@stoked-ui/media-selector";

export default class StokedUiTimelineApp extends App implements IApp {

  defaultInputFileType: IMimeType;

  defaultOutputFileType: IMimeType;

  constructor() {
    super('stoked-ui-timeline');
    const inputMimeType = SUIMime.make(
      'timeline-project',
      '.sut',
      'Timeline Project File'
    );
    this.defaultInputFileType = inputMimeType;

    const outputMimeType = SUIMime.make(
      'timeline-project-audio',
      '.sua',
      'Timeline Audio'
    );
    this.defaultOutputFileType = outputMimeType;

    // Create factories
    const inputFactory = new AppFileFactory([inputMimeType], AppFile);
    const outputFactory = new AppOutputFileFactory([outputMimeType], AppOutputFile);

    this.registerInputFactory(inputFactory);
    this.registerOutputFactory(outputFactory);
  }
}
