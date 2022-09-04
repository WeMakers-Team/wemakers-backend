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

  @Public()
  @Post('/signup')
  @ApiOperation({ summary: '사용자 회원 가입' })
  @ApiResponse({ status: 200, description: ' sign up user' })
  signUp(
    @Body(ValidationPipe) createUserDto: AuthCreateDto,
  ): Promise<AuthInterface> {
    return this.authService.signUp(createUserDto);
  }

  @Public()
  @Post('sign-in')
  @ApiOperation({ summary: '사용자 로그인' })
  @ApiResponse({ status: 200, description: ' sign in user' })
  signIn(
    @Body(ValidationPipe) userDto: AuthCreateDto,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    return this.authService.signIn(userDto);
  }

  @UseGuards(AccessTokenGuard)
  @Post('sign-out')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '사용자 로그아웃' })
  @ApiResponse({ status: 200, description: ' sign out user' })
  signOut(@GetCurrentUserId() userId: number) {
    return this.authService.signOut(userId);
  }

  @UseGuards(RefreshTokenGuadrd)
  @Post('/refresh')
  @HttpCode(HttpStatus.OK)
  refreshToken(@GetCurrentUserId() userId: number, @Req() req: Request) {
    console.log('req', req);
    const token = req.get('authorization');
    return this.authService.refreshTokens(userId, token);
  }
}
