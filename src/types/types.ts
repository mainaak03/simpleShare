import Peer, { DataConnection } from "peerjs";
import { MutableRefObject } from "react";

export type MainContainerProps = {
    handleConnectionNotif: (connectionState:boolean) => void,
    roomId: string | undefined,
};

export type userContextType = {
    username: string,
    peerRef: MutableRefObject<Peer | null>,
    connRef: MutableRefObject<DataConnection | null>,
};
