<template>
   <div>
      <div class="container px-3 mb-4">
         <div class="row g-4">
            <div class="col-lg-4 d-none d-lg-block">
               <div class="docs-nav-wrapper">
                  <h6 class="docs-nav-title">ENDPOINTS</h6>
                  <ul class="list-unstyled docs-nav">
                     <li v-for="endpoint in allEndpoints" :key="endpoint.id">
                        <a :href="`#${endpoint.id}`" class="nav-link"
                           :class="{ 'active': activeSection === endpoint.id }">
                           {{ endpoint.title }}
                        </a>
                     </li>
                  </ul>
               </div>
            </div>

            <div class="col-lg-8">
               <div v-for="endpoint in allEndpoints" :key="endpoint.id" :id="endpoint.id" class="endpoint-section">
                  <div class="content-card rounded-3">
                     <div class="card-body-custom">
                        <div class="d-flex align-items-center mb-3">
                           <span :class="`method-badge me-3 method-${endpoint.method.toLowerCase()}`">{{ endpoint.method
                           }}</span>
                           <code class="text-path">{{ endpoint.path }}</code>
                        </div>
                        <h5 class="main-title mb-2">{{ endpoint.title }}</h5>
                        <p class="endpoint-description">{{ endpoint.description }}</p>

                        <h6 class="section-heading mt-3">Body Parameters</h6>
                        <div class="table-responsive mb-3">
                           <table class="table detail-info-table table-bordered">
                              <thead>
                                 <tr>
                                    <th>Parameter</th>
                                    <th>Type</th>
                                    <th>Status</th>
                                    <th>Description</th>
                                 </tr>
                              </thead>
                              <tbody>
                                 <tr v-for="param in endpoint.parameters" :key="param.name">
                                    <td><code>{{ param.name }}</code></td>
                                    <td><code>{{ param.type }}</code></td>
                                    <td>
                                       <span v-if="param.required" class="badge bg-danger">Required</span>
                                       <span v-else class="badge text-bg-secondary">Optional</span>
                                    </td>
                                    <td v-html="param.description"></td>
                                 </tr>
                              </tbody>
                           </table>
                        </div>

                        <h6 class="section-heading mt-3">Example (cURL)</h6>
                        <div class="code-container position-relative">
                           <pre><code class="language-bash">{{ endpoint.curlExample }}</code></pre>
                           <button class="btn btn-sm btn-copy"
                              @click="copyToClipboard(endpoint.curlExample, endpoint.id)">
                              <i class="bi"
                                 :class="copyStatus[endpoint.id] === 'Copied!' ? 'bi-check-lg' : 'bi-clipboard'"></i>
                           </button>
                        </div>

                        <h6 class="section-heading mt-3">Example (Node.js)</h6>
                        <div class="code-container position-relative">
                           <pre><code class="language-javascript">{{ endpoint.nodejsExample }}</code></pre>
                           <button class="btn btn-sm btn-copy"
                              @click="copyToClipboard(endpoint.nodejsExample, endpoint.id + '-nodejs')">
                              <i class="bi"
                                 :class="copyStatus[endpoint.id + '-nodejs'] === 'Copied!' ? 'bi-check-lg' : 'bi-clipboard'"></i>
                           </button>
                        </div>
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </div>
   </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, nextTick, computed } from 'vue'
import Prism from 'prismjs'
import 'prismjs/themes/prism-tomorrow.css'
import 'prismjs/components/prism-bash'
import 'prismjs/components/prism-javascript'
import { useHead, useRuntimeConfig } from '#app'

useHead({ title: 'API Documentation' })

const config = useRuntimeConfig()
const copyStatus = ref({})
const activeSection = ref('')
let observer = null

const copyToClipboard = (text, id) => {
   navigator.clipboard.writeText(text).then(() => {
      copyStatus.value[id] = 'Copied!'; setTimeout(() => { delete copyStatus.value[id] }, 2000)
   })
}

const endpointsData = ref([
   {
      id: 'api-upload',
      title: 'File Upload',
      method: 'POST',
      path: '/api/upload',
      description: 'Uploads a file and returns a shareable link. The request must be sent as multipart/form-data.',
      parameters: [
         { name: 'file', type: 'File', required: true, description: 'The file to be uploaded.' },
         { name: 'expiry', type: 'string', required: false, description: 'Expiration time. Can be <code>5m</code>, <code>1h</code>, <code>1d</code>, or <code>permanent</code>.' },
         { name: 'password', type: 'string', required: false, description: 'A password required only if expiry is set to <code>permanent</code>.' }
      ],
      curlTemplate: `curl -X POST "__BASE_URL__/api/upload" \\\n  -F "file=@/path/to/your/file.jpg" \\\n  -F "expiry=1d"`,
      nodejsExample: `import FormData from 'form-data'
import axios from 'axios'
import pkg from 'file-type'
const { fromBuffer: parse } = pkg

export default (buffer, extension) => new Promise(async resolve => {
  try {
    let form = new FormData()
    try {
      var { ext } = await parse(buffer)
    } catch (e) {
      var ext = 'bin'
    }
    form.append('file', Buffer.from(buffer), 'file.' + (extension || ext))
    form.append('expiry', '1d') // Optional: 5m, 1h, 1d, permanent
    
    const json = await (await axios.post('__BASE_URL__/api/upload', form, {
      headers: {
        ...form.getHeaders()
      }
    })).data
    resolve(json)
  } catch (e) {
    resolve({
      status: false,
      msg: e?.response?.data?.msg || e.message
    })
  }
})`
   },
   {
      id: 'api-short',
      title: 'URL Shortener',
      method: 'POST',
      path: '/api/short',
      description: 'Shortens a long URL. The request must be sent as application/json.',
      parameters: [
         { name: 'url', type: 'string', required: true, description: 'The long URL to be shortened.' }
      ],
      curlTemplate: `curl -X POST "__BASE_URL__/api/short" \\\n  --header "Content-Type: application/json" \\\n  --data-raw '{\n    "url": "https://a-very-long-and-complex-url.com/example"\n  }'`,
      nodejsExample: `import axios from 'axios'

export default async (url) => {
  try {
    const response = await axios.post('__BASE_URL__/api/short', {
      url: url
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    })
    return response.data
  } catch (e) {
    return {
      status: false,
      msg: e?.response?.data?.msg || e.message
    }
  }
}`
   }
])

const allEndpoints = computed(() => {
   const baseUrl = process.client ? window.location.origin : (config.public.baseURL || 'https://your-domain.com');
   return endpointsData.value.map(endpoint => ({
      ...endpoint,
      curlExample: endpoint.curlTemplate.replace(/__BASE_URL__/g, baseUrl),
      nodejsExample: endpoint.nodejsExample.replace(/__BASE_URL__/g, baseUrl)
   }));
});

onMounted(() => {
   nextTick(() => {
      Prism.highlightAll();
      const options = { rootMargin: "-20% 0px -80% 0px" }
      observer = new IntersectionObserver((entries) => {
         entries.forEach(entry => {
            if (entry.isIntersecting) {
               activeSection.value = entry.target.id
            }
         })
      }, options)
      document.querySelectorAll('.endpoint-section').forEach(section => observer.observe(section))
   })
})

onBeforeUnmount(() => {
   if (observer) observer.disconnect()
})
</script>

<style scoped>
html {
   scroll-behavior: smooth;
}

.main-title {
   font-weight: 600;
   color: var(--app-text-color);
   font-size: 1.25rem;
   margin-bottom: 0.5rem;
}

.content-card {
   background: var(--app-card-bg);
   border: 1px solid var(--app-border-color);
   border-radius: .5rem;
}

.card-body-custom {
   padding: 1.25rem;
}

.docs-nav-wrapper {
   position: sticky;
   top: 110px;
}

.docs-nav-title {
   font-size: .75rem;
   font-weight: 700;
   text-transform: uppercase;
   letter-spacing: .5px;
   color: var(--app-secondary-text-color);
   padding: 0 .75rem;
   margin-bottom: .5rem;
}

.docs-nav .nav-link {
   padding: .5rem .75rem;
   border-radius: 6px;
   color: var(--app-secondary-text-color);
   font-weight: 500;
   font-size: 0.9rem;
   transition: all .2s;
}

.docs-nav .nav-link:hover {
   background: var(--app-bg);
   color: var(--app-text-color);
}

.docs-nav .nav-link.active {
   background: var(--app-bg);
   color: var(--app-accent-color);
   font-weight: 600;
   border-left-color: var(--app-accent-color);
}

.endpoint-section {
   margin-bottom: 1.5rem;
   scroll-margin-top: 100px;
}

.endpoint-description {
   color: var(--app-secondary-text-color);
   font-size: 0.85rem;
   line-height: 1.5;
   margin-bottom: 0.75rem;
}

.method-badge {
   font-size: .65rem;
   font-weight: 700;
   padding: .15em .5em;
   border-radius: 4px;
   text-transform: uppercase;
   color: #fff;
}

.method-post {
   background: #0d6efd;
}

.text-path {
   color: var(--app-text-color);
   font-size: 0.875rem;
   font-weight: 500;
}

.section-heading {
   font-weight: 600;
   font-size: 0.8rem;
   color: var(--app-text-color);
   text-transform: uppercase;
   letter-spacing: .5px;
   margin-top: 1.5rem;
   margin-bottom: 0.75rem;
}

.table-bordered {
   --bs-table-border-color: var(--app-border-color);
}

.detail-info-table {
   font-size: 0.8rem;
   --bs-table-color: var(--app-text-color);
   --bs-table-bg: var(--app-card-bg);
   margin-bottom: 0.5rem;
}

.detail-info-table thead th {
   background-color: var(--app-bg);
   color: var(--app-secondary-text-color);
   text-transform: uppercase;
   font-size: 0.75rem;
   font-weight: 600;
   padding: 0.5rem 0.75rem;
}

.detail-info-table code {
   font-weight: 600;
   color: var(--app-text-color);
   background-color: var(--app-bg);
   padding: 2px 5px;
   border-radius: 4px;
   font-size: 0.8rem;
}

.detail-info-table td,
.detail-info-table th {
   padding: 0.5rem 0.75rem;
   vertical-align: middle;
}

.badge.bg-danger {
   background-color: rgba(220, 53, 69, 0.15) !important;
   color: #dc3545 !important;
   font-size: 0.75rem;
}

.badge.text-bg-secondary {
   background-color: rgba(var(--app-text-rgb, 255, 255, 255), 0.1) !important;
   color: var(--app-secondary-text-color) !important;
   font-size: 0.75rem;
}

.code-container {
   background: #2d2d2d;
   border-radius: 6px;
   border: 1px solid var(--app-border-color);
   margin-bottom: 0.75rem;
}

.code-container pre[class*="language-"] {
   background: transparent !important;
   margin: 0;
   padding: 0.875rem;
   text-shadow: none;
   font-size: 0.85rem;
   max-height: 300px;
   overflow-y: auto;
}

.btn-copy {
   position: absolute;
   top: .5rem;
   right: .5rem;
   background: rgba(255, 255, 255, 0.1);
   color: #fff;
   border: none;
   opacity: 0;
   transition: opacity .2s;
   padding: 0.25rem 0.5rem;
   font-size: 0.75rem;
}

.code-container:hover .btn-copy {
   opacity: 1;
}

/* Responsive adjustments */
@media (max-width: 768px) {
   .content-card {
      margin: 0 -0.5rem;
      border-radius: 0;
      border-left: none;
      border-right: none;
   }
   
   .card-body-custom {
      padding: 1rem;
   }
   
   .text-path {
      font-size: 0.8rem;
      word-break: break-all;
   }
   
   .endpoint-description {
      font-size: 0.8rem;
   }
   
   .detail-info-table {
      font-size: 0.75rem;
   }
}
</style>