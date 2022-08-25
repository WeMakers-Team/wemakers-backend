import { Injectable } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { PrismaClient } from '@prisma/client';

export class UserDto {
  @ApiProperty({ description: '이름' })
  username: string;

  @ApiProperty({ description: '이메일' })
  email: string;
}

@Injectable()
export class UsersService {
  prisma = new PrismaClient();

  //private users: UserDto[] = [];

  async getAllUsers(): Promise<any> {
    //return this.users;
    const users = this.prisma.user.findMany();
    return users;
  }

  async createUser(createDto: UserDto): Promise<any> {
    //this.users.push({ id: this.users.length + 1, ...createDto });
    await this.prisma.user.create({
      data: {
        ...createDto,
      },
    });
  }
}
