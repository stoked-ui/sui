import { openDB } from '@tempfix/idb';
import { IWebData } from "../TimelineFile/WebFile.types";
import { MimeType, IMimeType } from "../TimelineFile/MimeType";


/**
 * Represents a version of a file stored in IndexedDB.
 */
export type IDBFileVersion = Omit<IWebData, 'mimeType'> & {
  data: Blob;
  mimeType: MimeType;
};

export type IDBVersionedFile = Record<number, IDBFileVersion>;

/**
 * Represents a file stored in IndexedDB.
 */
export type IDBProjectFile = Record<string, IDBVersionedFile>;

/**
 * Properties required to initialize a LocalDbStore.
 */
export interface LocalDbStoreProps {
  name: string;
}

/**
 * Properties required to initialize the LocalDb.
 */
export interface LocalDbProps {
  dbName: string;
  stores: string[];
  initializeStores: string[];
  disabled: boolean;
}

export interface FileSaveRequest {
  id: string,
  version: number,
  embedded: boolean,
  meta: IWebData,
  blob: Blob,
  mime: IMimeType
}

export interface FileLoadRequest {
  id: string,
  version?: number,
  type: string,
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
    this.initialized = true;

    this.dbName = dbName;

    this.disabled = disabled;

    if (this.disabled) {
      return;
    }

    await openDB(dbName, this.version, {
      upgrade(db) {
        stores.forEach((store) => db.createObjectStore(store));
      }
    });

    for (let i = 0; i < stores.length; i += 1){
      // eslint-disable-next-line @typescript-eslint/no-use-before-define
      this.stores[stores[i]] =  new LocalDbStore({ name: stores[i] })
      if (initializeStores.includes(stores[i])) {
        // eslint-disable-next-line no-await-in-loop
        await this.stores[stores[i]].init();
      }
    }
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
  static async loadId({ type, id, version = -1 }: FileLoadRequest): Promise<{ mimeType: MimeType, blob: Blob } | null> {
    return this.stores[type].loadId(id, version);
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
}

/**
 * Class representing a store in the local database.
 */
class LocalDbStore {
  name: string;

  private _keys: Set<string> = new Set<string>();

  private _index: Record<string, IDBVersionedFile> = {};

  initialized: boolean = false;

  /**
   * Creates an instance of LocalDbStore.
   * @param props - The properties required to initialize the store.
   */
  constructor(props: LocalDbStoreProps) {
    this.name = props.name;
  }

  private getVersion(id: string, versionRequest: number = -1) {
    if (versionRequest === 0 || versionRequest < -1) {
      throw new Error('Invalid version');
    }
    const versionedFile = this._index[id];
    if (!versionedFile) {
      throw new Error('Project ID not found');
    }

    const versions = Object.keys(versionedFile).map(Number);
    if (!versions.length) {
      throw new Error('No versions found');
    }
    if (versionedFile[versionRequest]) {
      return versionRequest;
    }
    versions.sort();
    if (versionRequest === -1) {
      return versions[versions.length - 1];
    }
    const higherVersions = versions.filter((version) => version > versionRequest);
    if (higherVersions.length) {
      return higherVersions[higherVersions.length - 1];
    }
    return 0
  }

  /**
   * Loads a file by its ID and version from the store.
   * @param id - The ID of the file.
   * @param version - The version of the file (default is -1 used for the latest version). Version is 1 based so 0 is invalid.
   * @returns A promise that resolves to the file data.
   */
  async loadId(id: string, version: number = -1): Promise<{ mimeType: MimeType, blob: Blob } | null> {
    if (!this.initialized) {
      await this.init();
    }
    if (!this._keys.size) {
      await this.retrieveKeys()
    }
    if (!this._keys.has(id)) {
      return null;
    }
    const tx = await this.getTransaction();
    const record = await tx.objectStore(this.name).get(id) as IDBProjectFile;
    if (!record) {
      return null;
    }
    const versionRecord = record[version] as IDBFileVersion;
    if (!versionRecord) {
      return null;
    }

    console.info('loadId success', versionRecord);
    return { mimeType: versionRecord.mimeType, blob: versionRecord.data };
  }

  /**
   * Saves a file to the store.
   * @param fileData - The file data to be saved.
   * @returns A promise indicating whether the save was successful.
   */
  async saveFile(fileData: FileSaveRequest): Promise<boolean> {
    const { id, version, blob, meta, mime } = fileData;

    try {
      const db = await openDB(LocalDb.dbName, LocalDb.version);
      const tx = db.transaction(this.name, 'readwrite');
      const store = tx.objectStore(this.name);

      const versionData = { ...meta, data: blob, mimeType: mime.type  } as IDBFileVersion

      const dbFile: IDBVersionedFile = { [version]: versionData }

      if (version === 1) {
        await store.put(dbFile, id);
      } else {
        let versionedFile: IDBVersionedFile = await store.get(id);
        if (!versionedFile) {
          versionedFile = dbFile;
        } else {
          versionedFile[version] = versionData;
        }

        await store.put(versionedFile, id);
      }

      await tx.done;

      console.info(`IDB Save: [${id}] ${this.name} - ${LocalDb.dbName}::${this.name} => Complete`);

      return true;
    } catch (e) {
      console.error(`IDB Save Error: [${id}] ${this.name} - ${LocalDb.dbName}::${this.name}`);
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
      const storeKeys = await store.getAllKeys() as string[];
      this._keys = new Set(storeKeys as string[]);
      await tx.done;
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
}
