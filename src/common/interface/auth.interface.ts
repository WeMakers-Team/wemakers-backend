import { Role } from '@prisma/client';

export type JwtPayloadType = {
  sub: number;
  role: Role;
};

export interface AuthInterface {
  name: string;
  email: string;
  role: Role;
}

export interface SignUpResponse {
  id: number;
  name: string;
  email: string;
  role: Role;
}

export interface SignInResponse {
  accessToken: string;
  refreshToken: string;
}
