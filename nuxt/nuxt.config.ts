export default defineNuxtConfig({
   ssr: false,
   devtools: { enabled: false },
   modules: ['@pinia/nuxt'],
   vite: {
      server: {
         allowedHosts: true
      }
   },
   css: [
      '~/assets/css/style.css'
   ],
   app: {
      head: {
         title: process.env.NUXT_PUBLIC_SITENAME || 'Kenshiro\'s Temp',
         meta: [
            { name: 'viewport', content: 'width=device-width, initial-scale=1.0' },
            { name: 'author', content: 'Nugraha Pratama' },
            { name: 'description', content: 'Easily upload files temporarily and get a downloadable link. Quickly shorten your URLs for easy sharing and better accessibility.' },
            { property: 'og:title', content: process.env.NUXT_PUBLIC_SITENAME || 'Kenshiro\'s Temp' },
            { property: 'og:description', content: 'A reliable API that simplifies integration and automates workflows. Powered by mixed data sources, including partial scraper-based data.' },
            { property: 'og:url', content: 'https://neoxr-open-api.neoxr.eu' },
            { property: 'og:site_name', content: process.env.NUXT_PUBLIC_SITENAME || 'Kenshiro\'s Temp' },
            { property: 'og:keywords', content: 'A reliable API that simplifies integration and automates workflows. Powered by mixed data sources, including partial scraper-based data.' },
            { property: 'og:image', content: 'https://github.com/kavionn/database/raw/refs/heads/master/media/kavion.jpg' },
            { property: 'og:type', content: 'website' }
         ],
         link: [
            { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
            { rel: 'stylesheet', href: 'https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css', crossorigin: 'anonymous' }
         ],
         script: [
            { src: 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js', crossorigin: 'anonymous' }
         ]
      }
   },
   runtimeConfig: {
      public: {
         title: process.env.NUXT_PUBLIC_SITENAME || 'Kenshiro\'s Temp',
         tagline: 'Temporary Uploader',
         file_path: process.env.FILE_PATH,
         popup: {
            title: `Welcome to ${process.env.NUXT_PUBLIC_SITENAME || 'Kenshiro\'s Temp'}!`,
            description: 'Enjoy easy temporary file uploads and URL shortening for free. Secure, fast, and no registration required.'
         }
      }
   }
})