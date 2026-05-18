<template>
   <div class="container px-3 mb-5">
      <div class="d-flex justify-content-between align-items-center mb-4 pt-4">
         <div>
            <h4 class="fw-bold mb-0">My Files</h4>
            <nav aria-label="breadcrumb">
               <ol class="breadcrumb mb-0 small">
                  <li class="breadcrumb-item"><a href="#" @click.prevent="navigateToFolder(null)">Root</a></li>
                  <li v-for="(b, i) in breadcrumbs" :key="i" class="breadcrumb-item active">{{ b.name }}</li>
               </ol>
            </nav>
         </div>
         <div class="d-flex gap-2">
            <button class="btn btn-outline-primary btn-sm d-flex align-items-center gap-2" @click="createFolder">
               <i class="bi bi-folder-plus"></i> New Folder
            </button>
            <button class="btn btn-primary btn-sm d-flex align-items-center gap-2" @click="triggerUpload">
               <i class="bi bi-cloud-arrow-up"></i> Upload
            </button>
         </div>
      </div>

      <div v-if="loading" class="text-center py-5">
         <div class="spinner-border text-primary" role="status"></div>
         <p class="mt-2 text-secondary">Loading files...</p>
      </div>

      <div v-else-if="items.folders.length === 0 && items.files.length === 0" class="text-center py-5 empty-state">
         <i class="bi bi-folder2-open display-1 text-secondary opacity-25"></i>
         <p class="mt-3 text-secondary">This folder is empty.</p>
      </div>

      <div v-else class="row g-3">
         <!-- Folders -->
         <div v-for="folder in items.folders" :key="'f-'+folder.id" class="col-6 col-md-4 col-lg-3">
            <div class="card item-card h-100 border-0 shadow-sm" @click="navigateToFolder(folder)">
               <div class="card-body d-flex align-items-center gap-3">
                  <i class="bi bi-folder-fill fs-3 text-warning"></i>
                  <div class="text-truncate">
                     <div class="fw-bold text-truncate small">{{ folder.name }}</div>
                  </div>
                  <div class="ms-auto dropdown" @click.stop>
                     <button class="btn btn-link p-0 text-secondary" data-bs-toggle="dropdown">
                        <i class="bi bi-three-dots-vertical"></i>
                     </button>
                     <ul class="dropdown-menu dropdown-menu-end shadow border-0">
                        <li><button class="dropdown-item py-2 text-danger" @click="deleteFolder(folder.id)"><i class="bi bi-trash me-2"></i> Delete</button></li>
                     </ul>
                  </div>
               </div>
            </div>
         </div>

         <!-- Files -->
         <div v-for="file in items.files" :key="'fi-'+file.id" class="col-6 col-md-4 col-lg-3">
            <div class="card item-card h-100 border-0 shadow-sm">
               <div class="card-body">
                  <div class="d-flex align-items-start justify-content-between mb-2">
                     <i class="bi bi-file-earmark-text-fill fs-3 text-primary"></i>
                     <div class="dropdown">
                        <button class="btn btn-link p-0 text-secondary" data-bs-toggle="dropdown">
                           <i class="bi bi-three-dots-vertical"></i>
                        </button>
                        <ul class="dropdown-menu dropdown-menu-end shadow border-0">
                           <li><a class="dropdown-item py-2" :href="'/file/' + file.code" target="_blank"><i class="bi bi-eye me-2"></i> View Page</a></li>
                           <li><button class="dropdown-item py-2" @click="copyLink(file.code)"><i class="bi bi-link-45deg me-2"></i> Copy Link</button></li>
                           <li><hr class="dropdown-divider"></li>
                           <li><button class="dropdown-item py-2 text-danger" @click="deleteFile(file.code)"><i class="bi bi-trash me-2"></i> Delete</button></li>
                        </ul>
                     </div>
                  </div>
                  <div class="fw-bold text-truncate small mb-1" :title="file.original">{{ file.original }}</div>
                  <div class="text-secondary smaller">{{ file.size }} • {{ formatDate(file.created_at || Date.now()) }}</div>
               </div>
            </div>
         </div>
      </div>

      <!-- Hidden File Input -->
      <input type="file" ref="fileInput" class="d-none" @change="handleUpload">
   </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAuthStore } from '~/stores/auth'
import Swal from 'sweetalert2'

const auth = useAuthStore()
const { $api } = useNuxtApp()

const items = ref({ folders: [], files: [] })
const loading = ref(true)
const currentFolderId = ref(null)
const breadcrumbs = ref([])
const fileInput = ref(null)

const fetchItems = async () => {
   loading.value = true
   try {
      const url = currentFolderId.value ? `/api/folders/list?parent_id=${currentFolderId.value}` : '/api/folders/list'
      const res = await $api(url)
      if (res.status) {
         items.value = res.data
      }
   } catch (error) {
      console.error('Fetch items error:', error)
   } finally {
      loading.value = false
   }
}

const navigateToFolder = (folder) => {
   if (folder) {
      currentFolderId.value = folder.id
      breadcrumbs.value.push(folder)
   } else {
      currentFolderId.value = null
      breadcrumbs.value = []
   }
   fetchItems()
}

const createFolder = async () => {
   const { value: name } = await Swal.fire({
      title: 'New Folder',
      input: 'text',
      inputLabel: 'Folder Name',
      inputPlaceholder: 'Enter folder name...',
      showCancelButton: true,
      inputValidator: (value) => {
         if (!value) return 'You need to write something!'
      }
   })

   if (name) {
      try {
         const res = await $api('/api/folders/create', {
            method: 'POST',
            body: { name, parent_id: currentFolderId.value }
         })
         if (res.status) {
            Swal.fire('Created!', 'Your folder has been created.', 'success')
            fetchItems()
         }
      } catch (error) {
         Swal.fire('Error', 'Failed to create folder.', 'error')
      }
   }
}

const triggerUpload = () => {
   fileInput.value.click()
}

const handleUpload = async (event) => {
   const file = event.target.files[0]
   if (!file) return

   Swal.fire({
      title: 'Uploading...',
      html: 'Please wait while your file is being uploaded.',
      allowOutsideClick: false,
      didOpen: () => {
         Swal.showLoading()
      }
   })

   const formData = new FormData()
   formData.append('file', file)
   formData.append('expiry', 'permanent')
   if (currentFolderId.value) {
      formData.append('folder_id', currentFolderId.value)
   }

   try {
      const res = await $api('/api/upload', {
         method: 'POST',
         body: formData
      })
      if (res.status) {
         Swal.fire('Uploaded!', 'Your file has been uploaded.', 'success')
         fetchItems()
      }
   } catch (error) {
      Swal.fire('Error', 'Upload failed.', 'error')
   } finally {
      event.target.value = ''
   }
}

const deleteFile = async (code) => {
   const result = await Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!'
   })

   if (result.isConfirmed) {
      try {
         const res = await $api(`/api/file/${code}`, { method: 'DELETE' })
         if (res.status) {
            Swal.fire('Deleted!', 'Your file has been deleted.', 'success')
            fetchItems()
         }
      } catch (error) {
         Swal.fire('Error', 'Failed to delete file.', 'error')
      }
   }
}

const deleteFolder = async (id) => {
   const result = await Swal.fire({
      title: 'Delete Folder?',
      text: "Items inside will be moved to root.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!'
   })

   if (result.isConfirmed) {
      try {
         const res = await $api(`/api/folders/${id}`, { method: 'DELETE' })
         if (res.status) {
            Swal.fire('Deleted!', 'Your folder has been deleted.', 'success')
            fetchItems()
         }
      } catch (error) {
         Swal.fire('Error', 'Failed to delete folder.', 'error')
      }
   }
}

const copyLink = (code) => {
   const url = `${window.location.origin}/file/${code}`
   navigator.clipboard.writeText(url)
   Swal.fire({
      toast: true,
      position: 'top-end',
      icon: 'success',
      title: 'Link copied to clipboard',
      showConfirmButton: false,
      timer: 2000
   })
}

const formatDate = (ts) => {
   return new Date(ts).toLocaleDateString()
}

onMounted(() => {
   if (!auth.user && !auth.loading) {
      navigateTo('/')
   }
   fetchItems()
})
</script>

<style scoped>
.breadcrumb-item + .breadcrumb-item::before {
   content: "›";
   font-size: 1.2rem;
   line-height: 1;
   vertical-align: middle;
}
.item-card {
   cursor: pointer;
   transition: transform 0.2s, box-shadow 0.2s;
   background-color: var(--app-card-bg);
   border: 1px solid var(--app-border-color) !important;
}
.item-card:hover {
   transform: translateY(-3px);
   box-shadow: 0 4px 12px rgba(0,0,0,0.1) !important;
}
.smaller {
   font-size: 0.75rem;
}
.empty-state {
   border: 2px dashed var(--app-border-color);
   border-radius: 1rem;
}
.dropdown-item {
   cursor: pointer;
}
</style>
