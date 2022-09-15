import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Prisma, RefreshToken, Role } from '@prisma/client';
import * as bcrpyt from 'bcrypt';
import { use } from 'passport';
import { UsersRepository } from '../users/users.repository';
import { UsersService } from '../users/users.service';
import { AuthCreateDto, AuthSignInDto } from './dto/auth.dto';
import { AuthInterface, JwtPayload } from './interface/auth.interface';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
    private usersService: UsersService,
    private usersRepository: UsersRepository,
  ) {}

  async signUp(authCreateDto: AuthCreateDto): Promise<AuthInterface> {
    try {
      const hashedPassword = await this.hashData(authCreateDto.password);
      const newUser = await this.usersRepository.createUser(
        authCreateDto,
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
  }

  async signIn(
    authSignInDto: AuthSignInDto,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const user = await this.usersService.getUser(authSignInDto.email);

    if (!(await this.compareData(authSignInDto.password, user.password))) {
      throw new UnauthorizedException('login failed');
    }

    const accessToken = this.createAccessToken(user.id, user.role);
    const refreshToken = await this.createRefreshTokens(user.id, user.role);

    return {
      accessToken,
      refreshToken,
    };
  }

  async signOut(userId: number) {
    const token = await this.usersRepository.findRefreshToken(userId);
    await this.usersRepository.deleteRefreshToken(token.id);
  }

  async recreateAccessToken(
    userId: number,
    refreshToken: string,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const user = await this.usersService.getUser(userId);
    const token = await this.findRefreshToken(user.id);

    if (!this.compareData(refreshToken, token.refreshToken)) {
      throw new UnauthorizedException('Access Denied');
    }

    const accessToken = this.createAccessToken(user.id, user.role);

    return { accessToken, refreshToken };
  }

  createAccessToken(userId: number, role: Role): string {
    const tokenPayload: JwtPayload = {
      sub: userId,
      role: role,
    };

    const accessToken = this.jwtService.sign(tokenPayload, {
      secret: this.configService.get('JWT_ACCESS_TOKEN_SECRET'),
      expiresIn: this.configService.get('JWT_ACCESS_TOKEN_EXPIRATION_TIME'),
    });

    return accessToken;
  }

  async createRefreshTokens(userId: number, role: Role): Promise<string> {
    const tokenPayload: JwtPayload = {
      sub: userId,
      role: role,
    };

    const refreshToken = this.jwtService.sign(tokenPayload, {
      secret: this.configService.get('JWT_REFRESH_TOKEN_SECRET'),
      expiresIn: this.configService.get('JWT_REFRESH_TOKEN_EXPIRATION_TIME'),
    });

    const hashedRefreshToken = await this.hashData(refreshToken);
    await this.usersRepository.createRefreshTokenHash(
      userId,
      hashedRefreshToken,
    );

    return refreshToken;
  }

  async findRefreshToken(userId: number): Promise<RefreshToken> {
    return await this.usersRepository.findRefreshToken(userId);
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
