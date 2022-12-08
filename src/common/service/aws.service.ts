import { HttpException, Injectable } from '@nestjs/common';
import * as aws from 'aws-sdk';
import { exceptionMessages } from '../exceptionMessage';

@Injectable()
export class AwsS3Service {
  AWS_REGION = '';
  AWS_S3_BUCKET_NANE = '';
  AWS_ACCESS_KEY_ID = '';
  AWS_SECRET_ACCESS_KEY = '';

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

  async uploadS3bucket(folderName: string, fileName: string, file) {
    try {
      const upload = await this.s3
        .putObject({
          Bucket: this.AWS_S3_BUCKET_NANE,
          Key: `${folderName}/${fileName}`,
          Body: file.buffer,
          ContentType: file.mimetype,
          ContentEncoding: file.encoding,
          ContentDisposition: 'inline',
        })
        .promise();

      console.log(upload);
    } catch (err) {
      throw new HttpException(exceptionMessages.FAILED_UPLOAD_S3, 400);
    }
  }
}
