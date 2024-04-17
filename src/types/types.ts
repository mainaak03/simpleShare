import Peer from "peerjs";

export type peerType = {
    socketId: string,
    username: string,
    userAvatar: string,
};

export type MainContainerProps = {
    handlePokeNotif: (senderUsername:string) => void,
    handleConnectionNotif: (connectionState:boolean) => void,
};

export type userContextType = {
    username: string,
    userAvatar: string,
    peer: Peer,
};