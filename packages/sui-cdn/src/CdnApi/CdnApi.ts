const JSON_HEADERS = {
  'Content-Type': 'application/json',
};

const MAX_RETRIES = 3;
const URL_BATCH_SIZE = 50;

function uploadFingerprint(path: string, file: File): string {
  return `cdn-upload:${path}:${file.name}:${file.size}:${file.lastModified}`;
}

function getStoredSessionId(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function setStoredSessionId(key: string, sessionId: string): void {
  try {
    window.localStorage.setItem(key, sessionId);
  } catch {
    // Ignore storage failures.
  }
}

function clearStoredSessionId(key: string): void {
  try {
    window.localStorage.removeItem(key);
  } catch {
    // Ignore storage failures.
  }
}

async function apiRequest(path: string, options: RequestInit = {}): Promise<any> {
  const response = await fetch(path, {
    credentials: 'include',
    ...options,
    headers: {
      ...JSON_HEADERS,
      ...(options.headers || {}),
    },
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.message || `Request failed with ${response.status}`);
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

async function generateHash(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return btoa(String.fromCharCode(...hashArray));
}

async function uploadChunk(
  file: File,
  partNumber: number,
  chunkSize: number,
  presignedUrl: string,
  signal: AbortSignal | undefined,
  retries = 0,
): Promise<string> {
  const start = (partNumber - 1) * chunkSize;
  const end = Math.min(start + chunkSize, file.size);
  const chunk = file.slice(start, end);

  try {
    const response = await fetch(presignedUrl, {
      method: 'PUT',
      body: chunk,
      signal,
      headers: {
        'Content-Type': file.type || 'application/octet-stream',
      },
    });

    if (!response.ok) {
      throw new Error(`Chunk upload failed with ${response.status}`);
    }

    const etag = response.headers.get('ETag');
    if (!etag) {
      throw new Error('Chunk upload response did not include an ETag');
    }

    return etag;
  } catch (error: any) {
    if (retries < MAX_RETRIES && error.name !== 'AbortError') {
      await new Promise((resolve) => setTimeout(resolve, 1000 * (retries + 1)));
      return uploadChunk(file, partNumber, chunkSize, presignedUrl, signal, retries + 1);
    }

    throw error;
  }
}

export interface UploadFileOptions {
  path: string;
  file: File;
  signal?: AbortSignal;
  onProgress?: (progress: number) => void;
}

export interface CdnApi {
  createFolder: (path: string) => Promise<any>;
  deletePath: (path: string) => Promise<any>;
  movePath: (sourcePath: string, destinationPath: string) => Promise<any>;
  getPermissions: (path: string) => Promise<any>;
  updatePermissions: (path: string, viewRoles: string[], viewUserIds: string[]) => Promise<any>;
  clearPermissions: (path: string) => Promise<any>;
  buildExportUrl: (path: string) => string;
  uploadFile: (options: UploadFileOptions) => Promise<any>;
}

export function createCdnApi(apiBaseUrl = '/api/cdn'): CdnApi {
  const base = apiBaseUrl.replace(/\/$/, '');

  async function _apiRequest(path: string, options: RequestInit = {}): Promise<any> {
    return apiRequest(`${base}${path}`, options);
  }

  return {
    async createFolder(path: string) {
      return _apiRequest('/folders', {
        method: 'POST',
        body: JSON.stringify({ path }),
      });
    },

    async deletePath(path: string) {
      return _apiRequest('/delete', {
        method: 'POST',
        body: JSON.stringify({ path }),
      });
    },

    async movePath(sourcePath: string, destinationPath: string) {
      return _apiRequest('/move', {
        method: 'POST',
        body: JSON.stringify({ sourcePath, destinationPath }),
      });
    },

    async getPermissions(path: string) {
      return _apiRequest(`/permissions?path=${encodeURIComponent(path)}`, {
        method: 'GET',
        headers: {},
      });
    },

    async updatePermissions(path: string, viewRoles: string[], viewUserIds: string[]) {
      return _apiRequest('/permissions', {
        method: 'PUT',
        body: JSON.stringify({ path, viewRoles, viewUserIds }),
      });
    },

    async clearPermissions(path: string) {
      return _apiRequest(`/permissions?path=${encodeURIComponent(path)}`, {
        method: 'DELETE',
        headers: {},
      });
    },

    buildExportUrl(path: string): string {
      const url = new URL(`${base}/export`, window.location.origin);
      url.searchParams.set('path', path);
      return url.toString();
    },

    async uploadFile({ path, file, signal, onProgress }: UploadFileOptions) {
      const fingerprint = uploadFingerprint(path, file);
      let sessionId = getStoredSessionId(fingerprint);
      let status: any;
      let chunkSize: number;
      let pendingUrls = new Map<number, string>();
      let completedParts = new Set<number>();

      if (sessionId) {
        try {
          status = await _apiRequest(`/upload/${sessionId}/status`, {
            method: 'GET',
            signal,
            headers: {},
          } as any);
          chunkSize = Math.ceil(status.totalSize / status.totalParts);
          pendingUrls = new Map(
            (status.presignedUrls || []).map((item: any) => [item.partNumber, item.url]),
          );
          completedParts = new Set(
            Array.from({ length: status.totalParts }, (_, index) => index + 1).filter(
              (partNumber) => !status.pendingPartNumbers.includes(partNumber),
            ),
          );
        } catch {
          sessionId = null;
          clearStoredSessionId(fingerprint);
        }
      }

      if (!sessionId) {
        const hash = await generateHash(file).catch(() => undefined);
        const initiated = await _apiRequest('/upload/initiate', {
          method: 'POST',
          body: JSON.stringify({
            path,
            filename: file.name,
            mimeType: file.type || 'application/octet-stream',
            totalSize: file.size,
            hash,
          }),
          signal,
        } as any);
        sessionId = initiated.sessionId;
        chunkSize = initiated.chunkSize;
        pendingUrls = new Map(initiated.presignedUrls.map((item: any) => [item.partNumber, item.url]));
        completedParts = new Set();
        status = {
          totalParts: initiated.totalParts,
          pendingPartNumbers: Array.from({ length: initiated.totalParts }, (_, index) => index + 1),
        };
        setStoredSessionId(fingerprint, sessionId!);
      }

      const pendingParts = Array.from(
        { length: status.totalParts },
        (_, index) => index + 1,
      ).filter((partNumber) => !completedParts.has(partNumber));

      for (let index = 0; index < pendingParts.length; index += 1) {
        const partNumber = pendingParts[index];

        if (!pendingUrls.has(partNumber)) {
          const nextBatch = pendingParts
            .slice(index, index + URL_BATCH_SIZE)
            .filter((candidate) => !pendingUrls.has(candidate));
          const urlResponse = await _apiRequest(`/upload/${sessionId}/urls`, {
            method: 'POST',
            body: JSON.stringify({ partNumbers: nextBatch }),
            signal,
          } as any);
          for (const item of urlResponse.presignedUrls || []) {
            pendingUrls.set(item.partNumber, item.url);
          }
        }

        const presignedUrl = pendingUrls.get(partNumber);
        if (!presignedUrl) {
          throw new Error(`Missing presigned URL for part ${partNumber}`);
        }

        const etag = await uploadChunk(file, partNumber, chunkSize!, presignedUrl, signal);
        await _apiRequest(`/upload/${sessionId}/part/${partNumber}`, {
          method: 'POST',
          body: JSON.stringify({ etag }),
          signal,
        } as any);

        completedParts.add(partNumber);
        if (onProgress) {
          onProgress(Math.round((completedParts.size / status.totalParts) * 100));
        }
      }

      const result = await _apiRequest(`/upload/${sessionId}/complete`, {
        method: 'POST',
        signal,
      } as any);
      clearStoredSessionId(fingerprint);
      return result;
    },
  };
}

export async function collectDroppedEntries(
  dataTransferItems: DataTransferItemList | null | undefined,
): Promise<Array<{ file: File; relativePath: string }>> {
  async function readFileEntry(entry: FileSystemFileEntry, prefix = ''): Promise<Array<{ file: File; relativePath: string }>> {
    return new Promise((resolve, reject) => {
      entry.file(
        (file: File) => {
          resolve([{ file, relativePath: `${prefix}${file.name}` }]);
        },
        reject,
      );
    });
  }

  async function readDirectoryEntries(reader: FileSystemDirectoryReader): Promise<FileSystemEntry[]> {
    const collected: FileSystemEntry[] = [];

    async function readBatch(): Promise<FileSystemEntry[]> {
      return new Promise((resolve, reject) => {
        reader.readEntries(resolve, reject);
      });
    }

    while (true) {
      const entries = await readBatch();
      if (!entries.length) {
        return collected;
      }
      collected.push(...entries);
    }
  }

  async function readEntry(entry: FileSystemEntry, prefix = ''): Promise<Array<{ file: File; relativePath: string }>> {
    if (entry.isFile) {
      return readFileEntry(entry as FileSystemFileEntry, prefix);
    }

    if (entry.isDirectory) {
      const children = await readDirectoryEntries((entry as FileSystemDirectoryEntry).createReader());
      const nested = await Promise.all(
        children.map((child) => readEntry(child, `${prefix}${entry.name}/`)),
      );
      return nested.flat();
    }

    return [];
  }

  const items = Array.from(dataTransferItems || []);
  const entryBackedItems = items
    .map((item) => item.webkitGetAsEntry?.())
    .filter(Boolean) as FileSystemEntry[];

  if (entryBackedItems.length) {
    const nested = await Promise.all(entryBackedItems.map((entry) => readEntry(entry)));
    return nested.flat();
  }

  return Array.from(items)
    .map((item) => item.getAsFile?.())
    .filter(Boolean)
    .map((file) => ({
      file: file as File,
      relativePath: (file as File).name,
    }));
}

export function beginDesktopDownload(
  event: React.DragEvent,
  object: { name: string; url: string; mimeType?: string; effectAllowed?: string },
): void {
  event.dataTransfer.effectAllowed = (object.effectAllowed as any) || 'copy';
  event.dataTransfer.setData(
    'DownloadURL',
    `${object.mimeType || 'application/octet-stream'}:${object.name}:${object.url}`,
  );
  event.dataTransfer.setData('text/uri-list', object.url);
  event.dataTransfer.setData('text/plain', object.url);
}
