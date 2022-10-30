import { Injectable, UnauthorizedException } from '@nestjs/common';
import { User } from '@prisma/client';
import { FindUserResponse } from 'src/common/interface/users.interface';
import { UsersRepository } from './users.repository';

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  async findUser(userId: number): Promise<FindUserResponse> {
    const user = await this.usersRepository.findUserByIdOrEmail(userId);

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    };
  }
}
