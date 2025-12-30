import axios from 'axios'
import { extension } from 'mime-types'

export const routes = {
   category: 'main',
   path: '/download/:id',
   method: 'get',
   execution: async (req, res, next) => {
      try {
         const { id } = req.params
         const check = await global.db.select('uploader', '*', `id = "${id}"`)
         if (!check.length) return res.status(404).json({
            creator: global.creator,
            status: false,
            msg: 'File not found'
         })

         await global.db.increment('uploader', 'downloads', `id = "${id}"`)

         const url = (`${req.protocol + 's://' + req.get('Host')}/${process.env.FILE_PATH}/${check?.[0]?.filename}`).replace(new RegExp('ss://', 'g'), 's://')
         const response = await axios.get(url, {
            responseType: 'stream'
         })

         if (response.status !== 200) {
            res.status(response.status).send('Failed to fetch file')
            return
         }

         const contentType = response.headers['content-type'] || 'application/octet-stream'
         const contentLength = response.headers['content-length'] || 0
         const fname = check?.[0]?.filename || 'Neoxr CDN - ' + Utils.makeId(6) + '.' + (extension(contentType) || 'bin')

         // Set response headers
         res.set('Content-Type', contentType)
         res.set('Content-Length', contentLength)
         res.set('Content-Disposition', 'attachment; filename=' + (check?.[0]?.original || fname))
         res.set('Cache-Control', 'no-cache, no-store, must-revalidate')
         res.set('Pragma', 'no-cache')
         res.set('Expires', '0')

         // Pipe the axios response stream to the Express response
         response.data.pipe(res).on('error', e => {
            res.status(500).send(e.message)
            res.destroy(e)
         })
      } catch (e) {
         res.status(500).send(e.message)
      }
   },
   error: false,
   protect: true
}