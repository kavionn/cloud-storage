export default defineNuxtPlugin((nuxtApp) => {
   const config = useRuntimeConfig()
   
   const $api = $fetch.create({
      baseURL: config.public.baseURL,
      onResponseError({ response }) {
         console.error('API Error:', response)
      }
   })

   return {
      provide: {
         api: $api
      }
   }
})
