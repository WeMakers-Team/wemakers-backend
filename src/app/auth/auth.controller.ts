import {
  Body,
  Controller,
  Delete,
  Get,
  Post,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { User } from '@prisma/client';
import { AuthService } from './auth.service';
import { GetCurrentUser } from '../../common/decorator/auth.decorator';
import { AccessTokenGuard, RefreshTokenGuard } from './jwt/jwt.guard';
import { AuthCreateDto, AuthSignInDto } from '../../common/dto/auth.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @ApiOperation({ summary: '사용자 회원 가입' })
  @Post('sign-up')
  async signUp(@Body(ValidationPipe) authCreateDto: AuthCreateDto) {
    const user = await this.authService.signUp(authCreateDto);

    return {
      users: user,
    };
  }

  @ApiOperation({ summary: '사용자 로그인' })
  @Post('sign-in')
  async signIn(@Body(ValidationPipe) authSignInDto: AuthSignInDto) {
    const tokens = await this.authService.signIn(authSignInDto);

    return {
      tokens: tokens,
    };
  }

  @ApiOperation({ summary: '사용자 로그아웃' })
  @UseGuards(AccessTokenGuard)
  @Delete('sign-out')
  async signOut(@GetCurrentUser() user: User) {
    await this.authService.signOut(user.id);
  }

  @ApiOperation({ summary: 'access token 재발급' })
  @UseGuards(RefreshTokenGuard)
  @Post('recreate/access-token')
  async recreateAccessToken(@GetCurrentUser() userId: number) {
    const accessToken = await this.authService.recreateAccessToken(userId);

    return {
      tokens: { accessToken },
    };
  }

  @ApiOperation({ summary: 'access token 테스트' })
  @UseGuards(AccessTokenGuard)
  @Get('access-test')
  accessTokenGuardTest(@GetCurrentUser() user: User) {
    return `Access Token Guard Test - ${user.email}!`;
  }

  @UseGuards(RefreshTokenGuard)
  @Post('refresh-test')
  refreshTokenGuardTest(@GetCurrentUser() userId: number) {
    console.log('======UserId=====');
    console.log(userId);
    return `Refresh Token Guard Test !`;
  }
}
