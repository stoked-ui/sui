# @stoked-ui/common

Shared utilities, hooks, client-safe interfaces, and small React primitives used across the Stoked UI package family.

This package is the foundation layer for the published `@stoked-ui/*` packages. It does not depend on other Stoked UI packages.

## Installation

```bash
pnpm add @stoked-ui/common
```

Peer dependencies:

```bash
pnpm add react@18.3.1 react-dom @mui/material @mui/system @mui/icons-material @emotion/react @emotion/styled
```

Runtime dependencies installed with the package include `@tempfix/idb` for IndexedDB access and `framer-motion` for `GrokLoader`.

## Quick Start

```tsx
import * as React from 'react';
import { FetchBackoff, LocalDb, UserMenu, namedId, useResize } from '@stoked-ui/common';

const id = namedId('media');
await FetchBackoff('/api/media', undefined, { retries: 3 });

function ResizeAwarePanel() {
  const ref = React.useRef<HTMLDivElement>(null);
  const size = useResize(ref);

  return (
    <div id={id} ref={ref}>
      {size.width} x {size.height}
      <UserMenu name="Stoked User" role="admin" onSignOut={() => {}} />
    </div>
  );
}

await LocalDb.init({
  type: 'application/stoked-ui-project',
  dbName: 'stoked-ui',
  stores: [],
  initializeStores: [],
  disabled: false,
});
```

## Primary Exports

- `LocalDb`, `VideoDb`, IndexedDB file/video request and record types.
- `MimeRegistry`, `SUIMime`, `IMimeType`, `getExtension`, and the extension-to-MIME registry.
- `createProviderState`, `createSettings`, `Flags`, and provider-state types.
- `namedId` and `useIncId`.
- `SortedList`, constructor helpers, `setProperty`, and `mergeWith`.
- `FetchBackoff`.
- `compositeColors`.
- Client-safe upload, publicity, and embed-visibility interfaces.
- `UserMenu`, `SocialLinks`, and `GrokLoader`.
- `useResize` and `useResizeWindow`.

## Integration Notes

- `LocalDb` is browser-oriented. Guard it from server-side execution in SSR apps.
- `UserMenu`, `SocialLinks`, and `GrokLoader` expect the MUI and Emotion peers to be available.
- The interfaces exported from `src/interfaces` are client-safe and are also reused by API packages.
- This package publishes from `build/`; source entry during workspace development is `src/index.tsx`.

## Local Development

```bash
pnpm --filter @stoked-ui/common build
pnpm --filter @stoked-ui/common typescript
pnpm --filter @stoked-ui/common test
pnpm --filter @stoked-ui/common dev
```

## Related Docs

- Repository package docs: `docs/pages/products/*/docs`
- Package source: `packages/sui-common/src`

## License

MIT
