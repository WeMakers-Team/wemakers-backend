import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { Response } from 'express';
import * as exceptionMessagesAuth from '../common/exceptionMessage/exception-message-auth.json';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: Error, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();

    if (!(exception instanceof HttpException)) {
      exception = new InternalServerErrorException();
    }

    const statusCode = (exception as HttpException).getStatus();
    const response = (exception as HttpException).getResponse()?.['response'];

    const log = {
      statusCode,
      message: response?.['message'] || '정의되지 않은 Error Message',
      code: response?.['code'] || '정의되지 않은 Error Code',
    };

    res.status(statusCode).json(log);
  }
}

@Catch(UnauthorizedException)
export class JwtexceptionFilter implements ExceptionFilter {
  catch(exception: UnauthorizedException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();
    const statusCode = exception.getStatus();

    const errorMessage = exceptionMessagesAuth.UNVERIFIED_TOKEN;
    const log = {
      statusCode,
      message: errorMessage['message'],
      code: errorMessage['code'],
    };

    res.status(statusCode).json(log);
  }
}
