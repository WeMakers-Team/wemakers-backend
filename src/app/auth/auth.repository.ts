import { PrismaClient, RefreshToken } from '@prisma/client';

export class AuthRepository {
  prisma = new PrismaClient();

  async findRefreshToken(accountId: number): Promise<RefreshToken> {
    return await this.prisma.refreshToken.findFirst({
      where: {
        accountId,
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

  async createRefreshTokenHash(accountId: number, refreshToken: string) {
    await this.prisma.refreshToken.create({
      data: {
        refreshToken,
        account: {
          connect: { id: accountId },
        },
      },
    });
  }
}
