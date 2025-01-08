import { openDB } from '@tempfix/idb';
import {MimeType, IMimeType} from "../MimeType";
import {Settings} from "../ProviderState/Settings";
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
export type IDBFile =  { id: string, name: string, url?: string, size?: number, created?: number, lastModified?: number, type: string, mediaType: string, children?: IDBFile[] };

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
  stores: {name: string, type: string }[];
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

export function getRecordVersions(record: IDBProjectFile) {
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

export function getVideos(record: IDBProjectFile) {
  return Object.values(record.versions).map((version: any) => version.videos).flat()
}

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

    for (let i = 0; i < stores.length; i += 1){
      // eslint-disable-next-line @typescript-eslint/no-use-before-define
      this.stores[stores[i].name] =  new LocalDbStore(stores[i] as LocalDbStoreProps)
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
   * @param store - The name of the store.
   * @param id - The ID of the file.
   * @param version - The version requested from idb.
   * @returns A promise that resolves to the file data.
   */
  static async loadByName({ store, name, version = -1 }: FileLoadRequestByName): Promise<ProjectValue | null> {
    return this.stores[store].loadByName(name, version);
  }

  static async getVersions({ store, name }: { store: string, name: string }): Promise<Versions> {
    const storeInstance = this.stores[store];
    if (!storeInstance.initialized) {
      await storeInstance.init();
    }

    const tx = await storeInstance.getTransaction();
    const record = await tx.objectStore(store).get(name) as IDBProjectFile;

    if (!record) {
      return [];
    }

    return getRecordVersions(record);
  }

  /**
   * Loads a file by its ID from the specified store.
   * @param store - The name of the store.
   * @param id - The ID of the file.
   * @param version - The version requested from idb.
   * @returns A promise that resolves to the file data.
   */
  static async loadByUrl({ store, url }: FileLoadRequestByUrl): Promise<ProjectValue | null> {
    console.info('store', store, url, this.stores);
    return this.stores[store].loadByUrl(url);
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
   * @param file - The file to be saved.
   * @returns A promise that resolves to the ID of the saved file.
   */
  static async saveFile(fileData: FileSaveRequest): Promise<boolean> {
    return this.stores[fileData.mime.name].saveFile(fileData);
  }

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
   * Loads a file by its ID and version from the store.
   * @param name - The name of the file.
   * @param version - The version of the file (default is -1 used for the latest version). Version
   *   is 1 based so 0 is invalid.
   * @returns A promise that resolves to the file data.
   */
  async loadByName(name: string, version: number = -1): Promise<ProjectValue | null> {
    if (!this.initialized) {
      await this.init();
    }

    if (!this._keys.size) {
      await this.retrieveKeys();
    }

    if (!this._keys.has(name)) {
      return null;
    }

    const tx = await this.getTransaction();
    const record = await tx.objectStore(this.name).get(name) as IDBProjectFile;

    if (!record) {
      return null;
    }

    // Retrieve all versions from the record
    const versions = getRecordVersions(record);
    // Sort versions by version number
    versions.sort((a, b) => a.version - b.version);

    // Determine the requested version
    const requestedVersion = version === -1
      ? versions[versions.length - 1] // Latest version
      : versions.find(v => v.version === version);

    if (!requestedVersion) {
      throw new Error(`Requested version ${version} not found.`);
    }

    // Return the requested version and the complete list of versions
    const versionRecord = record.versions[requestedVersion.version] as IDBFileVersion;

    return {
      mimeType: versionRecord.mimeType,
      blob: versionRecord.data,
      versions,
      version: requestedVersion.version,
      videos: getVideos(record),
    };
  }

  /**
   * Loads a file by its URL from the store.
   * @param url - The URL of the file.
   * @returns A promise that resolves to the file data.
   */
  async loadByUrl(url: string): Promise<ProjectValue | null> {
    if (!this.initialized) {
      await this.init();
    }

    const tx = await this.getTransaction();
    const store = tx.objectStore(this.name);

    // Use the 'url' index to look up the record
    const request = store.index('url').get(url);
    const record = await request;

    if (!record) {
      console.warn(`No record found for URL: ${url}`);
      return null;
    }

    // Extract all versions from the record
    const versions = getRecordVersions(record);
    // Sort versions by version number
    versions.sort((a, b) => a.version - b.version);

    // Use the latest version if none is explicitly requested
    const latestVersion = versions[versions.length - 1];
    const versionRecord = record.versions[latestVersion.version] as IDBFileVersion;

    return {
      mimeType: versionRecord.mimeType,
      blob: versionRecord.data,
      versions,
      version: latestVersion.version,
      videos: getVideos(record),
    };
  }


  async getKeyValue(key: string): Promise<any> {
    const tx = await this.getTransaction();
    const record = await tx.objectStore(this.name).get(key) as IDBProjectFile;
    if (!record) {
      return null;
    }
    return record;
  }

  /**
   * Saves a file to the store.
   * @param key - The file data to be saved.
   * @param value - The file data to be saved.
   * @returns A promise indicating whether the save was successful.
   */
  async setKeyValue(key: any, value: any): Promise<boolean> {
    try {
      const db = await openDB(LocalDb.dbName, LocalDb.version);
      const tx = db.transaction(this.name, 'readwrite');
      const store = tx.objectStore(this.name);
      await store.put(value, key);
      await tx.done;
    } catch (e) {
      console.error(`IDB Save Error: [${key}] ${this.name} - ${LocalDb.dbName}::${this.name}`);
      return false
    }
    return true;
  }

  async saveVideo(request: VideoSaveRequest): Promise<boolean> {
    try {
      const db = await openDB(LocalDb.dbName, LocalDb.version);
      const tx = db.transaction(this.name, 'readwrite');
      const store = tx.objectStore(this.name);
      const { projectName, version, storeName, ...video } = request;
      const videoData = {...video, id: namedId('video'), type: 'video/mp4', mediaType: 'video', version } as IDBVideo

      const projectFile: IDBProjectFile = await store.get(projectName);
      if (!projectFile) {
        console.error('No project found for video', projectName);
      } else {
        projectFile.versions[version].videos.push(videoData);
        await store.put(projectFile, projectName);
      }
      await tx.done;
      await this.retrieveKeys();
      console.info(`IDB Save Video: [${videoData.name}] ${this.name} - ${LocalDb.dbName}::${this.name} => Complete`);
      return true;
    } catch (e) {
      console.error(`IDB Save Video Error: [${request.name}] ${this.name} - ${LocalDb.dbName}::${this.name}`);
      // throw new Error(e as string);
      return false
    }
  }

  /**
   * Saves a file to the store.
   * @param fileData - The file data to be saved.
   * @returns A promise indicating whether the save was successful.
   */
  async saveFile(fileData: FileSaveRequest): Promise<boolean> {
    const { name, version, blob, meta, mime, url } = fileData;

    try {
      const db = await openDB(LocalDb.dbName, LocalDb.version);
      const tx = db.transaction(this.name, 'readwrite');
      const store = tx.objectStore(this.name);

      const versionData = { ...meta, data: blob, mimeType: mime.type, url, videos: []   } as IDBFileVersion

      const dbFile: IDBProjectFile = { versions: { [version]: {...versionData, url} }, name, url };

      if (version === 1) {
        await store.put(dbFile, name);
      } else {
        let projectFile: IDBProjectFile = await store.get(name);
        if (!projectFile) {
          projectFile = dbFile;
        } else {
          projectFile.versions[version] = versionData;
        }

        await store.put(projectFile, name);
      }

      await tx.done;
      console.info(`IDB Save: [${name}] ${this.name} - ${LocalDb.dbName}::${this.name} => Complete`);
      await this.retrieveKeys();
      return true;
    } catch (e) {
      console.error(`IDB Save Error: [${name}] ${this.name} - ${LocalDb.dbName}::${this.name}`);
      // throw new Error(e as string);
      return false
    }
  };

  /**
   * Gets a transaction for the store.
   * @param mode - The mode of the transaction (default is "readonly").
   * @returns A promise that resolves to the transaction.
   */
  async getTransaction(mode: "readonly" | "readwrite" = "readonly") {
    console.info(`IDB Open: ${this.name}`);
    const openDb = await LocalDb.open();
    return openDb.transaction(this.name, mode);
  }

  /**
   * Initializes the store by retrieving keys.
   */
  async init() {
    console.info('IDB Init: ', this.name);
    await this.retrieveKeys();
    this.initialized = true;
  }

  /**
   * Retrieves the keys from the store.
   * @returns A promise that resolves when the keys are retrieved.
   */
  async retrieveKeys() {
    try {
      const db = await openDB(LocalDb.dbName, 1);
      const tx = db.transaction(this.name, 'readonly');
      const store = tx.objectStore(this.name);
      const storeKeys = await store.getAllKeys();
      console.info('keys',storeKeys)
      this._keys = new Set(storeKeys as string[]);
      this._files = await Promise.all(Array.from(this._keys).map(async (key) => {
        const record = await store.get(key);
        const versions = Object.keys(record.versions);
        const lastVersion = versions[versions.length - 1];
        const latest = record.versions[lastVersion];
        const videos = Object.values(record.versions).map((version: any) => version.videos).flat();
        const videoFolder = createFolder('Videos', videos, record.created, { id: 'videos' });
        const versionsFolder = createFolder('Versions', getRecordVersions(record), record.created, { id: 'versions' });
        return {
          id: latest.id,
          name: record.name,
          url: record.url,
          size: latest.data.size,
          lastModified: latest.lastModified || latest.created,
          type: this.type,
          mediaType: this.type?.includes('project') ? 'project' : 'doc',
          children: [videoFolder, versionsFolder],
        };
      }));

      await tx.done;
      console.info("IDB Keys: ", this._keys, Array.from(this._files));
    } catch (e) {
      throw new Error(`${LocalDb.dbName} - store: ${this.name} - ${e as string}`);
    }
  }

  /**
   * Gets the keys from the store.
   * @returns A promise that resolves to the keys.
   */
  async getKeys() {
    if (!this.initialized) {
      await this.init();
    }

    return this._keys;
  }

  get keys() {
    return this._keys;
  }

  get files() {
    return this._files;
  }

}
