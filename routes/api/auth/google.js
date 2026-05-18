import { OAuth2Client } from 'google-auth-library'

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID)

export const routes = {
   category: 'api',
   path: '/api/auth/google',
   method: 'post',
   execution: async (req, res) => {
      try {
         const { token } = req.body
         if (!token) {
            return res.status(400).json({
               creator: global.creator,
               status: false,
               msg: 'Token is required.'
            })
         }

         const ticket = await client.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID
         })

         const payload = ticket.getPayload()
         const { sub: google_id, name, email, picture } = payload

         let user = (await global.db.select('users', '*', `google_id = '${google_id}'`))[0]

         if (!user) {
            await global.db.insert('users', {
               google_id,
               name,
               email,
               picture,
               created_at: Date.now()
            })
            user = (await global.db.select('users', '*', `google_id = '${google_id}'`))[0]
         }

         req.session.user = user
         
         res.json({
            creator: global.creator,
            status: true,
            data: user
         })
      } catch (error) {
         console.error('Google Auth Error:', error)
         res.status(500).json({
            creator: global.creator,
            status: false,
            msg: 'Authentication failed.'
         })
      }
   }
}
