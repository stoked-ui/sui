import * as mediaApi from './dist/lambda.js';

export const handler = (mediaApi as { handler: unknown }).handler;
