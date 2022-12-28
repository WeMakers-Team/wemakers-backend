import { ChatUserInfo, PrismaClient } from "@prisma/client";
import { chatRoomInfo, chatRoomInfoWithConnection } from "src/common/interface/socket.interface";

export class SocketRepository {
    prisma = new PrismaClient();

    async deleteNobodyRoom(){
        const isExistsRoom = await this.prisma.chatRoom.findMany({
            include: {
              ChatRoomInfo: true
            }
          })
      
          isExistsRoom.map(async (roomInfo) => {
            if(roomInfo.ChatRoomInfo.length === 0){
              await this.prisma.chatRoom.deleteMany({
                where: {
                  id: roomInfo.id
                }
              })
            }
          })
    }
    
    async listAccountRoom(accountId: number): Promise<chatRoomInfoWithConnection[]>{
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

    async detailRoomInfo({ accountId, invitedUserId }): Promise<chatRoomInfoWithConnection>{
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
    
    async chatRoomWithAccount({roomName, accountId}): Promise<chatRoomInfo>{
         const roomInfo =  await this.prisma.chatRoom.findFirst({
            where: {
              roomName,
              ChatRoomInfo: {
                some: 
                { accountId },
              },
            },
          })

          return { roomInfo }
    }

    async disconnectSocketWithRoom({roomId, accountId}): Promise<void>{
        await this.prisma.chatUserInfo.deleteMany({
            where: { chatRoomId: roomId, accountId: accountId },
        });
    }
}