import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { UsersModule } from '../users/users.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import {
  JwtAccessTokenStrategy,
  JwtRefreshTokenStrategy,
} from './common/jwt/jwt.strategy';

@Module({
  imports: [
    UsersModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: process.env.JWT_ACCESS_TOKEN_SECRET,
      signOptions: {
        expiresIn: process.env.JWT_ACCESS_TOKEN_EXPIRATION_TIME,
      },
    }),
  ],
  controllers: [AuthController],
  // auth moudle에서 사용하기 위하며 JwtStrategy 삽입
  providers: [AuthService, JwtAccessTokenStrategy, JwtRefreshTokenStrategy],
  // auth module외에도 Jwt 전부 사용하기 때문에 Expory(캡슐화)
  exports: [JwtAccessTokenStrategy, JwtRefreshTokenStrategy, PassportModule],
})
export class AuthModule {}
