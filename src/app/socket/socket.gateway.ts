import { HttpException, Logger } from '@nestjs/common';
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
import { PrismaClient } from '@prisma/client';
import { IoTThingsGraph } from 'aws-sdk';
import { Server, Socket } from 'socket.io';
import { MessagePayload } from 'src/common/dto/socket.dto';
import {  exceptionMessagesSocket } from 'src/common/exceptionMessage';
import { UsersRepository } from '../users/users.repository';
import { SocketRepository } from './socket.repository';

let createdRooms = [];
@WebSocketGateway(8001, { transports: ['websocket'], namespace: 'websocket' })
export class EventsGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  prisma = new PrismaClient();
  constructor(
    private user: UsersRepository,
    private socketRepository: SocketRepository
    ) {}
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

  async handleDisconnect(client: Socket) {
    const numId = Number(client.handshake.query.id);
    const { nickName } = await this.user.findUserByIdOrWhere(numId);
    this.logger.debug(`${nickName} is discsonnected...`);
  }

  async handleConnection(client: Socket) {
    const numId = Number(client.handshake.query.id);
    const { nickName } = await this.user.findUserByIdOrWhere(numId);

    this.server.emit('msgToClient', {
      nickName,
      text: `${nickName} is connect!`,
    });
  }

  @SubscribeMessage('list-room')
  async listRoom(
    @ConnectedSocket() socket: Socket,
  ){

    const chatUserId = Number(socket.handshake.query.id);

    const roomInfo = await this.socketRepository.listAccountRoom(chatUserId)

    return roomInfo;
  }


  @SubscribeMessage('msgToServer')
  async handleMessage(
    @ConnectedSocket() socket: Socket,
    @MessageBody() { roomName, message }: MessagePayload,
  ) {
    const chatUserId = Number(socket.handshake.query.id);
    const { nickName } = await this.user.findUserByIdOrWhere(chatUserId);
    
    socket.broadcast
      .to(roomName)
      .emit('msgToReciver', { nickName, message });

    
    this.logger.debug('message 전송 완료')
    return { nickName , message,  };
  }

  @SubscribeMessage('create-room')
  async handleCreateRoom(
    @ConnectedSocket() socket: Socket, 
    @MessageBody() roomName: string,
  ) {
    const chatUserId = Number(socket.handshake.query.id);
    const invitedUserId = Number(socket.handshake.query.inviteId)
    const { nickName } = await this.user.findUserByIdOrWhere(chatUserId);
    const { nickName: invitedUserNickname } = await this.user.findUserByIdOrWhere(invitedUserId);
    
    try {
      
      const {roomInfo} = await this.socketRepository.detailRoomInfo({accountId: chatUserId, invitedUserId: invitedUserId})
      
      if (roomInfo) {
        throw new HttpException(exceptionMessagesSocket.THIS_ROOM_ALREADY_EXISTS, 400)
      }

      await this.socketRepository.createRoomWithUsers({
        roomName,
        accountId: chatUserId,
        invitedUserId
      })
      
    } catch(err){
      throw new HttpException(err.message, 400)
    }

    socket.join(roomName); // 기존에 없던 room으로 join하면 room이 생성됨

    this.server.emit('createRoom', `${nickName}님이 ${invitedUserNickname}을 초대하였습니다`);
    this.logger.debug(`${nickName} create ${roomName} room`);
  }

  @SubscribeMessage('join-room')
  async handleJoinRoom(
    @ConnectedSocket() socket: Socket,
    @MessageBody() roomName: string,
  ) {
    socket.join(roomName);

    const chatUserId = Number(socket.handshake.query.id);

    try{
      const exRoom = await this.prisma.chatRoom.findFirst({
        where: {
          roomName,
          ChatRoomInfo: {
            some: 
            { accountId: chatUserId},
          },
        },
      })
  
      if(!exRoom){
        throw new HttpException(exceptionMessagesSocket.THIS_ROOM_DOES_NOT_EXISTS, 400)
      }

    }catch(err){
      throw new HttpException(err.message, 400)
    }
    this.server.to(roomName).emit('joinMessage', `$${roomName}에 입장햇습니다`);
  }

  @SubscribeMessage('leave-room')
  async leaveRoom(
    roomName: string,
    @ConnectedSocket() socket: Socket,
    ) {
    const chatUserId = Number(socket.handshake.query.id);
    const { nickName } = await this.user.findUserByIdOrWhere(chatUserId);
    try{
      const exRoom = await this.prisma.chatRoom.findFirst({
        where: {
          roomName,
          ChatRoomInfo: {
            some: 
            { accountId: chatUserId},
          },
        },
      })

      if(!exRoom){
        throw new HttpException(exceptionMessagesSocket.THIS_ROOM_DOES_NOT_EXISTS, 400)
      }

     socket.leave(roomName)

     await this.prisma.chatUserInfo.deleteMany({
      where: { chatRoomId: exRoom.id, accountId: chatUserId },
    });
    
     this.server.to(roomName).emit('leaveRoomMessage', `${nickName}님이 ${roomName}에서 퇴장하셨습니다`)
    }catch(err){
      throw new HttpException(err.message, 400)
    }
  }
}
