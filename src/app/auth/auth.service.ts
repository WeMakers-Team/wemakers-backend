import {
  ConflictException,
  HttpException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Prisma, PrismaClient, User } from '@prisma/client';
import { error } from 'console';
import { CreateUserDto, UserDto } from './dto/auth.dto';
import { AuthInreface } from './interface/auth.interface';
import * as bcrpyt from 'bcryptjs';

@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService) {}
  prisma = new PrismaClient();

  async findUser(email: string): Promise<User> {
    const user = await this.prisma.user.findUnique({
      where: {
        email: email,
      },
    });

    if (user) {
      return user;
    }
    throw new HttpException(
      '사용자 이메일이 존재하지 않습니다',
      HttpStatus.NOT_FOUND,
    );
  }

  async signUp(userData: CreateUserDto): Promise<AuthInreface> {
    const { password } = userData;
    const salt = await bcrpyt.genSalt();
    const hashedPassword = await bcrpyt.hash(password, salt);

    try {
      const newUser = await this.prisma.user.create({
        data: {
          name: userData.name,
          email: userData.email,
          password: hashedPassword,
          birthday: userData.birthDay,
          type: userData.type,
        },
      });

      const message = {
        name: newUser.name,
        email: newUser.email,
        type: newUser.type,
      };

      return message;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        throw new InternalServerErrorException('this Email already exists');
      } else if (error.code === 'P2002') {
        throw new ConflictException('this Email already exists');
      }
    }
    throw error;
  }

  async signIn(userDto: UserDto): Promise<{ accessToken: string }> {
    const { email, password } = userDto;

    const user = await this.prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (user && (await bcrpyt.compare(password, user.password))) {
      const payload = { userId: user.id, userType: user.type };
      const accessToken = await this.jwtService.sign(payload);
      return { accessToken };
    } else {
      throw new UnauthorizedException('login failed');
    }
  }
}
