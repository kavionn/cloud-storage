import auth from '../../../middlewares/auth.js'

export const routes = {
   category: 'api',
   path: '/api/folders/:id',
   method: 'delete',
   middleware: [auth],
   execution: async (req, res) => {
      try {
         const { id } = req.params
         const user_id = req.session.user.id

         const folder = (await global.db.select('folders', '*', `id = ${id} AND user_id = ${user_id}`))[0]
         if (!folder) {
            return res.status(404).json({
               creator: global.creator,
               status: false,
               msg: 'Folder not found or unauthorized.'
            })
         }

         // Cek apakah ada isi di folder (opsional, bisa hapus rekursif)
         // Untuk kesederhanaan, kita pindahkan file ke root atau biarkan saja (tapi di list nanti bakal aneh)
         // Idealnya hapus isi folder juga.
         
         await global.db.delete('folders', `id = ${id}`)
         // Set parent_id file dan folder anak menjadi null (pindah ke root)
         await global.db.update('uploader', { folder_id: null }, `folder_id = ${id}`)
         await global.db.update('folders', { parent_id: null }, `parent_id = ${id}`)

         res.json({
            creator: global.creator,
            status: true,
            msg: 'Folder deleted successfully.'
         })
      } catch (error) {
         console.error('Delete Folder Error:', error)
         res.status(500).json({
            creator: global.creator,
            status: false,
            msg: 'Internal server error.'
         })
      }
   }
}
