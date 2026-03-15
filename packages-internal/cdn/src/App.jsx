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
  cdnName,
  formatAuthOriginLabel,
  getAuthOrigins,
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

function initialsForName(name) {
  return (name || '')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || '')
    .join('') || '?';
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
  const deferredQuery = useDeferredValue(query.trim().toLowerCase());
  const auth = useAuthSession();
  const { status, data, error } = useDirectoryContents(prefix, true, reloadToken);
  const crumbs = buildCrumbs(prefix);
  const authOrigins = getAuthOrigins();
  const usingLocalAuthSource = authOrigins.length === 1 && authOrigins[0].includes('localhost');
  const canManage = auth.status === 'authenticated' && auth.user.role === 'admin';

  useEffect(() => {
    document.title = prefix ? `${prefix} | ${cdnName}` : cdnName;
  }, [prefix]);

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
            <div className="hero-session" data-state={auth.status}>
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
            </div>
          </div>
        </section>

        {auth.status === 'error' ? (
          <section className="auth-panel">
            <p className="feedback error">
              Session lookup failed, but public browsing is still available. {auth.error.message}
            </p>
          </section>
        ) : null}

        {auth.status === 'unauthenticated' ? (
          <section className="auth-panel">
            <div className="listing-head">
              <div>
                <p className="eyebrow">Authentication</p>
                <h2>Public browsing is on</h2>
              </div>
              <p className="status-chip" data-status="success">
                Public
              </p>
            </div>
            <p className="feedback">
              {usingLocalAuthSource
                ? 'Public files can be browsed without signing in. For local development, use the localhost auth flow for client areas, admin controls, or restricted content.'
                : 'Public files can be browsed without signing in. Sign in only if you need client areas, admin controls, or path-restricted content.'}
            </p>
            <div className="auth-actions">
              {authOrigins.map((origin) => (
                <a
                  key={origin}
                  className="auth-link"
                  href={buildAuthLoginUrl(origin, currentUrl)}
                >
                  Sign in with {formatAuthOriginLabel(origin)}
                </a>
              ))}
            </div>
          </section>
        ) : null}

        <React.Fragment>
        <section className="toolbar">
          <nav className="crumbs" aria-label="Breadcrumb">
            <button
              className="crumb root"
              type="button"
              onClick={() => openPrefix('')}
              onDragOver={canManage ? (event) => event.preventDefault() : undefined}
              onDrop={canManage ? (event) => handleDrop(event, '') : undefined}
            >
              {cdnName}
            </button>
            {crumbs.map((crumb) => (
              <button
                key={crumb.path}
                className="crumb"
                type="button"
                onClick={() => openPrefix(crumb.path)}
                onDragOver={canManage ? (event) => event.preventDefault() : undefined}
                onDrop={canManage ? (event) => handleDrop(event, crumb.path) : undefined}
              >
                {crumb.label}
              </button>
            ))}
          </nav>

          <label className="search">
            <span>Filter this directory</span>
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search files and folders"
            />
          </label>
        </section>

        {canManage ? (
          <section className="action-bar">
            <button className="action-button" type="button" onClick={handleCreateFolder}>
              New folder
            </button>
          </section>
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
          <div className="listing-head">
            <div>
              <p className="eyebrow">Contents</p>
              <h2>{prefix || 'Bucket root'}</h2>
            </div>
            <p className="status-chip" data-status={status}>
              {status === 'loading' && 'Loading'}
              {status === 'success' && 'Ready'}
              {status === 'error' && 'Error'}
            </p>
          </div>

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

          {status === 'error' ? <p className="feedback error">{error.message}</p> : null}

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
                  <button
                    className="folder-open"
                    type="button"
                    onClick={() => openPrefix(folder.path)}
                  >
                    <span className="folder-icon">[+]</span>
                    <span className="folder-name">{folder.name}</span>
                    <span className="folder-path">{folder.path}</span>
                  </button>
                  <div className="folder-actions">
                    <a
                      className="inline-action"
                      href={buildExportUrl(folder.path)}
                    >
                      Export zip
                    </a>
                    {canManage ? (
                      <button
                        className="inline-action"
                        type="button"
                        onClick={() => handlePermissions(folder.path)}
                      >
                        Restrict
                      </button>
                    ) : null}
                    {canManage ? (
                      <button
                        className="inline-action"
                        type="button"
                        onClick={() => handleDelete(folder.path)}
                      >
                        Delete
                      </button>
                    ) : null}
                  </div>
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
                    <th>Open</th>
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
                        <td>
                          <a href={object.url} target="_blank" rel="noreferrer">
                            View
                          </a>
                          {canManage ? (
                            <button
                              className="inline-action"
                              type="button"
                              onClick={() => handlePermissions(object.path)}
                            >
                              Restrict
                            </button>
                          ) : null}
                          {canManage ? (
                            <button
                              className="inline-action"
                              type="button"
                              onClick={() => handleDelete(object.path)}
                            >
                              Delete
                            </button>
                          ) : null}
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
