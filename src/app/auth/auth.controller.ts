import { Body, Controller, Delete, Post, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { GetCurrentUser } from '../../common/decorator/auth.decorator';
import { AccessTokenGuard, RefreshTokenGuard } from './jwt/jwt.guard';
import {
  AuthCreateDto,
  SignInDto,
  UserIdentifier,
} from '../../common/dto/auth.dto';
import {
  Account,
  AuthAccessToken,
  AuthVerificationToken,
} from 'src/common/interface/auth.interface';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('sign-up')
  async signUp(@Body() authCreateDto: AuthCreateDto): Promise<Account> {
    return await this.authService.signUp(authCreateDto);
  }

  @Post('sign-in')
  async signIn(
    @Body() authSignInDto: SignInDto,
  ): Promise<AuthVerificationToken> {
    return await this.authService.signIn(authSignInDto);
  }

  @UseGuards(AccessTokenGuard)
  @Delete('sign-out')
  async signOut(@GetCurrentUser() { userId }: UserIdentifier): Promise<void> {
    await this.authService.signOut(userId);
  }

  @UseGuards(AccessTokenGuard, RefreshTokenGuard)
  @Post('recreate/access-token')
  async recreateAccessToken(
    @GetCurrentUser() { userId }: UserIdentifier,
  ): Promise<AuthAccessToken> {
    return await this.authService.recreateAccessToken(userId);
  }
}
