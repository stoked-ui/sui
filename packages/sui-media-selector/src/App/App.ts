import AppFile from './AppFile';
import WebFileFactory from '../WebFileFactory';
import { IMimeType } from '@stoked-ui/common';
import AppOutputFile from './AppOutputFile';

/**
 * Interface for an application.
 */
export interface IApp {
  defaultInputFileType: IMimeType;
  defaultOutputFileType: IMimeType;
  registerInputFactory(factory: AppFileFactory): void;
  registerOutputFactory(factory: AppOutputFileFactory): void;
}

/**
 * Abstract class representing an application.
 */
export default abstract class App {
  readonly name: string;

  private inputFactories: AppFileFactory[];
  private outputFactories: AppOutputFileFactory[];
  private outputFactoryDefaultIndex: number = -1;
  private inputFactoryDefaultIndex: number = -1;

  /**
   * Constructor for the App class.
   * @param {string} name - The name of the application.
   */
  constructor(name: string) {
    this.name = name;
    this.inputFactories = [];
    this.outputFactories = [];
  }

  /**
   * Registers a factory for managing input files.
   * @param {AppFileFactory} factory - The factory to register.
   * @param {boolean} [isDefault=false] - Indicates if the factory is the default.
   */
  registerInputFactory(factory: AppFileFactory, isDefault: boolean = false): void {
    if (isDefault) {
      this.inputFactoryDefaultIndex = this.inputFactories.length;
    }
    this.inputFactories.push(factory);
  }

  /**
   * Registers a factory for producing output files.
   * @param {AppOutputFileFactory} factory - The factory to register.
   * @param {boolean} [isDefault=false] - Indicates if the factory is the default.
   */
  registerOutputFactory(factory: AppOutputFileFactory, isDefault: boolean = false): void {
    if (isDefault) {
      this.outputFactoryDefaultIndex = this.outputFactories.length;
    }
    this.outputFactories.push(factory);
  }

  /**
   * Checks if the app supports a specific MIME type for input.
   * @param {IMimeType} mimeType - The MIME type to check for support.
   * @returns {boolean} - True if the app supports the MIME type, false otherwise.
   */
  supportsInputMimeType(mimeType: IMimeType): boolean {
    return this.inputFactories.some((factory) =>
      factory.supportsMimeType(mimeType)
    );
  }

  /**
   * Checks if the app supports a specific MIME type for output.
   * @param {IMimeType} mimeType - The MIME type to check for support.
   * @returns {boolean} - True if the app supports the MIME type, false otherwise.
   */
  supportsOutputMimeType(mimeType: IMimeType): boolean {
    return this.outputFactories.some((factory) =>
      factory.supportsMimeType(mimeType)
    );
  }

  /**
   * Creates an input file for a given MIME type.
   * @param {any} [data] - Optional data for the input file.
   * @param {IMimeType} [mimeType] - Optional MIME type for the input file.
   * @returns {AppFile | null} - The created input file or null if not created.
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
   * @param {any} [data] - Optional data for the output file.
   * @param {IMimeType} [mimeType] - Optional MIME type for the output file.
   * @returns {AppOutputFile | null} - The created output file or null if not created.
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