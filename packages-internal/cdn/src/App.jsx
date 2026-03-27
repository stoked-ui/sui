import React, { startTransition, useDeferredValue, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  beginDesktopDownload,
  buildExportUrl,
  clearPermissions,
  collectDroppedEntries,
  createFolder,
  deletePath as deleteRemotePath,
  getPermissions,
  movePath as moveRemotePath,
  updatePermissions,
  uploadFile,
} from './lib/cdnApi';
import { buildCrumbs, formatBytes, formatTimestamp, getContents, getFileKind } from './lib/contents';
import {
  authSessionEndpoint,
  buildAuthLoginUrl,
  buildAuthLogoutUrl,
  cdnName,
  getAuthOrigin,
  publicBaseUrl,
} from './config';

function useDirectoryContents(prefix, enabled, reloadToken) {
  const [state, setState] = useState({
    status: enabled ? 'loading' : 'idle',
    data: { folders: [], objects: [] },
    error: null,
  });

  useEffect(() => {
    if (!enabled) {
      setState({
        status: 'idle',
        data: { folders: [], objects: [] },
        error: null,
      });
      return undefined;
    }

    let cancelled = false;

    setState((current) => ({
      ...current,
      status: 'loading',
      error: null,
    }));

    getContents(prefix)
      .then((data) => {
        if (cancelled) {
          return;
        }

        setState({
          status: 'success',
          data,
          error: null,
        });
      })
      .catch((error) => {
        if (cancelled) {
          return;
        }

        setState({
          status: 'error',
          data: { folders: [], objects: [] },
          error,
        });
      });

    return () => {
      cancelled = true;
    };
  }, [enabled, prefix, reloadToken]);

  return state;
}

function useAuthSession() {
  const [state, setState] = useState({
    status: 'loading',
    user: null,
    error: null,
  });

  useEffect(() => {
    let cancelled = false;

    fetch(authSessionEndpoint, {
      credentials: 'include',
    })
      .then(async (response) => {
        if (!response.ok) {
          if (response.status === 401) {
            return { authenticated: false };
          }

          const body = await response.json().catch(() => ({}));
          throw new Error(body.message || `Session check failed with ${response.status}`);
        }

        return response.json();
      })
      .then((payload) => {
        if (cancelled) {
          return;
        }

        if (!payload?.authenticated) {
          setState({
            status: 'unauthenticated',
            user: null,
            error: null,
          });
          return;
        }

        setState({
          status: 'authenticated',
          user: payload.user,
          error: null,
        });
      })
      .catch((error) => {
        if (cancelled) {
          return;
        }

        setState({
          status: 'error',
          user: null,
          error,
        });
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return state;
}

function iconForKind(kind) {
  switch (kind) {
    case 'video':
      return '[V]';
    case 'image':
      return '[I]';
    case 'download':
      return '[D]';
    case 'code':
      return '[#]';
    default:
      return '[ ]';
  }
}

function emptyMessage(prefix, query) {
  if (query) {
    return `No results in ${prefix || 'root'} for "${query}".`;
  }

  return prefix ? `No files directly inside ${prefix}.` : 'This directory is empty.';
}

function basenameForPath(path) {
  const normalized = path.replace(/\/$/, '');
  const segments = normalized.split('/').filter(Boolean);
  return segments[segments.length - 1] || normalized;
}

function buildAbsolutePathUrl(path) {
  const origin = typeof window === 'undefined'
    ? publicBaseUrl
    : window.location.origin;

  return new URL(path.replace(/^\//, ''), `${origin.replace(/\/$/, '')}/`).toString();
}

function initialsForName(name) {
  return (name || '')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || '')
    .join('') || '?';
}

function isCredentialFailure(error) {
  const message = error instanceof Error ? error.message.toLowerCase() : '';

  return message.includes('aws sso login')
    || message.includes('token is expired')
    || message.includes('expired token')
    || message.includes('could not load credentials')
    || message.includes('credential provider')
    || message.includes('resolved credential object is not valid');
}

function shouldForceLogout(authStatus, error) {
  if (authStatus !== 'authenticated' || !error) {
    return false;
  }

  if (error.code === 'credentials_unavailable') {
    return true;
  }

  if (typeof error.status === 'number' && error.status === 401) {
    return true;
  }

  return isCredentialFailure(error);
}

function describeContentsError(error, authStatus) {
  if (!error) {
    return '';
  }

  if (shouldForceLogout(authStatus, error)) {
    return 'Your CDN access expired. Sign in again to continue.';
  }

  if (typeof error.status === 'number' && error.status === 403) {
    return 'This directory is not available for your account.';
  }

  if (typeof error.status === 'number' && error.status === 404) {
    return 'This directory is no longer available.';
  }

  return 'Directory contents are temporarily unavailable. Refresh to try again.';
}

function parseUserIds(value) {
  return value
    .split(/[,\n]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

const permissionRoleOptions = [
  'admin',
  'client',
  'agent',
  'totally stoked',
  'subscriber',
  'stokd member',
];

export default function App() {
  const [searchParams, setSearchParams] = useSearchParams();
  const prefix = searchParams.get('prefix') || '';
  const [query, setQuery] = useState('');
  const [reloadToken, setReloadToken] = useState(0);
  const [operationError, setOperationError] = useState('');
  const [uploads, setUploads] = useState([]);
  const [permissionEditor, setPermissionEditor] = useState(null);
  const [logoutTriggered, setLogoutTriggered] = useState(false);
  const deferredQuery = useDeferredValue(query.trim().toLowerCase());
  const auth = useAuthSession();
  const { status, data, error } = useDirectoryContents(prefix, true, reloadToken);
  const crumbs = buildCrumbs(prefix);
  const authOrigin = getAuthOrigin();
  const canManage = auth.status === 'authenticated' && auth.user.role === 'admin';
  const shouldLogout = shouldForceLogout(auth.status, error);

  useEffect(() => {
    document.title = prefix ? `${prefix} | ${cdnName}` : cdnName;
  }, [prefix]);

  useEffect(() => {
    if (!shouldLogout || logoutTriggered || typeof window === 'undefined') {
      return;
    }

    setLogoutTriggered(true);
    window.location.assign(buildAuthLogoutUrl(window.location.href));
  }, [logoutTriggered, shouldLogout]);

  const filtered = !deferredQuery
    ? data
    : {
        folders: data.folders.filter((item) => item.name.toLowerCase().includes(deferredQuery)),
        objects: data.objects.filter((item) => item.name.toLowerCase().includes(deferredQuery)),
      };

  const fileCount = filtered.folders.length + filtered.objects.length;
  const totalBytes = filtered.objects.reduce((sum, item) => sum + (item.size || 0), 0);

  function openPrefix(nextPrefix) {
    setPermissionEditor(null);
    startTransition(() => {
      if (nextPrefix) {
        setSearchParams({ prefix: nextPrefix });
      } else {
        setSearchParams({});
      }
    });
  }

  const currentUrl = typeof window === 'undefined' ? '/' : window.location.href;

  function refreshContents() {
    setReloadToken((current) => current + 1);
  }

  function setUploadState(id, nextState) {
    setUploads((current) => {
      const existing = current.find((upload) => upload.id === id);
      if (!existing) {
        return [...current, { id, ...nextState }];
      }

      return current.map((upload) => (
        upload.id === id
          ? { ...upload, ...nextState }
          : upload
      ));
    });
  }

  async function uploadEntries(entries, targetPrefix = prefix) {
    setOperationError('');

    for (const entry of entries) {
      const targetPath = `${targetPrefix}${entry.relativePath}`.replace(/^\/+/, '');
      const uploadId = `${targetPath}:${entry.file.size}:${entry.file.lastModified}`;

      setUploadState(uploadId, {
        name: entry.relativePath,
        progress: 0,
        status: 'uploading',
      });

      try {
        await uploadFile({
          path: targetPath,
          file: entry.file,
          onProgress: (progress) => {
            setUploadState(uploadId, { progress, status: 'uploading' });
          },
        });

        setUploadState(uploadId, {
          progress: 100,
          status: 'complete',
        });
      } catch (uploadError) {
        setUploadState(uploadId, {
          status: 'error',
          error: uploadError.message,
        });
        setOperationError(uploadError.message);
      }
    }

    refreshContents();
  }

  async function handleCreateFolder() {
    const folderName = window.prompt('New folder name');
    if (!folderName) {
      return;
    }

    try {
      await createFolder(`${prefix}${folderName}/`);
      refreshContents();
    } catch (folderError) {
      setOperationError(folderError.message);
    }
  }

  async function handleDelete(path) {
    if (!window.confirm(`Delete ${path}?`)) {
      return;
    }

    try {
      await deleteRemotePath(path);
      setPermissionEditor((current) => (current?.path === path ? null : current));
      refreshContents();
    } catch (deleteError) {
      setOperationError(deleteError.message);
    }
  }

  async function handleMove(sourcePath, destinationPrefix) {
    const itemName = basenameForPath(sourcePath);
    const isDirectory = sourcePath.endsWith('/');
    if (isDirectory && destinationPrefix.startsWith(sourcePath)) {
      setOperationError('Cannot move a folder into itself.');
      return;
    }

    const nextPath = `${destinationPrefix}${itemName}${isDirectory ? '/' : ''}`;

    if (nextPath === sourcePath) {
      return;
    }

    try {
      await moveRemotePath(sourcePath, nextPath);
      refreshContents();
    } catch (moveError) {
      setOperationError(moveError.message);
    }
  }

  async function handlePermissions(path) {
    setOperationError('');
    setPermissionEditor({
      path,
      viewRoles: [],
      viewUserIdsText: '',
      hasExisting: false,
      status: 'loading',
      error: '',
    });

    try {
      const permission = await getPermissions(path);
      setPermissionEditor((current) => {
        if (!current || current.path !== path) {
          return current;
        }

        return {
          path,
          viewRoles: permission?.viewRoles || [],
          viewUserIdsText: (permission?.viewUserIds || []).join(', '),
          hasExisting: Boolean(permission),
          status: 'ready',
          error: '',
        };
      });
    } catch (permissionError) {
      setPermissionEditor((current) => {
        if (!current || current.path !== path) {
          return current;
        }

        return {
          ...current,
          status: 'error',
          error: permissionError.message,
        };
      });
    }
  }

  async function handleCopyPath(path) {
    try {
      await navigator.clipboard.writeText(buildAbsolutePathUrl(path));
    } catch {
      setOperationError('Could not copy the path.');
    }
  }

  function updatePermissionEditor(changes) {
    setPermissionEditor((current) => (current ? { ...current, ...changes } : current));
  }

  function togglePermissionRole(role) {
    setPermissionEditor((current) => {
      if (!current) {
        return current;
      }

      const viewRoles = current.viewRoles.includes(role)
        ? current.viewRoles.filter((value) => value !== role)
        : [...current.viewRoles, role];

      return {
        ...current,
        viewRoles,
        error: '',
      };
    });
  }

  async function handlePermissionSave() {
    if (!permissionEditor) {
      return;
    }

    const viewUserIds = parseUserIds(permissionEditor.viewUserIdsText);
    if (!permissionEditor.viewRoles.length && !viewUserIds.length) {
      updatePermissionEditor({
        error: 'Choose at least one role or user, or clear the restriction.',
      });
      return;
    }

    updatePermissionEditor({ status: 'saving', error: '' });

    try {
      await updatePermissions(permissionEditor.path, permissionEditor.viewRoles, viewUserIds);
      setPermissionEditor(null);
      refreshContents();
    } catch (permissionError) {
      updatePermissionEditor({
        status: 'ready',
        error: permissionError.message,
      });
    }
  }

  async function handlePermissionClear() {
    if (!permissionEditor) {
      return;
    }

    updatePermissionEditor({ status: 'clearing', error: '' });

    try {
      await clearPermissions(permissionEditor.path);
      setPermissionEditor(null);
      refreshContents();
    } catch (permissionError) {
      updatePermissionEditor({
        status: 'ready',
        error: permissionError.message,
      });
    }
  }

  function getDraggedPayload(event) {
    const rawValue = event.dataTransfer.getData('application/x-stoked-path');
    if (!rawValue) {
      return null;
    }

    try {
      return JSON.parse(rawValue);
    } catch {
      return null;
    }
  }

  async function handleDrop(event, targetPrefix) {
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

  return (
    <div className="app-shell">
      <main className="page">
        <section className="hero">
          <div className="hero-row">
            <div className="hero-title-block">
              <p className="eyebrow">Internal package rebuild</p>
              <h1>{cdnName}</h1>
              <p className="hero-copy">
                Role-aware access, uploads, moves, and exports in one place.
              </p>
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

              <details className="hero-session-menu" data-state={auth.status}>
                <summary className="hero-session">
                  {auth.status === 'authenticated' ? (
                    <React.Fragment>
                      {auth.user.avatarUrl ? (
                        <img
                          className="hero-avatar"
                          src={auth.user.avatarUrl}
                          alt={auth.user.name}
                        />
                      ) : (
                        <span className="hero-avatar hero-avatar-fallback" aria-hidden="true">
                          {initialsForName(auth.user.name)}
                        </span>
                      )}
                      <div className="hero-session-copy">
                        <span className="hero-session-name">{auth.user.name}</span>
                        <span className="hero-session-role">{auth.user.role}</span>
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
                  {auth.status !== 'loading' ? <span className="hero-session-caret" aria-hidden="true">+</span> : null}
                </summary>

                {auth.status === 'loading' ? null : (
                  <div className="hero-session-dropdown">
                    {auth.status === 'authenticated' ? (
                      <a className="hero-session-action" href={buildAuthLogoutUrl(currentUrl)}>
                        Sign out
                      </a>
                    ) : (
                      <a className="hero-session-action" href={buildAuthLoginUrl(authOrigin, currentUrl)}>
                        Sign in
                      </a>
                    )}
                  </div>
                )}
              </details>
            </div>
          </div>
        </section>

        <React.Fragment>
        {crumbs.length ? (
          <nav className="pathbar" aria-label="Breadcrumb">
            <button
              className="path-link"
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
          </nav>
        ) : null}

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

              <label className="permission-field" htmlFor="permission-user-ids">
                <span className="permission-label">Visible user IDs</span>
                <textarea
                  id="permission-user-ids"
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
              {uploads.map((upload) => (
                <div key={upload.id} className="upload-item">
                  <div>
                    <strong>{upload.name}</strong>
                    <span className="item-subtitle">{upload.status}</span>
                  </div>
                  <span>{upload.progress || 0}%</span>
                </div>
              ))}
            </div>
          ) : null}

          {status === 'error' ? (
            <p className="feedback error">{describeContentsError(error, auth.status)}</p>
          ) : null}

          {status === 'loading' ? <p className="feedback">Loading directory contents...</p> : null}

          {status === 'success' && fileCount === 0 ? (
            <p className="feedback">{emptyMessage(prefix, deferredQuery)}</p>
          ) : null}

          {status === 'success' && filtered.folders.length > 0 ? (
            <div className="folder-grid">
              {filtered.folders.map((folder) => (
                <article
                  key={folder.path}
                  className="folder-card"
                  draggable
                  onDragStart={(event) => {
                    if (canManage) {
                      event.dataTransfer.setData('application/x-stoked-path', JSON.stringify({
                        path: folder.path,
                      }));
                    }

                    beginDesktopDownload(event, {
                      name: `${basenameForPath(folder.path)}.zip`,
                      url: buildExportUrl(folder.path),
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
                      onClick={() => openPrefix(folder.path)}
                    >
                      <span className="folder-icon" aria-hidden="true">
                        <svg viewBox="0 0 24 24">
                          <path d="M10 4H4c-1.1 0-2 .9-2 2v3h20V8c0-1.1-.9-2-2-2h-8l-2-2Z" />
                          <path d="M22 10H2v8c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2v-8Z" />
                        </svg>
                      </span>
                      <span className="folder-name">{basenameForPath(folder.path)}</span>
                    </button>
                    <div className="folder-actions">
                      <a
                        className="inline-action inline-action-icon"
                        href={buildExportUrl(folder.path)}
                        title="Export Zip"
                        aria-label="Export Zip"
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
                          onClick={() => handlePermissions(folder.path)}
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
                          onClick={() => handleDelete(folder.path)}
                        >
                          <svg viewBox="0 0 24 24" aria-hidden="true">
                            <path d="M9 3.75h6l.75 1.5h3.5v2h-1v11A2.75 2.75 0 0 1 15.5 21h-7A2.75 2.75 0 0 1 5.75 18.25v-11h-1v-2h3.5L9 3.75Zm-1.25 3.5v11c0 .41.34.75.75.75h7a.75.75 0 0 0 .75-.75v-11h-8.5Zm2.5 2h2v7h-2v-7Zm4 0h2v7h-2v-7Z" />
                          </svg>
                        </button>
                      ) : null}
                    </div>
                  </div>
                  <button
                    className="folder-path"
                    type="button"
                    title="Copy full path"
                    onClick={() => handleCopyPath(folder.path)}
                  >
                    {folder.path}
                  </button>
                </article>
              ))}
            </div>
          ) : null}

          {status === 'success' && filtered.objects.length > 0 ? (
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
                        {canManage ? (
                          <button
                            className="icon-action"
                            type="button"
                            title="New folder"
                            aria-label="New folder"
                            onClick={handleCreateFolder}
                          >
                            <svg viewBox="0 0 24 24" aria-hidden="true">
                              <path d="M10 4H4c-1.1 0-2 .9-2 2v3h20V8c0-1.1-.9-2-2-2h-8l-2-2Z" />
                              <path d="M22 10H2v8c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2v-8Z" />
                              <path d="M12 12.25h-1.25v2.5h-2.5V16h2.5v2.5H12V16h2.5v-1.25H12v-2.5Z" />
                            </svg>
                          </button>
                        ) : null}
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.objects.map((object) => {
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
                              <div className="item-title">{object.name}</div>
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
          ) : null}
        </section>
        </React.Fragment>
      </main>
    </div>
  );
}
