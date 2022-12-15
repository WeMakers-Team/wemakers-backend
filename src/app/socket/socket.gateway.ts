import { Logger } from '@nestjs/common';
import { IoAdapter } from '@nestjs/platform-socket.io';
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
import { Server, Socket, Namespace } from 'socket.io';
import { UsersRepository } from '../users/users.repository';

let createdRooms = [];
@WebSocketGateway(8001, { transports: ['websocket'], namespace: 'websocket' })
export class EventsGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  constructor(private user: UsersRepository) {}
  @WebSocketServer()
  server: Server;
  logger = new Logger('GateWay');

  afterInit() {
    this.server.on('delete-room', (room) => {
      const deletedRoom = createdRooms.find(
        (createdRoom) => createdRoom === room,
      );
      if (!deletedRoom) return;

      this.server.emit('delete-room', deletedRoom);

      createdRooms = createdRooms.filter(
        (createdRoom) => createdRoom !== deletedRoom,
      ); // 유저가 생성한 room 목록 중에 삭제되는 room 있으면 제거
    });

    this.logger.debug('웹소켓 서버 초기화 ✅');
  }

  handleDisconnect(client: Socket) {
    this.logger.debug(`${client.id} is discsonnected...`);
  }

  async handleConnection(client: Socket) {
    const numId = Number(client.handshake.query.id);
    const { nickName } = await this.user.findUserByIdOrWhere(numId);

    this.server.emit('msgToClient', {
      nickName,
      text: `${nickName} is connect!`,
    });
  }

  @SubscribeMessage('msgToServer')
  handleMessage(client: Socket, payload: { name: string; text: string }): void {
    this.server.emit('msgToClient', payload);
    this.logger.debug(`${payload.text}`);
  }

  @SubscribeMessage('create-room')
  handleCreateRoom(
    @ConnectedSocket() socket: Socket,
    @MessageBody() roomName: string,
  ) {
    const exists = createdRooms.find((createdRoom) => createdRoom === roomName);
    if (exists) {
      return { success: false, payload: `${roomName} 방이 이미 존재합니다.` };
    }

    socket.join(roomName); // 기존에 없던 room으로 join하면 room이 생성됨
    createdRooms.push(roomName); // 유저가 생성한 room 목록에 추가
    this.server.emit('createRoom', roomName);
    this.logger.debug(`${roomName} created`);
    return { success: true, payload: roomName };
  }

  @SubscribeMessage('join-room')
  handleJoinRoom(
    @ConnectedSocket() socket: Socket,
    @MessageBody() roomName: string,
    client: Socket,
  ) {
    socket.join(roomName);
    this.server.to(roomName).emit('joinMessage', `${roomName}에 입장햇습니다`);
  }
}
