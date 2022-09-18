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
import {
  DeleteResponstImpl,
  ErrorResponse,
  PostResponseImpl,
} from './interface/http.interface';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @ApiOperation({ summary: '사용자 회원 가입' })
  @Post('sign-up')
  async signUp(
    @Body(ValidationPipe) authCreateDto: AuthCreateDto,
  ): Promise<PostResponseImpl | ErrorResponse> {
    const user = await this.authService.signUp(authCreateDto);
    return {
      statusCode: 201,
      message: 'ok',
      result: {
        users: user,
      },
    };
  }

  @ApiOperation({ summary: '사용자 로그인' })
  @Post('sign-in')
  async signIn(
    @Body(ValidationPipe) authSignInDto: AuthSignInDto,
  ): Promise<PostResponseImpl | ErrorResponse> {
    const tokens = await this.authService.signIn(authSignInDto);

    return {
      statusCode: 201,
      message: 'ok',
      result: {
        tokens: tokens,
      },
    };
  }

  @ApiOperation({ summary: '사용자 로그아웃' })
  @UseGuards(AccessTokenGuard)
  @Delete('sign-out')
  async signOut(@GetCurrentUser() user: User): Promise<DeleteResponstImpl> {
    await this.authService.signOut(user.id);

    return {
      statusCode: 204,
      message: 'ok',
    };
  }

  @ApiOperation({ summary: 'access token 재발급' })
  @UseGuards(RefreshTokenGuard)
  @Post('recreate/access-token')
  async recreateAccessToken(
    @GetCurrentUser() user: User,
  ): Promise<PostResponseImpl> {
    const accessToken = await this.authService.recreateAccessToken(user.id);

    return {
      statusCode: 201,
      message: 'ok',
      result: {
        token: { accessToken },
      },
    };
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
