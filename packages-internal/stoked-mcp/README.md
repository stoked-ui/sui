# @stoked-ui/stoked-mcp

Unified MCP server for Stoked's Next API.

It exposes:
- Blog tools (`/api/blog*`)
- License/product tools (`/api/licenses*`)

## Requirements

- Node.js >= 20
- A running Next app with API routes under `/api`
- `STOKED_API_TOKEN` for authenticated blog operations

## Environment Variables

| Variable | Required | Description | Default |
| --- | --- | --- | --- |
| `STOKED_API_URL` | No | Base URL of Next API (no trailing slash) | `http://localhost:3000/api` |
| `STOKED_API_TOKEN` | No | Bearer token for authenticated blog endpoints | empty |

Compatibility aliases are also supported:
- `NEXT_API_URL` and `BLOG_API_URL` for URL fallback
- `BLOG_API_TOKEN` for token fallback

## Local Development

```sh
pnpm install
cd packages-internal/stoked-mcp
pnpm dev
```

## Build and Run

```sh
cd packages-internal/stoked-mcp
pnpm build
node dist/index.js
```

Or run with npm exec:

```sh
npx @stoked-ui/stoked-mcp
```

## Claude Desktop Example

```json
{
  "mcpServers": {
    "stoked-mcp": {
      "command": "npx",
      "args": ["-y", "@stoked-ui/stoked-mcp"],
      "env": {
        "STOKED_API_URL": "https://docs.stoked-ui.com/api",
        "STOKED_API_TOKEN": "YOUR_API_TOKEN"
      }
    }
  }
}
```

## Available Tools

- `create_blog_post`
- `update_blog_post`
- `get_blog_post`
- `list_blog_posts`
- `publish_blog_post`
- `unpublish_blog_post`
- `delete_blog_post`
- `list_tags`
- `list_authors`
- `list_license_products`
- `create_license_checkout`
- `activate_license`
- `validate_license`
- `deactivate_license`

## Notes

- `list_blog_posts` defaults to public listing (`/blog/public`).
- Set `includeDrafts: true` in `list_blog_posts` to use authenticated `/blog` listing.
- Blog write/publish/unpublish/delete operations require `STOKED_API_TOKEN`.

## Development Commands

```sh
pnpm type-check
pnpm test
```
