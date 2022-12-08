import { HttpException, Injectable } from '@nestjs/common';
import { Account } from 'src/common/interface/auth.interface';
import { UsersRepository } from './users.repository';
import { AwsS3Service } from 'src/common/service/aws.service';

@Injectable()
export class UsersService {
  constructor(
    private readonly s3: AwsS3Service,
    private readonly usersRepository: UsersRepository,
  ) {}

  async findUser(userId: number): Promise<Account> {
    const { password, ...response } =
      await this.usersRepository.findUserByIdOrWhere(userId);

    return response;
  }

  async updateProfile(userId: number, profileImg) {
    const bucketFolder = '';
    const imgFile = `${userId}_${profileImg.originalname}`;

    // s3 업로드
    await this.s3.uploadS3bucket(bucketFolder, imgFile, profileImg);

    // db에 url 저장
    return await this.usersRepository.updateProfile(userId, imgFile);
  }
}
