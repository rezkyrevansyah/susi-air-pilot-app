import 'dotenv/config';
import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { AppConfig } from './config/config.module.js';
import { setupApp } from './setup-app.js';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  setupApp(app);
  await app.listen(app.get(AppConfig).port, '0.0.0.0');
}

void bootstrap().catch((error: unknown) => {
  Logger.error(
    error instanceof Error ? error.message : 'Startup failed',
    'Bootstrap',
  );
  process.exitCode = 1;
});
