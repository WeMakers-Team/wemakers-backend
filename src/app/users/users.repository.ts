import { PrismaClient, User } from '@prisma/client';
import { AuthCreateDto } from '../../common/dto/auth.dto';

export class UsersRepository {
  prisma = new PrismaClient();

  async createUser(
    { password, checkPassword, ...dto }: AuthCreateDto,
    hashedPassword: string,
  ): Promise<User> {
    const newUser = await this.prisma.user.create({
      data: {
        password: hashedPassword,
        ...dto,
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
}
