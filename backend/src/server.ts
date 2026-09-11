import 'dotenv/config';
import { env } from './config/env.js';
import { buildApp } from './app.js';

const start = async (): Promise<void> => {
  try {
    const app = await buildApp();
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
        store: app.store.kind,
      },
      'Backend foundation started',
    );
  } catch (error) {
    console.error('Backend foundation failed to start', error);
    process.exit(1);
  }
};

void start();
