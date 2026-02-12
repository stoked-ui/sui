---
productId: media-api
title: Quick Start
githubLabel: 'Quick Start'
packageName: '@stoked-ui/media-api'
---

# Quick Start

<p class="description">Get the Media API running locally in minutes.</p>

{{"component": "modules/components/ComponentLinkHeader"}}

## Prerequisites

- Node.js 18+
- MongoDB instance (local or Atlas)
- AWS S3 bucket (for file storage)
- FFmpeg installed on the system

## Installation

```bash
git clone https://github.com/stoked-ui/stoked-ui.git
cd stoked-ui/packages/sui-media-api
pnpm install
```

## Configuration

Create a `.env` file in the package root:

```env
# MongoDB
MONGODB_URI=mongodb://localhost:27017/stoked-media

# AWS S3
AWS_REGION=us-east-1
AWS_S3_BUCKET=your-media-bucket
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key

# JWT
JWT_SECRET=your-jwt-secret

# Server
PORT=3001
```

## Running the API

```bash
# Development mode with hot reload
pnpm dev

# Production build
pnpm build
pnpm start
```

## Verify it works

Once running, visit the Swagger documentation:

```
http://localhost:3001/api/docs
```

## First request

```bash
# Health check
curl http://localhost:3001/api/health

# List media items (requires auth token)
curl -H "Authorization: Bearer <token>" http://localhost:3001/api/media
```

## Connecting the client

Use `@stoked-ui/media` on the frontend to communicate with this API:

```tsx
import { useMediaList } from '@stoked-ui/media';

function MediaLibrary() {
  const { data } = useMediaList({ page: 1, limit: 20 });
  return <div>{data?.items.map(item => <p key={item.id}>{item.title}</p>)}</div>;
}
```
