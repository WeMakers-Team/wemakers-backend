import { Role } from '@prisma/client';

export type JwtPayload = {
  sub: number;
  role: Role;
};

export interface AuthInterface {
  name: string;
  email: string;
  role: Role;
}
