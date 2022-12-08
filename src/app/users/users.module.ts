import { Module } from '@nestjs/common';
import { AwsS3Service } from 'src/common/service/aws.service';
import { UsersController } from './users.controller';
import { UsersRepository } from './users.repository';
import { UsersService } from './users.service';

@Module({
  controllers: [UsersController],
  providers: [UsersService, UsersRepository, AwsS3Service],
  exports: [UsersService, UsersRepository],
})
export class UsersModule {}
