import { BadRequestException } from '@nestjs/common';
import { PickType } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsString,
  Matches,
} from 'class-validator';
import { exceptionMessagesAuth } from '../exceptionMessage';

export class AuthCreateDto {
  @IsNotEmpty({
    context: {
      code: 'EMPTY_EMAIL',
    },
  })
  @IsEmail(
    {},
    {
      context: {
        code: 'MUST_EMAIL_TYPE',
      },
    },
  )
  email: string;

  @IsNotEmpty({
    context: {
      code: 'EMPTY_NAME',
    },
  })
  @IsString({
    context: {
      code: 'MUST_STRING_TYPE',
    },
  })
  name: string;

  @IsNotEmpty({
    context: {
      code: 'EMPTY_PASSWORD',
    },
  })
  @IsString({
    context: {
      code: 'MUST_STRING_TYPE',
    },
  })
  @Matches(/^[a-zA-Z0-9]*$/, {
    message: 'password only accepts english and number',
    context: {
      code: 'ONLY_ENGLISH_OR_NUMBER',
    },
  })
  password: string;

  @Transform(({ value, obj }) => {
    if (value !== obj.password) {
      throw new BadRequestException(
        exceptionMessagesAuth.PASSWORD_DOES_NOT_MATCH,
      );
    }
    return value;
  })
  @IsNotEmpty({
    context: {
      code: 'EMPTY_CHECKPASSWORD',
    },
  })
  @IsString({
    context: {
      code: 'MUST_STRING_TYPE',
    },
  })
  checkPassword: string;

  @IsNotEmpty({
    context: {
      code: 'EMPTY_ROLE',
    },
  })
  @IsEnum(Role, {
    message: 'type only accepts enum values - "MENTOR" or "MENTEE"',
    context: {
      code: 'MUST_MENTEE_OR_MENTOR',
    },
  })
  role: Role;
}

export class SignInDto extends PickType(AuthCreateDto, [
  'email',
  'password',
] as const) {}

export class UserIdentifier {
  @IsNumber(
    {},
    {
      context: {
        code: 'MUST_NUMBER_TYPE',
      },
    },
  )
  @IsNotEmpty({
    context: {
      code: 'EMPTY_USER_ID',
    },
  })
  userId: number;
}

export class UserInfoToCreateToken extends UserIdentifier {
  @IsEnum(Role, {
    message: 'type only accepts enum values - "MENTOR" or "MENTEE"',
    context: {
      code: 'MUST_MENTEE_OR_MENTOR',
    },
  })
  role: Role;
}
