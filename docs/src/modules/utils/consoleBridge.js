const DEFAULT_ENDPOINT = '/api/logs';
const GLOBAL_STATE_KEY = '__stokedBrowserConsoleBridge__';
const CONSOLE_METHODS = ['log', 'info', 'warn', 'error', 'debug'];

function shouldForwardBrowserLogs() {
  return (
    process.env.NODE_ENV === 'development' ||
    process.env.NEXT_PUBLIC_FORWARD_BROWSER_LOGS === 'true'
  );
}

function serializeValue(value, depth = 0, seen = new WeakSet()) {
  if (value === null || value === undefined) {
    return value;
  }

  const valueType = typeof value;
  if (valueType === 'string' || valueType === 'number' || valueType === 'boolean') {
    return value;
  }

  if (valueType === 'bigint') {
    return `${value.toString()}n`;
  }

  if (valueType === 'symbol') {
    return value.toString();
  }

  if (valueType === 'function') {
    return `[Function${value.name ? `: ${value.name}` : ''}]`;
  }

  if (value instanceof Error) {
    return {
      name: value.name,
      message: value.message,
      stack: value.stack,
    };
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  if (Array.isArray(value)) {
    if (depth >= 2) {
      return '[Array]';
    }

    if (seen.has(value)) {
      return '[Circular]';
    }

    seen.add(value);
    return value.slice(0, 20).map((item) => serializeValue(item, depth + 1, seen));
  }

  if (valueType === 'object') {
    if (depth >= 2) {
      return `[${value.constructor?.name || 'Object'}]`;
    }

    if (seen.has(value)) {
      return '[Circular]';
    }

    seen.add(value);

    return Object.entries(value)
      .slice(0, 20)
      .reduce((serialized, [key, entry]) => {
        serialized[key] = serializeValue(entry, depth + 1, seen);
        return serialized;
      }, {});
  }

  return String(value);
}

function sendToBackend(endpoint, payload) {
  if (typeof navigator !== 'undefined' && typeof navigator.sendBeacon === 'function') {
    const body = new Blob([JSON.stringify(payload)], { type: 'application/json' });
    if (navigator.sendBeacon(endpoint, body)) {
      return;
    }
  }

  fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
    keepalive: true,
  }).catch(() => {});
}

export default function installBrowserConsoleBridge(options = {}) {
  const enabled = options.enabled ?? shouldForwardBrowserLogs();
  const endpoint = options.endpoint || DEFAULT_ENDPOINT;

  if (!enabled || typeof window === 'undefined' || !window.console) {
    return () => {};
  }

  const existing = window[GLOBAL_STATE_KEY];
  if (existing?.installed) {
    return existing.cleanup || (() => {});
  }

  const originalConsoleMethods = {};
  let active = true;

  const cleanup = () => {
    if (!active) {
      return;
    }

    active = false;

    CONSOLE_METHODS.forEach((method) => {
      if (originalConsoleMethods[method]) {
        window.console[method] = originalConsoleMethods[method];
      }
    });

    if (window[GLOBAL_STATE_KEY]?.cleanup === cleanup) {
      delete window[GLOBAL_STATE_KEY];
    }
  };

  CONSOLE_METHODS.forEach((method) => {
    const original =
      typeof window.console[method] === 'function'
        ? window.console[method].bind(window.console)
        : window.console.log.bind(window.console);

    originalConsoleMethods[method] = original;

    window.console[method] = (...args) => {
      original(...args);

      if (!active) {
        return;
      }

      try {
        sendToBackend(endpoint, {
          source: 'browser-console',
          level: method,
          href: window.location.href,
          pathname: window.location.pathname,
          timestamp: new Date().toISOString(),
          args: args.map((arg) => serializeValue(arg)),
        });
      } catch {
        // Never let logging failures break the app.
      }
    };
  });

  window[GLOBAL_STATE_KEY] = {
    installed: true,
    cleanup,
  };

  return cleanup;
}
