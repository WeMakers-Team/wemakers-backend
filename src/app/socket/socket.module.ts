import { Logger, Module } from '@nestjs/common';
import { SocketController } from './socket.controller';
import { EventsGateway } from './socket.gateway';
import { SocketService } from './socket.service';

@Module({
  imports: [EventsGateway],
  controllers: [SocketController],
  providers: [SocketService],
  exports: [SocketModule, EventsGateway]
})
export class SocketModule {}
