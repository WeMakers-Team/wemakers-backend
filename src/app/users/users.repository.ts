import { Account, MentorProfile, PrismaClient } from '@prisma/client';
import { UpdateAccountDto, UpdateMentorProfileDto } from 'src/common/dto/users.dto';
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

  async findUserByIdOrWhere(
    where: number | { [key: string]: any },
  ): Promise<Account> {
    const whereOption = typeof where === 'number' ? { id: where } : where;

    return await this.prisma.account.findFirst({
      where: whereOption,
    });
  }

  async updateAccount(userId: number, dto: UpdateAccountDto, profileImg: string | undefined): Promise<Account> {
    return await this.prisma.account.update({
      where: {
        id: userId,
      },
      data: {
        profilePhoto: profileImg,
        ...dto
      },
    });
  }

  async getAllMentors(): Promise<MentorProfile[]> {
    return await this.prisma.mentorProfile.findMany()
  }

  async findMentorProfile(userId: number): Promise<MentorProfile> {
    return await this.prisma.mentorProfile.findFirst({
      where: {
        accountId: userId
      }
    })
  }

  async updateMentorProfile(userId: number, dto: UpdateMentorProfileDto) {
    const { skillsId, category, ...others } = dto;

    return await this.prisma.mentorProfile.update({
      where: {
        accountId: userId
      },
      data: {
        ...others,
        Skill: {
          connect: skillsId.map((id) => {
            return {
              id
            }
          })
        },
      }
    })
  }

  async isPublicMentorProfile(userId: number) {
    const { isPublic } = await this.prisma.mentorProfile.findFirst({
      where: {
        accountId: userId
      }
    })

    return await this.prisma.mentorProfile.update({
      where: {
        accountId: userId
      },
      data: {
        isPublic: isPublic ? false : true
      }
    })
  }
}
