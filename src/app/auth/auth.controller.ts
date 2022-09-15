import {
  Body,
  Controller,
  Post,
  Req,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Request } from 'express';
import { AuthService } from './auth.service';
import { GetCurrentUserId } from './common/decorator/get-current-user-id.decorator';
import { AccessTokenGuard, RefreshTokenGuard } from './common/jwt/jwt.guard';
import { AuthCreateDto, AuthSignInDto } from './dto/auth.dto';
import { AuthInterface } from './interface/auth.interface';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @ApiOperation({ summary: '사용자 회원 가입' })
  @ApiResponse({ status: 200, description: ' sign up user' })
  @Post('sign-up')
  signUp(
    @Body(ValidationPipe) authCreateDto: AuthCreateDto,
  ): Promise<AuthInterface> {
    return this.authService.signUp(authCreateDto);
  }

  @ApiOperation({ summary: '사용자 로그인' })
  @ApiResponse({ status: 200, description: ' sign in user' })
  @Post('sign-in')
  signIn(
    @Body(ValidationPipe) authSignInDto: AuthSignInDto,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    return this.authService.signIn(authSignInDto);
  }

  @ApiOperation({ summary: '사용자 로그아웃' })
  @ApiResponse({ status: 200, description: ' sign out user' })
  @UseGuards(AccessTokenGuard)
  @Post('sign-out')
  signOut(@GetCurrentUserId() userId: number) {
    return this.authService.signOut(userId);
  }

  @UseGuards(RefreshTokenGuard)
  @Post('refresh-token')
  recreateRefreshToken(
    @GetCurrentUserId() userId: number,
    @Req() req: Request,
  ) {
    console.log('req', req);
    const token = req.get('authorization');
    return this.authService.recreateRefreshToken(userId, token);
  }
}
