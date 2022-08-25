import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { UserDto, UsersService } from './users.service';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @ApiOperation({ summary: '사용자 정보 조회' })
  @ApiResponse({ status: 200, description: 'get all users' })
  getAllUsers(): any {
    return this.usersService.getAllUsers();
  }

  @Post()
  @ApiResponse({ status: 201, description: 'create user' })
  createUser(@Body() createDto: UserDto) {
    return this.usersService.createUser(createDto);
  }
}
