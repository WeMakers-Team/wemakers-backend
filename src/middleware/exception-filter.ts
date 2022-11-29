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
    console.error(exception);
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();

    if (!(exception instanceof HttpException)) {
      exception = new InternalServerErrorException();
    }

    const statusCode = (exception as HttpException).getStatus();
    const response = (exception as HttpException).getResponse();
    const errorRes = response?.['stack'] ? response?.['response'] : response;

    const log = {
      statusCode,
      message: errorRes?.['message'],
      code: errorRes?.['code'],
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
