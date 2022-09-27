import {
  BadRequestException,
  ConflictException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Prisma, RefreshToken, Role, User } from '@prisma/client';
import * as bcrpyt from 'bcrypt';
import { UsersRepository } from '../users/users.repository';
import { UsersService } from '../users/users.service';
import { AuthCreateDto, AuthSignInDto } from '../../common/dto/auth.dto';
import {
  AuthInterface,
  JwtPayloadType,
  SignInResponse,
  SignUpResponse,
} from '../../common/interface/auth.interface';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
    private usersService: UsersService,
    private usersRepository: UsersRepository,
  ) {}

  async signUp(authCreateDto: AuthCreateDto): Promise<SignUpResponse> {
    try {
      const hashedPassword: string = await this.hashData(
        authCreateDto.password,
      );

      const newUser: User = await this.usersRepository.createUser(
        authCreateDto,
        hashedPassword,
      );

      return {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
      };
    } catch (error) {
      if (error.code === 'P2002') {
        throw new BadRequestException('this email already exists');
      }
    }
  }

  async signIn(authSignInDto: AuthSignInDto): Promise<SignInResponse> {
    const user: User = await this.usersRepository.findUserByIdOrEmail(
      authSignInDto.email,
    );

    if (!user) {
      throw new BadRequestException('this email does not exist');
    } else if (
      !(await this.compareData(authSignInDto.password, user.password))
    ) {
      throw new BadRequestException('password mismatched.');
    }

    const accessToken: string = this.createAccessToken(user.id, user.role);
    const refreshToken: string = await this.createRefreshToken(
      user.id,
      user.role,
    );

    return {
      accessToken,
      refreshToken,
    };
  }

  async signOut(userId: number) {
    const token: RefreshToken = await this.usersRepository.findRefreshToken(
      userId,
    );

    await this.usersRepository.deleteRefreshToken(token.id);
  }

  async recreateAccessToken(userId: number): Promise<string> {
    const user: User = await this.usersRepository.findUserByIdOrEmail(userId);
    const accessToken: string = this.createAccessToken(user.id, user.role);

    return accessToken;
  }

  private createAccessToken(userId: number, role: Role): string {
    const tokenPayload: JwtPayloadType = {
      sub: userId,
      role: role,
    };

    const accessToken: string = this.jwtService.sign(tokenPayload, {
      secret: this.configService.get('JWT_ACCESS_TOKEN_SECRET'),
      expiresIn: this.configService.get('JWT_ACCESS_TOKEN_EXPIRATION_TIME'),
    });

    return accessToken;
  }

  private async createRefreshToken(
    userId: number,
    role: Role,
  ): Promise<string> {
    const tokenPayload: JwtPayloadType = {
      sub: userId,
      role: role,
    };

    const refreshToken: string = this.jwtService.sign(tokenPayload, {
      secret: this.configService.get('JWT_REFRESH_TOKEN_SECRET'),
      expiresIn: this.configService.get('JWT_REFRESH_TOKEN_EXPIRATION_TIME'),
    });

    const hashedRefreshToken: string = await this.hashData(refreshToken);
    await this.usersRepository.createRefreshTokenHash(
      userId,
      hashedRefreshToken,
    );

    return refreshToken;
  }

  async findRefreshToken(userId: number): Promise<RefreshToken> {
    return await this.usersRepository.findRefreshToken(userId);
  }

  async compareData(original: string, hashData: string): Promise<boolean> {
    return await bcrpyt.compare(original, hashData);
  }

  async hashData(data: string): Promise<string> {
    const salt: string = await bcrpyt.genSalt();
    const hash: string = await bcrpyt.hash(data, salt);
    return hash;
  }
}
