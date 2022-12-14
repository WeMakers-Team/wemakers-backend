import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Account } from 'src/common/interface/auth.interface';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('profile')
  async findUser(): Promise<Account> {
    const userId = 1; // get guard
    return await this.usersService.findUser(userId);
  }

  @Patch('profile')
  @UseInterceptors(FileInterceptor('profileImg'))
  async updateProfile(@UploadedFile() profileImg) {
    const userId = 1;
    return await this.usersService.updateProfile(userId, profileImg);
  }

  @Post('chat') 
  async chate(userId: number, @Body() message: string){
    this.usersService.userChat(userId, message)
  }
}
