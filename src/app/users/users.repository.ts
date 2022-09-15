import { PrismaClient, RefreshToken, User } from '@prisma/client';
import { AuthCreateDto } from '../auth/dto/auth.dto';

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

  async findAllUsers(): Promise<User[]> {
    return await this.prisma.user.findMany();
  }

  async findUserById(userId: number): Promise<User> {
    const user = await this.prisma.user.findFirst({
      where: { id: userId },
    });

    return user;
  }

  async findUserByEmail(email: string): Promise<User> {
    const user = await this.prisma.user.findFirst({
      where: { email },
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
