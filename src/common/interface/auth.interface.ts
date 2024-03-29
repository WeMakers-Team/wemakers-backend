import { Role, Account as Account_ } from '@prisma/client';

export type JwtPayloadType = {
  sub: number;
  role: Role;
};

export interface AuthVerificationToken {
  accessToken: string;
  refreshToken: string;
}

export type Account = Omit<Account_, 'password'>;

export type AuthAccessToken = Pick<AuthVerificationToken, 'accessToken'>;
export type AuthRefreshToken = Pick<AuthVerificationToken, 'refreshToken'>;

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface Empty {}
