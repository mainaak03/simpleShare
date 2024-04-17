/* eslint-disable @typescript-eslint/no-explicit-any */
import { ChangeEvent, FC, useEffect, useRef, useState, MouseEvent, useContext } from "react";
import { PlusIcon, CubeIcon, CubeTransparentIcon, XMarkIcon, DocumentDuplicateIcon, LinkIcon, BoltIcon, HandRaisedIcon } from "@heroicons/react/24/outline";
import { MainContainerProps, userContextType } from "../types/types";
import Peer, { DataConnection } from "peerjs";
import { chunkFile } from "../utils/utils";
import { UserContext } from "../context/userContext";
import QRCode from "react-qr-code";

const MainContainer: FC<MainContainerProps> = ({ handlePokeNotif, handleConnectionNotif }) => {

    const { peer, username, userAvatar } = useContext(UserContext) as userContextType;

    const [roomToJoin, setRoomToJoin] = useState<string>("");

    const handleLinkCopy = () => {
        const url = `${peer.id}`;
        navigator.clipboard.writeText(url);
    };
    // useEffect(() => {
    //     console.log(peer.id);
    // }, []);

    return (
        <div className="flex flex-col justify-center items-center mt-12 w-1/3">
            <div className="flex flex-row justify-evenly items-center p-4 rounded-lg border-[1px] w-full">
                <div className="flex flex-row items-baseline">
                    <p className="mx-1 font-light text-lg">You are: </p>
                    <p className="mx-1 font-bold text-lg">{username}</p>
                    <p className="mx-1 font-bold text-lg">{peer.id.slice(0, 10)}</p>
                </div>
                <img className="rounded-full" src={`data:image/svg+xml;utf8,${encodeURIComponent(userAvatar)}`} />
            </div>

            <div className="flex flex-col gap-4 justify-evenly items-center w-full">
                <div className="flex flex-row w-full justify-center items-center text-md font-light">
                    <button className="flex flex-col justify-center items-center gap-2 max-w-36 m-2"
                    onClick={() => handleLinkCopy()}>
                        <p className="text-sm m-1 w-full text-center">Click to copy shareLink</p>
                        <QRCode value={peer.id} level="H" style={{ height: "auto", maxWidth: "100%", width: "100%" }} />
                        <p className="text-sm m-1 text-center">Scan the QR</p>
                    </button>
                </div>
                <p className="flex font-light text-lg">OR</p>
                <div className="flex flex-col w-full items-center justify-center">
                    <input onChange={(e) => { setRoomToJoin(e.target.value) }} className="flex w-full mb-2 p-1 h-1/2 border-[1px] rounded-md" type="text" placeholder="Enter room ID" value={roomToJoin} />
                    <button className="flex flex-row w-full justify-center items-center text-md font-light px-6 py-4 rounded-md bg-darkmode_bg bg-opacity-10">
                        <CubeTransparentIcon className="h-6 w-6 mx-4" />
                        <p>Connect to a shareLink</p>
                    </button>
                </div>
            </div>
        </div>
    )
};

export default MainContainer;