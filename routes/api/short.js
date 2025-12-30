import { Utils } from '../../lib/index.js'

export const routes = {
   category: 'api',
   path: '/api/short',
   parameter: ['url'],
   method: 'post',
   execution: async (req, res, next) => {
      const id = Utils.makeId(6)
      const expired = (new Date * 1) + 3600000
      await global.db.insert('shorten', {
         code: id,
         url: req.body.url,
         views: 0,
         expired_at: expired
      })
      res.json({
         creator: global.creator,
         status: true,
         data: {
            code: id,
            origin: req.body.url,
            url: `${req.protocol + '://' + req.get('Host')}/s/${id}`,
            views: 0,
            expired_at: expired
         }
      })
   },
   error: false
}