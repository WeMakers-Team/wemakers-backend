import { Injectable, UnauthorizedException } from '@nestjs/common';
import { Account } from 'src/common/interface/auth.interface';
import { UsersRepository } from './users.repository';

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  async findUser(userId: number): Promise<Account> {
    const { password, ...response } =
      await this.usersRepository.findUserByIdOrWhere(userId);

    return response;
  }
}
