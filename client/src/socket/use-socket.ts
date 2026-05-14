import { SocketContext } from "./socket"
import { useContext } from "react"


export function useSocket() {
  return useContext(SocketContext)
};
