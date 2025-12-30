<template>
   <transition name="fade">
      <div v-if="uiStore.isInitialLoading" class="preloader-overlay">
         <div class="loader-content">
            <!-- Icon Pulsing -->
            <div class="icon-wrapper">
               <i class="bi bi-cup-hot"></i>
            </div>
            
            <div class="line-loader"></div>
         </div>
      </div>
   </transition>
</template>

<!-- Script sama -->
<script setup lang="ts">
import { onMounted } from 'vue'
import { useUiStore } from '@/stores/ui'
const uiStore = useUiStore()
onMounted(() => { setTimeout(() => { uiStore.finishInitialLoading() }, 2000) })
</script>

<style scoped>
.preloader-overlay {
   /* ... sama ... */
   position: fixed; top: 0; left: 0; width: 100%; height: 100%;
   background-color: var(--app-bg); display: flex; justify-content: center; align-items: center; z-index: 999999;
}

.loader-content {
   width: 150px;
   display: flex;
   flex-direction: column;
   align-items: center;
   gap: 1.5rem;
}

.icon-wrapper {
   width: 60px;
   height: 60px;
   display: flex;
   align-items: center;
   justify-content: center;
   border-radius: 50%;
   background-color: var(--app-card-bg);
   border: 1px solid var(--app-border-color);
   color: var(--app-accent-color);
   font-size: 1.8rem;
   box-shadow: 0 0 0 0 rgba(var(--app-accent-rgb), 0.7); /* Perlu penyesuaian jika var rgb tidak ada, pakai opacity biasa */
   animation: pulse-shadow 2s infinite;
}

/* Jika variabel --app-accent-rgb tidak ada di CSS global, ganti box-shadow di atas dengan ini: */
/* box-shadow: 0 0 20px rgba(0,0,0,0.1); */

.line-loader {
   width: 100%;
   height: 4px;
   background-color: var(--app-border-color);
   position: relative;
   overflow: hidden;
   border-radius: 10px;
}

.line-loader::before {
   content: '';
   position: absolute;
   top: 0; left: -50%; width: 50%; height: 100%;
   background-color: var(--app-accent-color);
   animation: line-load 1s cubic-bezier(0.4, 0, 0.2, 1) infinite;
   border-radius: 10px;
}

@keyframes pulse-shadow {
   0% { transform: scale(0.95); box-shadow: 0 0 0 0 var(--app-accent-color); }
   70% { transform: scale(1); box-shadow: 0 0 0 10px rgba(0, 0, 0, 0); }
   100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(0, 0, 0, 0); }
}

@keyframes line-load {
   0% { left: -50%; }
   100% { left: 100%; }
}

.fade-leave-active { transition: opacity 0.5s ease-out; }
.fade-leave-to { opacity: 0; }
</style>