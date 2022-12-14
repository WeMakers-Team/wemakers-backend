import { Injectable, Logger } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { PrismaClient } from '@prisma/client';
import { Server, Socket } from 'socket.io';
import { UsersRepository } from '../users/users.repository';

@WebSocketGateway(8001, { transports: ['websocket'], namespace: 'websocket' })
export class EventsGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() public server: Server;
  private logger: Logger = new Logger('AppGateway');


  @SubscribeMessage('events')
    handleEvent(@MessageBody() data: string): string {
    return data;
  }

  afterInit(server: Server) {
    this.logger.log('init')
  }

  handleConnection(@ConnectedSocket() socket: Socket, client: Socket) {
    this.logger.log(`Client Connected : ${client}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client Disconnected : ${client}`);
  }
}