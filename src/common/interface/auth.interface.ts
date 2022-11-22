import { Role, User } from '@prisma/client';

export type JwtPayloadType = {
  sub: number;
  role: Role;
};

export interface AuthVerificationToken {
  accessToken: string;
  refreshToken: string;
}

export type Account = Omit<User, 'password'>;

export type AuthAccessToken = Pick<AuthVerificationToken, 'accessToken'>;
export type AuthRefreshToken = Pick<AuthVerificationToken, 'refreshToken'>;

export interface CompareDataResponse {
  isCompareResponse: boolean;
}

export interface HashDataResponse {
  hashedData: string;
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface Empty {}
