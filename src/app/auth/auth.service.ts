import { HttpException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { RefreshToken, User } from '@prisma/client';
import { UsersRepository } from '../users/users.repository';
import {
  AuthCreateDto,
  DataToCompare,
  DataToHash,
  SignInDto,
  UserIdentifier,
  UserInfoToCreateToken,
} from '../../common/dto/auth.dto';
import {
  Account,
  AuthAccessToekn,
  AuthRefreshToken,
  AuthVerificationToken,
  CompareDataResponse,
  HashDataResponse,
  JwtPayloadType,
} from '../../common/interface/auth.interface';
import { AuthRepository } from './auth.repository';
import * as bcrpyt from 'bcrypt';
import { exceptionMessagesAuth } from 'src/common/exceptionMessage/';

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

      const { hashedData } = await this.hashData({ dataNeedTohash: password });

      const newUser = await this.usersRepository.createUser(
        authCreateDto,
        hashedData,
      );

      const { password: newUserpassword, ...response } = newUser;

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

  async signIn(authSignInDto: SignInDto): Promise<AuthVerificationToken> {
    const { email, password } = authSignInDto;
    try {
      const {
        id: userId,
        password: userPassword,
        role: userRole,
      } = await this.usersRepository.findUserByIdOrEmail(email);

      await this.compareData({
        dataNeedTohash: password,
        hashedData: userPassword,
      });

      if (!userId) {
        throw new HttpException(
          exceptionMessagesAuth.THIS_EAMIL_DOES_NOT_EXIST,
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

  async recreateAccessToken(userId: number): Promise<AuthAccessToekn> {
    const { id, role }: User = await this.usersRepository.findUserByIdOrEmail(
      userId,
    );

    const { accessToken } = this.createAccessToken({ userId: id, role });

    const response: AuthAccessToekn = {
      accessToken,
    };

    return response;
  }

  private createAccessToken({
    userId,
    role,
  }: UserInfoToCreateToken): AuthAccessToekn {
    const tokenPayload: JwtPayloadType = {
      sub: userId,
      role: role,
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

  private async createRefreshToken({
    userId,
    role,
  }: UserInfoToCreateToken): Promise<AuthRefreshToken> {
    const tokenPayload: JwtPayloadType = {
      sub: userId,
      role: role,
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

    const { hashedData } = await this.hashData({
      dataNeedTohash: refreshToken,
    });

    try {
      await this.authRepository.createRefreshTokenHash(userId, hashedData);
    } catch (err) {
      throw new HttpException(err, 400);
    }
    const response: AuthRefreshToken = {
      refreshToken,
    };

    return response;
  }

  async findRefreshToken({ userId }: UserIdentifier): Promise<RefreshToken> {
    return await this.authRepository.findRefreshToken(userId);
  }

  async compareData({
    dataNeedTohash,
    hashedData,
  }: DataToCompare): Promise<CompareDataResponse> {
    const compare = await bcrpyt.compare(dataNeedTohash, hashedData);

    if (!compare) {
      throw new HttpException(
        exceptionMessagesAuth.COMPARE_DATA_RETURN_FALSE,
        400,
      );
    }

    const response: CompareDataResponse = {
      isCompareResponse: true,
    };

    return response;
  }

  async hashData({ dataNeedTohash }: DataToHash): Promise<HashDataResponse> {
    const salt = await bcrpyt.genSalt();
    const hashedData: string = await bcrpyt.hash(dataNeedTohash, salt);

    const response: HashDataResponse = {
      hashedData,
    };
    return response;
  }
}
