import {
  HttpException,
  ValidationError,
  ValidationPipe as NestValidationPipe,
} from '@nestjs/common';
import { HttpErrorByCode } from '@nestjs/common/utils/http-error-by-code.util';

export class CustomValidationPipe extends NestValidationPipe {
  public createExceptionFactory() {
    return (validationErrors: ValidationError[] = []) => {
      if (this.isDetailedOutputDisabled) {
        return new HttpErrorByCode[this.errorHttpStatusCode]();
      }

      const errors = this.getExceptionObj(validationErrors);
      return new HttpException(errors, 400);
    };
  }

  protected getExceptionObj(validationErrors: ValidationError[]) {
    const error = validationErrors[0];

    // get code
    const errorCode = error.contexts;
    const key = errorCode ? Object.keys(errorCode)[0] : undefined;
    const code = errorCode?.[key]['code'];

    if (!code) {
      throw new HttpException(
        {
          message: 'error code가 정의되지 않았습니다.',
          code: 'NOT_VALIDATION_ERROR_CODE',
        },
        400,
      );
    }

    // get message
    const message = error.constraints?.[key];

    return {
      code,
      message,
    };
  }
}
