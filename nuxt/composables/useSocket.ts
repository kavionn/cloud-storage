import { io, type Socket } from 'socket.io-client'

export const useSocket = () => {
   const socketState = useState<Socket | null>('global_socket', () => null)

   if (!process.client) return null

   if (!socketState.value) {
      const socket = io({
         path: '/socket.io',
         autoConnect: true,
         reconnection: true,
         reconnectionAttempts: Infinity,
         reconnectionDelay: 1000,
         reconnectionDelayMax: 5000,
         transports: ['websocket']
      })

      socket.on('connect', () => {
         console.log('📡 Socket Connected:', socket.id)

         const persistentSessionId = localStorage.getItem('session_id')

         socket.emit('register_session', persistentSessionId)
      })

      socket.on('session_established', (newSessionId: string) => {
         localStorage.setItem('session_id', newSessionId)
      })

      socket.on('disconnect', reason => {
         console.log('❌ Socket Disconnected:', reason)
      })

      document.addEventListener('visibilitychange', () => {
         if (!document.hidden && !socket.connected) {
            socket.connect()
         }
      })
      
      if (socketState.value && !socketState.value.connected) {
         socketState.value.connect()
      }

      socketState.value = socket
   }
   
   

   return socketState.value
}