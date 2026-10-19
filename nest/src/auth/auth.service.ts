import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from './login.dto.js';

export const PILOT_ID = 'pilot-john-doe';
export const TOKEN_LIFETIME_SECONDS = 8 * 60 * 60;

@Injectable()
export class AuthService {
  constructor(private readonly jwt: JwtService) {}

  async login({ username, password }: LoginDto) {
    if (username !== 'johndoe' || password !== 'susiairtest') {
      throw new UnauthorizedException({
        code: 'INVALID_CREDENTIALS',
        message: 'Incorrect username or password',
      });
    }
    return {
      accessToken: await this.jwt.signAsync({ sub: PILOT_ID }),
      tokenType: 'Bearer',
      expiresIn: TOKEN_LIFETIME_SECONDS,
    };
  }
}
