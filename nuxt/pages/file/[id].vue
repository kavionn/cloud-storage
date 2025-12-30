<template>
   <div class="container px-3 mb-4">
      <div v-if="isLoading" class="p-5 text-center">
         <div class="spinner-border loader-spinner" role="status"></div>
      </div>

      <div v-else>
         <div class="row g-4">
            <div class="col-lg-7">
               <div v-if="!response?.status" class="content-card p-5 text-center">
                  <i class="bi bi-x-circle-fill fs-1 text-danger mb-3"></i>
                  <h4 class="main-title">File Not Found</h4>
                  <p class="text-secondary">{{ response?.msg }}</p>
               </div>

               <div v-if="response?.status" class="content-card text-center">

                  <div class="card-header-custom">
                     <div class="icon-wrapper mx-auto mb-3">
                        <i class="bi bi-file-earmark-zip-fill"></i>
                     </div>
                     <h4 class="file-name mb-2">{{ response?.data?.original }}</h4>
                     <p class="file-meta mb-0">
                        <span>{{ response?.data?.size }}</span>
                        <span class="mx-2">&bull;</span>
                        <span>{{ response?.data?.downloads }} Downloads</span>
                     </p>
                     <div v-if="response?.data?.expired_at" class="expiry-countdown mt-2">
                        <i class="bi bi-clock me-1"></i> {{ countdownText }}
                     </div>
                  </div>

                  <div class="card-body-custom">
                     <div class="btn-group w-100" role="group">
                        <button @click="downloadFile" class="btn btn-custom-accent btn-md">
                           <i class="bi bi-download me-2"></i>Download File
                        </button>
                        <button @click="copyDownloadLink" class="btn btn-outline-secondary">
                           <i class="bi bi-link-45deg me-1"></i> {{ copyDownloadLinkButtonText }}
                        </button>
                     </div>
                  </div>

                  <div class="card-footer-custom">
                     <label class="form-label small text-secondary">Direct Link</label>
                     <div class="input-group">
                        <input type="text" class="form-control form-control-sm" :value="directLink" readonly>
                        <button @click="copyDirectLink" class="btn btn-sm btn-outline-secondary" type="button">
                           {{ copyDirectLinkButtonText }}
                        </button>
                     </div>
                  </div>
               </div>
            </div>

            <div class="col-lg-5">
               <RecentFiles :files="recentFiles" :is-loading="isFilesLoading" @refresh="fetchRecentFiles" />
            </div>

         </div>
      </div>
   </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref, computed } from 'vue'
import { useRouter, useNuxtApp, useRoute, useHead, useRuntimeConfig } from '#app'

const { $api } = useNuxtApp()
const router = useRouter()
const route = useRoute()
const config = useRuntimeConfig()
const id = route.params.id

interface Response { status: boolean; data?: any; msg?: string }

const response = ref<Response>({ status: false, msg: 'Data not found' })
const isLoading = ref(true)
const directLink = ref<string | null>(null)
const copyDownloadLinkButtonText = ref('Copy Link')
const copyDirectLinkButtonText = ref('Copy')
const recentFiles = ref<any[] | null>(null)
const isFilesLoading = ref(true)
const countdownText = ref('Calculating...')
let timerInterval: NodeJS.Timeout | null = null

const padZero = (num: number) => String(num).padStart(2, '0')

useHead({ title: computed(() => response.value?.data?.original || 'File Detail') })

const updateCountdown = () => {
   const expirationTime = response.value.data?.expired_at
   if (expirationTime === -1) {
      countdownText.value = 'Permanent'
      if (timerInterval) clearInterval(timerInterval)
      return
   }
   if (!expirationTime) return
   const diff = expirationTime - Date.now()
   if (diff <= 0) {
      countdownText.value = 'Expired'
      if (timerInterval) clearInterval(timerInterval)
      router.push('/')
      return
   }
   const d = Math.floor(diff / (1000 * 60 * 60 * 24)), h = Math.floor((diff / (1000 * 60 * 60)) % 24)
   const m = Math.floor((diff / (1000 * 60)) % 60), s = Math.floor((diff / 1000) % 60)
   countdownText.value = `${padZero(d)}:${padZero(h)}:${padZero(m)}:${padZero(s)}`
}

const downloadFile = () => {
   if (!response.value.data?.id) return
   window.location.href = `${config.public.baseURL}/download/${response.value.data.id}`
}

const copyToClipboard = async (text: string, buttonState: Ref<string>, originalText: string) => {
   try {
      await navigator.clipboard.writeText(text)
      buttonState.value = 'Copied!';
      setTimeout(() => { buttonState.value = originalText }, 2000)
   } catch (err) { console.error(err) }
}
const copyDownloadLink = () => copyToClipboard(`${config.public.baseURL}/download/${response.value.data.id}`, copyDownloadLinkButtonText, 'Copy Link')
const copyDirectLink = () => copyToClipboard(directLink.value || '', copyDirectLinkButtonText, 'Copy')

const fetchRecentFiles = async () => {
   isFilesLoading.value = true
   try {
      const response = await $api('/api/files')
      if (response.status) {
         recentFiles.value = response.data
      }
   } catch (error) {
      console.error("Failed to fetch recent files", error)
   } finally {
      isFilesLoading.value = false
   }
}

onMounted(async () => {
   fetchRecentFiles()
   isLoading.value = true
   try {
      const res = await $api(`/api/file/${id}`)
      if (res.status) {
         directLink.value = `${config.public.baseURL}/${config.public.file_path}/${res.data?.filename}`
         response.value = { status: true, data: res.data, msg: 'Data found' }
         if (response.value.data.expired_at) {
            updateCountdown()
            if (response.value.data.expired_at !== -1) {
               timerInterval = setInterval(updateCountdown, 1000)
            }
         }
      } else {
         response.value = { status: false, msg: 'File not found or has expired.' }
      }
   } catch {
      response.value = { status: false, msg: 'Failed to load data.' }
   } finally {
      isLoading.value = false
   }
})

onUnmounted(() => {
   if (timerInterval) clearInterval(timerInterval)
})
</script>

<style scoped>
/* Main Card */
.content-card {
   background-color: var(--app-card-bg);
   border: 1px solid var(--app-border-color);
   border-radius: .5rem;
   overflow: hidden;
}

/* Custom Header */
.card-header-custom {
   background-color: var(--app-bg);
   padding: 2rem;
   border-bottom: 1px solid var(--app-border-color);
}

.icon-wrapper {
   width: 80px;
   height: 80px;
   display: flex;
   align-items: center;
   justify-content: center;
   background-color: var(--app-card-bg);
   border: 1px solid var(--app-border-color);
   border-radius: 1rem;
   font-size: 3rem;
   color: var(--app-accent-color);
}

.file-name {
   font-weight: 700;
   color: var(--app-text-color);
   word-break: break-all;
}

.file-meta {
   font-size: 0.9rem;
   color: var(--app-secondary-text-color);
}

.expiry-countdown {
   font-size: 0.85rem;
   font-weight: 600;
   color: var(--app-secondary-text-color);
   background-color: var(--app-card-bg);
   padding: 0.25rem 0.75rem;
   border-radius: 50px;
   display: inline-block;
}

.expiry-countdown i {
   position: relative;
   top: 1px
}

/* Custom Body & Footer */
.card-body-custom {
   padding: 2rem;
}

.card-footer-custom {
   background-color: var(--app-bg);
   border-top: 1px solid var(--app-border-color);
   padding: 1rem 1.5rem;
}

/* Loader */
.loader-spinner {
   width: 2.5rem;
   height: 2.5rem;
   color: var(--app-accent-color);
}
</style>