import { Account, PrismaClient } from '@prisma/client';
import { AuthCreateDto } from '../../common/dto/auth.dto';

export class UsersRepository {
  prisma = new PrismaClient();

  async createUser(
    { password, checkPassword, ...dto }: AuthCreateDto,
    hashedPassword: string,
  ): Promise<Account> {
    const newUser = await this.prisma.account.create({
      data: {
        password: hashedPassword,
        ...dto,
      },
    });
    return newUser;
  }

  async getAllUsers(): Promise<Account[]> {
    return await this.prisma.account.findMany();
  }

  async findUserByIdOrEmail(userData: number | string): Promise<Account> {
    const whereOption =
      typeof userData === 'number' ? { id: userData } : { email: userData };

    const user = await this.prisma.account.findFirst({
      where: whereOption,
    });

    return user;
  }
}
