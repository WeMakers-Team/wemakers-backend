import { UnauthorizedException } from '@nestjs/common';
import { PrismaClient, User } from '@prisma/client';
import { AuthService } from './auth.service';
import { CreateUserDto } from './dto/auth.dto';

export class AuthRepository {
  constructor(private readonly authService: AuthService) {}
  prisma = new PrismaClient();

  async createUser(
    userData: CreateUserDto,
    hashedPassword: string,
  ): Promise<User> {
    const newUser = await this.prisma.user.create({
      data: {
        name: userData.name,
        email: userData.email,
        password: hashedPassword,
        birthday: userData.birthDay,
        refreshToken: '',
        role: userData.role,
      },
    });
    return newUser;
  }

  async findUserById(userId: number): Promise<User> {
    const user = await this.prisma.user.findFirst({
      where: { id: userId },
    });

    if (!user) throw new UnauthorizedException(' This User is not exist');
    return user;
  }

  async findUserByEmail(email: string): Promise<User> {
    const user = await this.prisma.user.findFirst({
      where: { email },
    });

    if (!user) throw new UnauthorizedException(' This User is not exist');
    return user;
  }

  async deleteRefreshToken(userId: number) {
    await this.prisma.user.updateMany({
      where: { id: userId, refreshToken: { not: null } },
      data: { refreshToken: null },
    });
  }

  async updateRefreshTokenHash(userId: number, refreshToken: string) {
    await this.prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        refreshToken: refreshToken,
      },
    });
  }
}
