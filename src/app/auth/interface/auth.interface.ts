import { Type } from '@prisma/client';

export class AuthInreface {
  name: string;
  email: string;
  type: Type;
}
