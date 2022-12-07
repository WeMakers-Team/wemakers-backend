import { HttpException, Injectable } from '@nestjs/common';
import { Account } from 'src/common/interface/auth.interface';
import { UsersRepository } from './users.repository';

import * as aws from 'aws-sdk';

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
    const imgName = `${userId}_${profileImg.originalname}`;

    await this.s3.uploadS3bucket(bucketFolder, imgName, profileImg);

    // db에 url 저장
    return await this.usersRepository.updateProfile(userId, imgName);
  }
}

@Injectable()
class AwsS3Service {
  private readonly AWS_REGION = '';
  private readonly AWS_S3_BUCKET_NANE = '';
  private readonly AWS_ACCESS_KEY_ID = '';
  private readonly AWS_SECRET_ACCESS_KEY = '';

  private readonly s3;

  constructor() {
    aws.config.update({
      region: this.AWS_REGION,
      credentials: {
        accessKeyId: this.AWS_ACCESS_KEY_ID,
        secretAccessKey: this.AWS_SECRET_ACCESS_KEY,
      },
    });

    this.s3 = new aws.S3({
      apiVersion: '2006-03-01',
    });
  }

  async uploadS3bucket(folderName: string, imgName: string, file) {
    try {
      const upload = await this.s3
        .putObject({
          Bucket: this.AWS_S3_BUCKET_NANE,
          Key: `${folderName}/${imgName}`,
          Body: file.buffer,
          ContentType: file.mimetype,
          ContentEncoding: file.encoding,
          ContentDisposition: 'inline',
        })
        .promise();

      console.log(upload);
    } catch (err) {
      throw new HttpException('S3 에러', 400);
    }
  }
}
