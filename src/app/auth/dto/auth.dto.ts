import { ApiProperty } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { IsEmail, IsEnum, IsString, Matches } from 'class-validator';

export class AuthCreateDto {
  @ApiProperty({ description: '이메일' })
  @IsString()
  @IsEmail() // email onyl accept Email Type
  email: string;

  @ApiProperty({ description: '이름' })
  @IsString() // Type only Stirng
  name: string;

  @ApiProperty({ description: '생일' })
  birthDay: Date;

  @ApiProperty({ description: '멘토 혹은 멘티' })
  @IsEnum(Role, {
    message: 'Type only accepts enum values',
  })
  role: Role;

  @ApiProperty({ description: '비밀번호' })
  @IsString()
  @Matches(/^[a-zA-Z0-9]*$/, {
    message: 'password only accepts english and number',
  })
  password: string;
}

export class Token {
  @ApiProperty({ description: 'refresh token' })
  @IsString()
  refreshToken: string;
}
