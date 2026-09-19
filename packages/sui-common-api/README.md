# @stoked-ui/common-api

Server-side NestJS and Mongoose primitives shared by Stoked UI backend packages.

Use this package in API services that need the common schema decorators, MongoDB model definitions, upload DTOs, and backend-safe re-exports of shared visibility types.

## Installation

```bash
pnpm add @stoked-ui/common-api @stoked-ui/common
```

Peer dependency:

- `@stoked-ui/common`

Runtime dependencies include `@nestjs/common`, `@nestjs/mongoose`, `@nestjs/swagger`, `class-validator`, `mongoose`, and `lodash.clonedeep`.

## Quick Start

Register shared schemas in a NestJS module:

```ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MediaFeature, UploadSessionFeature } from '@stoked-ui/common-api';

@Module({
  imports: [MongooseModule.forFeature([MediaFeature, UploadSessionFeature])],
})
export class MediaDatabaseModule {}
```

Use the upload DTOs in a controller:

```ts
import { Body, Controller, Post } from '@nestjs/common';
import { InitiateUploadDto } from '@stoked-ui/common-api';

@Controller('uploads')
export class UploadsController {
  @Post('initiate')
  initiate(@Body() body: InitiateUploadDto) {
    return body;
  }
}
```

## Primary Exports

- Models and feature constants: `BaseModel`, `File`, `Image`, `Video`, `Media`, `UploadSession`, `BlogPost`, `Invoice`, `License`, `Product`, `Client`, `User`, their schemas, hydrated document types, and `*Feature` definitions.
- DTOs: `InitiateUploadDto`, `GetMoreUrlsDto`, `PartCompletionDto`, `PresignedUrlDto`, `InitiateUploadResponseDto`, `UploadStatusResponseDto`, `PartCompletionResponseDto`, `CompleteUploadResponseDto`, `ActiveUploadDto`, and `ActiveUploadsResponseDto`.
- Decorators: `StdSchema`, `DefaultSchemaOptions`, and `swapId`.
- Re-exported shared types: `PublicityType`, publicity helpers, `EmbedVisibilityType`, embed visibility helpers, and defaults from `@stoked-ui/common`.

## Integration Notes

- This is a backend-only package. Do not import it into browser bundles.
- The `*Feature` exports are designed for `MongooseModule.forFeature()`.
- `@StdSchema()` applies the common `_id` to `id` transform, timestamps, virtuals, and schema defaults.
- Upload DTOs define the multipart upload wire format used by media API upload controllers and clients.
- Changes to shared model fields affect downstream API services such as `@stoked-ui/media-api`.

## Local Development

```bash
pnpm --filter @stoked-ui/common-api build
pnpm --filter @stoked-ui/common-api typescript
pnpm --filter @stoked-ui/common-api dev
```

## Related Docs

- Media API package: `@stoked-ui/media-api`
- Source: `packages/sui-common-api/src`

## License

MIT
