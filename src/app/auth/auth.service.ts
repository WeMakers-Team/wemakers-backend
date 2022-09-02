import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Prisma, PrismaClient, Type } from '@prisma/client';
import { error } from 'console';
import { CreateUserDto, UserDto } from './dto/auth.dto';
import { AuthInterface } from './interface/auth.interface';
import * as bcrpyt from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import { AuthRepository } from './auth.repository';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
    private authRepository: AuthRepository,
  ) {}

  prisma = new PrismaClient();

  async signUp(userData: CreateUserDto): Promise<AuthInterface> {
    try {
      const hashedPassword = await this.hashData(userData.password);
      const newUser = await this.authRepository.createUser(
        userData,
        hashedPassword,
      );
      return {
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
      };
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
    const user = await this.authRepository.findUserByEmail(userDto.email);

    if (user && (await this.compareData(userDto.password, user.password))) {
      const accessToken = await this.createAccessToken(user.id, user.role);
      const refreshToken = await this.createRefreshTokens(user.id, user.role);

      return {
        accessToken,
        refreshToken,
      };
    } else {
      throw new UnauthorizedException('login failed');
    }
  }

  async signOut(userId: number) {
    await this.authRepository.deleteRefreshToken(userId);
  }

  async createAccessToken(userId: number, role: Role): Promise<string> {
    const tokenPayload = {
      id: userId,
      role: role,
    };

    const accessToken = await this.jwtService.sign(tokenPayload, {
      secret: this.configService.get('JWT_ACCESS_TOKEN_EXPIRATION_TIME'),
      expiresIn: this.configService.get('JWT_ACCESS_TOKEN_EXPIRATION_TIME'),
    });

    return accessToken;
  }

  async createRefreshTokens(userId: number, role: Role): Promise<string> {
    const tokenPayload = {
      id: userId,
      role: role,
    };

    const refreshToken = this.jwtService.sign(tokenPayload, {
      secret: this.configService.get('JWT_REFRESH_TOKEN_SECRET'),
      expiresIn: this.configService.get('JWT_REFRESH_TOKEN_EXPIRATION_TIME'),
    });

    const hashToken = await this.hashData(refreshToken);
    await this.authRepository.updateRefreshTokenHash(userId, hashToken);

    return refreshToken;
  }

  async refreshTokens(
    userId: number,
    refreshToken: string,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const user = await this.prisma.user.findFirst({
      where: { id: userId },
    });

    if (!user) throw new UnauthorizedException('Access Denied');

    const rtMatches = this.compareData(refreshToken, user.refreshToken);
    if (!rtMatches) throw new UnauthorizedException('Access Denied');

    const accessToken = await this.createAccessToken(user.id, user.role);

    return { accessToken, refreshToken };
  }

  async compareData(original: string, hashData: string) {
    return await bcrpyt.compare(original, hashData);
  }

  async hashData(data: string): Promise<string> {
    const salt = await bcrpyt.genSalt();
    const hash = await bcrpyt.hash(data, salt);
    return hash;
  }
}
