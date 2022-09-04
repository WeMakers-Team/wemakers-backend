import { Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { UsersRepository } from './users.repository';

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  async getAllUsers(): Promise<User[]> {
    return await this.usersRepository.findAllUsers();
  }

  async getUser(user: number | string): Promise<User> {
    if (typeof user === 'number') {
      return this.usersRepository.findUserById(user);
    } else {
      return this.usersRepository.findUserByEmail(user);
    }
  }
}
