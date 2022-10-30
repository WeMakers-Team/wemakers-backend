import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { UsersRepository } from './users.repository';
import { UsersService } from './users.service';
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get(':id')
  async findUser(@Param('id', ParseIntPipe) userId: number) {
    return await this.usersService.findUser(userId);
  }
}
