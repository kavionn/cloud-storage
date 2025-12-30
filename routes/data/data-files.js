export const routes = {
   category: 'api',
   path: '/api/files',
   method: 'get',
   execution: async (req, res, next) => {
      const { limit } = req.query
      const files = await global.db.fetch('uploader', limit || 10)
      if (!files.length) return res.json({
         creator: global.creator,
         status: false,
         msg: 'No files found'
      })
      res.json({
         creator: global.creator,
         status: true,
         data: files
      })
   },
   error: false
}