import auth from '../../middlewares/auth.js'
import fs from 'fs'
import path from 'path'

export const routes = {
   category: 'api',
   path: '/api/file/:code',
   method: 'delete',
   middleware: [auth],
   execution: async (req, res) => {
      try {
         const { code } = req.params
         const user_id = req.session.user.id

         const file = (await global.db.select('uploader', '*', `code = '${code}' AND user_id = ${user_id}`))[0]
         if (!file) {
            return res.status(404).json({
               creator: global.creator,
               status: false,
               msg: 'File not found or unauthorized.'
            })
         }

         // Delete from DB
         await global.db.delete('uploader', `code = '${code}'`)

         // Delete from Disk
         const filePath = path.join(process.cwd(), 'public/' + process.env.FILE_PATH + '/' + file.filename)
         if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath)
         }

         res.json({
            creator: global.creator,
            status: true,
            msg: 'File deleted successfully.'
         })
      } catch (error) {
         console.error('Delete File Error:', error)
         res.status(500).json({
            creator: global.creator,
            status: false,
            msg: 'Internal server error.'
         })
      }
   }
}
