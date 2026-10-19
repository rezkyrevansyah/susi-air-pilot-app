import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class ApiExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(ApiExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const response = host.switchToHttp().getResponse<Response>();
    const statusCode =
      exception instanceof HttpException ? exception.getStatus() : 500;
    const payload =
      exception instanceof HttpException ? exception.getResponse() : null;
    const body =
      typeof payload === 'object' && payload !== null
        ? (payload as Record<string, unknown>)
        : {};
    const codes: Record<number, string> = {
      400: 'BAD_REQUEST',
      401: 'UNAUTHORIZED',
      403: 'FORBIDDEN',
      404: 'NOT_FOUND',
      413: 'PAYLOAD_TOO_LARGE',
    };
    if (statusCode >= 500) {
      this.logger.error(
        exception instanceof Error ? exception.stack : 'Unexpected error',
      );
    }
    response.status(statusCode).json({
      statusCode,
      code:
        statusCode >= 500
          ? 'INTERNAL_ERROR'
          : (body.code ?? codes[statusCode] ?? 'HTTP_ERROR'),
      message:
        statusCode >= 500
          ? 'An unexpected error occurred'
          : (body.message ??
            (typeof payload === 'string' ? payload : 'Request failed')),
      ...(statusCode < 500 && body.details ? { details: body.details } : {}),
    });
  }
}
