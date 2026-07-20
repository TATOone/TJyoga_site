import 'dotenv/config';
import { env } from './config/env.js';
import { buildApp } from './app.js';

const start = async (): Promise<void> => {
  const app = await buildApp();

  try {
    await app.listen({
      host: env.HOST,
      port: env.PORT,
    });
    app.log.info(
      {
        event: 'backend_started',
        host: env.HOST,
        port: env.PORT,
        api_prefix: env.API_PREFIX,
      },
      'Backend foundation started',
    );
  } catch (error) {
    app.log.error({ error }, 'Backend foundation failed to start');
    process.exit(1);
  }
};

void start();
