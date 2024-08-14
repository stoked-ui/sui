import Dexie, { Table } from 'dexie';
import { TimelineRow } from '@stoked-ui/timeline';
import { FileBase } from '@stoked-ui/file-explorer';

const DB_VERSION = 0;

export interface DbObject {
  id: number;
  globalId: string;
}

export interface FileStore extends DbObject {
  name: string;
  files: FileBase[];
}

export interface FileBaseRef extends DbObject {
  name: string;
  fileRef: string;
  file?: FileBase;
}

export interface FileStoreRef extends DbObject  {
  name: string;
  fileRefs: FileBaseRef[];
}

export interface VideoProject extends DbObject  {
  name: string;
  tracks: TimelineRow[];
  fileStore: FileStoreRef;
}

type StoreMapping = {
  FileStore: FileStore;
  FileBaseRef: FileBaseRef;
  FileStoreRef: FileStoreRef;
  VideoProject: VideoProject;
};

type Properties<T> = keyof T;


type StoreSchema = { store: string; schema: string; };
type Schema = { [tableName: string]: string | null; };

function BuildStoreSchema<T extends keyof StoreMapping>(typeName: T): StoreSchema {
  const properties: Array<Properties<StoreMapping[T]>> = Object.keys({} as StoreMapping[T]) as Array<Properties<StoreMapping[T]>>;
  const entries: string[] = properties.map(property => property as string);
  return { store: typeName, schema: entries.join(', ') };
}

function BuildSchema() {
   Object.entries({} as StoreMapping).forEach(console.log);
}

export class DB extends Dexie {
  FileBaseRef!: Table<FileBaseRef>;

  VideoProject!: Table<VideoProject>;

  constructor() {
    super('myDatabase');
    BuildSchema();
    /*
    const createStores = () => {
      const stores:  = {};
      Object.entries(Stores).forEach(([key, value]) => {
        stores[key] = '++id, globalId, ';
        if (value instanceof Table) {
          this[key].clear();
        }
      });
      this.version(DB_VERSION).stores({

      });
    }
    this.version(1).stores({
      fileStores: '++id, name, rollNumber',
      videos: '++id, name, tracks, fileStore'
    });
    */
  }
}
export const db = new DB(); // export the db
