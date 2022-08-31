import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './jwt.startegy';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: process.env.NODE_ENV === 'dev' ? '.env' : '.env.test',
      ignoreEnvFile: process.env.NODE_ENV === 'production',
    }),
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
  providers: [AuthService, JwtStrategy],
  // auth module외에도 Jwt 전부 사용하기 때문에 Expory(캡슐화)
  exports: [JwtStrategy, PassportModule],
})
export class AuthModule {}
