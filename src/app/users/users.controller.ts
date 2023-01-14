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
import { UpdateAccountDto, UpdateMentorProfileDto } from 'src/common/dto/users.dto';
import { Account } from 'src/common/interface/auth.interface';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  @Patch('account')
  @UseInterceptors(FileInterceptor('profileImg'))
  async updateProfile(@UploadedFile() profileImg, @Body() dto: UpdateAccountDto) {
    const userId = 1;
    return await this.usersService.updateAccount(userId, dto, profileImg);
  }

  @Get('mentor-profile')
  async findUser(): Promise<Account> {
    const userId = 1; // get guard
    return await this.usersService.findUser(userId);
  }

  @Patch('mentor-profile')
  async updateMentorProfile(@Body() dto: UpdateMentorProfileDto) {
    const userId = 1;
    return await this.usersService.updateMentorProfile(userId, dto);
  }

  @Patch('mentor-profile/is-public')
  async isPublicMentorProfile() {
    const userId = 1;
    return await this.usersService.isPublicMentorProfile(userId)
  }
}
