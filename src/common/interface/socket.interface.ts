import { ChatUserInfo as ChatUserInfoType, ChatRoom as chatRoomType } from '@prisma/client';

export type chatRoomInfoWithConnection = {
    roomInfo : ChatUserInfoType
}


export type chatRoomInfo = {
    roomInfo : chatRoomType
}