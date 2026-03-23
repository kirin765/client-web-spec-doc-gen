// 예외 필터: 프로덕션 환경에서는 민감 정보 숨김
import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const isProduction = process.env.NODE_ENV === 'production';

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      if (typeof exceptionResponse === 'object') {
        const resp = exceptionResponse as any;
        message = resp.message || exception.message;
      } else {
        message = exception.message;
      }
    } else if (exception instanceof Error) {
      // 프로덕션: 민감 정보 숨김
      if (isProduction) {
        message = 'Internal server error';
      } else {
        message = exception.message;
      }
    }

    // 모든 에러는 로그에 상세 기록
    this.logger.error(
      `[${status}] ${exception instanceof Error ? exception.message : String(exception)}`,
      exception instanceof Error ? exception.stack : '',
    );

    response.status(status).json({
      statusCode: status,
      message,
      timestamp: new Date().toISOString(),
    });
  }
}


