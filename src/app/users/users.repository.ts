import { Account, MentorProfile, PrismaClient } from '@prisma/client';
import { BookmarkMentorDto, CreateSkillDto, UpdateAccountDto, UpdateMentorProfileDto } from 'src/common/dto/users.dto';
import { AuthCreateDto } from '../../common/dto/auth.dto';

export class UsersRepository {
  prisma = new PrismaClient();

  async createUser(
    { password, checkPassword, ...dto }: AuthCreateDto,
    hashedPassword: string,
  ): Promise<Account> {

    let data: any = {
      password: hashedPassword,
      ...dto,
    }

    if (dto.role === "MENTOR") {
      data.MentorProfile = {
        create: {
          mentorIntroduce: ""
        }
      }
    }

    const newUser = await this.prisma.account.create({
      data
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

  async getAllMentors(userId: number): Promise<MentorProfile[]> {
    return await this.prisma.mentorProfile.findMany({
      include: {
        account: {
          include: {
            BookmarkTo: { // 북마크한 유저들
              select: {
                isClicked: true // 북마크 여부
              },
              where: {
                menteeId: userId
              }
            }
          }
        }
      }
    })
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
        Skill: skillsId ? {
          connect: skillsId.map((id) => {
            return {
              id
            }
          })
        } : undefined,
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

  async createSkill(dto: CreateSkillDto, logoImg) {
    return await this.prisma.skill.create({
      data: {
        logo: logoImg,
        ...dto
      }
    })
  }

  async bookmarkMentor({ mentorProfileId, isClicked }: BookmarkMentorDto, userId: number) {
    return await this.prisma.bookmarkMentors.upsert({
      where: {
        menteeId_mentorId: {
          menteeId: userId,
          mentorId: mentorProfileId
        }
      },
      update: {
        isClicked: !isClicked,
      },
      create: {
        menteeId: userId,
        mentorId: mentorProfileId,
      },
    })
  }
}
