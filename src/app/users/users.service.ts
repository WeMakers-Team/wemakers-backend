import { HttpException, Injectable } from '@nestjs/common';
import { Account } from 'src/common/interface/auth.interface';
import { UsersRepository } from './users.repository';
import { AwsS3Service } from 'src/common/service/aws.service';
import { exceptionMessagesAuth } from 'src/common/exceptionMessage';
import { UpdateAccountDto, UpdateMentorProfileDto } from 'src/common/dto/users.dto';

@Injectable()
export class UsersService {
  constructor(
    private readonly s3: AwsS3Service,
    private readonly usersRepository: UsersRepository,
  ) { }

  async findUser(userId: number): Promise<Account> {
    const user = await this.usersRepository.findUserByIdOrWhere(userId);

    if (!user) {
      throw new HttpException(exceptionMessagesAuth.USER_NOT_EXIST, 400);
    }

    const { password, ...response } = user;
    return response;
  }

  async updateAccount(userId: number, dto: UpdateAccountDto, profileImg?) {
    const imgFileName = profileImg ? `img_${userId}_${profileImg.originalname}` : undefined

    if (imgFileName) {
      const bucketFolderName = 'profile';

      // s3 업로드
      await this.s3.uploadS3bucket(bucketFolderName, imgFileName, profileImg);
    }

    // db 저장
    return await this.usersRepository.updateAccount(userId, dto, imgFileName);
  }

  async updateMentorProfile(userId: number, dto: UpdateMentorProfileDto) {
    return await this.usersRepository.updateMentorProfile(userId, dto);
  }

  async isPublicMentorProfile(userId: number) {
    return await this.usersRepository.isPublicMentorProfile(userId)
  }
}
