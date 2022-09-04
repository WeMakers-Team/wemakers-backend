import { Role } from '@prisma/client';

export class AuthInterface {
  name: string;
  email: string;
  role: Role;
}
