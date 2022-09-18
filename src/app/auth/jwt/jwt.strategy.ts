import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UsersRepository } from 'src/app/users/users.repository';
import { UsersService } from 'src/app/users/users.service';
import { JwtPayload } from '../../../common/interface/auth.interface';
import * as bcrpyt from 'bcrypt';

@Injectable()
export class JwtAccessTokenStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    private readonly configService: ConfigService,
    private readonly userService: UsersService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.get('JWT_ACCESS_TOKEN_SECRET'),
    });
  }

  async validate(payload: JwtPayload) {
    console.log(payload);
    const user = await this.userService.getUser(payload.sub);

    if (user) {
      return user;
    } else {
      throw new UnauthorizedException();
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
    private readonly userService: UsersService,
    private readonly userRepository: UsersRepository,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromBodyField('refreshToken'),
      secretOrKey: configService.get('JWT_REFRESH_TOKEN_SECRET'),
      passReqToCallback: true,
    });
  }

  async validate(req, payload: JwtPayload) {
    const user = await this.userService.getUser(payload.sub);
    const reqRefreshToken = req.body.refreshToken;
    const userRefreshToken = await this.userRepository.findRefreshToken(
      payload.sub,
    );

    if (await bcrpyt.compare(reqRefreshToken, userRefreshToken.refreshToken)) {
      return user;
    } else {
      throw new UnauthorizedException();
    }
  }
}
