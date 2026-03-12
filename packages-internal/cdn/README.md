# Internal CDN

This package is a rebuilt source version of the currently deployed `cdn.stokedconsulting.com` app. The deployed site exposed AWS credentials in client-side JavaScript; this package removes that pattern and expects one of these safer data sources instead:

- `VITE_CDN_CONTENTS_URL` pointing to a JSON or S3-XML listing endpoint
- local mock data for UI iteration

The asset URLs still point at `https://cdn.stokedconsulting.com`, so existing references to bucket-hosted files remain valid.

## Local development

```bash
pnpm install
pnpm --filter @stoked-ui/internal-cdn dev
```

Create `packages-internal/cdn/.env.local` if you want to point at a real listing endpoint:

```bash
VITE_CDN_NAME=Stoked CDN
VITE_CDN_PUBLIC_BASE_URL=https://cdn.stokedconsulting.com
VITE_CDN_CONTENTS_URL=http://localhost:5199/api/cdn/contents/
```

The docs app now exposes `GET /api/cdn/contents/`, which lists the same bucket server-side.

## Expected endpoint shapes

JSON:

```json
{
  "folders": [{ "name": "products/", "path": "products/", "url": "/?prefix=products/" }],
  "objects": [
    {
      "name": "main.js",
      "path": "main.js",
      "size": 673308,
      "lastModified": "2024-05-07T00:58:49.000Z",
      "url": "https://cdn.stokedconsulting.com/main.js"
    }
  ]
}
```

S3 XML:

- `ListBucketResult` with `CommonPrefixes` and `Contents`
- queried with `prefix` and `delimiter=/`
