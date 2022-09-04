import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Prisma, Role } from '@prisma/client';
import { error } from 'console';
import { AuthCreateDto } from './dto/auth.dto';
import { AuthInterface } from './interface/auth.interface';
import * as bcrpyt from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import { UsersRepository } from '../users/users.repository';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
    private usersService: UsersService,
    private usersRepository: UsersRepository,
  ) {}

  async signUp(userDto: AuthCreateDto): Promise<AuthInterface> {
    try {
      const hashedPassword = await this.hashData(userDto.password);
      const newUser = await this.usersRepository.createUser(
        userDto,
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
    userDto: AuthCreateDto,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const user = await this.usersService.getUser(userDto.email);

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
    await this.usersRepository.deleteRefreshToken(userId);
  }

  async recreateRefreshToken(
    userId: number,
    refreshToken: string,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const user = await this.usersService.getUser(userId);

    if (!user) throw new UnauthorizedException('Access Denied');

    const rtMatches = this.compareData(refreshToken, user.refreshToken);
    if (!rtMatches) throw new UnauthorizedException('Access Denied');

    const accessToken = await this.createAccessToken(user.id, user.role);

    return { accessToken, refreshToken };
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
    console.log('refreshToken type', typeof refreshToken);
    await this.usersRepository.updateRefreshTokenHash(userId, hashToken);

    return refreshToken;
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
