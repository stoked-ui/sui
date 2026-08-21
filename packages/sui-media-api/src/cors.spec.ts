import { NestFactory } from '@nestjs/core';
import { Context } from 'aws-lambda';
import { Server } from './app';
import { handler } from './lambda.bootstrap';

jest.mock('./swagger.config', () => ({
  setupSwaggerUI: jest.fn(),
}));

const OWNED_PRODUCTION_ORIGINS = [
  'https://sui.stokd.cloud',
  'https://www.sui.stokd.cloud',
  'https://stoked-ui.com',
  'https://www.stoked-ui.com',
  'https://consulting.stokd.cloud',
  'https://www.consulting.stokd.cloud',
  'https://stokedconsulting.com',
  'https://www.stokedconsulting.com',
  'https://cdn.stokd.cloud',
  'https://cdn-sui.stokd.cloud',
  'https://cdn.consulting.stokd.cloud',
    'https://cdn.stokedconsulting.com',
    'https://cdn-sui.stokedconsulting.com',
    'https://brianstoker.com',
    'https://www.brianstoker.com',
  ];

type CorsResult = { error: Error | null; allowed?: boolean };
type CorsOptions = {
  credentials: boolean;
  origin: (
    origin: string | undefined,
    callback: (error: Error | null, allowed?: boolean) => void,
  ) => void;
};

function checkOrigin(corsOptions: CorsOptions, origin: string) {
  return new Promise<CorsResult>((resolve) => {
    corsOptions.origin(origin, (error, allowed) => resolve({ error, allowed }));
  });
}

function createFakeApp(enableCors: jest.Mock) {
  return {
    use: jest.fn(),
    get: jest.fn(() => ({ get: (_key: string, fallback: string) => fallback })),
    setGlobalPrefix: jest.fn(),
    enableCors,
    listen: jest.fn().mockResolvedValue(undefined),
  };
}

describe('Media API credentialed CORS', () => {
  const previousEnv = {
    NODE_ENV: process.env.NODE_ENV,
    SST_STAGE: process.env.SST_STAGE,
    ALLOWED_ORIGINS: process.env.ALLOWED_ORIGINS,
  };
  let corsOptions: CorsOptions;

  beforeAll(async () => {
    process.env.NODE_ENV = 'production';
    process.env.SST_STAGE = 'production';
    delete process.env.ALLOWED_ORIGINS;

    const enableCors = jest.fn();
    const fakeApp = createFakeApp(enableCors);

    jest.spyOn(NestFactory, 'create').mockResolvedValue(fakeApp as never);
    await new Server().start();
    corsOptions = enableCors.mock.calls[0][0] as CorsOptions;
  });

  afterAll(() => {
    jest.restoreAllMocks();
    for (const [key, value] of Object.entries(previousEnv)) {
      if (value === undefined) {
        delete process.env[key];
      } else {
        process.env[key] = value;
      }
    }
  });

  it('accepts every owned production origin with credentials enabled', async () => {
    const rejected: string[] = [];

    for (const origin of OWNED_PRODUCTION_ORIGINS) {
      const result = await checkOrigin(corsOptions, origin);
      if (result.error || result.allowed !== true) {
        rejected.push(origin);
      }
    }

    expect(corsOptions.credentials).toBe(true);
    expect(rejected).toEqual([]);
  });

  it('rejects an unknown production origin', async () => {
    const result = await checkOrigin(corsOptions, 'https://unknown.example.com');

    expect(result.allowed).not.toBe(true);
    expect(result.error).toBeInstanceOf(Error);
  });

  it('adds valid configured origins without replacing mandatory owned origins', async () => {
    process.env.ALLOWED_ORIGINS = 'https://extra.example.com/path,not-a-url';
    const enableCors = jest.fn();
    const fakeApp = createFakeApp(enableCors);
    (NestFactory.create as jest.Mock).mockResolvedValueOnce(fakeApp);

    try {
      await new Server().start();
      const configuredCors = enableCors.mock.calls[0][0] as CorsOptions;

      expect((await checkOrigin(configuredCors, 'https://extra.example.com')).allowed).toBe(true);
      expect((await checkOrigin(configuredCors, 'https://stokedconsulting.com')).allowed).toBe(
        true,
      );
    } finally {
      delete process.env.ALLOWED_ORIGINS;
    }
  });

  it('echoes an allowed Lambda preflight origin without wildcard credentials', async () => {
    const origin = 'https://stokedconsulting.com';
    const response = (await handler(
      {
        requestContext: { http: { method: 'OPTIONS' } },
        headers: { origin },
      },
      {} as Context,
      jest.fn(),
    )) as { statusCode: number; headers: Record<string, string> };

    expect(response.statusCode).toBe(200);
    expect(response.headers['Access-Control-Allow-Origin']).toBe(origin);
    expect(response.headers['Access-Control-Allow-Origin']).not.toBe('*');
    expect(response.headers['Access-Control-Allow-Credentials']).toBe('true');
  });

  it('denies an unknown Lambda preflight origin without an allow-origin header', async () => {
    const response = (await handler(
      {
        requestContext: { http: { method: 'OPTIONS' } },
        headers: { origin: 'https://unknown.example.com' },
      },
      {} as Context,
      jest.fn(),
    )) as { statusCode: number; headers: Record<string, string> };

    expect(response.statusCode).toBe(403);
    expect(response.headers['Access-Control-Allow-Origin']).toBeUndefined();
  });
});
