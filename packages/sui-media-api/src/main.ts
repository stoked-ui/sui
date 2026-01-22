import * as dotenv from 'dotenv';
import { Server } from './app';

dotenv.config();

// Disable noisy console output in production (keep warn/error)
if (
  process.env.NODE_ENV === 'production' ||
  process.env.SST_STAGE === 'production' ||
  process.env.SST_STAGE === 'prod'
) {
  console.log = () => {};
  console.info = () => {};
  console.debug = () => {};
  console.trace = () => {};
}

async function bootstrap() {
  const server = new Server();
  return await server.start();
}

bootstrap();
