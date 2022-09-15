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
import { GetCurrentUser } from './common/decorator/auth.decorator';
import { AccessTokenGuard, RefreshTokenGuard } from './common/jwt/jwt.guard';
import { AuthCreateDto, AuthSignInDto } from './dto/auth.dto';
import { AuthInterface } from './interface/auth.interface';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @ApiOperation({ summary: '사용자 회원 가입' })
  @Post('sign-up')
  async signUp(
    @Body(ValidationPipe) authCreateDto: AuthCreateDto,
  ): Promise<AuthInterface> {
    return await this.authService.signUp(authCreateDto);
  }

  @ApiOperation({ summary: '사용자 로그인' })
  @Post('sign-in')
  async signIn(
    @Body(ValidationPipe) authSignInDto: AuthSignInDto,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    return await this.authService.signIn(authSignInDto);
  }

  @ApiOperation({ summary: '사용자 로그아웃' })
  @UseGuards(AccessTokenGuard)
  @Delete('sign-out')
  async signOut(@GetCurrentUser() user: User) {
    await this.authService.signOut(user.id);
    return { result: true }; //test
  }

  @ApiOperation({ summary: 'access token 재발급' })
  @UseGuards(RefreshTokenGuard)
  @Post('recreate/access-token')
  async recreateAccessToken(
    @GetCurrentUser() user: User,
  ): Promise<{ accessToken: string }> {
    const accessToken = await this.authService.recreateAccessToken(user.id);
    return { accessToken };
  }

  @ApiOperation({ summary: 'access token 테스트' })
  @UseGuards(AccessTokenGuard)
  @Get('access-test')
  accessTokenGuardTest() {
    return 'Access Token Guard Test !';
  }

  @UseGuards(RefreshTokenGuard)
  @Post('refresh-test')
  refreshTokenGuardTest() {
    return 'Refresh Token Guard Test !';
  }
}
