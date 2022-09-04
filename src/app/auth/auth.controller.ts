import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { AccessTokenGuard } from './common/guard/access-token.guard';
import { RefreshTokenGuadrd } from './common/guard/refresh-token.guard';
import { GetCurrentUserId } from './common/decorator/get-current-user-id.decorator';
import { Public } from './common/decorator/public.decorator';
import { Request } from 'express';
import { AuthInterface } from './interface/auth.interface';
import { AuthCreateDto } from './dto/auth.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @ApiOperation({ summary: '사용자 회원 가입' })
  @ApiResponse({ status: 200, description: ' sign up user' })
  @Public()
  @Post('sign-up')
  signUp(
    @Body(ValidationPipe) createUserDto: AuthCreateDto,
  ): Promise<AuthInterface> {
    return this.authService.signUp(createUserDto);
  }

  @ApiOperation({ summary: '사용자 로그인' })
  @ApiResponse({ status: 200, description: ' sign in user' })
  @Public()
  @Post('sign-in')
  signIn(
    @Body(ValidationPipe) userDto: AuthCreateDto,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    return this.authService.signIn(userDto);
  }

  @ApiOperation({ summary: '사용자 로그아웃' })
  @ApiResponse({ status: 200, description: ' sign out user' })
  @UseGuards(AccessTokenGuard)
  @Post('sign-out')
  signOut(@GetCurrentUserId() userId: number) {
    return this.authService.signOut(userId);
  }

  @UseGuards(RefreshTokenGuadrd)
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
