import {
  Body,
  Controller,
  Delete,
  Post,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { User } from '@prisma/client';
import { AuthService } from './auth.service';
import { GetCurrentUser } from '../../common/decorator/auth.decorator';
import { AccessTokenGuard, RefreshTokenGuard } from './jwt/jwt.guard';
import {
  AuthCreateDto,
  SignInDto,
  UserIdentifier,
} from '../../common/dto/auth.dto';
import { AuthVerificationToken } from 'src/common/interface/auth.interface';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('sign-up')
  async signUp(
    @Body(ValidationPipe) authCreateDto: AuthCreateDto,
  ): Promise<Omit<User, 'password'>> {
    return await this.authService.signUp(authCreateDto);
  }

  @Post('sign-in')
  async signIn(
    @Body(ValidationPipe) authSignInDto: SignInDto,
  ): Promise<AuthVerificationToken> {
    return await this.authService.signIn(authSignInDto);
  }

  @UseGuards(AccessTokenGuard)
  @Delete('sign-out')
  async signOut(@GetCurrentUser() { userId }: UserIdentifier): Promise<void> {
    await this.authService.signOut(userId);
  }

  @UseGuards(RefreshTokenGuard)
  @Post('recreate/access-token')
  async recreateAccessToken(
    @GetCurrentUser('sub') { userId }: UserIdentifier,
  ): Promise<Omit<AuthVerificationToken, 'refreshToken'>> {
    return await this.authService.recreateAccessToken(userId);
  }
}
