import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Account } from 'src/common/interface/auth.interface';
import { UsersRepository } from './users.repository';
import { UsersService } from './users.service';
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('profile')
  async findUser(@Param('id', ParseIntPipe) userId: number): Promise<Account> {
    return await this.usersService.findUser(userId);
  }

  @Patch('profile')
  @UseInterceptors(FileInterceptor('profileImg'))
  async updateProfile(@UploadedFile() profileImg) {
    const userId = 1;
    return await this.usersService.updateProfile(userId, profileImg);
  }
}
