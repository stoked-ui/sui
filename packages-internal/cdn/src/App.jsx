import React, { startTransition, useDeferredValue, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { buildCrumbs, formatBytes, formatTimestamp, getContents, getFileKind } from './lib/contents';
import { cdnName } from './config';

function useDirectoryContents(prefix) {
  const [state, setState] = useState({
    status: 'loading',
    data: { folders: [], objects: [] },
    error: null,
  });

  useEffect(() => {
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
  }, [prefix]);

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

export default function App() {
  const [searchParams, setSearchParams] = useSearchParams();
  const prefix = searchParams.get('prefix') || '';
  const [query, setQuery] = useState('');
  const deferredQuery = useDeferredValue(query.trim().toLowerCase());
  const { status, data, error } = useDirectoryContents(prefix);
  const crumbs = buildCrumbs(prefix);

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
    startTransition(() => {
      if (nextPrefix) {
        setSearchParams({ prefix: nextPrefix });
      } else {
        setSearchParams({});
      }
    });
  }

  return (
    <div className="app-shell">
      <main className="page">
        <section className="hero">
          <p className="eyebrow">Internal package rebuild</p>
          <div className="hero-row">
            <div>
              <h1>{cdnName}</h1>
              <p className="hero-copy">
                A cleaner browser for the Stoked CDN with no AWS secrets in the client.
                Point it at a safe listing endpoint when infra is ready; use local mock data in the meantime.
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
          </div>
        </section>

        <section className="toolbar">
          <nav className="crumbs" aria-label="Breadcrumb">
            <button className="crumb root" type="button" onClick={() => openPrefix('')}>
              {cdnName}
            </button>
            {crumbs.map((crumb) => (
              <button
                key={crumb.path}
                className="crumb"
                type="button"
                onClick={() => openPrefix(crumb.path)}
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

        <section className="listing">
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

          {status === 'error' ? <p className="feedback error">{error.message}</p> : null}

          {status === 'loading' ? <p className="feedback">Loading directory contents...</p> : null}

          {status === 'success' && fileCount === 0 ? (
            <p className="feedback">{emptyMessage(prefix, deferredQuery)}</p>
          ) : null}

          {status === 'success' && filtered.folders.length > 0 ? (
            <div className="folder-grid">
              {filtered.folders.map((folder) => (
                <button
                  key={folder.path}
                  className="folder-card"
                  type="button"
                  onClick={() => openPrefix(folder.path)}
                >
                  <span className="folder-icon">[+]</span>
                  <span className="folder-name">{folder.name}</span>
                  <span className="folder-path">{folder.path}</span>
                </button>
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
                      <tr key={object.path}>
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
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : null}
        </section>
      </main>
    </div>
  );
}
