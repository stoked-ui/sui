declare module '@stoked-ui/common' {
  export function namedId(options?: string | { id: string, length: number }): string;
  
  export interface Constructor<T = {}> {
    new (...args: any[]): T;
  }
  
  export interface FileSaveRequest {
    file: File;
    path?: string;
    name?: string;
  }
  
  export interface Versions {
    [key: string]: any;
  }
  
  export interface IDBVideo {
    [key: string]: any;
  }
  
  export interface Settings {
    [key: string]: any;
  }
  
  export interface MimeType {
    [key: string]: string;
  }
  
  export interface IMimeType {
    [key: string]: string;
  }
  
  export class SortedList<T> {
    constructor();
    add(item: T): void;
    remove(item: T): void;
    get items(): T[];
  }
} 
