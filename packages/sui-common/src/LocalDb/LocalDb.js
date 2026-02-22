"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRecordVersions = getRecordVersions;
exports.getVideos = getVideos;
exports.createFolder = createFolder;
const idb_1 = require("@tempfix/idb");
const Ids_1 = require("../Ids");
function getRecordVersions(record) {
    const versions = Object.entries(record.versions).map(([ver, fileVersion]) => {
        const versionNumber = parseInt(ver, 10);
        const { name, created, lastModified, data, id, mimeType } = fileVersion;
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
function getVideos(record) {
    return Object.values(record.versions).map((version) => version.videos).flat();
}
function createFolder(name, children = [], created, options = {}) {
    const { id, ...remainingOptions } = options;
    return {
        id: id || (0, Ids_1.namedId)(name),
        name,
        created,
        type: 'folder',
        mediaType: 'folder',
        children,
        ...remainingOptions,
    };
}
class LocalDb {
    static async init({ dbName, stores = [], initializeStores = [], disabled = false }) {
        if (this.initialized) {
            return;
        }
        this.dbName = dbName;
        this.disabled = disabled;
        if (this.disabled) {
            this.initialized = true;
            return;
        }
        await (0, idb_1.openDB)(dbName, this.version, {
            upgrade(db) {
                stores.forEach((store) => {
                    console.info('create store', store.name);
                    const dbStore = db.createObjectStore(store.name);
                    dbStore.createIndex('url', 'url', { unique: true });
                });
            }
        });
        for (let i = 0; i < stores.length; i += 1) {
            this.stores[stores[i].name] = new LocalDbStore(stores[i]);
            if (initializeStores.includes(stores[i].name)) {
                await this.stores[stores[i].name].init();
            }
        }
        this.initialized = true;
    }
    static async open() {
        return (0, idb_1.openDB)(this.dbName, this.version);
    }
    static async loadByName({ store, name, version = -1 }) {
        return this.stores[store].loadByName(name, version);
    }
    static async getVersions({ store, name }) {
        const storeInstance = this.stores[store];
        if (!storeInstance.initialized) {
            await storeInstance.init();
        }
        const tx = await storeInstance.getTransaction();
        const record = await tx.objectStore(store).get(name);
        if (!record) {
            return [];
        }
        return getRecordVersions(record);
    }
    static async loadByUrl({ store, url }) {
        console.info('store', store, url, this.stores);
        return this.stores[store].loadByUrl(url);
    }
    static async getKeys(store) {
        return this.stores[store].getKeys();
    }
    static async saveFile(fileData) {
        return this.stores[fileData.mime.name].saveFile(fileData);
    }
    static async saveVideo(videoRequest) {
        return this.stores[videoRequest.storeName].saveVideo(videoRequest);
    }
}
LocalDb.stores = {};
LocalDb.version = 1;
LocalDb.disabled = false;
LocalDb.initialized = false;
exports.default = LocalDb;
class LocalDbStore {
    constructor(props) {
        this._keys = new Set();
        this._files = [];
        this.initialized = false;
        this.name = props.name;
        this.type = props.type;
    }
    async loadByName(name, version = -1) {
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
        const record = await tx.objectStore(this.name).get(name);
        if (!record) {
            return null;
        }
        const versions = getRecordVersions(record);
        versions.sort((a, b) => a.version - b.version);
        const requestedVersion = version === -1
            ? versions[versions.length - 1]
            : versions.find(v => v.version === version);
        if (!requestedVersion) {
            throw new Error(`Requested version ${version} not found.`);
        }
        const versionRecord = record.versions[requestedVersion.version];
        return {
            mimeType: versionRecord.mimeType,
            blob: versionRecord.data,
            versions,
            version: requestedVersion.version,
            videos: getVideos(record),
        };
    }
    async loadByUrl(url) {
        if (!this.initialized) {
            await this.init();
        }
        const tx = await this.getTransaction();
        const store = tx.objectStore(this.name);
        const request = store.index('url').get(url);
        const record = await request;
        if (!record) {
            console.warn(`No record found for URL: ${url}`);
            return null;
        }
        const versions = getRecordVersions(record);
        versions.sort((a, b) => a.version - b.version);
        const latestVersion = versions[versions.length - 1];
        const versionRecord = record.versions[latestVersion.version];
        return {
            mimeType: versionRecord.mimeType,
            blob: versionRecord.data,
            versions,
            version: latestVersion.version,
            videos: getVideos(record),
        };
    }
    async getKeyValue(key) {
        const tx = await this.getTransaction();
        const record = await tx.objectStore(this.name).get(key);
        if (!record) {
            return null;
        }
        return record;
    }
    async setKeyValue(key, value) {
        try {
            const db = await (0, idb_1.openDB)(LocalDb.dbName, LocalDb.version);
            const tx = db.transaction(this.name, 'readwrite');
            const store = tx.objectStore(this.name);
            await store.put(value, key);
            await tx.done;
        }
        catch (e) {
            console.error(`IDB Save Error: [${key}] ${this.name} - ${LocalDb.dbName}::${this.name}`);
            return false;
        }
        return true;
    }
    async saveVideo(request) {
        try {
            const db = await (0, idb_1.openDB)(LocalDb.dbName, LocalDb.version);
            const tx = db.transaction(this.name, 'readwrite');
            const store = tx.objectStore(this.name);
            const { projectName, version, storeName, ...video } = request;
            const videoData = { ...video, id: (0, Ids_1.namedId)('video'), type: 'video/mp4', mediaType: 'video', version };
            const projectFile = await store.get(projectName);
            if (!projectFile) {
                console.error('No project found for video', projectName);
            }
            else {
                projectFile.versions[version].videos.push(videoData);
                await store.put(projectFile, projectName);
            }
            await tx.done;
            await this.retrieveKeys();
            console.info(`IDB Save Video: [${videoData.name}] ${this.name} - ${LocalDb.dbName}::${this.name} => Complete`);
            return true;
        }
        catch (e) {
            console.error(`IDB Save Video Error: [${request.name}] ${this.name} - ${LocalDb.dbName}::${this.name}`);
            return false;
        }
    }
    async saveFile(fileData) {
        const { name, version, blob, meta, mime, url } = fileData;
        try {
            const db = await (0, idb_1.openDB)(LocalDb.dbName, LocalDb.version);
            const tx = db.transaction(this.name, 'readwrite');
            const store = tx.objectStore(this.name);
            const versionData = { ...meta, data: blob, mimeType: mime.type, url, videos: [] };
            const dbFile = { versions: { [version]: { ...versionData, url } }, name, url };
            if (version === 1) {
                await store.put(dbFile, name);
            }
            else {
                let projectFile = await store.get(name);
                if (!projectFile) {
                    projectFile = dbFile;
                }
                else {
                    projectFile.versions[version] = versionData;
                }
                await store.put(projectFile, name);
            }
            await tx.done;
            console.info(`IDB Save: [${name}] ${this.name} - ${LocalDb.dbName}::${this.name} => Complete`);
            await this.retrieveKeys();
            return true;
        }
        catch (e) {
            console.error(`IDB Save Error: [${name}] ${this.name} - ${LocalDb.dbName}::${this.name}`);
            return false;
        }
    }
    ;
    async getTransaction(mode = "readonly") {
        console.info(`IDB Open: ${this.name}`);
        const openDb = await LocalDb.open();
        return openDb.transaction(this.name, mode);
    }
    async init() {
        console.info('IDB Init: ', this.name);
        await this.retrieveKeys();
        this.initialized = true;
    }
    async retrieveKeys() {
        try {
            const db = await (0, idb_1.openDB)(LocalDb.dbName, 1);
            const tx = db.transaction(this.name, 'readonly');
            const store = tx.objectStore(this.name);
            const storeKeys = await store.getAllKeys();
            this._keys = new Set(storeKeys);
            this._files = await Promise.all(Array.from(this._keys).map(async (key) => {
                const record = await store.get(key);
                const versions = Object.keys(record.versions);
                const lastVersion = versions[versions.length - 1];
                const latest = record.versions[lastVersion];
                const videos = Object.values(record.versions).map((version) => version.videos).flat();
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
        }
        catch (e) {
            throw new Error(`${LocalDb.dbName} - store: ${this.name} - ${e}`);
        }
    }
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
//# sourceMappingURL=LocalDb.js.map