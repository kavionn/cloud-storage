export const routes = {
   category: 'api',
   path: '/api/file/:hash',
   method: 'get',
   execution: async (req, res, next) => {
      const { hash } = req.params
      const check = await global.db.select('uploader', '*', `code = "${hash}"`)
      if (!check.length) return res.status(404).json({
         creator: global.creator,
         status: false,
         msg: 'File not found'
      })
      res.json({
         creator: global.creator,
         status: true,
         data: check[0]
      })
   },
   error: false
}