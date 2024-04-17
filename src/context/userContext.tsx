import React from "react";
import { userContextType } from "../types/types";
import avatar from "animal-avatar-generator";
import { uniqueNamesGenerator, Config, adjectives, animals } from "unique-names-generator";
import Peer from "peerjs";

export const UserContext = React.createContext<userContextType | null>(null);

const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {

  const customConfig: Config = {
    dictionaries: [adjectives, animals],
    separator: '-',
    length: 2
  };

  const username = uniqueNamesGenerator(customConfig);
  const userAvatar = avatar(Math.random().toString(), { size: 50 });

  const peerId = crypto.randomUUID();

  const peer = new Peer(peerId, {
    host: "simpleshare-rtc.onrender.com",
    path: "/peerjs/rtc",
    port: 443,
    debug: 2,
    secure: true,
  });

  return <UserContext.Provider value={{ peer, username, userAvatar }}>{children}</UserContext.Provider>
};

export default UserProvider;