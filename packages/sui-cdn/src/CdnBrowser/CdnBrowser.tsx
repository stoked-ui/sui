import * as React from 'react';
import { startTransition, useDeferredValue, useEffect, useRef, useState } from 'react';
import {
  beginDesktopDownload,
  collectDroppedEntries,
  createCdnApi,
} from '../CdnApi/CdnApi';
import {
  buildCrumbs,
  formatBytes,
  formatTimestamp,
  getContents as getContentsDefault,
  getFileKind,
  normalizePrefix,
} from '../utils/contents';
import type { CdnBrowserProps } from './CdnBrowser.types';
import type { CdnContents } from '../utils/contents';

// ─── helpers ────────────────────────────────────────────────────────────────

function iconForKind(kind: string): string {
  switch (kind) {
    case 'video': return '[V]';
    case 'image': return '[I]';
    case 'download': return '[D]';
    case 'code': return '[#]';
    default: return '[ ]';
  }
}

function emptyMessage(prefix: string, query: string): string {
  if (query) {
    return `No results in ${prefix || 'root'} for "${query}".`;
  }
  return prefix ? `No files directly inside ${prefix}.` : 'This directory is empty.';
}

function basenameForPath(path: string): string {
  const normalized = path.replace(/\/$/, '');
  const segments = normalized.split('/').filter(Boolean);
  return segments[segments.length - 1] || normalized;
}

function getParentPrefix(path: string): string {
  const normalized = path.replace(/\/$/, '');
  const lastSlash = normalized.lastIndexOf('/');
  return lastSlash === -1 ? '' : normalized.slice(0, lastSlash + 1);
}

function normalizeDirectoryPrefix(prefix: string): string {
  return prefix
    .trim()
    .replace(/\/+/g, '/')
    .replace(/^\//, '')
    .replace(/(.+[^/])$/, '$1/');
}

function isMediaKind(kind: string): boolean {
  return kind === 'image' || kind === 'video';
}

function isMediaHeavy(objects: CdnContents['objects']): boolean {
  if (!objects.length) {return false;}
  const mediaCount = objects.filter((obj) => isMediaKind(getFileKind(obj.path))).length;
  return mediaCount / objects.length >= 0.9;
}

function getViewModeKey(prefix: string): string {
  return `cdn-view-mode-${prefix}`;
}

function readStoredViewMode(prefix: string): string | null {
  try {
    return localStorage.getItem(getViewModeKey(prefix)) || null;
  } catch {
    return null;
  }
}

function writeStoredViewMode(prefix: string, mode: string): void {
  try {
    localStorage.setItem(getViewModeKey(prefix), mode);
  } catch {
    /* ignore */
  }
}

function isCredentialFailure(error: unknown): boolean {
  const message = error instanceof Error ? error.message.toLowerCase() : '';
  return (
    message.includes('aws sso login')
    || message.includes('token is expired')
    || message.includes('expired token')
    || message.includes('could not load credentials')
    || message.includes('credential provider')
    || message.includes('resolved credential object is not valid')
  );
}

function shouldForceLogout(authStatus: string, error: unknown): boolean {
  if (authStatus !== 'authenticated' || !error) {return false;}
  if ((error as any).code === 'credentials_unavailable') {return true;}
  if (typeof (error as any).status === 'number' && (error as any).status === 401) {return true;}
  return isCredentialFailure(error);
}

function describeContentsError(error: unknown, authStatus: string): string {
  if (!error) {return '';}
  if (shouldForceLogout(authStatus, error)) {
    return 'Your CDN access expired. Sign in again to continue.';
  }
  if (typeof (error as any).status === 'number' && (error as any).status === 403) {
    return 'This directory is not available for your account.';
  }
  if (typeof (error as any).status === 'number' && (error as any).status === 404) {
    return 'This directory is no longer available.';
  }
  return 'Directory contents are temporarily unavailable. Refresh to try again.';
}

function parseUserIds(value: string): string[] {
  return value.split(/[,\n]/).map((item) => item.trim()).filter(Boolean);
}

function initialsForName(name: string): string {
  return (name || '')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || '')
    .join('') || '?';
}

const permissionRoleOptions = ['admin', 'client', 'agent', 'totally stoked', 'subscriber', 'stokd member'];

// ─── hooks ───────────────────────────────────────────────────────────────────

function useDirectoryContents(
  prefix: string,
  contentsEndpoint: string,
  publicBaseUrl: string,
  customGetContents: ((prefix: string) => Promise<CdnContents>) | undefined,
  reloadToken: number,
) {
  const [state, setState] = useState<{
    status: string;
    data: CdnContents;
    error: unknown;
  }>({
    status: 'loading',
    data: { folders: [], objects: [] },
    error: null,
  });

  useEffect(() => {
    let cancelled = false;

    setState((current) => ({ ...current, status: 'loading', error: null }));

    const fetcher = customGetContents
      ? customGetContents(prefix)
      : getContentsDefault(prefix, contentsEndpoint, publicBaseUrl);

    fetcher
      .then((data) => {
        if (cancelled) {return;}
        setState({ status: 'success', data, error: null });
      })
      .catch((error: unknown) => {
        if (cancelled) {return;}
        setState({ status: 'error', data: { folders: [], objects: [] }, error });
      });

    return () => {
      cancelled = true;
    };
  }, [prefix, contentsEndpoint, publicBaseUrl, customGetContents, reloadToken]);

  return state;
}

interface AuthState {
  status: string;
  user: { name: string; role: string; avatarUrl?: string } | null;
  error: unknown;
}

function useAuthSession(authEndpoint: string | undefined): AuthState {
  const [state, setState] = useState<AuthState>({
    status: authEndpoint ? 'loading' : 'disabled',
    user: null,
    error: null,
  });

  useEffect(() => {
    if (!authEndpoint) {
      setState({ status: 'disabled', user: null, error: null });
      return undefined;
    }

    let cancelled = false;

    fetch(authEndpoint, { credentials: 'include' })
      .then(async (response) => {
        if (!response.ok) {
          if (response.status === 401) {return { authenticated: false };}
          const body = await response.json().catch(() => ({}));
          throw new Error(body.message || `Session check failed with ${response.status}`);
        }
        return response.json();
      })
      .then((payload) => {
        if (cancelled) {return;}
        if (!payload?.authenticated) {
          setState({ status: 'unauthenticated', user: null, error: null });
          return;
        }
        setState({ status: 'authenticated', user: payload.user, error: null });
      })
      .catch((error: unknown) => {
        if (cancelled) {return;}
        setState({ status: 'error', user: null, error });
      });

    return () => {
      cancelled = true;
    };
  }, [authEndpoint]);

  return state;
}

// ─── sub-components ──────────────────────────────────────────────────────────

interface GalleryCardProps {
  object: { path: string; url: string; name: string; size: number };
  canManage: boolean;
  renamingPath: string | null;
  renameValue: string;
  onDragStart: (event: React.DragEvent) => void;
  onRenameStart: (path: string, name: string) => void;
  onRenameChange: (value: string) => void;
  onRenameCommit: () => void;
  onRenameKeyDown: (event: React.KeyboardEvent<HTMLInputElement>) => void;
  onDelete: (path: string) => void;
  onPermissions: (path: string) => void;
}

function GalleryCard({
  object,
  canManage,
  renamingPath,
  renameValue,
  onDragStart,
  onRenameStart,
  onRenameChange,
  onRenameCommit,
  onRenameKeyDown,
  onDelete,
  onPermissions,
}: GalleryCardProps) {
  const kind = getFileKind(object.path);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) {return;}
    if (isHovering) {
      video.play().catch(() => {});
    } else {
      video.pause();
      if (video.readyState > 0) {
        try { video.currentTime = 0.1; } catch { /* ignore */ }
      }
    }
  }, [isHovering]);

  function handleLoadedMetadata() {
    const video = videoRef.current;
    if (video) {
      try { video.currentTime = 0.1; } catch { /* ignore */ }
    }
  }

  return (
    <article
      className="media-card"
      draggable
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      onDragStart={onDragStart}
    >
      <a
        className="media-card-thumb-link"
        href={object.url}
        target="_blank"
        rel="noreferrer"
        tabIndex={-1}
      >
        {kind === 'image' ? (
          <img
            className="media-card-thumb"
            src={object.url}
            alt={object.name}
            loading="lazy"
          />
        ) : kind === 'video' ? (
          <video
            ref={videoRef}
            src={object.url}
            className="media-card-thumb"
            muted
            playsInline
            loop
            preload="metadata"
            onLoadedMetadata={handleLoadedMetadata}
          />
        ) : (
          <div
            className="media-card-thumb media-card-thumb-placeholder"
            data-kind={kind}
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z" />
            </svg>
          </div>
        )}
      </a>
      <div className="media-card-body">
        {canManage && renamingPath === object.path ? (
          <input
            className="rename-input"
            value={renameValue}
            onChange={(e) => onRenameChange(e.target.value)}
            onKeyDown={onRenameKeyDown}
            onBlur={onRenameCommit}
             
            autoFocus
          />
        ) : (
          <div
            className="media-card-name"
            title={object.name}
            onDoubleClick={canManage ? () => onRenameStart(object.path, object.name) : undefined}
            style={canManage ? { cursor: 'text' } : undefined}
          >
            {object.name}
          </div>
        )}
        <div className="media-card-meta">{formatBytes(object.size)}</div>
        <div className="media-card-actions">
          <a
            className="icon-action"
            href={object.url}
            target="_blank"
            rel="noreferrer"
            title="View"
            aria-label="View"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M12 5c5.5 0 9.5 4.6 10.8 6.4.27.37.27.83 0 1.2C21.5 14.4 17.5 19 12 19S2.5 14.4 1.2 12.6a1.01 1.01 0 0 1 0-1.2C2.5 9.6 6.5 5 12 5Zm0 2C8 7 4.86 10.1 3.31 12 4.86 13.9 8 17 12 17s7.14-3.1 8.69-5C19.14 10.1 16 7 12 7Zm0 1.75A3.25 3.25 0 1 1 8.75 12 3.25 3.25 0 0 1 12 8.75Zm0 2A1.25 1.25 0 1 0 13.25 12 1.25 1.25 0 0 0 12 10.75Z" />
            </svg>
          </a>
          {canManage ? (
            <button
              className="icon-action"
              type="button"
              title="Restrict"
              aria-label="Restrict"
              onClick={() => onPermissions(object.path)}
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12 1.75A5.25 5.25 0 0 0 6.75 7v2H5.5A1.75 1.75 0 0 0 3.75 10.75v9.5c0 .97.78 1.75 1.75 1.75h13a1.75 1.75 0 0 0 1.75-1.75v-9.5A1.75 1.75 0 0 0 18.5 9h-1.25V7A5.25 5.25 0 0 0 12 1.75Zm-3.25 7.25V7a3.25 3.25 0 1 1 6.5 0v2h-6.5Zm3.25 3a1.75 1.75 0 0 1 1 3.19v2.06h-2v-2.06A1.75 1.75 0 0 1 12 12Z" />
              </svg>
            </button>
          ) : null}
          {canManage ? (
            <button
              className="icon-action"
              type="button"
              title="Delete"
              aria-label="Delete"
              onClick={() => onDelete(object.path)}
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M9 3.75h6l.75 1.5h3.5v2h-1v11A2.75 2.75 0 0 1 15.5 21h-7A2.75 2.75 0 0 1 5.75 18.25v-11h-1v-2h3.5L9 3.75Zm-1.25 3.5v11c0 .41.34.75.75.75h7a.75.75 0 0 0 .75-.75v-11h-8.5Zm2.5 2h2v7h-2v-7Zm4 0h2v7h-2v-7Z" />
              </svg>
            </button>
          ) : null}
        </div>
      </div>
    </article>
  );
}

function MediaUploadThumbnail({ file }: { file: File }) {
  const [src, setSrc] = useState('');

  useEffect(() => {
    const url = URL.createObjectURL(file);
    setSrc(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  if (!src) {return null;}
  return <img className="upload-thumbnail" src={src} alt="" aria-hidden="true" />;
}

// ─── main component ──────────────────────────────────────────────────────────

export function CdnBrowser(props: CdnBrowserProps) {
  const {
    apiBaseUrl = '/api/cdn',
    publicBaseUrl = '',
    authEndpoint,
    loginUrl,
    logoutUrl,
    prefix: controlledPrefix,
    onPrefixChange,
    getContents: customGetContents,
    title = 'CDN Browser',
    subtitle,
    hideRootFiles = true,
    onUploadComplete,
    onError,
    className,
    style,
  } = props;

  const api = React.useMemo(() => createCdnApi(apiBaseUrl), [apiBaseUrl]);
  const contentsEndpoint = `${apiBaseUrl.replace(/\/$/, '')}/contents`;

  const [internalPrefix, setInternalPrefix] = useState('');
  const prefix = controlledPrefix !== undefined ? controlledPrefix : internalPrefix;

  const [query, setQuery] = useState('');
  const [reloadToken, setReloadToken] = useState(0);
  const [operationError, setOperationError] = useState('');
  const [uploads, setUploads] = useState<
    Array<{
      id: string;
      name: string;
      progress: number;
      status: string;
      file?: File;
      error?: string;
    }>
  >([]);
  const [permissionEditor, setPermissionEditor] = useState<{
    path: string;
    viewRoles: string[];
    viewUserIdsText: string;
    hasExisting: boolean;
    status: string;
    error: string;
  } | null>(null);
  const [logoutTriggered, setLogoutTriggered] = useState(false);
  const [viewMode, setViewMode] = useState('list');
  const [renamingPath, setRenamingPath] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const tabBlurRef = useRef(false);
  const wasEscapedRef = useRef(false);
  const pendingFolderClicksRef = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  const deferredQuery = useDeferredValue(query.trim().toLowerCase());
  const auth = useAuthSession(authEndpoint);
  const { status, data, error } = useDirectoryContents(
    prefix,
    contentsEndpoint,
    publicBaseUrl,
    customGetContents,
    reloadToken,
  );
  const crumbs = buildCrumbs(prefix);
  const canManage = auth.status === 'authenticated' && auth.user?.role === 'admin';
  const needsLogout = shouldForceLogout(auth.status, error);

  function resolveLoginUrl(returnTo: string): string {
    if (!loginUrl) {return returnTo;}
    return typeof loginUrl === 'function' ? loginUrl(returnTo) : loginUrl;
  }

  function resolveLogoutUrl(returnTo: string): string {
    if (!logoutUrl) {return returnTo;}
    return typeof logoutUrl === 'function' ? logoutUrl(returnTo) : logoutUrl;
  }

  useEffect(() => {
    if (!needsLogout || logoutTriggered || typeof window === 'undefined') {return;}
    setLogoutTriggered(true);
    window.location.assign(resolveLogoutUrl(window.location.href));
  }, [logoutTriggered, needsLogout]);

  useEffect(() => {
    if (status !== 'success') {return;}
    const stored = readStoredViewMode(prefix);
    if (stored) { setViewMode(stored); return; }
    setViewMode(isMediaHeavy(data.objects) ? 'gallery' : 'list');
  }, [status, data, prefix]);

  const filtered = !deferredQuery
    ? data
    : {
        folders: data.folders.filter((item) => item.name.toLowerCase().includes(deferredQuery)),
        objects: data.objects.filter((item) => item.name.toLowerCase().includes(deferredQuery)),
      };

  // Suppress files at root — the S3 bucket root contains SPA shell files
  const isRoot = !prefix || normalizePrefix(prefix) === '';
  const visible = (hideRootFiles && isRoot)
    ? { folders: filtered.folders, objects: [] }
    : filtered;

  const fileCount = visible.folders.length + visible.objects.length;
  const totalBytes = visible.objects.reduce((sum, item) => sum + (item.size || 0), 0);

  function openPrefix(nextPrefix: string) {
    setPermissionEditor(null);
    const normalized = nextPrefix ? normalizeDirectoryPrefix(nextPrefix) : '';
    startTransition(() => {
      if (onPrefixChange) {
        onPrefixChange(normalized);
      } else {
        setInternalPrefix(normalized);
      }
    });
  }

  const currentUrl = typeof window === 'undefined' ? '/' : window.location.href;

  function refreshContents() {
    setReloadToken((current) => current + 1);
  }

  function toggleViewMode() {
    const next = viewMode === 'gallery' ? 'list' : 'gallery';
    writeStoredViewMode(prefix, next);
    setViewMode(next);
  }

  function setUploadState(id: string, nextState: Partial<(typeof uploads)[0]>) {
    setUploads((current) => {
      const existing = current.find((upload) => upload.id === id);
      if (!existing) {
        return [...current, { id, name: '', progress: 0, status: 'uploading', ...nextState }];
      }
      return current.map((upload) => (upload.id === id ? { ...upload, ...nextState } : upload));
    });
  }

  async function uploadEntries(
    entries: Array<{ file: File; relativePath: string }>,
    targetPrefix = prefix,
  ) {
    setOperationError('');

    for (const entry of entries) {
      const targetPath = `${targetPrefix}${entry.relativePath}`.replace(/^\/+/, '');
      const uploadId = `${targetPath}:${entry.file.size}:${entry.file.lastModified}`;

      setUploadState(uploadId, {
        name: entry.relativePath,
        progress: 0,
        status: 'uploading',
        file: entry.file,
      });

      try {
        await api.uploadFile({
          path: targetPath,
          file: entry.file,
          onProgress: (progress) => {
            setUploadState(uploadId, { progress, status: 'uploading' });
          },
        });

        setUploadState(uploadId, { progress: 100, status: 'complete' });
        onUploadComplete?.(targetPath);
      } catch (uploadError: any) {
        setUploadState(uploadId, { status: 'error', error: uploadError.message });
        setOperationError(uploadError.message);
        onError?.(uploadError);
      }
    }

    refreshContents();
  }

  async function handleCreateFolder() {
    const folderName = window.prompt('New folder name');
    if (!folderName) {return;}
    try {
      await api.createFolder(`${prefix}${folderName}/`);
      refreshContents();
    } catch (folderError: any) {
      setOperationError(folderError.message);
    }
  }

  async function handleDelete(path: string) {
    if (!window.confirm(`Delete ${path}?`)) {return;}
    try {
      await api.deletePath(path);
      setPermissionEditor((current) => (current?.path === path ? null : current));
      refreshContents();
    } catch (deleteError: any) {
      setOperationError(deleteError.message);
    }
  }

  async function handleMove(sourcePath: string, destinationPrefix: string) {
    const itemName = basenameForPath(sourcePath);
    const isDirectory = sourcePath.endsWith('/');
    if (isDirectory && destinationPrefix.startsWith(sourcePath)) {
      setOperationError('Cannot move a folder into itself.');
      return;
    }

    const nextPath = `${destinationPrefix}${itemName}${isDirectory ? '/' : ''}`;
    if (nextPath === sourcePath) {return;}

    try {
      await api.movePath(sourcePath, nextPath);
      refreshContents();
    } catch (moveError: any) {
      setOperationError(moveError.message);
    }
  }

  async function handlePermissions(path: string) {
    setOperationError('');
    setPermissionEditor({
      path, viewRoles: [], viewUserIdsText: '', hasExisting: false, status: 'loading', error: '',
    });

    try {
      const permission = await api.getPermissions(path);
      setPermissionEditor((current) => {
        if (!current || current.path !== path) {return current;}
        return {
          path,
          viewRoles: permission?.viewRoles || [],
          viewUserIdsText: (permission?.viewUserIds || []).join(', '),
          hasExisting: Boolean(permission),
          status: 'ready',
          error: '',
        };
      });
    } catch (permissionError: any) {
      setPermissionEditor((current) => {
        if (!current || current.path !== path) {return current;}
        return { ...current, status: 'error', error: permissionError.message };
      });
    }
  }

  async function handleCopyPath(path: string) {
    const origin = typeof window === 'undefined' ? publicBaseUrl : window.location.origin;
    const resolvedBase = publicBaseUrl || origin;
    const url = new URL(path.replace(/^\//, ''), `${resolvedBase.replace(/\/$/, '')}/`).toString();
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      setOperationError('Could not copy the path.');
    }
  }

  function updatePermissionEditor(changes: Partial<NonNullable<typeof permissionEditor>>) {
    setPermissionEditor((current) => (current ? { ...current, ...changes } : current));
  }

  function togglePermissionRole(role: string) {
    setPermissionEditor((current) => {
      if (!current) {return current;}
      const viewRoles = current.viewRoles.includes(role)
        ? current.viewRoles.filter((value) => value !== role)
        : [...current.viewRoles, role];
      return { ...current, viewRoles, error: '' };
    });
  }

  async function handlePermissionSave() {
    if (!permissionEditor) {return;}
    const viewUserIds = parseUserIds(permissionEditor.viewUserIdsText);
    if (!permissionEditor.viewRoles.length && !viewUserIds.length) {
      updatePermissionEditor({ error: 'Choose at least one role or user, or clear the restriction.' });
      return;
    }
    updatePermissionEditor({ status: 'saving', error: '' });
    try {
      await api.updatePermissions(permissionEditor.path, permissionEditor.viewRoles, viewUserIds);
      setPermissionEditor(null);
      refreshContents();
    } catch (permissionError: any) {
      updatePermissionEditor({ status: 'ready', error: permissionError.message });
    }
  }

  async function handlePermissionClear() {
    if (!permissionEditor) {return;}
    updatePermissionEditor({ status: 'clearing', error: '' });
    try {
      await api.clearPermissions(permissionEditor.path);
      setPermissionEditor(null);
      refreshContents();
    } catch (permissionError: any) {
      updatePermissionEditor({ status: 'ready', error: permissionError.message });
    }
  }

  function getDraggedPayload(event: React.DragEvent): { path: string } | null {
    const rawValue = event.dataTransfer.getData('application/x-stoked-path');
    if (!rawValue) {return null;}
    try {
      return JSON.parse(rawValue);
    } catch {
      return null;
    }
  }

  async function handleDrop(event: React.DragEvent, targetPrefix: string) {
    event.preventDefault();
    const draggedItem = getDraggedPayload(event);
    if (draggedItem) {
      await handleMove(draggedItem.path, targetPrefix);
      return;
    }
    const entries = await collectDroppedEntries(event.dataTransfer.items);
    if (entries.length) {
      await uploadEntries(entries, targetPrefix);
    }
  }

  const allItemPaths = [
    ...visible.folders.map((f) => f.path),
    ...visible.objects.map((o) => o.path),
  ];

  function handleRenameStart(path: string, currentName: string) {
    setRenamingPath(path);
    setRenameValue(currentName);
  }

  async function handleRenameCommit() {
    if (tabBlurRef.current) {
      tabBlurRef.current = false;
      return;
    }
    if (wasEscapedRef.current) {
      wasEscapedRef.current = false;
      return;
    }
    if (!renamingPath) {return;}
    const path = renamingPath;
    const trimmed = renameValue.trim();
    setRenamingPath(null);
    setRenameValue('');
    if (!trimmed) {return;}
    const isDirectory = path.endsWith('/');
    const parentPfx = getParentPrefix(path);
    const newPath = `${parentPfx}${trimmed}${isDirectory ? '/' : ''}`;
    if (newPath !== path) {
      try {
        await api.movePath(path, newPath);
        refreshContents();
      } catch (renameError: any) {
        setOperationError(renameError.message);
      }
    }
  }

  function handleRenameCancel() {
    wasEscapedRef.current = true;
    setRenamingPath(null);
    setRenameValue('');
  }

  function handleRenameKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Escape') {
      event.preventDefault();
      handleRenameCancel();
      return;
    }
    if (event.key === 'Enter') {
      event.preventDefault();
      handleRenameCommit();
      return;
    }
    if (event.key === 'Tab') {
      event.preventDefault();
      if (!renamingPath) {return;}
      const currentPath = renamingPath;
      const currentValue = renameValue.trim();
      const idx = allItemPaths.indexOf(currentPath);
      const nextPath = allItemPaths.length > 1
        ? allItemPaths[(idx + 1) % allItemPaths.length]
        : null;

      tabBlurRef.current = true;

      if (nextPath) {
        setRenamingPath(nextPath);
        setRenameValue(basenameForPath(nextPath));
      } else {
        setRenamingPath(null);
        setRenameValue('');
      }

      if (currentValue) {
        const isDirectory = currentPath.endsWith('/');
        const parentPfx = getParentPrefix(currentPath);
        const newPath = `${parentPfx}${currentValue}${isDirectory ? '/' : ''}`;
        if (newPath !== currentPath) {
          api.movePath(currentPath, newPath)
            .then(() => refreshContents())
            .catch((e: any) => setOperationError(e.message));
        }
      }
    }
  }

  function handleFolderNameClick(
    event: React.MouseEvent,
    folderPath: string,
    folderName: string,
  ) {
    event.stopPropagation();
    if (pendingFolderClicksRef.current[folderPath]) {
      clearTimeout(pendingFolderClicksRef.current[folderPath]);
      delete pendingFolderClicksRef.current[folderPath];
      handleRenameStart(folderPath, folderName);
    } else {
      pendingFolderClicksRef.current[folderPath] = setTimeout(() => {
        delete pendingFolderClicksRef.current[folderPath];
        openPrefix(folderPath);
      }, 220);
    }
  }

  return (
    <div
      className={`suiCdnBrowser${className ? ` ${className}` : ''}`}
      style={style}
    >
      <main className="page">
        <section className="hero">
          <div className="hero-row">
            <div className="hero-title-block">
              {subtitle ? <p className="eyebrow">{subtitle}</p> : null}
              <h1>{title}</h1>
              <p className="hero-copy">Role-aware access, uploads, moves, and exports in one place.</p>
            </div>
            <div className="hero-sidecar">
              <label className="search hero-search" aria-label="Filter this directory">
                <input
                  type="search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search files and folders"
                />
              </label>

              <div className="hero-stats">
                <div>
                  <span className="stat-label">Directory</span>
                  <strong>{prefix || 'root'}</strong>
                </div>
                <div>
                  <span className="stat-label">Visible items</span>
                  <strong>{fileCount}</strong>
                </div>
                <div>
                  <span className="stat-label">Visible size</span>
                  <strong>{formatBytes(totalBytes)}</strong>
                </div>
              </div>

              {auth.status !== 'disabled' ? (
                <details className="hero-session-menu" data-state={auth.status}>
                  <summary className="hero-session">
                    {auth.status === 'authenticated' ? (
                      <React.Fragment>
                        {auth.user?.avatarUrl ? (
                          <img className="hero-avatar" src={auth.user.avatarUrl} alt={auth.user.name} />
                        ) : (
                          <span className="hero-avatar hero-avatar-fallback" aria-hidden="true">
                            {initialsForName(auth.user?.name || '')}
                          </span>
                        )}
                        <div className="hero-session-copy">
                          <span className="hero-session-name">{auth.user?.name}</span>
                          <span className="hero-session-role">{auth.user?.role}</span>
                        </div>
                      </React.Fragment>
                    ) : (
                      <div className="hero-session-copy">
                        <span className="hero-session-name">
                          {auth.status === 'loading' ? 'Checking session' : 'Public access'}
                        </span>
                        <span className="hero-session-role">
                          {auth.status === 'error' ? 'Session unavailable' : 'Not signed in'}
                        </span>
                      </div>
                    )}
                    {auth.status !== 'loading' ? (
                      <span className="hero-session-caret" aria-hidden="true">+</span>
                    ) : null}
                  </summary>

                  {auth.status !== 'loading' ? (
                    <div className="hero-session-dropdown">
                      {auth.status === 'authenticated' ? (
                        <a className="hero-session-action" href={resolveLogoutUrl(currentUrl)}>
                          Sign out
                        </a>
                      ) : (
                        <a className="hero-session-action" href={resolveLoginUrl(currentUrl)}>
                          Sign in
                        </a>
                      )}
                    </div>
                  ) : null}
                </details>
              ) : null}
            </div>
          </div>
        </section>

        <React.Fragment>
          <nav className="pathbar" aria-label="Breadcrumb">
            <button
              className={`path-link${crumbs.length === 0 ? ' current' : ''}`}
              type="button"
              onClick={() => openPrefix('')}
              onDragOver={canManage ? (event) => event.preventDefault() : undefined}
              onDrop={canManage ? (event) => handleDrop(event, '') : undefined}
            >
              root
            </button>
            {crumbs.map((crumb, index) => (
              <button
                key={crumb.path}
                className={`path-link${index === crumbs.length - 1 ? ' current' : ''}`}
                type="button"
                onClick={() => openPrefix(crumb.path)}
                onDragOver={canManage ? (event) => event.preventDefault() : undefined}
                onDrop={canManage ? (event) => handleDrop(event, crumb.path) : undefined}
              >
                {crumb.label}
              </button>
            ))}
            {canManage ? (
              <span className="path-actions">
                <button
                  className="pathbar-action"
                  type="button"
                  title="New folder"
                  aria-label="New folder"
                  onClick={handleCreateFolder}
                >
                  +
                </button>
              </span>
            ) : null}
          </nav>

          {canManage && permissionEditor ? (
            <section className="permission-panel">
              <div className="listing-head">
                <div>
                  <p className="eyebrow">Permissions</p>
                  <h2>{permissionEditor.path}</h2>
                </div>
                <p
                  className="status-chip"
                  data-status={permissionEditor.status === 'error' ? 'error' : 'success'}
                >
                  {permissionEditor.status === 'loading' && 'Loading'}
                  {permissionEditor.status === 'saving' && 'Saving'}
                  {permissionEditor.status === 'clearing' && 'Clearing'}
                  {permissionEditor.status === 'ready' && (permissionEditor.hasExisting ? 'Restricted' : 'Inherited')}
                  {permissionEditor.status === 'error' && 'Error'}
                </p>
              </div>

              <p className="permission-note">
                {permissionEditor.hasExisting
                  ? 'This path has an explicit visibility override.'
                  : 'No explicit restriction is saved yet. Default role access will apply until you save one.'}
              </p>

              {permissionEditor.error ? (
                <p className="feedback error">{permissionEditor.error}</p>
              ) : null}

              <div className="permission-grid">
                <div className="permission-field">
                  <span className="permission-label">Visible roles</span>
                  <div className="role-grid">
                    {permissionRoleOptions.map((role) => (
                      <label key={role} className="role-option">
                        <input
                          type="checkbox"
                          checked={permissionEditor.viewRoles.includes(role)}
                          onChange={() => togglePermissionRole(role)}
                          disabled={permissionEditor.status !== 'ready'}
                        />
                        <span>{role}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <label className="permission-field" htmlFor="suiCdnBrowser-permission-user-ids">
                  <span className="permission-label">Visible user IDs</span>
                  <textarea
                    id="suiCdnBrowser-permission-user-ids"
                    rows={5}
                    value={permissionEditor.viewUserIdsText}
                    onChange={(event) => updatePermissionEditor({
                      viewUserIdsText: event.target.value,
                      error: '',
                    })}
                    placeholder="Comma-separated user IDs"
                    disabled={permissionEditor.status !== 'ready'}
                  />
                  <span className="item-subtitle">
                    Use this when a path should be visible to specific accounts only.
                  </span>
                </label>
              </div>

              <div className="permission-actions">
                <button
                  className="action-button"
                  type="button"
                  onClick={handlePermissionSave}
                  disabled={permissionEditor.status !== 'ready'}
                >
                  Save restriction
                </button>
                <button
                  className="secondary-button"
                  type="button"
                  onClick={handlePermissionClear}
                  disabled={permissionEditor.status !== 'ready' || !permissionEditor.hasExisting}
                >
                  Clear restriction
                </button>
                <button
                  className="secondary-button"
                  type="button"
                  onClick={() => setPermissionEditor(null)}
                  disabled={permissionEditor.status === 'saving' || permissionEditor.status === 'clearing'}
                >
                  Cancel
                </button>
              </div>
            </section>
          ) : null}

          <section
            className="listing"
            onDragOver={canManage ? (event) => event.preventDefault() : undefined}
            onDrop={canManage ? (event) => handleDrop(event, prefix) : undefined}
          >
            {operationError ? <p className="feedback error">{operationError}</p> : null}

            {uploads.length ? (
              <div className="upload-list">
                {uploads.map((upload) => {
                  const kind = upload.file ? getFileKind(upload.file.name) : 'file';
                  const isMedia = isMediaKind(kind);
                  const isImage = isMedia && upload.file && upload.file.type.startsWith('image/');

                  return (
                    <div
                      key={upload.id}
                      className={`upload-item${isMedia ? ' upload-item-media' : ''}`}
                      data-status={upload.status}
                    >
                      {isImage ? (
                        <MediaUploadThumbnail file={upload.file!} />
                      ) : isMedia ? (
                        <div className="upload-thumbnail upload-thumbnail-video" aria-hidden="true">
                          <svg viewBox="0 0 24 24">
                            <path d="M8 6.82v10.36c0 .79.87 1.27 1.54.84l8.14-5.18c.62-.39.62-1.29 0-1.69L9.54 5.98C8.87 5.55 8 6.03 8 6.82z" />
                          </svg>
                        </div>
                      ) : null}
                      <div className="upload-copy">
                        <strong>{upload.name}</strong>
                        <span className="upload-status" data-status={upload.status}>
                          {upload.status}
                        </span>
                        {upload.error ? (
                          <span className="upload-error">{upload.error}</span>
                        ) : null}
                      </div>
                      <span className="upload-progress">{upload.progress || 0}%</span>
                    </div>
                  );
                })}
              </div>
            ) : null}

            {status === 'error' ? (
              <p className="feedback error">{describeContentsError(error, auth.status)}</p>
            ) : null}

            {status === 'loading' ? <p className="feedback">Loading directory contents...</p> : null}

            {status === 'success' && fileCount === 0 ? (
              <p className="feedback">{emptyMessage(prefix, deferredQuery)}</p>
            ) : null}

            {status === 'success' && visible.folders.length > 0 ? (
              <div className="folder-grid">
                {visible.folders.map((folder) => (
                  <article
                    key={folder.path}
                    className="folder-card"
                    role="link"
                    tabIndex={0}
                    draggable
                    onClick={() => { if (renamingPath !== folder.path) {openPrefix(folder.path);} }}
                    onKeyDown={(event) => {
                      if (event.target !== event.currentTarget) {return;}
                      if (renamingPath !== folder.path && (event.key === 'Enter' || event.key === ' ')) {
                        event.preventDefault();
                        openPrefix(folder.path);
                      }
                    }}
                    onDragStart={(event) => {
                      if (canManage) {
                        event.dataTransfer.setData('application/x-stoked-path', JSON.stringify({
                          path: folder.path,
                        }));
                      }
                      beginDesktopDownload(event, {
                        name: `${basenameForPath(folder.path)}.zip`,
                        url: api.buildExportUrl(folder.path),
                        mimeType: 'application/zip',
                        effectAllowed: canManage ? 'copyMove' : 'copy',
                      });
                    }}
                    onDragOver={canManage ? (event) => event.preventDefault() : undefined}
                    onDrop={canManage ? (event) => handleDrop(event, folder.path) : undefined}
                  >
                    <div className="folder-main">
                      <button
                        className="folder-open"
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          if (renamingPath !== folder.path) {openPrefix(folder.path);}
                        }}
                      >
                        <span className="folder-icon" aria-hidden="true">
                          <svg viewBox="0 0 24 24">
                            <path d="M10 4H4c-1.1 0-2 .9-2 2v3h20V8c0-1.1-.9-2-2-2h-8l-2-2Z" />
                            <path d="M22 10H2v8c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2v-8Z" />
                          </svg>
                        </span>
                        {canManage && renamingPath === folder.path ? (
                          <input
                            className="rename-input"
                            value={renameValue}
                            onChange={(e) => setRenameValue(e.target.value)}
                            onKeyDown={handleRenameKeyDown}
                            onBlur={handleRenameCommit}
                            onClick={(e) => e.stopPropagation()}
                             
                            autoFocus
                          />
                        ) : (
                          <span
                            className="folder-name"
                            onClick={canManage ? (e) => handleFolderNameClick(e, folder.path, basenameForPath(folder.path)) : undefined}
                            style={canManage ? { cursor: 'text' } : undefined}
                            title={canManage ? 'Double-click to rename' : undefined}
                          >
                            {basenameForPath(folder.path)}
                          </span>
                        )}
                      </button>
                      <div className="folder-actions">
                        <button
                          className="icon-action"
                          type="button"
                          title="Copy path"
                          aria-label="Copy path"
                          onClick={(event) => {
                            event.stopPropagation();
                            handleCopyPath(folder.path);
                          }}
                        >
                          <svg viewBox="0 0 24 24" aria-hidden="true">
                            <path d="M16 1.75H7.75A2.75 2.75 0 0 0 5 4.5V15h2V4.5c0-.41.34-.75.75-.75H16v-2Z" />
                            <path d="M10.5 6.75h8A2.75 2.75 0 0 1 21.25 9.5v10A2.75 2.75 0 0 1 18.5 22.25h-8a2.75 2.75 0 0 1-2.75-2.75v-10A2.75 2.75 0 0 1 10.5 6.75Zm0 2a.75.75 0 0 0-.75.75v10c0 .41.34.75.75.75h8a.75.75 0 0 0 .75-.75v-10a.75.75 0 0 0-.75-.75h-8Z" />
                          </svg>
                        </button>
                        <a
                          className="inline-action inline-action-icon"
                          href={api.buildExportUrl(folder.path)}
                          title="Export Zip"
                          aria-label="Export Zip"
                          onClick={(event) => event.stopPropagation()}
                        >
                          <svg viewBox="0 0 24 24" aria-hidden="true">
                            <path d="M12 2C6.49 2 2 6.49 2 12s4.49 10 10 10 10-4.49 10-10S17.51 2 12 2m-1 8V6h2v4h3l-4 4-4-4zm6 7H7v-2h10z" />
                          </svg>
                        </a>
                        {canManage ? (
                          <button
                            className="icon-action"
                            type="button"
                            title="Restrict"
                            aria-label="Restrict"
                            onClick={(event) => {
                              event.stopPropagation();
                              handlePermissions(folder.path);
                            }}
                          >
                            <svg viewBox="0 0 24 24" aria-hidden="true">
                              <path d="M12 1.75A5.25 5.25 0 0 0 6.75 7v2H5.5A1.75 1.75 0 0 0 3.75 10.75v9.5c0 .97.78 1.75 1.75 1.75h13a1.75 1.75 0 0 0 1.75-1.75v-9.5A1.75 1.75 0 0 0 18.5 9h-1.25V7A5.25 5.25 0 0 0 12 1.75Zm-3.25 7.25V7a3.25 3.25 0 1 1 6.5 0v2h-6.5Zm3.25 3a1.75 1.75 0 0 1 1 3.19v2.06h-2v-2.06A1.75 1.75 0 0 1 12 12Z" />
                            </svg>
                          </button>
                        ) : null}
                        {canManage ? (
                          <button
                            className="icon-action"
                            type="button"
                            title="Delete"
                            aria-label="Delete"
                            onClick={(event) => {
                              event.stopPropagation();
                              handleDelete(folder.path);
                            }}
                          >
                            <svg viewBox="0 0 24 24" aria-hidden="true">
                              <path d="M9 3.75h6l.75 1.5h3.5v2h-1v11A2.75 2.75 0 0 1 15.5 21h-7A2.75 2.75 0 0 1 5.75 18.25v-11h-1v-2h3.5L9 3.75Zm-1.25 3.5v11c0 .41.34.75.75.75h7a.75.75 0 0 0 .75-.75v-11h-8.5Zm2.5 2h2v7h-2v-7Zm4 0h2v7h-2v-7Z" />
                            </svg>
                          </button>
                        ) : null}
                      </div>
                    </div>
                    <span className="folder-path">{folder.path}</span>
                  </article>
                ))}
              </div>
            ) : null}

            {status === 'success' && visible.objects.length > 0 ? (
              <React.Fragment>
                <div className="objects-toolbar">
                  <span className="objects-count">
                    {visible.objects.length} file{visible.objects.length !== 1 ? 's' : ''}
                  </span>
                  <button
                    className={`view-toggle-btn${viewMode === 'list' ? ' active' : ''}`}
                    type="button"
                    title="List view"
                    aria-label="List view"
                    aria-pressed={viewMode === 'list'}
                    onClick={viewMode !== 'list' ? toggleViewMode : undefined}
                  >
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zM7 7v2h14V7H7z" />
                    </svg>
                  </button>
                  <button
                    className={`view-toggle-btn${viewMode === 'gallery' ? ' active' : ''}`}
                    type="button"
                    title="Gallery view"
                    aria-label="Gallery view"
                    aria-pressed={viewMode === 'gallery'}
                    onClick={viewMode !== 'gallery' ? toggleViewMode : undefined}
                  >
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M11 11H3V3h8v8zm2 0h8V3h-8v8zm-2 2H3v8h8v-8zm2 0v8h8v-8h-8z" />
                    </svg>
                  </button>
                </div>

                {viewMode === 'gallery' ? (
                  <div className="media-gallery">
                    {visible.objects.map((object) => (
                      <GalleryCard
                        key={object.path}
                        object={object}
                        canManage={canManage}
                        renamingPath={renamingPath}
                        renameValue={renameValue}
                        onDragStart={(event) => {
                          if (canManage) {
                            event.dataTransfer.setData('application/x-stoked-path', JSON.stringify({
                              path: object.path,
                            }));
                          }
                          beginDesktopDownload(event, {
                            name: object.name,
                            url: object.url,
                            effectAllowed: canManage ? 'copyMove' : 'copy',
                          });
                        }}
                        onRenameStart={handleRenameStart}
                        onRenameChange={setRenameValue}
                        onRenameCommit={handleRenameCommit}
                        onRenameKeyDown={handleRenameKeyDown}
                        onDelete={handleDelete}
                        onPermissions={handlePermissions}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="table-wrap">
                    <table>
                      <thead>
                        <tr>
                          <th>Name</th>
                          <th>Updated</th>
                          <th>Size</th>
                          <th className="actions-head">
                            <div className="table-head-actions">
                              <span>Actions</span>
                            </div>
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {visible.objects.map((object) => {
                          const kind = getFileKind(object.path);
                          return (
                            <tr
                              key={object.path}
                              draggable
                              onDragStart={(event) => {
                                if (canManage) {
                                  event.dataTransfer.setData('application/x-stoked-path', JSON.stringify({
                                    path: object.path,
                                  }));
                                }
                                beginDesktopDownload(event, {
                                  name: object.name,
                                  url: object.url,
                                  effectAllowed: canManage ? 'copyMove' : 'copy',
                                });
                              }}
                            >
                              <td>
                                <div className="item-name">
                                  <span className="item-icon" aria-hidden="true">
                                    {iconForKind(kind)}
                                  </span>
                                  <div>
                                    {canManage && renamingPath === object.path ? (
                                      <input
                                        className="rename-input"
                                        value={renameValue}
                                        onChange={(e) => setRenameValue(e.target.value)}
                                        onKeyDown={handleRenameKeyDown}
                                        onBlur={handleRenameCommit}
                                         
                                        autoFocus
                                      />
                                    ) : (
                                      <div
                                        className="item-title"
                                        onDoubleClick={canManage ? () => handleRenameStart(object.path, object.name) : undefined}
                                        style={canManage ? { cursor: 'text' } : undefined}
                                        title={canManage ? 'Double-click to rename' : undefined}
                                      >
                                        {object.name}
                                      </div>
                                    )}
                                    <div className="item-subtitle">{object.path}</div>
                                  </div>
                                </div>
                              </td>
                              <td>{formatTimestamp(object.lastModified)}</td>
                              <td>{formatBytes(object.size)}</td>
                              <td className="actions-cell">
                                <div className="item-actions">
                                  <a
                                    className="icon-action"
                                    href={object.url}
                                    target="_blank"
                                    rel="noreferrer"
                                    title="View"
                                    aria-label="View"
                                  >
                                    <svg viewBox="0 0 24 24" aria-hidden="true">
                                      <path d="M12 5c5.5 0 9.5 4.6 10.8 6.4.27.37.27.83 0 1.2C21.5 14.4 17.5 19 12 19S2.5 14.4 1.2 12.6a1.01 1.01 0 0 1 0-1.2C2.5 9.6 6.5 5 12 5Zm0 2C8 7 4.86 10.1 3.31 12 4.86 13.9 8 17 12 17s7.14-3.1 8.69-5C19.14 10.1 16 7 12 7Zm0 1.75A3.25 3.25 0 1 1 8.75 12 3.25 3.25 0 0 1 12 8.75Zm0 2A1.25 1.25 0 1 0 13.25 12 1.25 1.25 0 0 0 12 10.75Z" />
                                    </svg>
                                  </a>
                                  {canManage ? (
                                    <button
                                      className="icon-action"
                                      type="button"
                                      title="Restrict"
                                      aria-label="Restrict"
                                      onClick={() => handlePermissions(object.path)}
                                    >
                                      <svg viewBox="0 0 24 24" aria-hidden="true">
                                        <path d="M12 1.75A5.25 5.25 0 0 0 6.75 7v2H5.5A1.75 1.75 0 0 0 3.75 10.75v9.5c0 .97.78 1.75 1.75 1.75h13a1.75 1.75 0 0 0 1.75-1.75v-9.5A1.75 1.75 0 0 0 18.5 9h-1.25V7A5.25 5.25 0 0 0 12 1.75Zm-3.25 7.25V7a3.25 3.25 0 1 1 6.5 0v2h-6.5Zm3.25 3a1.75 1.75 0 0 1 1 3.19v2.06h-2v-2.06A1.75 1.75 0 0 1 12 12Z" />
                                      </svg>
                                    </button>
                                  ) : null}
                                  {canManage ? (
                                    <button
                                      className="icon-action"
                                      type="button"
                                      title="Delete"
                                      aria-label="Delete"
                                      onClick={() => handleDelete(object.path)}
                                    >
                                      <svg viewBox="0 0 24 24" aria-hidden="true">
                                        <path d="M9 3.75h6l.75 1.5h3.5v2h-1v11A2.75 2.75 0 0 1 15.5 21h-7A2.75 2.75 0 0 1 5.75 18.25v-11h-1v-2h3.5L9 3.75Zm-1.25 3.5v11c0 .41.34.75.75.75h7a.75.75 0 0 0 .75-.75v-11h-8.5Zm2.5 2h2v7h-2v-7Zm4 0h2v7h-2v-7Z" />
                                      </svg>
                                    </button>
                                  ) : null}
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </React.Fragment>
            ) : null}
          </section>
        </React.Fragment>
      </main>
    </div>
  );
}

export default CdnBrowser;
