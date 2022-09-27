import { PrismaClient, RefreshToken, User } from '@prisma/client';
import { AuthCreateDto } from '../../common/dto/auth.dto';

export class UsersRepository {
  prisma = new PrismaClient();

  async createUser(
    authCreateDto: AuthCreateDto,
    hashedPassword: string,
  ): Promise<User> {
    const newUser = await this.prisma.user.create({
      data: {
        name: authCreateDto.name,
        email: authCreateDto.email,
        password: hashedPassword,
        role: authCreateDto.role,
      },
    });
    return newUser;
  }

  async getAllUsers(): Promise<User[]> {
    return await this.prisma.user.findMany();
  }

  async findUserByIdOrEmail(userData: number | string): Promise<User> {
    const whereOption =
      typeof userData === 'number' ? { id: userData } : { email: userData };

    const user = await this.prisma.user.findFirst({
      where: whereOption,
    });

    return user;
  }

  async findRefreshToken(userId: number): Promise<RefreshToken> {
    return await this.prisma.refreshToken.findFirst({
      where: {
        userId,
      },
    });
  }

  async deleteRefreshToken(tokenId: number) {
    await this.prisma.refreshToken.delete({
      where: {
        id: tokenId,
      },
    });
  }

  async createRefreshTokenHash(userId: number, refreshToken: string) {
    await this.prisma.refreshToken.create({
      data: {
        refreshToken,
        user: {
          connect: { id: userId },
        },
      },
    });
  }
}
