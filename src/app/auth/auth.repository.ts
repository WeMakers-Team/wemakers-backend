import { PrismaClient, RefreshToken } from '@prisma/client';

export class AuthRepository {
  prisma = new PrismaClient();

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
