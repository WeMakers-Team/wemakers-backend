import { BadRequestException } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsString,
  Matches,
} from 'class-validator';

export class AuthCreateDto {
  @ApiProperty({ description: '이메일' })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({ description: '이름' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ description: '비밀번호' })
  @IsNotEmpty()
  @IsString()
  @Matches(/^[a-zA-Z0-9]*$/, {
    message: 'password only accepts english and number',
  })
  password: string;

  @ApiProperty({ description: '비밀번호 확인' })
  @Transform(({ value, obj }) => {
    if (value !== obj.password) {
      throw new BadRequestException('password mismatched.');
    }
    return value;
  })
  @IsNotEmpty()
  @IsString()
  checkPassword: string;

  @ApiProperty({ description: ' "MENTOR" or "MENTEE" ' })
  @IsNotEmpty()
  @IsEnum(Role, {
    message: 'type only accepts enum values',
  })
  role: Role;
}

export class AuthSignInDto {
  @ApiProperty({ description: '이메일' })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({ description: '비밀번호' })
  @IsNotEmpty()
  @IsString()
  password: string;
}

export class TokenDto {
  @ApiProperty({ description: 'refresh token' })
  @IsString()
  refreshToken: string;
}
