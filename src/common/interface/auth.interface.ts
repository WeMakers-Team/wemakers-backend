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

export type AuthAccessToekn = Omit<AuthVerificationToken, 'refreshToken'>;

export type AuthRefreshToken = Omit<AuthVerificationToken, 'accessToken'>;

export interface CompareDataResponse {
  isCompareResponse: boolean;
}

export interface HashDataResponse {
  hashedData: string;
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface Empty {}
