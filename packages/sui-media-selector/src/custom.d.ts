/**
 * Custom type declarations for @stoked-ui/media-selector
 */

// Declare modules without types or with additional type needs
declare module 'jszip' {
  export default class JSZip {
    constructor();
    file(path: string): any;
    file(path: string, data: any, options?: any): this;
    folder(name: string): JSZip;
    generateAsync(options: { type: string }): Promise<any>;
    loadAsync(data: ArrayBuffer | Blob | string): Promise<JSZip>;
  }
}

// Declare modules for assets
declare module '*.svg' {
  const content: React.FunctionComponent<React.SVGAttributes<SVGElement>>;
  export default content;
}

declare module '*.png' {
  const content: string;
  export default content;
}

declare module '*.jpg' {
  const content: string;
  export default content;
}

// FormData node module might need augmentation
declare module 'formdata-node' {
  export class FormData {
    append(name: string, value: string | Blob, fileName?: string): void;
  }
}

// Extend Window interface if needed
interface Window {
  showOpenFilePicker?: (options?: any) => Promise<any[]>;
  showSaveFilePicker?: (options?: any) => Promise<any>;
  showDirectoryPicker?: (options?: any) => Promise<any>;
} 
