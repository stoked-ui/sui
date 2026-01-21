// Lambda Bootstrap for Stoked UI Media API
import 'reflect-metadata'; // CRITICAL: Must be imported before any NestJS modules for DI to work
import serverlessExpress from '@codegenie/serverless-express';
import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import {
  APIGatewayProxyEvent,
  APIGatewayProxyEventV2WithRequestContext,
  Context,
  Handler,
} from 'aws-lambda';
import express from 'express';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';

const expressApp = express();
expressApp.use(cookieParser());

const { API_PATH_PREFIX } = process.env;

let server: Handler;

async function bootstrap() {
  const bootstrapStartTime = Date.now();

  try {
    const logger = new Logger('MediaAPI');

    const app = await NestFactory.create(
      AppModule,
      new ExpressAdapter(expressApp),
      {
        logger: ['error', 'warn', 'debug', 'log', 'verbose'],
        cors: {
          origin: true,
          methods: ['GET', 'POST', 'OPTIONS', 'PUT', 'PATCH', 'DELETE', 'HEAD'],
          allowedHeaders: [
            'Authorization',
            'Content-Type',
            'Accept',
            'Origin',
            'X-Requested-With',
            'Cookie',
          ],
          exposedHeaders: [
            'Content-Range',
            'Accept-Ranges',
            'Content-Encoding',
            'Content-Length',
          ],
          maxAge: 86400,
          credentials: true,
        },
      },
    );

    const apiVersion = API_PATH_PREFIX || '/v1';
    logger.log('API version: ' + apiVersion);
    app.setGlobalPrefix(apiVersion);

    await app.init();

    const serverlessExpressApp = serverlessExpress({
      app: expressApp,
      binarySettings: {
        contentTypes: [
          'image/*',
          'video/*',
          'audio/*',
          'application/octet-stream',
        ],
      },
    });

    const totalTime = Date.now() - bootstrapStartTime;
    logger.log(`Bootstrap completed in ${totalTime}ms`);

    return serverlessExpressApp;
  } catch (error) {
    const errorTime = Date.now() - bootstrapStartTime;
    console.error(`Bootstrap failed after ${errorTime}ms:`, error);
    throw error;
  }
}

export type EventType =
  | APIGatewayProxyEventV2WithRequestContext<Context>
  | APIGatewayProxyEvent
  | any;

export const handler: Handler = async (event: EventType, context: Context) => {
  const handlerStartTime = Date.now();

  // Handle OPTIONS and HEAD requests before bootstrap - CORS must always work
  const method = event.requestContext?.http?.method || event.httpMethod;

  if (method === 'OPTIONS' || method === 'HEAD') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods':
          'GET, POST, OPTIONS, PUT, PATCH, DELETE, HEAD',
        'Access-Control-Allow-Headers':
          'Authorization, Content-Type, Accept, Origin, X-Requested-With, Cookie',
        'Access-Control-Allow-Credentials': 'true',
        'Access-Control-Max-Age': '86400',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ok: true }),
    };
  }

  try {
    if (!server) {
      server = await bootstrap();
    }

    if (event.rawPath) {
      // Copy `rawPath` to `path` for aws-serverless-express
      event.path = event.rawPath;
    }

    return new Promise((resolve, reject) => {
      let callbackFired = false;

      // Add timeout to prevent Lambda from hanging
      const timeoutId = setTimeout(() => {
        if (!callbackFired) {
          const timeoutTime = Date.now() - handlerStartTime;
          reject(
            new Error(
              `Serverless-express timeout after ${timeoutTime}ms - callback never fired`,
            ),
          );
        }
      }, 19000); // 19 second timeout (1 second before Lambda timeout)

      try {
        const result = server(event, context, (error, result) => {
          callbackFired = true;
          clearTimeout(timeoutId);

          if (error) {
            reject(error);
          } else {
            resolve(result);
          }
        });

        // If server returns a promise, handle it
        if (result && typeof result.then === 'function') {
          result
            .then((promiseResult) => {
              if (!callbackFired) {
                callbackFired = true;
                clearTimeout(timeoutId);
                resolve(promiseResult);
              }
            })
            .catch((promiseError) => {
              if (!callbackFired) {
                callbackFired = true;
                clearTimeout(timeoutId);
                reject(promiseError);
              }
            });
        }
      } catch (syncError) {
        callbackFired = true;
        clearTimeout(timeoutId);
        reject(syncError);
      }
    });
  } catch (error) {
    const errorTime = Date.now() - handlerStartTime;
    console.error(`Handler failed after ${errorTime}ms:`, error);
    throw error;
  }
};
