---
productId: media-api
title: Media API
githubLabel: 'Media API'
packageName: '@stoked-ui/media-api'
---

# Overview

<p class="description">Production-ready NestJS API for media management with CRUD operations, metadata extraction, thumbnail generation, and AWS Lambda deployment support.</p>

{{"component": "modules/components/ComponentLinkHeader"}}

## Introduction

`@stoked-ui/media-api` is a backend API service built with NestJS that provides complete media management capabilities. It serves as the backend for the `@stoked-ui/media` client-side package.

## Architecture

- **Framework**: NestJS with TypeScript
- **Database**: MongoDB via Mongoose
- **Storage**: AWS S3 for media files
- **Processing**: FFmpeg for video, Sharp for images
- **Documentation**: Swagger/OpenAPI auto-generated docs
- **Deployment**: AWS Lambda via Serverless or standalone Node.js

## Features

- **CRUD Operations** — Create, read, update, and delete media items
- **Metadata Extraction** — Automatic extraction of media metadata (dimensions, duration, codec, etc.)
- **Thumbnail Generation** — Auto-generate thumbnails for images and video keyframes
- **Resumable Uploads** — Multipart upload support for large files
- **Search & Filter** — Full-text search and metadata-based filtering
- **Social Features** — Like, share, and comment on media items

## Tech Stack

| Layer | Technology |
|-------|-----------|
| API Framework | NestJS |
| Database | MongoDB / Mongoose |
| Object Storage | AWS S3 |
| Video Processing | FFmpeg |
| Image Processing | Sharp |
| API Docs | Swagger / OpenAPI |
| Auth | JWT / Passport |
| Deployment | AWS Lambda / Docker |

## What's next

- See the [Quick Start](/media-api/docs/quick-start/) guide to set up the API
- Browse the [Endpoints](/media-api/docs/endpoints/) reference
- Learn about the [Upload API](/media-api/docs/upload-api/) for large file uploads
