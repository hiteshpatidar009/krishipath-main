import { app } from './app.js';
import { connectDatabase, disconnectDatabase } from './config/database.js';
import { env } from './config/env.js';
import { logger } from './config/logger.js';

async function start() {
  await connectDatabase();
  const server = app.listen(env.PORT, () => logger.info(`KrishiPath API listening on http://localhost:${env.PORT}${env.API_PREFIX}`));
  const shutdown = async (signal: string) => { logger.info(`${signal} received; shutting down`); server.close(async () => { await disconnectDatabase(); process.exit(0); }); };
  process.on('SIGTERM', () => void shutdown('SIGTERM'));
  process.on('SIGINT', () => void shutdown('SIGINT'));
}
start().catch((error) => { logger.error('Server failed to start', { error }); process.exit(1); });
