import {
  BadRequestException,
  INestApplication,
  ValidationPipe,
} from '@nestjs/common';
import { AppConfig } from './config/config.module.js';

export function setupApp(app: INestApplication): void {
  const config = app.get(AppConfig);
  app.enableCors({
    origin: config.corsOrigins,
    methods: ['GET', 'POST'],
    allowedHeaders: ['Authorization', 'Content-Type'],
    credentials: false,
  });
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
      exceptionFactory: (errors) =>
        new BadRequestException({
          code: 'VALIDATION_ERROR',
          message: 'Request validation failed',
          details: errors.flatMap((error) =>
            Object.values(error.constraints ?? {}),
          ),
        }),
    }),
  );
  app.enableShutdownHooks();
}
