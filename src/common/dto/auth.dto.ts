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

export class AuthCreateDto {
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  @Matches(/^[a-zA-Z0-9]*$/, {
    message: 'password only accepts english and number',
  })
  password: string;

  @Transform(({ value, obj }) => {
    if (value !== obj.password) {
      throw new BadRequestException('password mismatched');
    }
    return value;
  })
  @IsNotEmpty()
  @IsString()
  checkPassword: string;

  @IsNotEmpty()
  @IsEnum(Role, {
    message: 'type only accepts enum values',
  })
  role: Role;
}

export class SignInDto extends PickType(AuthCreateDto, [
  'email',
  'password',
] as const) {}

export class UserIdentifier {
  @IsNumber()
  @IsNotEmpty()
  userId: number;
}

export class UserInfoToCreateToken extends UserIdentifier {
  @IsEnum(Role, {
    message: 'type only accepts enum values',
  })
  role: Role;
}

export class DataToHash {
  @IsString()
  @IsNotEmpty()
  dataNeedTohash: string;
}

export class DataToCompare extends DataToHash {
  @IsString()
  @IsNotEmpty()
  hashedData: string;
}
