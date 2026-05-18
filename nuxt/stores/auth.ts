import { defineStore } from 'pinia'

export const useAuthStore = defineStore('auth', {
   state: () => ({
      user: null,
      loading: true
   }),
   actions: {
      async fetchUser() {
         try {
            const { $api } = useNuxtApp()
            const response = await $api('/api/auth/user')
            if (response.status) {
               this.user = response.data
            } else {
               this.user = null
            }
         } catch (error) {
            this.user = null
         } finally {
            this.loading = false
         }
      },
      async login(token: string) {
         try {
            const { $api } = useNuxtApp()
            const response = await $api('/api/auth/google', {
               method: 'POST',
               body: { token }
            })
            if (response.status) {
               this.user = response.data
               return true
            }
            return false
         } catch (error) {
            console.error('Login error:', error)
            return false
         }
      },
      async logout() {
         try {
            const { $api } = useNuxtApp()
            await $api('/api/auth/logout', { method: 'POST' })
            this.user = null
            navigateTo('/')
         } catch (error) {
            console.error('Logout error:', error)
         }
      }
   }
})
