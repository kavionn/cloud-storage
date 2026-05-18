export default defineNuxtConfig({
   ssr: false,
   modules: ['@pinia/nuxt'],
   runtimeConfig: {
      public: {
         googleClientId: process.env.NUXT_PUBLIC_GOOGLE_CLIENT_ID || '',
         title: 'Uploader',
         tagline: 'Simple & Permanent Cloud Storage',
         baseURL: process.env.DOMAIN || 'http://localhost:7860',
         file_path: process.env.FILE_PATH || 'p'
      }
   },
   app: {
      head: {
         link: [
            { rel: 'stylesheet', href: 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css' },
            { rel: 'stylesheet', href: 'https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css' }
         ],
         script: [
            { src: 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js' }
         ]
      }
   }
})
