import {
  ConflictException,
  HttpException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Prisma, PrismaClient, Type, User } from '@prisma/client';
import { error } from 'console';
import { CreateUserDto, UserDto } from './dto/auth.dto';
import { AuthInreface } from './interface/auth.interface';
import * as bcrpyt from 'bcrypt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}
  prisma = new PrismaClient();

  async findUser(email: string): Promise<User> {
    const user = await this.prisma.user.findUnique({
      where: {
        email: email,
      },
    });

    if (user) {
      return user;
    }
    throw new HttpException(
      '사용자 이메일이 존재하지 않습니다',
      HttpStatus.NOT_FOUND,
    );
  }

  async hashData(data: string) {
    const salt = await bcrpyt.genSalt();
    return await bcrpyt.hash(data, salt);
  }

  /** 배포시에 return refresh token 제거하기 */
  async getTokens(
    userId: number,
    type: Type,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const tokenPayload = {
      id: userId,
      role: type,
    };
    const [at, rt] = await Promise.all([
      // this.jwtService.signAsync(
      //   {
      //     sub: userId,
      //     type,
      //   },
      //   {
      //     secret: this.configService.get('JWT_ACCESS_TOKEN_SECRET'),
      //     expiresIn: this.configService.get('JWT_ACCESS_TOKEN_EXPIRATION_TIME'),
      //   },
      // ),
      // this.jwtService.signAsync(
      //   {
      //     sub: userId,
      //     type,
      //   },
      //   {
      //     secret: this.configService.get('JWT_REFRESH_TOKEN_SECRET'),
      //     expiresIn: this.configService.get(
      //       'JWT_REFRESH_TOKEN_EXPIRATION_TIME',
      //     ),
      //   },
      // ),

      this.jwtService.sign(tokenPayload, {
        secret: this.configService.get('JWT_ACCESS_TOKEN_EXPIRATION_TIME'),
        expiresIn: this.configService.get('JWT_ACCESS_TOKEN_EXPIRATION_TIME'),
      }),

      this.jwtService.sign(tokenPayload, {
        secret: this.configService.get('JWT_REFRESH_TOKEN_SECRET'),
        expiresIn: this.configService.get('JWT_REFRESH_TOKEN_EXPIRATION_TIME'),
      }),
    ]);
    return {
      accessToken: at,
      refreshToken: rt,
    };
  }

  async signUp(userData: CreateUserDto): Promise<AuthInreface> {
    const { password } = userData;
    const hashedPassword = await this.hashData(password);

    try {
      const newUser = await this.prisma.user.create({
        data: {
          name: userData.name,
          email: userData.email,
          password: hashedPassword,
          birthday: userData.birthDay,
          type: userData.type,
        },
      });

      const message = {
        name: newUser.name,
        email: newUser.email,
        type: newUser.type,
      };

      return message;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        throw new InternalServerErrorException('this Email already exists');
      } else if (error.code === 'P2002') {
        throw new ConflictException('this Email already exists');
      }
    }
    throw error;
  }

  async signIn(
    userDto: UserDto,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const { email, password } = userDto;
    const user = await this.prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (user && (await bcrpyt.compare(password, user.password))) {
      const tokens = await this.getTokens(user.id, user.type);
      await this.updateRefreshTokenHash(user.id, tokens.refreshToken);
      return tokens;
    } else {
      throw new UnauthorizedException('login failed');
    }
  }

  async signOut(userId: number) {
    await this.prisma.user.updateMany({
      where: { id: userId, refreshToken: { not: null } },
      data: { refreshToken: null },
    });
  }

  async refreshTokens(userId: number, refreshToken: string) {
    const user = await this.prisma.user.findFirst({
      where: { id: userId },
    });

    if (!user) throw new UnauthorizedException('Access Denied');
    const rtMatches = bcrpyt.compare(refreshToken, user.refreshToken);
    if (!rtMatches) throw new UnauthorizedException('Access Denied');

    const tokens = await this.getTokens(user.id, user.type);
    await this.updateRefreshTokenHash(user.id, tokens.refreshToken);
    return tokens;
  }

  async updateRefreshTokenHash(userId: number, refreshToken: string) {
    const hashToken = await this.hashData(refreshToken);

    await this.prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        refreshToken: hashToken,
      },
    });
  }
}
