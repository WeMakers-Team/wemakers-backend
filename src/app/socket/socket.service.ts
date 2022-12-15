import { Injectable } from '@nestjs/common';
import { chatRoom } from 'src/common/dto/socket.dto';

@Injectable()
export class SocketService {
  private chatRoomList: Record<string, chatRoom>;
}
