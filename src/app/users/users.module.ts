import { Module } from '@nestjs/common';
import { AwsS3Service } from 'src/common/service/aws.service';
import { EventsGateway } from '../socket/socket.gateway';
import { SocketModule } from '../socket/socket.module';
import { UsersController } from './users.controller';
import { UsersRepository } from './users.repository';
import { UsersService } from './users.service';

@Module({
  controllers: [UsersController],
  providers: [UsersService, UsersRepository, AwsS3Service, SocketModule, EventsGateway],
  exports: [UsersService, UsersRepository],
})
export class UsersModule {}
