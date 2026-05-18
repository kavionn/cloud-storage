import auth from '../../../middlewares/auth.js'

export const routes = {
   category: 'api',
   path: '/api/folders/create',
   method: 'post',
   middleware: [auth],
   execution: async (req, res) => {
      try {
         const { name, parent_id } = req.body
         if (!name) {
            return res.status(400).json({
               creator: global.creator,
               status: false,
               msg: 'Folder name is required.'
            })
         }

         const user_id = req.session.user.id
         await global.db.insert('folders', {
            user_id,
            name,
            parent_id: parent_id || null,
            created_at: Date.now()
         })

         res.json({
            creator: global.creator,
            status: true,
            msg: 'Folder created successfully.'
         })
      } catch (error) {
         console.error('Create Folder Error:', error)
         res.status(500).json({
            creator: global.creator,
            status: false,
            msg: 'Internal server error.'
         })
      }
   }
}
