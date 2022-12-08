import { HttpException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as aws from 'aws-sdk';
import { exceptionMessages } from '../exceptionMessage';

@Injectable()
export class AwsS3Service {
  private readonly AWS_REGION = 'ap-northeast-2';
  private readonly AWS_S3_BUCKET_NANE = 'wemakers-bucket';
  private readonly s3;

  constructor(private readonly config: ConfigService) {
    aws.config.update({
      region: this.AWS_REGION,
      credentials: {
        accessKeyId: this.config.get('AWS_ACCESS_KEY_ID'),
        secretAccessKey: this.config.get('AWS_SECRET_ACCESS_KEY'),
      },
    });

    this.s3 = new aws.S3({
      apiVersion: '2006-03-01',
    });
  }

  async uploadS3bucket(folderName: string, fileName: string, file) {
    if (!folderName) {
      throw new HttpException(exceptionMessages.EMPTY_BUCKET_FOLDER_NAME, 400);
    }

    try {
      await this.s3
        .putObject({
          Bucket: this.AWS_S3_BUCKET_NANE,
          Key: `${folderName}/${fileName}`,
          Body: file.buffer,
          ContentType: file.mimetype,
          ContentEncoding: file.encoding,
          ContentDisposition: 'inline',
        })
        .promise();
    } catch (err) {
      console.error(err);
      throw new HttpException(exceptionMessages.FAILED_UPLOAD_S3, 400);
    }
  }
}
