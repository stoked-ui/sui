# @stoked-ui/blog-mcp

MCP (Model Context Protocol) server that exposes blog CRUD operations as tools,
enabling AI agents to author and manage blog posts programmatically.

## Overview

`@stoked-ui/blog-mcp` connects to the `@stoked-ui/media-api` Blog REST API over
HTTP and exposes each operation as an MCP tool.  Claude (or any other MCP client)
can use these tools to create, read, update, publish, and delete blog posts without
leaving the AI conversation context.

---

## Requirements

- Node.js >= 20
- Access to a running instance of `@stoked-ui/media-api` (local or production)
- A valid `BLOG_API_TOKEN` (Bearer token) for authenticated operations

---

## Environment Variables

| Variable        | Required | Description                                                  | Example                          |
|-----------------|----------|--------------------------------------------------------------|----------------------------------|
| `BLOG_API_URL`  | Yes      | Base URL of the Blog API (no trailing slash)                 | `https://api.stoked-ui.com/v1`   |
| `BLOG_API_TOKEN`| Yes      | Bearer token sent as `Authorization: Bearer <token>`        | `eyJhbGci...`                    |

Copy `.env.example` to `.env` and fill in the values:

```sh
cp .env.example .env
# edit .env
```

---

## Running the Server

### Local Development

```sh
# Install dependencies (from monorepo root)
pnpm install

# Run with ts-node (no build step)
cd packages/sui-blog-mcp
pnpm dev
```

### Production (after build)

```sh
# Build
cd packages/sui-blog-mcp
pnpm build

# Run the compiled binary
node dist/index.js
```

Or use the bin alias registered in `package.json`:

```sh
npx @stoked-ui/blog-mcp
```

---

## Claude Desktop Configuration

Add the following entry to your `claude_desktop_config.json` to enable the
`blog-mcp` tools inside Claude Desktop.

File location:
- **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`
- **Linux**: `~/.config/Claude/claude_desktop_config.json`

### Using npx (recommended — no local install required)

```json
{
  "mcpServers": {
    "blog-mcp": {
      "command": "npx",
      "args": ["-y", "@stoked-ui/blog-mcp"],
      "env": {
        "BLOG_API_URL": "https://api.stoked-ui.com/v1",
        "BLOG_API_TOKEN": "YOUR_BLOG_API_TOKEN_HERE"
      }
    }
  }
}
```

### Using a local checkout

```json
{
  "mcpServers": {
    "blog-mcp": {
      "command": "node",
      "args": ["/absolute/path/to/stoked-ui/packages/sui-blog-mcp/dist/index.js"],
      "env": {
        "BLOG_API_URL": "https://api.stoked-ui.com/v1",
        "BLOG_API_TOKEN": "YOUR_BLOG_API_TOKEN_HERE"
      }
    }
  }
}
```

After saving `claude_desktop_config.json`, restart Claude Desktop.  You should
see the blog tools listed under "Available Tools" in the MCP panel.

---

## Available Tools

| Tool Name           | Description                                                                              |
|---------------------|------------------------------------------------------------------------------------------|
| `create_blog_post`  | Create a new draft blog post. Returns the created post with its generated slug and ID.  |
| `update_blog_post`  | Update fields of an existing blog post by slug. Only provided fields are changed.       |
| `get_blog_post`     | Retrieve a single blog post by its URL slug.                                            |
| `list_blog_posts`   | List and filter blog posts with pagination. Returns paginated results with total count. |
| `publish_blog_post` | Publish a draft blog post (sets status to `published`).                                 |
| `unpublish_blog_post`| Revert a published post back to `draft` status.                                        |
| `delete_blog_post`  | Soft-delete a blog post by slug.                                                        |
| `list_tags`         | Get all tags used in published posts with per-tag post counts.                          |
| `list_authors`      | Get all authors who have published posts with per-author post counts.                   |

### Tool Details

#### `create_blog_post`

| Parameter      | Type       | Required | Description                                                        |
|----------------|------------|----------|--------------------------------------------------------------------|
| `title`        | `string`   | Yes      | Blog post title                                                    |
| `body`         | `string`   | Yes      | Full post body (Markdown supported)                                |
| `description`  | `string`   | Yes      | Short excerpt shown in listings                                    |
| `tags`         | `string[]` | Yes      | Tags for categorizing the post                                     |
| `authors`      | `string[]` | Yes      | Author identifiers (emails or usernames)                           |
| `targetSites`  | `string[]` | No       | Sites this post should appear on (default: `["stoked-ui.com"]`)   |
| `image`        | `string`   | No       | Cover image URL                                                    |
| `slug`         | `string`   | No       | URL slug (auto-generated from title if omitted)                    |
| `date`         | `string`   | No       | Publication date in ISO 8601 format                                |

#### `update_blog_post`

| Parameter      | Type       | Required | Description                         |
|----------------|------------|----------|-------------------------------------|
| `slug`         | `string`   | Yes      | URL slug of the post to update      |
| `title`        | `string`   | No       | New title                           |
| `body`         | `string`   | No       | New body content                    |
| `description`  | `string`   | No       | New description / excerpt           |
| `tags`         | `string[]` | No       | Replacement tag list                |
| `authors`      | `string[]` | No       | Replacement author list             |
| `targetSites`  | `string[]` | No       | Replacement target sites list       |
| `image`        | `string`   | No       | New cover image URL                 |
| `date`         | `string`   | No       | New publication date (ISO 8601)     |

#### `list_blog_posts`

| Parameter  | Type     | Required | Description                                      |
|------------|----------|----------|--------------------------------------------------|
| `page`     | `number` | No       | Page number (1-based, default: 1)                |
| `limit`    | `number` | No       | Posts per page (default: 20)                     |
| `status`   | `string` | No       | Filter by status: `draft`, `published`, `archived` |
| `tag`      | `string` | No       | Filter by a specific tag                         |
| `author`   | `string` | No       | Filter by author identifier                      |
| `search`   | `string` | No       | Full-text search across title, description, tags |
| `site`     | `string` | No       | Filter by target site                            |

---

## Authentication

All write operations (`create_blog_post`, `update_blog_post`, `publish_blog_post`,
`unpublish_blog_post`, `delete_blog_post`) require a valid `BLOG_API_TOKEN`.

Read operations (`get_blog_post`, `list_blog_posts`, `list_tags`, `list_authors`)
are available without authentication for published posts.  Fetching draft posts
requires a token.

The token is forwarded as an HTTP `Authorization: Bearer <token>` header on every
request.  Obtain a token by logging in via the `/v1/auth/login` endpoint of
`@stoked-ui/media-api`.

---

## Development

```sh
# Type-check without building
pnpm type-check

# Run unit tests
pnpm test

# Run tests with coverage
pnpm test:cov
```

---

## License

MIT — see the root `LICENSE` file.
