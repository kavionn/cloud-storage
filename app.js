import { App } from '@neoxr/webly'
import './lib/system/config.js'
import assist from './lib/system/global.js'
import middleware from './middlewares/index.js'
import { Utils } from './lib/index.js'
import os from 'node:os'
import fs from 'fs'
import path from 'path'
import { randomUUID } from 'node:crypto'

const onlineUsers = new Map()

const initialization = async () => {
   await assist()
   if (!fs.existsSync('./public/' + process.env.FILE_PATH)) fs.mkdirSync('./public/' + process.env.FILE_PATH)
   if (!fs.existsSync('./temp')) fs.mkdirSync('./temp')
}

const app = new App({
   name: 'Uploader',
   staticPath: ['nuxt/.output/public', 'public'],
   routePath: './routes',
   middleware,
   socket: true,
   socketOpts: {
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      pingInterval: 25000,
      pingTimeout: 5000
   },
   session: {
      name: 'token',
      keys: ['session'],
      maxAge: 72 * 60 * 60 * 1000,
      httpOnly: false,
      sameSite: 'strict'
   },
   cors: {
      origin: '*',
      methods: ['GET', 'POST', 'PUT', 'DELETE'],
      allowedHeaders: '*',
      preflightContinue: false,
      optionsSuccessStatus: 204,
      exposedHeaders: '*',
      credentials: true
   },
   port: process.env.PORT,
   error: (req, res) => {
      res.sendFile(path.join(process.cwd(), 'nuxt/.output/public', '404.html'))
   }
})

app?.socket?.on('connection', (socket) => {
   console.log('🟢 Client connected:', socket.id)

   socket.on('register_session', (persistentSessionId) => {
      let currentSessionId = persistentSessionId

      if (!currentSessionId || !onlineUsers.has(currentSessionId)) {
         currentSessionId = randomUUID()
         socket.emit('session_established', currentSessionId)
      } else {}

      const user = onlineUsers.get(currentSessionId)
      if (user && user.disconnectionTimer) {
         clearTimeout(user.disconnectionTimer)
      }

      onlineUsers.set(currentSessionId, {
         socketId: socket.id,
         disconnectionTimer: null
      })
   })

   const system = async () => {
      let size = 0, downloads = 0

      const files = await global.db.fetch('uploader') || []
      files.map(v => size += v.bytes)
      files.map(v => downloads += v.downloads)

      const statistic = await global.db.fetch('statistic') || []

      const cpuUsage = os.loadavg()[0]
      const totalMemory = os.totalmem()
      const freeMemory = os.freemem()
      const usedMemory = totalMemory - freeMemory
      const diskUsage = 0

      const information = {
         device: `${os.type()} (${os.arch()})`,
         cpuUsage: cpuUsage.toFixed(2),
         memory: {
            total: totalMemory,
            used: usedMemory,
            free: freeMemory,
            usage: ((usedMemory / totalMemory) * 100).toFixed(2)
         },
         runtime: Utils.toTime(process.uptime() * 1000),
         processor: `${os.cpus()[0].model}`,
         diskUsage: diskUsage.toFixed(2),
         files: {
            size: size,
            downloads: (downloads)?.toLocaleString()?.replace(/[,]/g, '.'),
            total: (files.length || 0)?.toLocaleString()?.replace(/[,]/g, '.')
         },
         statistic: {
            visitor: statistic?.[0]?.visitor || 0,
            hit: (statistic?.[0]?.hit || 0)?.toLocaleString()?.replace(/[,]/g, '.')
         }
      }
      socket.emit('system', information)
   }

   const interval = setInterval(system, 1000)

   socket.on('disconnect', () => {
      console.log('🔴 Client disconnected:', socket.id)
      clearInterval(interval)

      let userSessionId = null
      for (const [sessionId, user] of onlineUsers.entries()) {
         if (user.socketId === socket.id) {
            userSessionId = sessionId
            break
         }
      }

      if (userSessionId) {
         const user = onlineUsers.get(userSessionId)

         user.disconnectionTimer = setTimeout(() => {
            onlineUsers.delete(userSessionId)
         }, 30000)
      }
   })
})

await initialization()

app.start()