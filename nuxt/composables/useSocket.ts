import { io } from 'socket.io-client'

export const useSocket = () => {
   if (process.client) {
      return io()
   }
   return null
}
