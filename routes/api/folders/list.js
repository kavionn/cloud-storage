import auth from '../../../middlewares/auth.js'

export const routes = {
   category: 'api',
   path: '/api/folders/list',
   method: 'get',
   middleware: [auth],
   execution: async (req, res) => {
      try {
         const user_id = req.session.user.id
         const parent_id = req.query.parent_id || null
         
         let condition = `user_id = ${user_id}`
         if (parent_id) {
            condition += ` AND parent_id = ${parent_id}`
         } else {
            condition += ` AND parent_id IS NULL`
         }

         const folders = await global.db.select('folders', '*', condition)
         const files = await global.db.select('uploader', '*', condition)

         res.json({
            creator: global.creator,
            status: true,
            data: {
               folders,
               files
            }
         })
      } catch (error) {
         console.error('List Folder Error:', error)
         res.status(500).json({
            creator: global.creator,
            status: false,
            msg: 'Internal server error.'
         })
      }
   }
}
