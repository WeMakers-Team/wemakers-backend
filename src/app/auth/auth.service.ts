import { HttpException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { RefreshToken, User } from '@prisma/client';
import { UsersRepository } from '../users/users.repository';
import {
  AuthCreateDto,
  SignInDto,
  UserIdentifier,
  UserInfoToCreateToken,
} from '../../common/dto/auth.dto';
import {
  Account,
  AuthAccessToken,
  AuthRefreshToken,
  AuthVerificationToken,
  JwtPayloadType,
} from '../../common/interface/auth.interface';
import { AuthRepository } from './auth.repository';
import { exceptionMessagesAuth } from 'src/common/exceptionMessage/';

import * as crypto from 'crypto';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
    private usersRepository: UsersRepository,
    private authRepository: AuthRepository,
  ) {}

  async signUp(authCreateDto: AuthCreateDto): Promise<Account> {
    try {
      const { password } = authCreateDto;
      const hashedData = this.encryptData(password);

      const { password: newUserpassword, ...response } =
        await this.usersRepository.createUser(authCreateDto, hashedData);

      return response;
    } catch (error) {
      if (error.code === 'P2002') {
        throw new HttpException(
          exceptionMessagesAuth.THIS_USER_ALREADY_EXISTS,
          400,
        );
      }
      throw new HttpException(error, 400);
    }
  }

  async signIn({ email, password }: SignInDto): Promise<AuthVerificationToken> {
    try {
      const user = await this.usersRepository.findUserByIdOrEmail(email);

      if (!user) {
        throw new HttpException(
          exceptionMessagesAuth.THIS_EAMIL_DOES_NOT_EXIST,
          400,
        );
      }

      const { id: userId, password: userPassword, role: userRole } = user;
      if (this.encryptData(password) !== userPassword) {
        throw new HttpException(
          exceptionMessagesAuth.PASSWORD_DOES_NOT_MATCH,
          400,
        );
      }

      const { accessToken } = this.createAccessToken({
        userId,
        role: userRole,
      });

      const { refreshToken } = await this.createRefreshToken({
        userId: userId,
        role: userRole,
      });

      const response: AuthVerificationToken = { accessToken, refreshToken };
      return response;
    } catch (error) {
      throw new HttpException(error, 400);
    }
  }

  async signOut(userId: number): Promise<void> {
    try {
      const { id: tokenId } = await this.authRepository.findRefreshToken(
        userId,
      );
      await this.authRepository.deleteRefreshToken(tokenId);
    } catch (error) {
      throw new HttpException(error, 400);
    }
  }

  async recreateAccessToken(userId: number): Promise<AuthAccessToken> {
    const { id, role } = await this.usersRepository.findUserByIdOrEmail(userId);
    const { accessToken } = this.createAccessToken({ userId: id, role });

    const response: AuthAccessToken = {
      accessToken,
    };

    return response;
  }

  protected createAccessToken({
    userId,
    role,
  }: UserInfoToCreateToken): AuthAccessToken {
    const tokenPayload: JwtPayloadType = {
      sub: userId,
      role,
    };

    const accessToken: string = this.jwtService.sign(tokenPayload, {
      secret: this.configService.get('JWT_ACCESS_TOKEN_SECRET'),
      expiresIn: this.configService.get('JWT_ACCESS_TOKEN_EXPIRATION_TIME'),
    });

    const response = {
      accessToken,
    };

    return response;
  }

  protected async createRefreshToken({
    userId,
    role,
  }: UserInfoToCreateToken): Promise<AuthRefreshToken> {
    const tokenPayload: JwtPayloadType = {
      sub: userId,
      role,
    };

    const refreshToken: string = this.jwtService.sign(tokenPayload, {
      secret: this.configService.get('JWT_REFRESH_TOKEN_SECRET'),
      expiresIn: this.configService.get('JWT_REFRESH_TOKEN_EXPIRATION_TIME'),
    });

    if (!refreshToken) {
      throw new HttpException(
        exceptionMessagesAuth.REFRESH_TOKEN_DOES_NOT_EXIST,
        400,
      );
    }

    const hashedData = this.encryptData(refreshToken);

    try {
      // await this.authRepository.createRefreshTokenHash(userId, hashedData);
      const response: AuthRefreshToken = {
        refreshToken: hashedData,
      };
      return response;
    } catch (err) {
      throw new HttpException(err, 400);
    }
  }

  async findRefreshToken({ userId }: UserIdentifier): Promise<RefreshToken> {
    return await this.authRepository.findRefreshToken(userId);
  }

  // crypto
  protected readonly ENCRYPT_PASSWORD = 'password'; // 임시
  protected readonly ENCRYPT_KEY = crypto.scryptSync(
    this.ENCRYPT_PASSWORD,
    'GfG',
    32,
  );
  protected readonly ENCRYPT_IV = Buffer.alloc(16, 0);

  encryptData(dataNeedTohash: string): string {
    const cipher = crypto.createCipheriv(
      'aes-256-cbc',
      this.ENCRYPT_KEY,
      this.ENCRYPT_IV,
    );
    let encrypted = cipher.update(dataNeedTohash);
    encrypted = Buffer.concat([encrypted, cipher.final()]);

    return encrypted.toString('hex');
  }

  decryptData(hashedData: string): string {
    const encryptedText = Buffer.from(hashedData, 'hex');
    const decipher = crypto.createDecipheriv(
      'aes-256-cbc',
      Buffer.from(this.ENCRYPT_KEY),
      this.ENCRYPT_IV,
    );
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);

    return decrypted.toString();
  }
}
