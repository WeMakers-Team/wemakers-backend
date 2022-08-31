import { UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { PrismaClient, User } from '@prisma/client';
import { ExtractJwt, Strategy } from 'passport-jwt';

export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly userRepository: User) {
    super({
      secretOrKey: process.env.JWT_ACCESS_TOKEN_SECRET,
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    });
  }
  prisma = new PrismaClient();

  async validate(payload) {
    const { userId } = payload;
    const user: User = await this.prisma.user.findFirst({
      where: { id: userId },
    });

    if (!user) {
      throw new UnauthorizedException();
    }
    return user;
  }
}
