# TEMP UPLOADER (OPEN API)

> Temporary Uploader is a service that allows you to upload files to a temporary location.

## Benefits & Features

- Temporary & Permanent File Upload
- URL Shortener
- IP Restriction
- Plugins as Router
- Customizeable
- Fast & Lightweight
- Simple Web Interface

## Configuration

> Set konfigurasi pada file ```.env```

```.env
### Site Name
SITENAME = "Open's API"

### Database Name
DATABASE = 'database'

### Folder File Path
FILE_PATH = 'get'

### Max Upload Size (MB)
MAX_UPLOAD_SIZE = 5

### Apikey Authentication
API_KEY = 'neoxr'

### Timezone
TZ = 'Asia/Jakarta'

### Port
PORT = 7860

### Domain (Homepage)
DOMAIN = '/'

### Caching & RPM (Request Per Minute)
REQUEST_LIMIT = 10

### Permanent Upload PIN
PIN = 'neoxr'
```

### IP Restriction

> Terdapat IP Restriction sebagai pengaman tambahan endpoint, untuk menambahkan IP yang dizinkan terdapat pada file ```/lib/system/config.js```

```Javascript
export const allowedIPs = []
```
Masukkan IP kedalam array, misalnya :

```Javascript
export const allowedIPs = ["123.45.678", "910.111.213"]
```

## Installation

```bash
$ npm i -g yarn pm2
$ yarn install && yarn run build
$ pm2 start pm2.config.cjs && pm2 logs uploader
```

## API Endpoint

> Berikut adalah implementasi kode penggunaan API Endpoint dengan menggunakan Javascript.

### Temporary Upload

```Javascript
import FormData from 'form-data'
import axios from 'axios'
import pkg from 'file-type'
const { fromBuffer: parse } = pkg

export default (buffer, extension) => new Promise(async resolve => {
   try {
      let form = new FormData
      try {
         var { ext } = await parse(file)
      } catch (e) {
         var ext = 'bin'
      }
      form.append('file', Buffer.from(buffer), 'file.' + (extension || ext))
      const json = await (await axios.post('https://example.com/api/upload', form, {
         headers: {
            ...form.getHeaders()
         }
      })).data
      resolve(json)
   } catch (e) {
      resolve({
         creator: global.creator,
         status: false,
         msg: e?.response.data?.msg || e.message
      })
   }
})
```

### Permanent Upload

```Javascript
import FormData from 'form-data'
import axios from 'axios'
import pkg from 'file-type'
const { fromBuffer: parse } = pkg

export default (buffer, extension) => new Promise(async resolve => {
   try {
      let form = new FormData
      try {
         var { ext } = await parse(file)
      } catch (e) {
         var ext = 'bin'
      }
      form.append('file', Buffer.from(buffer), 'file.' + (extension || ext))
      form.append('expiry', 'permanent')
      form.append('pin', 'YOUR_PIN')
      const json = await (await axios.post('https://example.com/api/upload', form, {
         headers: {
            ...form.getHeaders()
         }
      })).data
      resolve(json)
   } catch (e) {
      resolve({
         creator: global.creator,
         status: false,
         msg: e?.response.data?.msg || e.message
      })
   }
})
```

**Notes :**

Terdapat tambahan parameter untuk upload permanen yaitu ```expiry``` dengan value ```-1``` yang di maksudkan sebagai no expiration alias tanpa kadaluarsa sedangkan ```apikey``` adalah proteksi agar tidak sembarang user mengupload file ke server, value apikey adalah yang terdapat pada konfigurasi environment ```.env```

### URL Shortener

```Javascript
import axios from 'axios'

export default url => new Promise(async resolve => {
   try {
      let form = new URLSearchParams
      form.append('url', url)
      const json = await (await axios.post('https://example.com/api/short', form)).data
      resolve(json)
   } catch (e) {
      resolve({
         creator,
         status: false,
         msg: e?.response.data?.msg || e.message
      })
   }
})
```
