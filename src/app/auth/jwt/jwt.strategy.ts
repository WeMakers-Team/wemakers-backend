import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UsersRepository } from 'src/app/users/users.repository';
import { UsersService } from 'src/app/users/users.service';
import { JwtPayloadType } from '../../../common/interface/auth.interface';
import * as bcrpyt from 'bcrypt';
import { AuthRepository } from '../auth.repository';
import { exceptionMessagesAuth } from 'src/common/exceptionMessage';

@Injectable()
export class JwtAccessTokenStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    private readonly configService: ConfigService,
    private readonly userRepository: UsersRepository,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      passReqToCallback: true,
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
    private readonly authRepository: AuthRepository,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromBodyField('refreshToken'),
      secretOrKey: configService.get('JWT_REFRESH_TOKEN_SECRET'),
      passReqToCallback: true,
    });
  }

  async validate(req, payload: JwtPayloadType) {
    const reqRefreshToken = req.body.refreshToken;
    const userRefreshToken = await this.authRepository.findRefreshToken(
      payload.sub,
    );

    if (
      userRefreshToken &&
      (await bcrpyt.compare(reqRefreshToken, userRefreshToken.refreshToken))
    ) {
      return payload.sub;
    } else {
      throw new UnauthorizedException(exceptionMessagesAuth.UNVERIFIED_TOKEN);
    }
  }
}
