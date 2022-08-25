import { Injectable } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';

export class UserDto {
  @ApiProperty({ description: 'id' })
  id: number;

  @ApiProperty({ description: '이름' })
  name: string;
}

@Injectable()
export class UsersService {
  private users: UserDto[] = [];

  getAllUsers(): UserDto[] {
    return this.users;
  }

  createUser(createDto: UserDto) {
    this.users.push({ id: this.users.length + 1, ...createDto });
  }
}
