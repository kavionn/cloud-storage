import { ref, onMounted, onUnmounted } from 'vue'

export const usePageEffects = () => {
   const isScrolled = ref(false)
   const theme = ref('dark')

   const handleScroll = () => {
      isScrolled.value = window.scrollY > 10
   }

   const toggleTheme = () => {
      theme.value = theme.value === 'dark' ? 'light' : 'dark'
      if (process.client) {
         if (theme.value === 'light') {
            document.body.classList.add('light-mode')
         } else {
            document.body.classList.remove('light-mode')
         }
         localStorage.setItem('theme', theme.value)
      }
   }

   onMounted(() => {
      window.addEventListener('scroll', handleScroll)
      handleScroll()

      if (process.client) {
         const savedTheme = localStorage.getItem('theme') || 'dark'
         theme.value = savedTheme
         if (theme.value === 'light') {
            document.body.classList.add('light-mode')
         } else {
            document.body.classList.remove('light-mode')
         }
      }
   })

   onUnmounted(() => {
      window.removeEventListener('scroll', handleScroll)
   })

   return {
      isScrolled,
      theme,
      toggleTheme
   }
}
