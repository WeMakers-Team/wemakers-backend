import { HttpException, Injectable } from '@nestjs/common';
import { Account } from 'src/common/interface/auth.interface';
import { UsersRepository } from './users.repository';
import { AwsS3Service } from 'src/common/service/aws.service';
import { exceptionMessagesAuth } from 'src/common/exceptionMessage';

@Injectable()
export class UsersService {
  constructor(
    private readonly s3: AwsS3Service,
    private readonly usersRepository: UsersRepository,
  ) {}

  async findUser(userId: number): Promise<Account> {
    const user = await this.usersRepository.findUserByIdOrWhere(userId);

    if (!user) {
      throw new HttpException(exceptionMessagesAuth.USER_NOT_EXIST, 400);
    }

    const { password, ...response } = user;
    return response;
  }

  async updateProfile(userId: number, profileImg) {
    const bucketFolder = 'profile';
    const imgFile = `img_${userId}_${profileImg.originalname}`;

    // s3 업로드
    await this.s3.uploadS3bucket(bucketFolder, imgFile, profileImg);

    // db에 url 저장
    return await this.usersRepository.updateProfile(userId, imgFile);
  }
}
