import { Type } from '@prisma/client';

export class AuthInterface {
  name: string;
  email: string;
  type: Type;
}
