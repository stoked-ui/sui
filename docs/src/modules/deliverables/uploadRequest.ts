export type UploadRequestQuery = Record<string, string | string[] | undefined>;

export interface ResolvedUploadRequest {
  clientId?: string;
  clientSlug?: string;
  bundleId?: string;
  filePath?: string;
  contentType?: string;
  buffer: Buffer;
}

export function getSingleValue(value: string | string[] | undefined) {
  if (Array.isArray(value)) {
    return value[0];
  }
  return value;
}

export function normalizeContentType(contentType: string | string[] | undefined) {
  return (getSingleValue(contentType) || '').split(';')[0]?.trim().toLowerCase();
}

/**
 * Resolves the upload metadata and file bytes from a deliverables upload request.
 *
 * Two wire formats are supported:
 *
 * 1. Raw bytes (what the `stoked` CLI sends): the metadata rides in the query
 *    string and `Content-Type` describes the *uploaded file*, not the envelope.
 * 2. Legacy JSON envelope: no query metadata, and the body is a JSON object
 *    carrying the metadata plus the file as base64.
 *
 * The two are told apart by whether the query string carries a `clientId`, NOT
 * by `Content-Type`. A `.json` deliverable is uploaded raw with
 * `Content-Type: application/json`, so branching on the header alone would
 * parse the file's own contents as the envelope and lose the metadata.
 */
export function resolveUploadRequest(input: {
  contentType: string | string[] | undefined;
  query: UploadRequestQuery;
  rawBody: Buffer;
}): ResolvedUploadRequest {
  const { query, rawBody } = input;
  const normalizedRequestContentType = normalizeContentType(input.contentType);
  const queryClientId = getSingleValue(query.clientId);

  if (normalizedRequestContentType === 'application/json' && !queryClientId) {
    const body = JSON.parse(rawBody.toString('utf8')) as {
      clientId?: string;
      clientSlug?: string;
      bundleId?: string;
      filePath?: string;
      contentType?: string;
      file?: string;
    };

    return {
      clientId: body.clientId,
      clientSlug: body.clientSlug,
      bundleId: body.bundleId,
      filePath: body.filePath,
      contentType: body.contentType,
      buffer: typeof body.file === 'string' ? Buffer.from(body.file, 'base64') : Buffer.alloc(0),
    };
  }

  return {
    clientId: queryClientId,
    clientSlug: getSingleValue(query.clientSlug),
    bundleId: getSingleValue(query.bundleId),
    filePath: getSingleValue(query.filePath),
    contentType: normalizedRequestContentType || 'application/octet-stream',
    buffer: rawBody,
  };
}
