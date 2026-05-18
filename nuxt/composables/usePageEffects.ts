import { ref, onMounted, onUnmounted } from 'vue'

export const usePageEffects = () => {
   const isScrolled = ref(false)

   const handleScroll = () => {
      isScrolled.value = window.scrollY > 10
   }

   onMounted(() => {
      window.addEventListener('scroll', handleScroll)
      handleScroll()
   })

   onUnmounted(() => {
      window.removeEventListener('scroll', handleScroll)
   })

   return {
      isScrolled
   }
}
