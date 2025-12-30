<template>
   <div class="content-card">
      <!-- HEADER DENGAN PADDING -->
      <div class="card-header d-flex justify-content-between align-items-center">
         <h5 class="main-title mb-0 fs-6">
            <i class="bi bi-clock-history me-2"></i>Recent Files
         </h5>
         <button @click="$emit('refresh')" class="btn btn-sm btn-refresh" title="Refresh list">
            <i class="bi bi-arrow-clockwise"></i>
         </button>
      </div>

      <div class="card-body p-0">
         <div v-if="isLoading" class="text-center text-secondary py-4">
            <div class="spinner-border spinner-border-sm" role="status"></div>
         </div>
         <div v-else-if="!files || files.length === 0" class="text-center text-secondary py-4 empty-state">
            No recent files found.
         </div>
         <div v-else class="list-group list-group-flush">
            <NuxtLink v-for="file in files" :key="file.code" :to="`/file/${file.code}`" class="list-group-item list-group-item-action">
               <div class="d-flex w-100 justify-content-between align-items-center">
                  <div class="d-flex align-items-center text-truncate">
                     <i class="bi bi-file-earmark-zip-fill me-2 fs-5"></i>
                     <span class="file-name text-truncate">{{ file.original }}</span>
                  </div>
                  <small class="file-size text-secondary ms-2 flex-shrink-0">{{ file.size }}</small>
               </div>
            </NuxtLink>
         </div>
      </div>
   </div>
</template>

<script setup lang="ts">
interface FileItem {
   code: string;
   original: string;
   size: string;
}

defineProps<{
   files: FileItem[] | null;
   isLoading: boolean;
}>()

defineEmits(['refresh'])
</script>

<style scoped>
/* Main Card */
.content-card {
   background-color: var(--app-card-bg);
   border: 1px solid var(--app-border-color);
   border-radius: .5rem;
   overflow: hidden;
}

/* Card Header dengan Padding */
.card-header {
   background-color: var(--app-bg);
   border-bottom: 1px solid var(--app-border-color);
   padding: 0.85rem 1.25rem; /* <-- PADDING DITAMBAHKAN DI SINI */
}

.main-title { 
   font-size: 0.9rem; 
   font-weight: 600; 
   color: var(--app-text-color); 
}

/* Tombol Refresh */
.btn-refresh {
   background-color: transparent;
   border: 1px solid transparent;
   color: var(--app-secondary-text-color);
   padding: 0.2rem 0.5rem;
   line-height: 1;
   font-size: 0.8rem;
   transition: all 0.2s;
}
.btn-refresh:hover {
   color: var(--app-text-color);
   background-color: var(--app-border-color);
}

/* List Item */
.list-group-item {
   background-color: transparent;
   color: var(--app-text-color);
   border-bottom: 1px solid var(--app-border-color);
   padding: 0.75rem 1.25rem;
   transition: background-color 0.2s;
}
.list-group-item:last-child { border-bottom: none; }
.list-group-item:hover { background-color: var(--app-bg); }
.file-name { font-size: 0.9rem; font-weight: 500; }
.file-size { font-size: 0.8rem; font-family: 'Courier New', monospace; }

.empty-state {
    font-style: italic;
    font-size: 0.9rem;
}
</style>