import { Role } from '@prisma/client';

export interface FindUserResponse {
  id: number;
  name: string;
  email: string;
  role: Role;
}
