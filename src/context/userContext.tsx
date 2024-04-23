import React, { useRef } from "react";
import { userContextType } from "../types/types";
import { uniqueNamesGenerator, Config, adjectives, animals } from "unique-names-generator";
import Peer, { DataConnection } from "peerjs";

export const UserContext = React.createContext<userContextType | null>(null);

const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {

  const customConfig: Config = {
    dictionaries: [adjectives, animals],
    separator: '-',
    length: 2
  };

  const username = uniqueNamesGenerator(customConfig);

  const peerRef = useRef<Peer | null>(null);
  const connRef = useRef<DataConnection | null>(null);

  return <UserContext.Provider value={{ username, peerRef, connRef }}>{children}</UserContext.Provider>
};

export default UserProvider;