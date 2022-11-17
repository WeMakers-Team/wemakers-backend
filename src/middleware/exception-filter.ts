import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { Response } from 'express';
import { exceptionMessagesAuth } from '../exceptionMessage';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: Error, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();

    if (!(exception instanceof HttpException)) {
      exception = new InternalServerErrorException();
    }

    const statusCode = (exception as HttpException).getStatus();
    const response = (exception as HttpException).getResponse();
    const log = {
      statusCode,
      message: response['message'],
      code: response['code'],
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
