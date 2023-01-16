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
import { MentorProfile } from '@prisma/client';
import { BookmarkMentorDto, CreateSkillDto, UpdateAccountDto, UpdateMentorProfileDto } from 'src/common/dto/users.dto';
import { Account } from 'src/common/interface/auth.interface';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  // 멘토, 멘티 계정 프로필
  @Get('account')
  async findUser(): Promise<Account> {
    const userId = 1; // get guard
    return await this.usersService.findUser(userId);
  }

  @Patch('account')
  @UseInterceptors(FileInterceptor('profileImg'))
  async updateAccount(@UploadedFile() profileImg, @Body() dto: UpdateAccountDto) {
    const userId = 1;
    return await this.usersService.updateAccount(userId, dto, profileImg);
  }

  // 멘토 프로필
  @Get('mentors')
  async getAllMentors(): Promise<MentorProfile[]> {
    const userId = 1;
    return await this.usersService.getAllMentors(userId)
  }

  @Get('mentor-profile')
  async findMentorProfile(): Promise<MentorProfile> {
    const userId = 1;
    return await this.usersService.findMentorProfile(userId)
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

  // 스킬
  @Post('skill')
  @UseInterceptors(FileInterceptor('logoImg'))
  async createSkill(@UploadedFile() logo, @Body() dto: CreateSkillDto) {
    return await this.usersService.createSkill(dto, logo)
  }

  // 북마크 및 취소
  @Post('bookmark/mentor')
  async bookmarkMentor(@Body() dto: BookmarkMentorDto) {
    const userId = 1;
    return await this.usersService.bookmarkMentor(dto, userId)
  }
}
