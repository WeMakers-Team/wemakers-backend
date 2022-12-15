import { Logger, Module } from '@nestjs/common';
import { UsersModule } from '../users/users.module';
import { SocketController } from './socket.controller';
import { EventsGateway } from './socket.gateway';
import { SocketService } from './socket.service';

@Module({
  imports: [UsersModule],
  controllers: [SocketController],
  providers: [SocketService, EventsGateway],
  exports: [SocketService],
})
export class SocketModule {}
