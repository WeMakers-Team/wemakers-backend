import { ChatUserInfo, PrismaClient } from "@prisma/client";
import { chatRoomInfo } from "src/common/interface/socket.interface";

export class SocketRepository {
    prisma = new PrismaClient();

    async listAccountRoom(accountId: number): Promise<chatRoomInfo[]>{
        const rooms = await this.prisma.chatUserInfo.findMany({
            where: {
                accountId: accountId
            }
        })

        const response = rooms.map((roomInfo) => {
            return {
                roomInfo
            }
        })

        return response
    }

    async detailRoomInfo({ accountId, invitedUserId }): Promise<chatRoomInfo>{
        const roomInfo = await this.prisma.chatUserInfo.findFirst({
            where: {
                AND: [
                    {accountId: accountId}, { accountId: invitedUserId}
                ]              
            }
        })

        return { roomInfo }
    }

    async createRoomWithUsers({roomName, accountId, invitedUserId}){
        const { id:chatRoomId } = await this.prisma.chatRoom.create({
            data: {
              roomName,
              ChatRoomInfo: {
                create: [
                  {
                    isAccept: true,
                    Account: {
                      connect: 
                        { id: accountId }
                    },
                  },
                ],
              },
            },
        })

        await this.prisma.chatUserInfo.create({
            data: {
              isAccept: true,
              chatRoomId,
              accountId: invitedUserId,
            },
        })
    }
    
}