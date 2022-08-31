import {
  Body,
  Controller,
  Post,
  Req,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { CreateUserDto, UserDto } from './dto/auth.dto';
import { AuthInreface } from './interface/auth.interface';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('/signup')
  @ApiOperation({ summary: '사용자 회원 가입' })
  @ApiResponse({ status: 200, description: ' sign up user' })
  signUp(
    @Body(ValidationPipe) createUserDto: CreateUserDto,
  ): Promise<AuthInreface> {
    return this.authService.signUp(createUserDto);
  }

  @Post('signin')
  @ApiOperation({ summary: '사용자 로그인' })
  @ApiResponse({ status: 200, description: ' sign in user' })
  signIn(
    @Body(ValidationPipe) userDto: UserDto,
  ): Promise<{ accessToken: string }> {
    return this.authService.signIn(userDto);
  }

  @Post('/test')
  @UseGuards(AuthGuard())
  test(@Req() req) {
    console.log('req', req);
  }
}
