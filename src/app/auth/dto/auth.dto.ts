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
  @IsEmail() // email only accept Email Type
  email: string;

  @ApiProperty({ description: '이름' })
  @IsNotEmpty()
  @IsString() // Type only Stirng
  name: string;

  @ApiProperty({ description: '비밀번호' })
  @IsNotEmpty()
  @IsString()
  @Matches(/^[a-zA-Z0-9]*$/, {
    message: 'password only accepts english and number',
  })
  password: string;

  @Transform(({ value, obj }) => {
    if (value !== obj.password) {
      throw new BadRequestException('password mismatch.');
    }
    return value;
  })
  @IsNotEmpty()
  @IsString()
  checkPassword: string;

  @ApiProperty({ description: '멘토 혹은 멘티' })
  @IsNotEmpty()
  @IsEnum(Role, {
    message: 'Type only accepts enum values',
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
