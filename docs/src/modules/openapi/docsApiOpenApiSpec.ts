import { promises as fs } from 'fs';
import path from 'path';

type HttpMethod = 'get' | 'post' | 'put' | 'patch' | 'delete' | 'options' | 'head';

type OpenApiParameter = {
  in: 'path';
  name: string;
  required: true;
  schema: {
    type: 'string';
  };
  description: string;
};

type OpenApiResponse = {
  description: string;
};

type OpenApiOperation = {
  operationId: string;
  summary: string;
  tags: string[];
  parameters?: OpenApiParameter[];
  requestBody?: {
    required: true;
    content: {
      'application/json': {
        schema: {
          type: 'object';
          additionalProperties: boolean;
        };
      };
    };
  };
  responses: Record<string, OpenApiResponse>;
  security?: Array<Record<string, string[]>>;
  'x-source-file': string;
};

export type OpenApiDocument = {
  openapi: '3.0.3';
  info: {
    title: string;
    version: string;
    description: string;
  };
  servers?: Array<{ url: string }>;
  tags: Array<{ name: string }>;
  paths: Record<string, Partial<Record<HttpMethod, OpenApiOperation>>>;
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http';
        scheme: 'bearer';
        bearerFormat: 'JWT';
        description: string;
      };
    };
  };
};

const DOCS_API_ROOT = path.join(process.cwd(), process.cwd().endsWith('docs') ? 'pages/api' : 'docs/pages/api');
const CACHE_TTL_MS = 30_000;

const HTTP_METHODS: HttpMethod[] = ['get', 'post', 'put', 'patch', 'delete', 'options', 'head'];
const HTTP_METHOD_SET = new Set<HttpMethod>(HTTP_METHODS);
const METHOD_EQ_REGEX = /req\.method\s*===\s*['"`]([A-Z]+)['"`]/g;
const METHOD_NEQ_REGEX = /req\.method\s*!==\s*['"`]([A-Z]+)['"`]/g;
const STATUS_REGEX = /res\.status\((\d{3})\)/g;
const ROUTE_FILE_REGEX = /\.(ts|tsx|js|jsx)$/;

const STATUS_DESCRIPTIONS: Record<string, string> = {
  '200': 'OK',
  '201': 'Created',
  '204': 'No Content',
  '400': 'Bad Request',
  '401': 'Unauthorized',
  '403': 'Forbidden',
  '404': 'Not Found',
  '405': 'Method Not Allowed',
  '409': 'Conflict',
  '500': 'Internal Server Error',
};

let cachedSpec: OpenApiDocument | null = null;
let cachedUntil = 0;

function parseMethod(raw: string): HttpMethod | null {
  const normalized = raw.toLowerCase() as HttpMethod;
  return HTTP_METHOD_SET.has(normalized) ? normalized : null;
}

function inferMethods(source: string): HttpMethod[] {
  const strictMethods = new Set<HttpMethod>();
  let match: RegExpExecArray | null;

  while ((match = METHOD_EQ_REGEX.exec(source)) !== null) {
    const method = parseMethod(match[1]);
    if (method) {
      strictMethods.add(method);
    }
  }
  METHOD_EQ_REGEX.lastIndex = 0;

  if (strictMethods.size > 0) {
    return Array.from(strictMethods);
  }

  const guardedMethods = new Set<HttpMethod>();
  while ((match = METHOD_NEQ_REGEX.exec(source)) !== null) {
    const method = parseMethod(match[1]);
    if (method) {
      guardedMethods.add(method);
    }
  }
  METHOD_NEQ_REGEX.lastIndex = 0;

  if (guardedMethods.size === 1) {
    return Array.from(guardedMethods);
  }

  if (guardedMethods.size > 1) {
    return HTTP_METHODS.filter((method) => !guardedMethods.has(method));
  }

  return ['get'];
}

function inferStatusCodes(source: string): string[] {
  const statuses = new Set<string>();
  let match: RegExpExecArray | null;

  while ((match = STATUS_REGEX.exec(source)) !== null) {
    statuses.add(match[1]);
  }
  STATUS_REGEX.lastIndex = 0;

  if (statuses.size === 0) {
    statuses.add('200');
  }

  return Array.from(statuses).sort((a, b) => Number(a) - Number(b));
}

function inferSecuredMethods(source: string, methods: HttpMethod[]): Set<HttpMethod> {
  const secured = new Set<HttpMethod>();

  const wrappedWithAuth = /export\s+default\s+withAuth\(/.test(source);
  if (wrappedWithAuth) {
    methods.forEach((method) => secured.add(method));
    return secured;
  }

  if (source.includes('getOptionalAuthUser')) {
    methods.filter((method) => method !== 'get').forEach((method) => secured.add(method));
    return secured;
  }

  const checksAuthorizationHeader = /req\.headers\.authorization/.test(source) && /Bearer /.test(source);
  if (checksAuthorizationHeader) {
    methods.forEach((method) => secured.add(method));
  }

  return secured;
}

function toOpenApiPath(routeFile: string): string {
  const relativeRoute = path.relative(DOCS_API_ROOT, routeFile).replace(/\\/g, '/');
  const withoutExt = relativeRoute.replace(ROUTE_FILE_REGEX, '');
  const withoutIndex = withoutExt.replace(/\/index$/, '');

  const route = withoutIndex
    .split('/')
    .filter(Boolean)
    .map((segment) => {
      const optionalCatchAll = segment.match(/^\[\[\.\.\.(.+)\]\]$/);
      if (optionalCatchAll) {
        return `{${optionalCatchAll[1]}}`;
      }

      const catchAll = segment.match(/^\[\.\.\.(.+)\]$/);
      if (catchAll) {
        return `{${catchAll[1]}}`;
      }

      const dynamic = segment.match(/^\[(.+)\]$/);
      if (dynamic) {
        return `{${dynamic[1]}}`;
      }

      return segment;
    });

  if (route.length === 0) {
    return '/api';
  }

  return `/api/${route.join('/')}`;
}

function inferTag(openApiPath: string): string {
  const segments = openApiPath.split('/').filter(Boolean);
  return segments[1] || 'api';
}

function inferPathParameters(openApiPath: string): OpenApiParameter[] {
  const params = Array.from(openApiPath.matchAll(/\{([^}]+)\}/g)).map((match) => match[1]);
  return params.map((name) => ({
    in: 'path',
    name,
    required: true,
    schema: { type: 'string' },
    description: `${name} path parameter`,
  }));
}

function buildOperationId(method: HttpMethod, openApiPath: string): string {
  const normalizedPath = openApiPath.replace(/[{}]/g, '').replace(/^\/+/, '').replace(/\/+/g, '_');
  return `${method}_${normalizedPath}`;
}

function buildResponses(statusCodes: string[]): Record<string, OpenApiResponse> {
  return statusCodes.reduce<Record<string, OpenApiResponse>>((acc, code) => {
    acc[code] = {
      description: STATUS_DESCRIPTIONS[code] || `HTTP ${code}`,
    };
    return acc;
  }, {});
}

function shouldIncludeRequestBody(method: HttpMethod): boolean {
  return method === 'post' || method === 'put' || method === 'patch';
}

async function collectRouteFiles(dir: string): Promise<string[]> {
  const files: string[] = [];
  const entries = await fs.readdir(dir, { withFileTypes: true });

  for (const entry of entries) {
    const entryPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      files.push(...(await collectRouteFiles(entryPath)));
      continue;
    }

    if (entry.isFile() && ROUTE_FILE_REGEX.test(entry.name)) {
      files.push(entryPath);
    }
  }

  return files;
}

function buildServers(): Array<{ url: string }> | undefined {
  const explicitServer =
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.NEXT_PUBLIC_BASE_URL;

  if (!explicitServer) {
    return undefined;
  }

  return [{ url: explicitServer.replace(/\/$/, '') }];
}

export async function generateDocsApiOpenApiSpec(): Promise<OpenApiDocument> {
  console.log('OpenAPI: Using DOCS_API_ROOT:', DOCS_API_ROOT);
  const files = (await collectRouteFiles(DOCS_API_ROOT)).sort((a, b) => a.localeCompare(b));
  const paths: OpenApiDocument['paths'] = {};
  const tags = new Set<string>();

  for (const routeFile of files) {
    try {
      const source = await fs.readFile(routeFile, 'utf8');
      const methods = inferMethods(source);
      const statusCodes = inferStatusCodes(source);
      const securedMethods = inferSecuredMethods(source, methods);
      const openApiPath = toOpenApiPath(routeFile);
      const routeTag = inferTag(openApiPath);
      const pathParameters = inferPathParameters(openApiPath);
      const relativeSourcePath = path.relative(process.cwd(), routeFile).replace(/\\/g, '/');

      tags.add(routeTag);

      if (!paths[openApiPath]) {
        paths[openApiPath] = {};
      }

      for (const method of methods) {
        const operation: OpenApiOperation = {
          operationId: buildOperationId(method, openApiPath),
          summary: `${method.toUpperCase()} ${openApiPath}`,
          tags: [routeTag],
          responses: buildResponses(statusCodes),
          'x-source-file': relativeSourcePath,
        };

        if (pathParameters.length > 0) {
          operation.parameters = pathParameters;
        }

        if (shouldIncludeRequestBody(method)) {
          operation.requestBody = {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  additionalProperties: true,
                },
              },
            },
          };
        }

        if (securedMethods.has(method)) {
          operation.security = [{ bearerAuth: [] }];
        }

        paths[openApiPath][method] = operation;
      }
    } catch (err) {
      console.error(`OpenAPI generator failed on file: ${routeFile}`, err);
      // Continue to next file instead of crashing the whole spec
    }
  }

  const document: OpenApiDocument = {
    openapi: '3.0.3',
    info: {
      title: 'Stoked Docs API',
      version: process.env.npm_package_version || '0.0.0',
      description: 'Automatically generated from docs/pages/api route handlers.',
    },
    tags: Array.from(tags)
      .sort((a, b) => a.localeCompare(b))
      .map((name) => ({ name })),
    paths,
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Use Authorization: Bearer <JWT or sk_ API key>.',
        },
      },
    },
  };

  const servers = buildServers();
  if (servers) {
    document.servers = servers;
  }

  return document;
}

export async function getDocsApiOpenApiSpec(forceRefresh = false): Promise<OpenApiDocument> {
  const now = Date.now();

  if (!forceRefresh && cachedSpec && now < cachedUntil) {
    return cachedSpec;
  }

  const spec = await generateDocsApiOpenApiSpec();
  cachedSpec = spec;
  cachedUntil = now + CACHE_TTL_MS;

  return spec;
}
