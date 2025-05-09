import { openDB } from '@tempfix/idb';
import { MimeType, IMimeType } from "../MimeType";
import { Settings } from "../ProviderState/Settings";
import { namedId } from '../Ids';

/**
 * Represents a version of a file stored in IndexedDB.
 */
export type IDBFileVersion = Omit<ISaveFileData, 'mimeType'> & {
  data: Blob;
  mimeType: MimeType;
  videos: IDBVideo[];
};

export type IDBVideo = { id: string, name: string, created: number, size: number, duration: number, type: string, mediaType: string, blob: Blob };
// projectName, name, duration, size, created, version, blob
export type IDBFile = { id: string, name: string, url?: string, size?: number, created?: number, lastModified?: number, type: string, mediaType: string, children?: IDBFile[] };

/**
 * Represents a file stored in IndexedDB.
 */
export type IDBProjectFile = { versions: Record<number, IDBFileVersion>, name: string, url?: string };

export type Version = IDBFile & { version: number };
export type Versions = Version[];
export type ProjectValue = { mimeType: MimeType, blob: Blob, versions: Versions, version: number, videos: IDBVideo[] };

/**
 * Properties required to initialize a LocalDbStore.
 */
export interface LocalDbStoreProps {
  name: string;
  type: `${string}/${string}`
}

/**
 * Properties required to initialize the LocalDb.
 */
export interface LocalDbProps {
  type: `${string}/${string}`;
  dbName: string;
  stores: { name: string, type: string }[];
  initializeStores: string[];
  disabled: boolean;
}

export interface ISaveFileData {
  id: string;
  name: string;
  version: number;
  created: number;
  lastModified: number;
  metadata: Settings;
  description: string;
  author: string;
  url?: string
}

export interface FileSaveRequest {
  name: string,
  version: number,
  meta: ISaveFileData,
  blob: Blob,
  mime: IMimeType,
  url?: string,
}

export interface VideoSaveRequest {
  storeName: string,
  projectName: string,
  name: string,
  version: number,
  blob: Blob,
  duration: number,
  created: number,
  size?: number,
}

export type FileLoadRequest = FileLoadRequestByName | FileLoadRequestByUrl;

export interface FileLoadRequestByName {
  name: string,
  version?: number,
  store: string,
}

export interface FileLoadRequestByUrl {
  url: string,
  version?: number,
  store: string,
}

/**
 * Retrieves versions of a project file from IndexedDB.
 * @param record - The project file record.
 * @returns An array of versions of the project file.
 */
export function getRecordVersions(record: IDBProjectFile): Versions {
  const versions: Versions = Object.entries(record.versions).map(([ver, fileVersion]) => {
    const versionNumber = parseInt(ver, 10);
    const { name, created, lastModified, data, id, mimeType } = fileVersion as IDBFileVersion;

    return {
      version: versionNumber,
      name,
      lastModified: lastModified || created || Date.now(),
      size: data.size,
      id: `${id}-${versionNumber}`,
      type: mimeType,
      mediaType: mimeType.includes('project') ? 'project' : 'doc',
    };
  });
  return versions;
}

/**
 * Retrieves videos from a project file in IndexedDB.
 * @param record - The project file record.
 * @returns An array of videos from the project file.
 */
export function getVideos(record: IDBProjectFile) {
  return Object.values(record.versions).map((version: any) => version.videos).flat()
}

/**
 * Creates a folder object with specified properties.
 * @param name - The name of the folder.
 * @param children - The children files of the folder.
 * @param created - The creation timestamp of the folder.
 * @param options - Additional options for the folder.
 * @returns A folder object.
 */
export function createFolder(name: string, children: IDBFile[] = [], created?: number, options: { id?: string, expanded?: boolean, selected?: boolean } = {}) {
  const { id, ...remainingOptions } = options;
  return {
    id: id || namedId(name),
    name,
    created,
    type: 'folder',
    mediaType: 'folder',
    children,
    ...remainingOptions,
  }
}

/**
 * Class representing the local database.
 */
export default class LocalDb {
  static dbName: string;

  static stores: { [storeName: string]: LocalDbStore; } = {};

  static version: number = 1;

  private static disabled: boolean = false;

  static initialized: boolean = false;

  /**
   * Initializes the local database with the given properties.
   * @param props - The properties required to initialize the database.
   */
  static async init({ dbName, stores = [], initializeStores = [], disabled = false }: LocalDbProps) {
    if (this.initialized) {
      return;
    }

    this.dbName = dbName;

    this.disabled = disabled;

    if (this.disabled) {
      this.initialized = true;
      return;
    }

    await openDB(dbName, this.version, {
      upgrade(db) {
        stores.forEach((store) => {
          console.info('create store', store.name);
          const dbStore = db.createObjectStore(store.name);
          dbStore.createIndex('url', 'url', { unique: true }); // Index for URLs
        });
      }
    });

    for (let i = 0; i < stores.length; i += 1) {
      // eslint-disable-next-line @typescript-eslint/no-use-before-define
      this.stores[stores[i].name] = new LocalDbStore(stores[i] as LocalDbStoreProps)
      if (initializeStores.includes(stores[i].name)) {
        // eslint-disable-next-line no-await-in-loop
        await this.stores[stores[i].name].init();
      }
    }

    this.initialized = true;
  }

  /**
   * Opens the local database.
   * @returns A promise that resolves to the opened database.
   */
  static async open() {
    return openDB(this.dbName, this.version);
  }

  /**
   * Loads a file by its ID from the specified store.
   * @param loadRequest - The request object containing store, name, and version.
   * @returns A promise that resolves to the file data.
   */
  static async loadByName(loadRequest: FileLoadRequestByName): Promise<ProjectValue | null> {
    return this.stores[loadRequest.store].loadByName(loadRequest.name, loadRequest.version);
  }

  /**
   * Gets versions of a file from the specified store.
   * @param project - The project details including store and name.
   * @returns A promise that resolves to the versions of the file.
   */
  static async getVersions(project: { store: string, name: string }): Promise<Versions> {
    const storeInstance = this.stores[project.store];
    if (!storeInstance.initialized) {
      await storeInstance.init();
    }

    const tx = await storeInstance.getTransaction();
    const record = await tx.objectStore(project.store).get(project.name) as IDBProjectFile;

    if (!record) {
      return [];
    }

    return getRecordVersions(record);
  }

  /**
   * Loads a file by its URL from the specified store.
   * @param loadRequest - The request object containing store and URL.
   * @returns A promise that resolves to the file data.
   */
  static async loadByUrl(loadRequest: FileLoadRequestByUrl): Promise<ProjectValue | null> {
    console.info('store', loadRequest.store, loadRequest.url, this.stores);
    return this.stores[loadRequest.store].loadByUrl(loadRequest.url);
  }

  /**
   * Retrieves the keys from the specified store.
   * @param store - The name of the store.
   * @returns A promise that resolves to the keys.
   */
  static async getKeys(store: string) {
    return this.stores[store].getKeys();
  }

  /**
   * Saves a file to the local database.
   * @param fileData - The file data to be saved.
   * @returns A promise that resolves to the success status of the save operation.
   */
  static async saveFile(fileData: FileSaveRequest): Promise<boolean> {
    return this.stores[fileData.mime.name].saveFile(fileData);
  }

  /**
   * Saves a video to the local database.
   * @param videoRequest - The video data to be saved.
   * @returns A promise that resolves to the success status of the save operation.
   */
  static async saveVideo(videoRequest: VideoSaveRequest): Promise<boolean> {
    return this.stores[videoRequest.storeName].saveVideo(videoRequest);
  }
}

/**
 * Class representing a store in the local database.
 */
class LocalDbStore {
  name: string;
  type: `${string}/${string}`
  private _keys: Set<string> = new Set<string>();
  private _files: IDBFile[] = [];
  initialized: boolean = false;

  /**
   * Creates an instance of LocalDbStore.
   * @param props - The properties required to initialize the store.
   */
  constructor(props: LocalDbStoreProps) {
    this.name = props.name;
    this.type = props.type;
  }

  /**
   * Loads a file by its name and version from the store.
   * @param name - The name of the file.
   * @param version - The version of the file (-1 for the latest version).
   * @returns A promise that resolves to the file data.
   */
  async loadByName(name: string, version: number = -1): Promise<ProjectValue | null> {
    // Implementation removed for brevity
  }

  /**
   * Loads a file by its URL from the store.
   * @param url - The URL of the file.
   * @returns A promise that resolves to the file data.
   */
  async loadByUrl(url: string): Promise<ProjectValue | null> {
    // Implementation removed for brevity
  }

  /**
   * Retrieves the key-value pair from the store.
   * @param key - The key to retrieve.
   * @returns A promise that resolves to the key-value pair.
   */
  async getKeyValue(key: string): Promise<any> {
    // Implementation removed for brevity
  }

  /**
   * Saves a key-value pair to the store.
   * @param key - The key of the pair.
   * @param value - The value of the pair.
   * @returns A promise indicating the success of the save operation.
   */
  async setKeyValue(key: any, value: any): Promise<boolean> {
    // Implementation removed for brevity
  }

  /**
   * Saves a video to the store.
   * @param request - The video data to be saved.
   * @returns A promise indicating the success of the save operation.
   */
  async saveVideo(request: VideoSaveRequest): Promise<boolean> {
    // Implementation removed for brevity
  }

  /**
   * Saves a file to the store.
   * @param fileData - The file data to be saved.
   * @returns A promise indicating the success of the save operation.
   */
  async saveFile(fileData: FileSaveRequest): Promise<boolean> {
    // Implementation removed for brevity
  }

  /**
   * Gets a transaction for the store.
   * @param mode - The mode of the transaction.
   * @returns A promise that resolves to the transaction.
   */
  async getTransaction(mode: "readonly" | "readwrite" = "readonly") {
    // Implementation removed for brevity
  }

  /**
   * Initializes the store by retrieving keys.
   */
  async init() {
    // Implementation removed for brevity
  }

  /**
   * Retrieves the keys from the store.
   * @returns A promise that resolves to the keys.
   */
  async retrieveKeys() {
    // Implementation removed for brevity
  }

  get keys() {
    return this._keys;
  }

  get files() {
    return this._files;
  }
}