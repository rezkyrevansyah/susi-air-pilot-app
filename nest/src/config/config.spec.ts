import { AppConfig } from './config.module.js';

describe('AppConfig', () => {
  const original = { ...process.env };
  beforeEach(() => {
    process.env = {
      ...original,
      JWT_SECRET: 'test-secret-at-least-thirty-two-characters',
      PORT: '3001',
      CORS_ORIGINS: 'http://localhost:3000',
    };
  });
  afterEach(() => {
    process.env = { ...original };
  });

  it('refuses to start without a signing secret', () => {
    delete process.env.JWT_SECRET;
    expect(() => new AppConfig()).toThrow('JWT_SECRET');
  });

  it.each(['0', '65536', '3001x', '3.5'])('rejects port %s', (port) => {
    process.env.PORT = port;
    expect(() => new AppConfig()).toThrow('PORT');
  });

  it.each([
    '*',
    'https://app.example/path',
    'https://app.example/',
    'file:///tmp',
  ])('rejects CORS origin %s', (origin) => {
    process.env.CORS_ORIGINS = origin;
    expect(() => new AppConfig()).toThrow('CORS_ORIGINS');
  });

  it('accepts a comma-separated allowlist', () => {
    process.env.CORS_ORIGINS = 'http://localhost:3000, https://pilot.example';
    expect(new AppConfig().corsOrigins).toEqual([
      'http://localhost:3000',
      'https://pilot.example',
    ]);
  });
});
