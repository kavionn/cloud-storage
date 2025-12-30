import { Utils } from '../../lib/index.js'
import path from 'path'
import fs from 'fs'
import multer from 'multer'

const uploadDir = `public/${process.env.FILE_PATH}`
if (!fs.existsSync(uploadDir)) {
   fs.mkdirSync(uploadDir, { recursive: true })
}

const storage = multer.diskStorage({
   destination: (req, file, cb) => {
      cb(null, uploadDir)
   },
   filename: (req, file, cb) => {
      const id = Utils.makeId(6)
      const extension = path.extname(file.originalname)
      const newFilename = `${id}${extension}`

      req.fileInfo = {
         id,
         newFilename
      }

      cb(null, newFilename)
   }
})

const upload = multer({
   storage: storage,
   limits: {
      fileSize: parseInt(process.env.MAX_UPLOAD_SIZE) * 1024 * 1024
   }
})

export const routes = {
   category: 'api',
   path: '/api/upload',
   method: 'post',
   middleware: [upload.single('file')],
   execution: async (req, res, next) => {
      try {
         const file = req.file
         const fields = req.body
         const { id, newFilename } = req.fileInfo

         if (!file) {
            return res.status(400).json({
               creator: global.creator,
               status: false,
               msg: 'File not found!'
            })
         }

         if (fields.expiry === 'permanent' && !fields.pin) {
            return res.status(401).json({
               creator: global.creator,
               status: false,
               msg: 'PIN is required for permanent upload.'
            })
         }

         if (fields.expiry === 'permanent' && fields.pin !== process.env.PIN) {
            return res.status(401).json({
               creator: global.creator,
               status: false,
               msg: 'Invalid PIN!'
            })
         }

         let expired
         switch (fields.expiry) {
            case '5m': expired = Date.now() + 5 * 60 * 1000; break
            case '15m': expired = Date.now() + 15 * 60 * 1000; break
            case '30m': expired = Date.now() + 30 * 60 * 1000; break
            case '1h': expired = Date.now() + 60 * 60 * 1000; break
            case '1d': expired = Date.now() + 24 * 60 * 60 * 1000; break
            case '3d': expired = Date.now() + 3 * 24 * 60 * 60 * 1000; break
            case '7w': expired = Date.now() + 7 * 24 * 60 * 60 * 1000; break
            case 'permanent': expired = -1; break
            default: expired = Date.now() + 5 * 60 * 1000
         }

         await global.db.insert('uploader', {
            code: id,
            original: file.originalname,
            filename: newFilename,
            bytes: file.size,
            size: Utils.formatSize(file.size),
            mime: file.mimetype,
            downloads: 0,
            expired_at: expired
         })

         res.json({
            creator: global.creator,
            status: true,
            data: {
               code: id,
               original: file.originalname,
               filename: newFilename,
               bytes: file.size,
               size: Utils.formatSize(file.size),
               mime: file.mimetype,
               downloads: 0,
               page: `${req.protocol}://${req.get('Host')}/file/${id}`,
               url: `${req.protocol}://${req.get('Host')}/${process.env.FILE_PATH}/${newFilename}`,
               expired_at: expired
            }
         })
      } catch (err) {
         if (err instanceof multer.MulterError) {
            if (err.code === 'LIMIT_FILE_SIZE') {
               return res.status(400).json({
                  creator: global.creator,
                  status: false,
                  msg: `Max file size is ${process.env.MAX_UPLOAD_SIZE}MB!`
               })
            }
         }

         console.error(err)
         res.status(500).json({
            creator: global.creator,
            status: false,
            msg: err.message || 'An internal server error occurred.'
         })
      }
   },
   error: false,
   rpm: true
}