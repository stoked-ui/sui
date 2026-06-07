# @stoked-ui/cdn

CDN browser component and API client for Stoked UI.

## Installation

```bash
npm install @stoked-ui/cdn
```

## Usage

```tsx
import { CdnBrowser, createCdnApi } from '@stoked-ui/cdn';

function MyApp() {
  return (
    <CdnBrowser
      apiBaseUrl="/api/cdn"
      publicBaseUrl="https://cdn.example.com"
    />
  );
}
```

## License

MIT
