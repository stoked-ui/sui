// File-explorer internal type declarations

export interface FileBase {
  id: string;
  name: string;
  children?: FileBase[];
  isFolder?: boolean;
  parent?: string;
  [key: string]: any;
} 
