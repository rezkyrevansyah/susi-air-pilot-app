import { INestApplication, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module.js';
import { PILOT_ID } from '../src/auth/auth.service.js';
import { PilotService } from '../src/pilot/pilot.service.js';
import { setupApp } from '../src/setup-app.js';

describe('Pilot API (HTTP)', () => {
  let app: INestApplication;
  let token: string;
  const original = { ...process.env };
  const credentials = { username: 'johndoe', password: 'susiairtest' };
  const protectedPaths = [
    '/pilot/me',
    '/flight-hours?from=2026-05-15&to=2026-05-15',
    '/flight-hours/summary?range=1w',
    '/documents',
    '/schedules?year=2026&month=05',
  ];

  beforeAll(async () => {
    process.env.JWT_SECRET = 'http-test-secret-at-least-thirty-two-characters';
    process.env.CORS_ORIGINS = 'http://localhost:3000';
    process.env.PORT = '3001';
    const module = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = module.createNestApplication({ logger: false });
    setupApp(app);
    await app.init();
    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send(credentials)
      .expect(200);
    token = response.body.accessToken as string;
  });

  afterAll(async () => {
    await app?.close();
    process.env = { ...original };
  });

  it('issues an eight-hour token for the single pilot', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send(credentials)
      .expect(200);
    expect(response.body).toEqual({
      accessToken: expect.any(String),
      tokenType: 'Bearer',
      expiresIn: 28800,
    });
    const claims = app
      .get(JwtService)
      .verify<{ sub: string; exp: number; iat: number }>(
        response.body.accessToken,
      );
    expect(claims.sub).toBe(PILOT_ID);
    expect(claims.exp - claims.iat).toBe(28800);
  });

  it.each([
    { username: 'johndoe', password: 'wrong' },
    { username: 'unknown', password: 'susiairtest' },
  ])('uses the same error for incorrect credentials: %j', async (body) => {
    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send(body)
      .expect(401);
    expect(response.body).toEqual({
      statusCode: 401,
      code: 'INVALID_CREDENTIALS',
      message: 'Incorrect username or password',
    });
  });

  it.each(protectedPaths)('requires a token for %s', async (path) => {
    const response = await request(app.getHttpServer()).get(path).expect(401);
    expect(response.body.code).toBe('UNAUTHORIZED');
  });

  it.each([
    'malformed',
    'expired',
    'wrong-signature',
    'wrong-subject',
    'wrong-audience',
    'missing-expiry',
  ])('rejects a %s token', async (kind) => {
    const jwt = app.get(JwtService);
    const tokens: Record<string, string> = {
      malformed: 'broken.token.value',
      expired: jwt.sign({ sub: PILOT_ID }, { expiresIn: -1 }),
      'wrong-signature': new JwtService({ secret: 'another-secret' }).sign({
        sub: PILOT_ID,
      }),
      'wrong-subject': jwt.sign({ sub: 'someone-else' }),
      'wrong-audience': jwt.sign({ sub: PILOT_ID }, { audience: 'other-app' }),
      'missing-expiry': new JwtService({ secret: process.env.JWT_SECRET }).sign(
        { sub: PILOT_ID, iss: 'susi-air-pilot-api', aud: 'susi-air-pilot-app' },
      ),
    };
    await request(app.getHttpServer())
      .get('/pilot/me')
      .auth(tokens[kind]!, { type: 'bearer' })
      .expect(401);
  });

  it.each([
    {},
    { username: 'johndoe' },
    { username: 5, password: true },
    { ...credentials, role: 'admin' },
  ])('validates login payload %j', async (body) => {
    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send(body)
      .expect(400);
    expect(response.body).toMatchObject({
      statusCode: 400,
      code: 'VALIDATION_ERROR',
      message: expect.any(String),
      details: expect.any(Array),
    });
  });

  it('returns the profile without credentials and with a self-contained avatar', async () => {
    const { body } = await request(app.getHttpServer())
      .get('/pilot/me')
      .auth(token, { type: 'bearer' })
      .expect(200);
    expect(body).toEqual({
      name: 'John Doe',
      totalFlightHours: 1444.5,
      avatarUrl: expect.stringMatching(/^data:image\/svg\+xml;base64,/),
    });
  });

  it('returns an inclusive daily range including zero-hour records', async () => {
    const { body } = await request(app.getHttpServer())
      .get('/flight-hours?from=2024-12-27&to=2024-12-28')
      .auth(token, { type: 'bearer' })
      .expect(200);
    expect(body.days).toEqual([
      { date: '2024-12-27', hours: 5.7 },
      { date: '2024-12-28', hours: 0 },
    ]);
    const empty = await request(app.getHttpServer())
      .get('/flight-hours?from=2030-01-01&to=2030-01-02')
      .auth(token, { type: 'bearer' })
      .expect(200);
    expect(empty.body.days).toEqual([]);
  });

  it.each([
    '/flight-hours',
    '/flight-hours?from=2026-02-30&to=2026-05-15',
    '/flight-hours?from=2026-05-16&to=2026-05-15',
    '/flight-hours?from=2026-05-15T00:00:00Z&to=2026-05-16',
    '/flight-hours?from=2026-05-15&from=2026-05-16&to=2026-05-17',
    '/flight-hours/summary?range=2w',
    '/flight-hours/summary?range=',
    '/flight-hours/summary?range=1w&unexpected=1',
    '/schedules',
    '/schedules?year=26&month=05',
    '/schedules?year=2026&month=00',
    '/schedules?year=2026&month=13',
    '/schedules?year=2026&month=5',
  ])('rejects invalid query: %s', async (path) => {
    const { body } = await request(app.getHttpServer())
      .get(path)
      .auth(token, { type: 'bearer' })
      .expect(400);
    expect(body).toMatchObject({
      statusCode: 400,
      code: 'VALIDATION_ERROR',
      message: expect.any(String),
    });
    expect(body).not.toHaveProperty('stack');
  });

  it.each([
    ['1w', 7, 40, 45],
    ['1m', 30, 100, 125],
    ['3m', 90, 300, 325],
    ['6m', 180, 600, 625],
    ['1y', 365, 1050, 1200],
  ])(
    'returns the chart contract for %s',
    async (range, windowDays, limit, yMax) => {
      const { body } = await request(app.getHttpServer())
        .get(`/flight-hours/summary?range=${range}`)
        .auth(token, { type: 'bearer' })
        .expect(200);
      expect(body).toMatchObject({
        asOf: '2026-05-15',
        range,
        chart: { windowDays, limit, yMax },
      });
      expect(body.cards).toHaveLength(4);
      expect(body.chart.points).toHaveLength(15);
      expect(body.chart.points[7].date).toBe('2026-05-15');
    },
  );

  it('defaults to the weekly chart', async () => {
    const { body } = await request(app.getHttpServer())
      .get('/flight-hours/summary')
      .auth(token, { type: 'bearer' })
      .expect(200);
    expect(body.range).toBe('1w');
  });

  it('returns document badge states from the backend', async () => {
    const { body } = await request(app.getHttpServer())
      .get('/documents')
      .auth(token, { type: 'bearer' })
      .expect(200);
    expect(body.documents).toHaveLength(5);
    expect(body.documents[2]).toMatchObject({
      id: 'doc_license',
      daysRemaining: 14,
      status: 'soon',
    });
  });

  it('returns the selected month, source colors, and an empty month with a legend', async () => {
    const may = await request(app.getHttpServer())
      .get('/schedules?year=2026&month=05')
      .auth(token, { type: 'bearer' })
      .expect(200);
    expect(may.body.schedules).toHaveLength(21);
    expect(may.body.legend).toHaveLength(10);
    const june = await request(app.getHttpServer())
      .get('/schedules?year=2026&month=06')
      .auth(token, { type: 'bearer' })
      .expect(200);
    expect(june.body.schedules).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          duty_date: '2026-06-04',
          duty_type: 'TRX',
          base_color: '#FBA577',
        }),
      ]),
    );
    const july = await request(app.getHttpServer())
      .get('/schedules?year=2026&month=07')
      .auth(token, { type: 'bearer' })
      .expect(200);
    expect(july.body).toMatchObject({ year: 2026, month: 7, schedules: [] });
    expect(july.body.legend).toHaveLength(10);
  });

  it('only sends CORS permission to configured browser origins', async () => {
    const allowed = await request(app.getHttpServer())
      .options('/documents')
      .set('Origin', 'http://localhost:3000')
      .set('Access-Control-Request-Method', 'GET')
      .expect(204);
    expect(allowed.headers['access-control-allow-origin']).toBe(
      'http://localhost:3000',
    );
    const blocked = await request(app.getHttpServer())
      .options('/documents')
      .set('Origin', 'https://unlisted.example')
      .set('Access-Control-Request-Method', 'GET');
    expect(blocked.headers['access-control-allow-origin']).toBeUndefined();
  });

  it('normalizes malformed JSON and unknown routes', async () => {
    const malformed = await request(app.getHttpServer())
      .post('/auth/login')
      .set('Content-Type', 'application/json')
      .send('{')
      .expect(400);
    expect(malformed.body).toMatchObject({
      statusCode: 400,
      code: expect.any(String),
      message: expect.any(String),
    });
    const missing = await request(app.getHttpServer())
      .get('/missing')
      .expect(404);
    expect(missing.body).toMatchObject({ statusCode: 404, code: 'NOT_FOUND' });
  });

  it('hides internal exception details', async () => {
    const log = vi
      .spyOn(Logger.prototype, 'error')
      .mockImplementation(() => undefined);
    const profile = vi
      .spyOn(app.get(PilotService), 'getProfile')
      .mockImplementationOnce(() => {
        throw new Error('private internal detail');
      });
    try {
      const { body } = await request(app.getHttpServer())
        .get('/pilot/me')
        .auth(token, { type: 'bearer' })
        .expect(500);
      expect(body).toEqual({
        statusCode: 500,
        code: 'INTERNAL_ERROR',
        message: 'An unexpected error occurred',
      });
    } finally {
      profile.mockRestore();
      log.mockRestore();
    }
  });
});
