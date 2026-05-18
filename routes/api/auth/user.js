export const routes = {
   category: 'api',
   path: '/api/auth/user',
   method: 'get',
   execution: async (req, res) => {
      if (req.session && req.session.user) {
         return res.json({
            creator: global.creator,
            status: true,
            data: req.session.user
         })
      }
      res.status(401).json({
         creator: global.creator,
         status: false,
         msg: 'Not authenticated.'
      })
   }
}
