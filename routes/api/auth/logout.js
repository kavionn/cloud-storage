export const routes = {
   category: 'api',
   path: '/api/auth/logout',
   method: 'post',
   execution: async (req, res) => {
      req.session = null
      res.json({
         creator: global.creator,
         status: true,
         msg: 'Logged out successfully.'
      })
   }
}
