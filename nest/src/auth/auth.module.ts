import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { AppConfig } from '../config/config.module.js';
import { AuthController } from './auth.controller.js';
import { AuthGuard } from './auth.guard.js';
import { AuthService, TOKEN_LIFETIME_SECONDS } from './auth.service.js';

@Module({
  imports: [
    JwtModule.registerAsync({
      inject: [AppConfig],
      useFactory: (config: AppConfig) => ({
        secret: config.jwtSecret,
        signOptions: {
          expiresIn: TOKEN_LIFETIME_SECONDS,
          algorithm: 'HS256',
          issuer: 'susi-air-pilot-api',
          audience: 'susi-air-pilot-app',
        },
        verifyOptions: {
          algorithms: ['HS256'],
          issuer: 'susi-air-pilot-api',
          audience: 'susi-air-pilot-app',
        },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, { provide: APP_GUARD, useClass: AuthGuard }],
})
export class AuthModule {}
