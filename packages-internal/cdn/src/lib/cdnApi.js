const JSON_HEADERS = {
  'Content-Type': 'application/json',
};

const MAX_RETRIES = 3;
const URL_BATCH_SIZE = 50;

function uploadFingerprint(path, file) {
  return `cdn-upload:${path}:${file.name}:${file.size}:${file.lastModified}`;
}

function getStoredSessionId(key) {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function setStoredSessionId(key, sessionId) {
  try {
    window.localStorage.setItem(key, sessionId);
  } catch {
    // Ignore storage failures.
  }
}

function clearStoredSessionId(key) {
  try {
    window.localStorage.removeItem(key);
  } catch {
    // Ignore storage failures.
  }
}

async function apiRequest(path, options = {}) {
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

async function generateHash(file) {
  const buffer = await file.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return btoa(String.fromCharCode(...hashArray));
}

async function uploadChunk(file, partNumber, chunkSize, presignedUrl, signal, retries = 0) {
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
  } catch (error) {
    if (retries < MAX_RETRIES && error.name !== 'AbortError') {
      await new Promise((resolve) => setTimeout(resolve, 1000 * (retries + 1)));
      return uploadChunk(file, partNumber, chunkSize, presignedUrl, signal, retries + 1);
    }

    throw error;
  }
}

export async function createFolder(path) {
  return apiRequest('/api/cdn/folders', {
    method: 'POST',
    body: JSON.stringify({ path }),
  });
}

export async function deletePath(path) {
  return apiRequest('/api/cdn/delete', {
    method: 'POST',
    body: JSON.stringify({ path }),
  });
}

export async function movePath(sourcePath, destinationPath) {
  return apiRequest('/api/cdn/move', {
    method: 'POST',
    body: JSON.stringify({ sourcePath, destinationPath }),
  });
}

export async function getPermissions(path) {
  return apiRequest(`/api/cdn/permissions?path=${encodeURIComponent(path)}`, {
    method: 'GET',
    headers: {},
  });
}

export async function updatePermissions(path, viewRoles, viewUserIds) {
  return apiRequest('/api/cdn/permissions', {
    method: 'PUT',
    body: JSON.stringify({
      path,
      viewRoles,
      viewUserIds,
    }),
  });
}

export async function clearPermissions(path) {
  return apiRequest(`/api/cdn/permissions?path=${encodeURIComponent(path)}`, {
    method: 'DELETE',
    headers: {},
  });
}

export function buildExportUrl(path) {
  const url = new URL('/api/cdn/export', window.location.origin);
  url.searchParams.set('path', path);
  return url.toString();
}

async function initiateUpload(path, file, signal) {
  const hash = await generateHash(file).catch(() => undefined);
  return apiRequest('/api/cdn/upload/initiate', {
    method: 'POST',
    body: JSON.stringify({
      path,
      filename: file.name,
      mimeType: file.type || 'application/octet-stream',
      totalSize: file.size,
      hash,
    }),
    signal,
  });
}

async function getUploadStatus(sessionId, signal) {
  return apiRequest(`/api/cdn/upload/${sessionId}/status`, {
    method: 'GET',
    signal,
    headers: {},
  });
}

async function getMoreUrls(sessionId, partNumbers, signal) {
  return apiRequest(`/api/cdn/upload/${sessionId}/urls`, {
    method: 'POST',
    body: JSON.stringify({ partNumbers }),
    signal,
  });
}

async function markPartComplete(sessionId, partNumber, etag, signal) {
  return apiRequest(`/api/cdn/upload/${sessionId}/part/${partNumber}`, {
    method: 'POST',
    body: JSON.stringify({ etag }),
    signal,
  });
}

async function completeUpload(sessionId, signal) {
  return apiRequest(`/api/cdn/upload/${sessionId}/complete`, {
    method: 'POST',
    signal,
  });
}

async function abortUpload(sessionId, signal) {
  return apiRequest(`/api/cdn/upload/${sessionId}/abort`, {
    method: 'POST',
    signal,
  });
}

export async function uploadFile({ path, file, signal, onProgress }) {
  const fingerprint = uploadFingerprint(path, file);
  let sessionId = getStoredSessionId(fingerprint);
  let status;
  let chunkSize;
  let pendingUrls = new Map();
  let completedParts = new Set();

  if (sessionId) {
    try {
      status = await getUploadStatus(sessionId, signal);
      chunkSize = Math.ceil(status.totalSize / status.totalParts);
      pendingUrls = new Map((status.presignedUrls || []).map((item) => [item.partNumber, item.url]));
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
    const initiated = await initiateUpload(path, file, signal);
    sessionId = initiated.sessionId;
    chunkSize = initiated.chunkSize;
    pendingUrls = new Map(initiated.presignedUrls.map((item) => [item.partNumber, item.url]));
    completedParts = new Set();
    status = {
      totalParts: initiated.totalParts,
      pendingPartNumbers: Array.from(
        { length: initiated.totalParts },
        (_, index) => index + 1,
      ),
    };
    setStoredSessionId(fingerprint, sessionId);
  }

  try {
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
        const urlResponse = await getMoreUrls(sessionId, nextBatch, signal);
        for (const item of urlResponse.presignedUrls || []) {
          pendingUrls.set(item.partNumber, item.url);
        }
      }

      const presignedUrl = pendingUrls.get(partNumber);
      if (!presignedUrl) {
        throw new Error(`Missing presigned URL for part ${partNumber}`);
      }

      const etag = await uploadChunk(file, partNumber, chunkSize, presignedUrl, signal);
      await markPartComplete(sessionId, partNumber, etag, signal);

      completedParts.add(partNumber);
      if (onProgress) {
        onProgress(Math.round((completedParts.size / status.totalParts) * 100));
      }
    }

    const result = await completeUpload(sessionId, signal);
    clearStoredSessionId(fingerprint);
    return result;
  } catch (error) {
    if (error.name === 'AbortError') {
      throw error;
    }

    if (signal?.aborted) {
      throw error;
    }

    throw error;
  }
}

async function readFileEntry(entry, prefix = '') {
  return new Promise((resolve, reject) => {
    entry.file(
      (file) => {
        resolve([{ file, relativePath: `${prefix}${file.name}` }]);
      },
      reject,
    );
  });
}

async function readDirectoryEntries(reader) {
  const collected = [];

  async function readBatch() {
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

async function readEntry(entry, prefix = '') {
  if (entry.isFile) {
    return readFileEntry(entry, prefix);
  }

  if (entry.isDirectory) {
    const children = await readDirectoryEntries(entry.createReader());
    const nested = await Promise.all(
      children.map((child) => readEntry(child, `${prefix}${entry.name}/`)),
    );
    return nested.flat();
  }

  return [];
}

export async function collectDroppedEntries(dataTransferItems) {
  const items = Array.from(dataTransferItems || []);
  const entryBackedItems = items
    .map((item) => item.webkitGetAsEntry?.())
    .filter(Boolean);

  if (entryBackedItems.length) {
    const nested = await Promise.all(entryBackedItems.map((entry) => readEntry(entry)));
    return nested.flat();
  }

  return Array.from(items)
    .map((item) => item.getAsFile?.())
    .filter(Boolean)
    .map((file) => ({
      file,
      relativePath: file.name,
    }));
}

export function beginDesktopDownload(event, object) {
  event.dataTransfer.effectAllowed = object.effectAllowed || 'copy';
  event.dataTransfer.setData('DownloadURL', `${object.mimeType || 'application/octet-stream'}:${object.name}:${object.url}`);
  event.dataTransfer.setData('text/uri-list', object.url);
  event.dataTransfer.setData('text/plain', object.url);
}
