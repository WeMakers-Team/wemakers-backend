import { Role } from '@prisma/client';

export interface JwtPayload {
  id: number;
  role: Role;
}

export class AuthInterface {
  name: string;
  email: string;
  role: Role;
}
