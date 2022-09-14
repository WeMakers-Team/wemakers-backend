import { Injectable, UnauthorizedException } from '@nestjs/common';
import { User } from '@prisma/client';
import { UsersRepository } from './users.repository';

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  async getAllUsers(): Promise<User[]> {
    return await this.usersRepository.findAllUsers();
  }

  async getUser(userData: number | string): Promise<User> {
    let user;

    if (typeof userData === 'number') {
      user = this.usersRepository.findUserById(userData);
    } else {
      user = this.usersRepository.findUserByEmail(userData);
    }

    if (!user) {
      throw new UnauthorizedException(' This User is not exist');
    }

    return user;
  }
}
