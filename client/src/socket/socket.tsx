import { useAuth } from "#/auth/use-auth";
import {
  createContext,
  useEffect,
  useState,
  type ReactNode
} from "react";

import { io, Socket } from "socket.io-client"

export const SocketContext = createContext<Socket | null>(null);

export function SocketProvider({ children }: {children: ReactNode}) {

  const [socket, setSocket] = useState<Socket | null>(null);

  const {accessToken: token, loading, guestId} = useAuth(); 

  useEffect(() => {

    if (loading) return;

    const socketInstance = io("http://localhost:8000", {
      auth: {
        token,
        guestId
      },
      autoConnect: false
    });

    console.log(token, "token");

    setSocket(socketInstance)

    return () => {
      socketInstance.disconnect()
    }

  }, [token, guestId]);

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  )
};
