import AppFile from './AppFile';
import WebFileFactory from '../WebFileFactory';
import { IMimeType } from '@stoked-ui/common';
import AppOutputFile from './AppOutputFile';

export class AppFileFactory extends WebFileFactory<AppFile> {}
export class AppOutputFileFactory extends WebFileFactory<AppOutputFile> {}

export interface IApp {
  defaultInputFileType: IMimeType;
  defaultOutputFileType: IMimeType;
  registerInputFactory(factory: AppFileFactory): void;
  registerOutputFactory(factory: AppOutputFileFactory): void;
}

export default abstract class App {
  readonly name: string;

  private inputFactories: AppFileFactory[];

  private outputFactories: AppOutputFileFactory[];

  private outputFactoryDefaultIndex: number = -1;

  private inputFactoryDefaultIndex: number = -1;

  constructor(name: string) {
    this.name = name;
    this.inputFactories = [];
    this.outputFactories = [];
  }

  /**
   * Registers a factory for managing input files.
   */
  registerInputFactory(factory: AppFileFactory, isDefault: boolean = false): void {
    if (isDefault) {
      this.inputFactoryDefaultIndex = this.inputFactories.length;
    }
    this.inputFactories.push(factory);
  }

  /**
   * Registers a factory for producing output files.
   */
  registerOutputFactory(factory: AppOutputFileFactory, isDefault: boolean = false): void {
    if (isDefault) {
      this.outputFactoryDefaultIndex = this.outputFactories.length;
    }
    this.outputFactories.push(factory);
  }

  /**
   * Checks if the app supports a specific MIME type for input.
   */
  supportsInputMimeType(mimeType: IMimeType): boolean {
    return this.inputFactories.some((factory) =>
      factory.supportsMimeType(mimeType)
    );
  }

  /**
   * Checks if the app supports a specific MIME type for output.
   */
  supportsOutputMimeType(mimeType: IMimeType): boolean {
    return this.outputFactories.some((factory) =>
      factory.supportsMimeType(mimeType)
    );
  }

  /**
   * Creates an input file for a given MIME type.
   */
  createInputFile(data?: any, mimeType?: IMimeType): AppFile | null {
    if (this.inputFactories.length === 0) {
      return null;
    }
    if (!mimeType) {
      if (this.inputFactoryDefaultIndex !== -1) {
        return this.inputFactories[this.inputFactoryDefaultIndex].createFile(data);
      }
      return this.inputFactories[0].createFile(data);
    }
    const factory = this.inputFactories.find((f) =>
      f.supportsMimeType(mimeType)
    );
    return factory ? factory.createFile(data) : null;
  }

  /**
   * Creates an output file for a given MIME type.
   */
  createOutputFile(data?: any, mimeType?: IMimeType): AppOutputFile | null {
    if (this.outputFactories.length === 0) {
      return null;
    }
    if (!mimeType) {
      if (this.outputFactoryDefaultIndex !== -1) {
        return this.outputFactories[this.outputFactoryDefaultIndex].createFile(data);
      }
      return this.outputFactories[0].createFile(data);
    }
    const factory = this.outputFactories.find((f) =>
      f.supportsMimeType(mimeType)
    );
    return factory ? factory.createFile(data) : null;
  }
}
