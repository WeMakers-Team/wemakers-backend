import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UsersRepository } from 'src/app/users/users.repository';
import { JwtPayloadType } from '../../../common/interface/auth.interface';
import { AuthRepository } from '../auth.repository';
import { exceptionMessagesAuth } from 'src/common/exceptionMessage';
import { AuthService } from '../auth.service';

@Injectable()
export class JwtAccessTokenStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    private readonly configService: ConfigService,
    private readonly userRepository: UsersRepository,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.get('JWT_ACCESS_TOKEN_SECRET'),
    });
  }

  async validate(payload: JwtPayloadType) {
    const user = await this.userRepository.findUserByIdOrEmail(payload.sub);

    if (user) {
      return user.id;
    } else {
      throw new UnauthorizedException(exceptionMessagesAuth.UNVERIFIED_TOKEN);
    }
  }
}

@Injectable()
export class JwtRefreshTokenStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor(
    private readonly configService: ConfigService,
    private readonly authService: AuthService,
    private readonly authRepository: AuthRepository,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: any) => {
          const refreshToken: string = request?.body?.['refreshToken'];
          const decryptedRefreshToken =
            this.authService.decryptData(refreshToken);

          return decryptedRefreshToken;
        },
      ]),
      secretOrKey: configService.get('JWT_REFRESH_TOKEN_SECRET'),
      passReqToCallback: true,
    });
  }

  async validate(req, { sub, role }: JwtPayloadType) {
    const reqRefreshToken = req.body.refreshToken;
    const decryptedRefreshToken = this.authService.decryptData(reqRefreshToken);
    const userRefreshToken = await this.authRepository.findRefreshToken(sub);

    if (
      userRefreshToken &&
      userRefreshToken.refreshToken === decryptedRefreshToken
    ) {
      return sub;
    } else {
      throw new UnauthorizedException(exceptionMessagesAuth.UNVERIFIED_TOKEN);
    }
  }
}
