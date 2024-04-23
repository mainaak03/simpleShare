/* eslint-disable @typescript-eslint/no-explicit-any */
import { FC, useEffect, useState, useContext, ChangeEvent, MouseEvent } from "react";
import { CubeTransparentIcon } from "@heroicons/react/24/outline";
import { MainContainerProps, userContextType } from "../types/types";
import Peer from "peerjs";
import { chunkFile, extractRemoteUsername } from "../utils/utils";
import { UserContext } from "../context/userContext";
import QRCode from "react-qr-code";
import { AnimatePresence, m, LazyMotion, domMax } from "framer-motion";

const MainContainer: FC<MainContainerProps> = ({ roomId }) => {

    const { username, peerRef, connRef } = useContext(UserContext) as userContextType;

    const [roomToJoin, setRoomToJoin] = useState("");
    const [connected, setConnected] = useState(false);
    const [receiving, setReceiving] = useState(false);
    const [sending, setSending] = useState(false);
    const [count, setCount] = useState(0);
    const [totalChunks, setTotalChunks] = useState(0);
    const [peerId, setPeerId] = useState("");
    const [remoteUsername, setRemoteUsername] = useState("");
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [error, setError] = useState("");

    const icon = {
        hidden: {
            opacity: 0,
            pathLength: 0,
            fill: "white"
        },
        visible: {
            opacity: 1,
            pathLength: 1,
            fill: "white"
        }
    };

    const handleLinkCopy = () => {
        const url = import.meta.env.DEV?("http://localhost:5173/"+peerId):(import.meta.env.VITE_DEPLOY_URL+peerId);
        navigator.clipboard.writeText(url);
    };

    const handleConnect = () => {
        const conn = peerRef.current?.connect(roomToJoin, {
            reliable: true,
        });
        // console.log(conn);
        if (conn) {
            const remoteUsername = extractRemoteUsername(conn.peer);
            // console.log(remoteUsername);
            setRemoteUsername(remoteUsername);
            conn.on("open", () => {
                setConnected(true);
                let filename = "", filesize = 0, filetype = "", numChunks = 0;
                let receivedChunks = 0;
                let combinedChunks: Uint8Array[] = [];

                conn.on("data", async (data: any) => {
                    // console.log("Receiving data", data);
                    if (data.ACK === true) {
                        setSending(false);
                    }
                    const metadata = data.metadata || null;
                    const recvData = data.data || null;
                    if (metadata && metadata.isHeader === true) {
                        filename = metadata.filename;
                        filesize = metadata.filesize;
                        filetype = metadata.filetype;
                        numChunks = metadata.numChunks;
                        setReceiving(true);
                        setTotalChunks(numChunks);
                    }
                    else if (metadata) {
                        combinedChunks.push(recvData);
                        receivedChunks++;
                        setCount(count => count + 1);
                        if (metadata.isEOF === true) {
                            receivedChunks--;
                            // console.log("found EOF", receivedChunks, numChunks);
                            if (receivedChunks === numChunks) {
                                // console.log("in here");
                                let combinedData: Uint8Array | undefined = new Uint8Array(filesize);
                                let offset = 0;
                                for (const chunk of combinedChunks) {
                                    combinedData.set(new Uint8Array(chunk), offset);
                                    offset += chunk.byteLength;
                                }

                                // Create a Blob from the combined data
                                let fileBlob: Blob | undefined = new Blob([combinedData], { type: filetype });

                                // Create a temporary anchor element to trigger download
                                const a = document.createElement('a');
                                a.href = URL.createObjectURL(fileBlob);
                                a.download = filename;
                                a.click();

                                // Clean up
                                URL.revokeObjectURL(a.href);
                                combinedChunks = [];
                                combinedData = undefined;
                                fileBlob = undefined;
                                receivedChunks = 0;
                                setCount(0);
                                setReceiving(false);

                                conn.send({ ACK: true });

                                // console.log("File received:", filename);
                            }
                        }
                    }
                });
            });
            conn.on("close", () => {
                setConnected(false);
                setReceiving(false);
                setCount(0);
            });
            connRef.current = conn;
        }
    };

    const handleDisconnect = (e: MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        connRef.current?.close();
        setRoomToJoin("");
        setConnected(false);
    };

    const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files && event.target.files[0];
        if (file) {
            if (file.size <= 4 * 1024 * 1024 * 1024) {
                setSelectedFile(file);
                setError("");
            } else {
                setError(`File size exceeds 2 GB`);
                setSelectedFile(null);
            }
        }
    };

    const MAX_CHUNK_SIZE_BYTES = 1024 * 1024; // 1 MB (Adjust as needed)
    const handleFileSend = (e: MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        if (connRef.current && selectedFile) {
            setSending(true);
            chunkFile(selectedFile, MAX_CHUNK_SIZE_BYTES)
                .then((chunks) => {
                    chunks.forEach((chunk) => {
                        // console.log(chunk);
                        connRef.current?.send(chunk);
                    })
                })
                .then(() => {
                    setSelectedFile(null);
                    // setSending(false);
                    // console.log("Sent file")
                })
                .catch((e) => console.log(e));
        }
        else {
            // console.log("connRef not ready or file not selected");
            window.alert("No file selected.");
        }
    };

    useEffect(() => {
        if (!peerRef.current) {
            const peerid = crypto.randomUUID() + "_" + username;

            const newPeer = new Peer(peerid, {
                // host: "localhost",
                // port: 9001,
                // path: "/peerjs/rtc",
                debug: 2,
            });
            newPeer.on("connection", (dataConn) => {
                // console.log("dataConnection received", dataConn);
                const conn = dataConn;
                const remoteUsername = extractRemoteUsername(conn.peer);
                // console.log(remoteUsername);
                setRemoteUsername(remoteUsername);

                conn.on("open", () => {
                    setConnected(true);
                    let filename = "", filesize = 0, filetype = "", numChunks = 0;
                    let receivedChunks = 0;
                    let combinedChunks: Uint8Array[] = [];

                    conn.on("data", async (data: any) => {
                        // console.log("Receiving data", data);
                        if (data.ACK === true) {
                            setSending(false);
                        }
                        const metadata = data.metadata || null;
                        const recvData = data.data || null;
                        if (metadata && metadata.isHeader === true) {
                            filename = metadata.filename;
                            filesize = metadata.filesize;
                            filetype = metadata.filetype;
                            numChunks = metadata.numChunks;
                            setReceiving(true);
                            setTotalChunks(numChunks);
                        }
                        else if (metadata) {
                            combinedChunks.push(recvData);
                            receivedChunks++;
                            setCount(count => count + 1);
                            if (metadata.isEOF === true) {
                                receivedChunks--;
                                // console.log("found EOF", receivedChunks, numChunks);
                                if (receivedChunks === numChunks) {
                                    // console.log("in here");
                                    let combinedData: Uint8Array | undefined = new Uint8Array(filesize);
                                    let offset = 0;
                                    for (const chunk of combinedChunks) {
                                        combinedData.set(new Uint8Array(chunk), offset);
                                        offset += chunk.byteLength;
                                    }

                                    // Create a Blob from the combined data
                                    let fileBlob: Blob | undefined = new Blob([combinedData], { type: filetype });

                                    // Create a temporary anchor element to trigger download
                                    const a = document.createElement('a');
                                    a.href = URL.createObjectURL(fileBlob);
                                    a.download = filename;
                                    a.click();

                                    // Clean up
                                    URL.revokeObjectURL(a.href);
                                    combinedChunks = [];
                                    combinedData = undefined;
                                    fileBlob = undefined;
                                    receivedChunks = 0;
                                    setCount(0);
                                    setReceiving(false);

                                    conn.send({ ACK: true });
                                    // console.log("File received:", filename);
                                }
                            }
                        }
                    });
                });
                conn.on("close", () => {
                    setConnected(false);
                    setReceiving(false);
                    setCount(0);
                });
                connRef.current = conn;
            });
            peerRef.current = newPeer;
            // console.log(peerRef.current);
        }
    }, []);

    useEffect(() => {
        // console.log(import.meta.env.DEV?(import.meta.env.VITE_DEV_URL+peerId):(import.meta.env.VITE_DEPLOY_URL+peerId));
        
        if (peerRef.current) {
            setPeerId(peerRef.current?.id);
        }
    }, [peerRef.current]);

    useEffect(() => {
        if (roomId) {
            setRoomToJoin(roomId);
        }
    }, []);


    return (
        <LazyMotion features={domMax}>
            <div className="flex flex-col justify-center items-center mt-12 w-1/3">
                {
                    !connected ?
                        <div className="flex flex-row justify-center items-center p-4 rounded-lg border-[1px] w-full">
                            <p className="mx-1 font-light text-lg">You are: </p>
                            <p className="mx-1 font-bold text-lg">{username}</p>
                        </div>
                        :
                        <div className="flex flex-row justify-center items-center p-4 rounded-lg border-[1px] w-full">
                            <p className="mx-1 font-light text-lg">Connected to: </p>
                            <p className="mx-1 font-bold text-lg">{remoteUsername}</p>
                        </div>
                }
                <AnimatePresence>
                    {
                        !connected &&
                        <m.div className="flex flex-col gap-4 justify-evenly items-center w-full m-8" key="not-connected" layout exit={{ opacity: 0 }}>
                            <div className="flex flex-row w-full justify-center items-center text-md font-light">
                                <button className="flex flex-col justify-center items-center gap-2 max-w-36 m-2"
                                    onClick={() => handleLinkCopy()}>
                                    <p className="text-sm m-1 w-full text-center">Click to copy shareLink</p>
                                    <QRCode value={import.meta.env.DEV?("http://localhost:5173/"+peerId):(import.meta.env.VITE_DEPLOY_URL+peerId)} level="H" style={{ height: "auto", maxWidth: "100%", width: "100%" }} />
                                    <p className="text-sm m-1 text-center">Scan the QR</p>
                                </button>
                            </div>
                            <p className="flex font-light text-lg">OR</p>
                            <div className="flex flex-col w-full items-center justify-center">
                                <input onChange={(e) => { setRoomToJoin(e.target.value) }} className="flex w-full mb-2 p-1 h-1/2 border-[1px] rounded-md" type="text" placeholder="Enter room ID" value={roomToJoin} />
                                <button className="flex flex-row w-full justify-center items-center text-md font-light px-6 py-4 rounded-md bg-[rgb(163,163,163)] bg-opacity-40 hover:bg-opacity-80 transition duration-300 ease-out"
                                    onClick={handleConnect}>
                                    <CubeTransparentIcon className="h-6 w-6 mx-4" />
                                    <p>Connect to shareLink</p>
                                </button>
                            </div>
                        </m.div>
                    }
                    {
                        connected &&
                        <m.div className="flex flex-col w-full m-8 p-6 rounded-lg border-[1px]" key="connected" layout exit={{ opacity: 0 }}>
                            <div className="flex w-full justify-start font-light">
                                Select your file (&lt; 2GB):
                            </div>
                            <input className="flex justify-center items-center w-full my-4" type="file" onChange={handleFileChange} />
                            {error && <p style={{ color: 'red' }} className="flex w-full">{error}</p>}
                            {selectedFile && (
                                <div className="flex flex-col font-light">
                                    <p>Filename: {selectedFile.name}</p>
                                    <p>Type: {selectedFile.type}</p>
                                    <p>Size: {(selectedFile.size / 1024 / 1024).toFixed(4)} MB</p>
                                </div>
                            )}
                            <m.div className="flex flex-row gap-4 justify-evenly items-center">
                                {(sending !== receiving) ?
                                    <m.button className="flex flex-1 justify-center items-center my-4 p-4 rounded-md transition duration-300 ease-out">
                                        {
                                            !receiving && <m.svg
                                                xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6">
                                                <m.path
                                                    d="m3.75 13.5 10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75Z"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    variants={icon}
                                                    initial="hidden"
                                                    animate="visible"
                                                    transition={{
                                                        ease: "linear",
                                                        default: { duration: 2, ease: "easeInOut" },
                                                        fill: { duration: 2, ease: [1, 0, 0.8, 1] },
                                                        delay: 2,
                                                    }}
                                                />
                                            </m.svg>
                                        }
                                        {
                                            sending ?
                                                `Sending...`
                                                :
                                                `Received ${count} / ${totalChunks} chunks`
                                        }
                                    </m.button>
                                    :
                                    <m.button className="flex flex-1 justify-center items-center mt-4 p-4 rounded-md bg-[rgb(163,163,163)] bg-opacity-40 hover:bg-opacity-80 transition duration-300 ease-out" onClick={(e) => handleFileSend(e)}>
                                        {/* <BoltIcon className="h-6 w-6 mx-4" /> */}
                                        <m.svg
                                            xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6 mx-2">
                                            <m.path
                                                d="m3.75 13.5 10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75Z"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                variants={icon}
                                                initial="hidden"
                                                animate="visible"
                                                transition={{
                                                    ease: "linear",
                                                    default: { duration: 2, ease: "easeInOut" },
                                                    fill: { duration: 2, ease: [1, 0, 0.8, 1] },
                                                    delay: 2,
                                                }}
                                            />
                                        </m.svg>
                                        Send!
                                    </m.button>
                                }
                                <m.button className="flex flex-1 justify-center items-center mt-4 p-4 rounded-md bg-[rgb(163,163,163)] bg-opacity-40 hover:bg-opacity-80 transition duration-300 ease-out" onClick={handleDisconnect}>
                                    <m.svg
                                        xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6 mx-2">
                                        <m.path
                                            d="M6 18 18 6M6 6l12 12"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            variants={icon}
                                            initial="hidden"
                                            animate="visible"
                                            transition={{
                                                ease: "linear",
                                                default: { duration: 2, ease: "easeInOut" },
                                                fill: { duration: 2, ease: [1, 0, 0.8, 1] },
                                                delay: 2,
                                            }}
                                        />
                                    </m.svg>
                                    Disconnect
                                </m.button>
                            </m.div>
                        </m.div>
                    }
                </AnimatePresence>
            </div>
        </LazyMotion>
    )
};

export default MainContainer;