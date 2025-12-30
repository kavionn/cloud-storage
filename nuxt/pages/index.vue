<template>
   <div class="container px-3 mb-4">

      <div class="row g-3 mb-4">
         <div class="col-6 col-md-3">
            <div class="stat-box">
               <div class="icon-box"><i class="bi bi-files"></i></div>
               <div>
                  <div class="value">{{ stats.totalFiles.toLocaleString() }}</div>
                  <div class="label">Total Files</div>
               </div>
            </div>
         </div>
         <div class="col-6 col-md-3">
            <div class="stat-box">
               <div class="icon-box"><i class="bi bi-database"></i></div>
               <div>
                  <div class="value">{{ formatBytes(stats.totalSize) }}</div>
                  <div class="label">Total Size</div>
               </div>
            </div>
         </div>
         <div class="col-6 col-md-3">
            <div class="stat-box">
               <div class="icon-box"><i class="bi bi-download"></i></div>
               <div>
                  <div class="value">{{ stats.totalDownloads.toLocaleString() }}</div>
                  <div class="label">Downloads</div>
               </div>
            </div>
         </div>
         <div class="col-6 col-md-3">
            <div class="stat-box">
               <div class="icon-box"><i class="bi bi-activity"></i></div>
               <div>
                  <div class="value">{{ stats.apiHits.toLocaleString() }}</div>
                  <div class="label">API Hits</div>
               </div>
            </div>
         </div>
      </div>

      <div class="row g-4">
         <div class="col-lg-7">
            <div class="d-flex flex-wrap justify-content-between align-items-center mb-3">
               <h5 class="main-title mb-0">Tools</h5>
               <div class="btn-group filter-group">
                  <button class="btn btn-filter" :class="{ 'active': activeView === 'upload' }"
                     @click="activeView = 'upload'"><i class="bi bi-cloud-arrow-up-fill me-1"></i> Upload</button>
                  <button class="btn btn-filter" :class="{ 'active': activeView === 'shorten' }"
                     @click="activeView = 'shorten'"><i class="bi bi-link-45deg me-1"></i> Shorten</button>
               </div>
            </div>

            <div class="content-card">
               <div class="p-4">
                  <Transition name="fade" mode="out-in">
                     <div v-if="activeView === 'upload'">
                        <form @submit.prevent="handleUpload">
                           <div class="mb-3">
                              <label class="form-label">Select or Drop a File</label>
                              <div class="drop-zone" :class="{ 'is-dragging': isDragging }" @click="triggerFileInput"
                                 @dragover.prevent="isDragging = true" @dragleave.prevent="isDragging = false"
                                 @drop.prevent="handleDrop">
                                 <input type="file" ref="fileInputRef" @change="handleFileChange" class="d-none">
                                 <div v-if="!fileToUpload" class="drop-zone-prompt">
                                    <i class="bi bi-upload fs-1"></i>
                                    <p class="mb-0 mt-2"><strong>Drag & drop file here</strong><br><span
                                          class="small">or click to browse</span></p>
                                 </div>
                                 <div v-else class="file-preview">
                                    <i class="bi bi-file-earmark-check-fill fs-1 text-success"></i>
                                    <div class="text-truncate mt-2" :title="fileToUpload.name">
                                       <strong>{{ fileToUpload.name }}</strong><br>
                                       <small>{{ formatBytes(fileToUpload.size) }}</small>
                                    </div>
                                    <button type="button" @click.stop="removeFile" class="btn-remove-file"
                                       title="Remove file">&times;</button>
                                 </div>
                              </div>
                           </div>
                           <div class="row g-2 mb-3">
                              <div class="col-md-6">
                                 <label for="expirySelect" class="form-label">Expiry Time</label>
                                 <select id="expirySelect" class="form-select" v-model="uploadExpiry">
                                    <option value="5m">5 Minutes</option>
                                    <option value="15m">15 Minutes</option>
                                    <option value="30m">30 Minutes</option>
                                    <option value="1h">1 Hour</option>
                                    <option value="1d">1 Day</option>
                                    <option value="3d">3 Days</option>
                                    <option value="1w">1 Week</option>
                                    <option value="permanent">Permanent</option>
                                 </select>
                              </div>
                              <div v-if="uploadExpiry === 'permanent'" class="col-md-6">
                                 <label for="pinInput" class="form-label">PIN</label>
                                 <input type="password" id="pinInput" class="form-control" v-model="uploadPin"
                                    placeholder="Enter PIN to confirm" required>
                                 <div class="form-text exclusive-text mt-1">
                                    Permanent upload is an exclusive feature. Contact admin to get a PIN.
                                 </div>
                              </div>
                           </div>
                           <button type="submit" class="btn btn-custom-accent d-flex align-items-center"
                              :disabled="isUploading || !fileToUpload">
                              <span v-if="isUploading" class="spinner-border spinner-border-sm me-2"></span>
                              {{ isUploading ? 'Uploading...' : 'Upload' }}
                           </button>
                        </form>
                        <div v-if="uploadResult" class="mt-3">
                           <label class="form-label">File URL</label>
                           <div class="input-group">
                              <input type="text" class="form-control" :value="uploadResult" readonly>
                              <button @click="copyToClipboard(uploadResult)" class="btn btn-outline-secondary"
                                 type="button" :disabled="copyButtonText === 'Copied!'">
                                 <i class="bi bi-clipboard me-1"></i> {{ copyButtonText }}
                              </button>
                           </div>
                        </div>
                        <Alert type="danger mt-3" :show="!!uploadError">{{ uploadError }}</Alert>
                     </div>
                     <div v-else-if="activeView === 'shorten'">
                        <form @submit.prevent="handleShorten">
                           <div class="mb-3">
                              <label for="linkInput" class="form-label">Enter a link to shorten</label>
                              <input type="url" class="form-control" id="linkInput" v-model="longUrl"
                                 placeholder="https://example.com/..." :disabled="isShortening" required>
                           </div>
                           <button type="submit" class="btn btn-custom-accent d-flex align-items-center"
                              :disabled="isShortening">
                              <span v-if="isShortening" class="spinner-border spinner-border-sm me-2"></span>
                              {{ isShortening ? 'Shortening...' : 'Shorten' }}
                           </button>
                        </form>
                        <div v-if="shortenResult" class="mt-3">
                           <label class="form-label">Shortened URL</label>
                           <div class="input-group">
                              <input type="text" class="form-control" :value="shortenResult" readonly>
                              <button @click="copyToClipboard(shortenResult)" class="btn btn-outline-secondary"
                                 type="button" :disabled="copyButtonText === 'Copied!'">
                                 <i class="bi bi-clipboard me-1"></i> {{ copyButtonText }}
                              </button>
                           </div>
                        </div>
                        <Alert type="danger mt-3" :show="!!shortenError">{{ shortenError }}</Alert>
                     </div>
                  </Transition>
               </div>
            </div>
         </div>

         <div class="col-lg-5">
            <RecentFiles :files="recentFiles" :is-loading="isFilesLoading" @refresh="fetchRecentFiles" />
         </div>
      </div>

      <div class="row g-3 mt-2">
         <div class="col-12 col-md-4">
            <div class="monitor-card">
               <div class="circular-progress">
                  <svg viewBox="0 0 36 36">
                     <path class="circle-bg"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                     <path class="circle" :stroke-dasharray="`${stats.cpuUsage || 0}, 100`"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                  </svg>
                  <div class="percentage"><i class="bi bi-cpu"></i></div>
               </div>
               <div class="text-content">
                  <div class="label">CPU Usage</div>
                  <div class="value">{{ parseFloat(stats.cpuUsage || '0').toFixed(1) }}%</div>
               </div>
            </div>
         </div>
         <div class="col-12 col-md-4">
            <div class="monitor-card">
               <div class="circular-progress">
                  <svg viewBox="0 0 36 36">
                     <path class="circle-bg"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                     <path class="circle" :stroke-dasharray="`${stats.memory.usage || 0}, 100`"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                  </svg>
                  <div class="percentage"><i class="bi bi-memory"></i></div>
               </div>
               <div class="text-content">
                  <div class="label">Memory</div>
                  <div class="value">{{ formatBytes(stats.memory.used) }}</div>
                  <div class="subtext">{{ formatBytes(stats.memory.total) }} Total</div>
               </div>
            </div>
         </div>
         <div class="col-12 col-md-4">
            <div class="monitor-card">
               <div class="circular-progress">
                  <svg viewBox="0 0 36 36">
                     <path class="circle-bg"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                     <path class="circle" :stroke-dasharray="`${runtimeProgress}, 100`"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                  </svg>
                  <div class="percentage"><i class="bi bi-clock-history"></i></div>
               </div>
               <div class="text-content">
                  <div class="label">Runtime</div>
                  <div class="value">{{ stats.runtime }}</div>
               </div>
            </div>
         </div>
      </div>
   </div>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRuntimeConfig, useNuxtApp } from '#app'
import { useSocket } from '~/composables/useSocket'
const socket = useSocket()

const { $api } = useNuxtApp()

const fileToUpload = ref<File | null>(null)
const longUrl = ref('')
const fileInputRef = ref<HTMLInputElement | null>(null)
const uploadResult = ref('')
const shortenResult = ref('')
const uploadError = ref('')
const shortenError = ref('')
const isUploading = ref(false)
const isShortening = ref(false)
const copyButtonText = ref('Copy')
const isDragging = ref(false)
const uploadExpiry = ref('5m')
const uploadPin = ref('')
const activeView = ref('upload')

const recentFiles = ref<any[] | null>(null)
const isFilesLoading = ref(true)

const stats = ref({ totalFiles: 0, totalSize: 0, totalDownloads: 0, apiHits: 0, cpuUsage: '0.00', memory: { used: 0, total: 0, usage: '0.00' }, runtime: '...', os: '...' })

const formatBytes = (bytes: number, decimals = 2) => {
   if (!bytes || bytes === 0) return '0 Bytes'
   const k = 1024; const dm = decimals < 0 ? 0 : decimals; const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
   const i = Math.floor(Math.log(bytes) / Math.log(k));
   return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

const runtimeProgress = computed(() => {
   const totalSecondsInDay = 86400;
   const now = new Date();
   const secondsSinceMidnight = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();
   const percentage = (secondsSinceMidnight / totalSecondsInDay) * 100;
   return percentage.toFixed(2);
});

const handleFileChange = (event: Event) => {
   const target = event.target as HTMLInputElement
   if (target.files?.[0]) { fileToUpload.value = target.files[0]; uploadError.value = ''; }
}
const handleDrop = (event: DragEvent) => {
   isDragging.value = false;
   if (event.dataTransfer?.files[0]) { fileToUpload.value = event.dataTransfer.files[0]; uploadError.value = ''; }
}
const triggerFileInput = () => fileInputRef.value?.click()
const removeFile = () => {
   fileToUpload.value = null;
   if (fileInputRef.value) fileInputRef.value.value = '';
}
const handleUpload = async () => {
   if (!fileToUpload.value) { uploadError.value = 'Please select a file.'; return }
   isUploading.value = true; uploadError.value = '';
   const formData = new FormData();
   formData.append('file', fileToUpload.value);
   formData.append('expiry', uploadExpiry.value);
   if (uploadExpiry.value === 'permanent' && uploadPin.value) {
      formData.append('pin', uploadPin.value);
   }
   try {
      const response = await $api('/api/upload', { method: 'POST', body: formData })
      if (response.status) {
         fileToUpload.value = null
         uploadResult.value = response.data.page
         fetchRecentFiles()
      }
   } catch (error: any) {
      uploadError.value = error.data?.msg || 'Server error.'
   } finally { isUploading.value = false }
}

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

const handleShorten = async () => {
   if (!longUrl.value) { shortenError.value = 'Please enter a URL.'; return }
   isShortening.value = true; shortenError.value = '';
   try {
      const response = await $api('/api/short', { method: 'POST', body: { url: longUrl.value } })
      if (response.status) shortenResult.value = response.data.url
      longUrl.value = ''
   } catch (error: any) {
      shortenError.value = error.data?.msg || 'Server error.'
   } finally { isShortening.value = false }
}

const copyToClipboard = async (text: string) => {
   try {
      await navigator.clipboard.writeText(text); copyButtonText.value = 'Copied!';
      setTimeout(() => { copyButtonText.value = 'Copy' }, 2000)
   } catch (err) { console.error('Copy failed:', err); }
}

onMounted(() => {
   fetchRecentFiles()
   if (socket) {
      socket.on('connect', () => console.log('✅ Socket connected'))
      socket.on('system', (data) => {
         stats.value.totalFiles = data.files.total; stats.value.totalSize = data.files.size;
         stats.value.totalDownloads = data.files.downloads; stats.value.apiHits = data.statistic.hit;
         stats.value.cpuUsage = data.cpuUsage; stats.value.memory.used = data.memory.used;
         stats.value.memory.total = data.memory.total;
         stats.value.memory.usage = data.memory.usage;
         stats.value.runtime = `${data.runtime}`;
         stats.value.os = data.device;
      })
      socket.on('disconnect', () => console.log('🔌 Socket disconnected'))
   }
})
onBeforeUnmount(() => {
   if (socket) {
      socket.off('system')
   }
})
</script>

<style scoped>
.stat-box {
   display: flex;
   align-items: center;
   gap: 1rem;
   padding: 1rem;
   background-color: var(--app-card-bg);
   border: 1px solid var(--app-border-color);
   border-radius: .5rem;
}

.icon-box {
   width: 40px;
   height: 40px;
   border-radius: 8px;
   display: flex;
   align-items: center;
   justify-content: center;
   font-size: 1.25rem;
   background-color: var(--app-bg);
   border: 1px solid var(--app-border-color);
   color: var(--app-secondary-text-color);
}

.stat-box .value {
   font-size: 1.25rem;
   font-weight: 700;
   color: var(--app-text-color);
   line-height: 1;
}

.stat-box .label {
   font-size: 0.75rem;
   color: var(--app-secondary-text-color);
   text-transform: uppercase;
}

.content-card {
   background-color: var(--app-card-bg);
   border: 1px solid var(--app-border-color);
   border-radius: .5rem;
   overflow: hidden;
}

.main-title {
   font-size: 1.1rem;
   font-weight: 600;
   color: var(--app-text-color);
}

.filter-group .btn-filter {
   background-color: var(--app-card-bg);
   color: var(--app-secondary-text-color);
   border-color: var(--app-border-color);
   font-size: 0.85rem;
   font-weight: 500;
}

.filter-group .btn-filter:hover:not(.active) {
   background-color: var(--app-bg);
}

.filter-group .btn-filter.active {
   background-color: var(--app-accent-color);
   color: var(--app-accent-text-color);
   border-color: var(--app-accent-color);
}

.drop-zone {
   border: 2px dashed var(--app-border-color);
   border-radius: 8px;
   padding: 2rem;
   text-align: center;
   cursor: pointer;
   transition: all 0.2s ease;
   color: var(--app-secondary-text-color);
}

.drop-zone.is-dragging,
.drop-zone:hover {
   border-color: var(--app-accent-color);
   background-color: var(--app-bg);
}

.file-preview {
   position: relative;
}

.btn-remove-file {
   position: absolute;
   top: -10px;
   right: -10px;
   width: 24px;
   height: 24px;
   border-radius: 50%;
   background-color: #dc3545;
   color: white;
   border: none;
   display: flex;
   align-items: center;
   justify-content: center;
   font-size: 1.2rem;
   line-height: 1;
}

.exclusive-text {
   font-size: 0.8rem;
   color: var(--app-secondary-text-color);
}

.exclusive-text i {
   color: var(--app-accent-color);
}

.monitor-card {
   display: flex;
   align-items: center;
   gap: 1rem;
   background-color: var(--app-card-bg);
   border: 1px solid var(--app-border-color);
   border-radius: .5rem;
   padding: 1rem;
   height: 100%;
}

.text-content .label {
   font-size: 0.8rem;
   color: var(--app-secondary-text-color);
   font-weight: 500;
}

.text-content .value {
   font-size: 1rem;
   font-weight: 700;
   color: var(--app-text-color);
}

.text-content .subtext {
   font-size: 0.75rem;
   color: var(--app-secondary-text-color);
}

.circular-progress {
   position: relative;
   width: 50px;
   height: 50px;
   flex-shrink: 0;
}

.circular-progress svg {
   width: 100%;
   height: 100%;
   transform: rotate(-90deg);
}

.circle-bg {
   fill: none;
   stroke: var(--app-bg);
   stroke-width: 4;
}

.circle {
   fill: none;
   stroke: var(--app-accent-color);
   stroke-width: 4;
   stroke-linecap: round;
   transition: stroke-dasharray 0.5s ease;
}

.percentage {
   position: absolute;
   top: 50%;
   left: 50%;
   transform: translate(-50%, -50%);
   font-size: 1.1rem;
   color: var(--app-secondary-text-color);
}

.fade-enter-active,
.fade-leave-active {
   transition: opacity .2s, transform .2s;
}

.fade-enter-from,
.fade-leave-to {
   opacity: 0;
   transform: translateY(10px);
}
</style>