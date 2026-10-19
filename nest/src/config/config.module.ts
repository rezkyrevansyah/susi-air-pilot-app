import { Global, Injectable, Module } from '@nestjs/common';

@Injectable()
export class AppConfig {
  readonly jwtSecret: string;
  readonly port: number;
  readonly corsOrigins: string[];

  constructor() {
    const secret = process.env.JWT_SECRET;
    if (!secret || secret.trim().length < 32) {
      throw new Error('JWT_SECRET must contain at least 32 characters');
    }
    const port = process.env.PORT ?? '3001';
    if (!/^\d+$/.test(port) || Number(port) < 1 || Number(port) > 65535) {
      throw new Error('PORT must be an integer between 1 and 65535');
    }
    const origins = (process.env.CORS_ORIGINS ?? 'http://localhost:3000')
      .split(',')
      .map((origin) => origin.trim());
    for (const origin of origins) {
      let parsed: URL;
      try {
        parsed = new URL(origin);
      } catch {
        throw new Error(
          'CORS_ORIGINS must contain comma-separated HTTP(S) origins',
        );
      }
      if (
        !['http:', 'https:'].includes(parsed.protocol) ||
        parsed.origin !== origin
      ) {
        throw new Error(
          'CORS_ORIGINS must contain exact HTTP(S) origins without paths',
        );
      }
    }
    this.jwtSecret = secret;
    this.port = Number(port);
    this.corsOrigins = origins;
  }
}

@Global()
@Module({ providers: [AppConfig], exports: [AppConfig] })
export class ConfigModule {}
