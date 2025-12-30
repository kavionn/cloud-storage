import axios from 'axios'
import fs from 'fs'
import path from 'path'

class Function {
   makeId = (length) => {
      var result = ''
      var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrtuvwxyz0123456789'
      var charactersLength = characters.length
      for (var i = 0; i < length; i++) {
         result += characters.charAt(Math.floor(Math.random() * charactersLength))
      }
      return result
   }

   isUrl = url => {
      try {
         new URL(url)
         return true
      } catch {
         return false
      }
   }

   toBuffer = async i => {
      try {
         const file = Buffer.isBuffer(i) ? i : this.isUrl(i) ? await (await axios.get(i, {
            responseType: 'arraybuffer'
         })).data : null
         return file
      } catch (e) {
         return null
      }
   }

   uuid = () => {
      var dt = new Date().getTime()
      var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
         var r = (dt + Math.random() * 16) % 16 | 0;
         var y = Math.floor(dt / 16);
         return (c == 'x' ? r : (r & 0x3 | 0x8)).toString(16);
      })
      return uuid
   }

   formatSize = (size) => {
      function round(value, precision) {
         var multiplier = Math.pow(10, precision || 0)
         return Math.round(value * multiplier) / multiplier
      }
      var megaByte = 1024 * 1024
      var gigaByte = 1024 * megaByte
      var teraByte = 1024 * gigaByte
      if (size < 1024) {
         return size + ' B'
      } else if (size < megaByte) {
         return round(size / 1024, 1) + ' KB'
      } else if (size < gigaByte) {
         return round(size / megaByte, 1) + ' MB'
      } else if (size < teraByte) {
         return round(size / gigaByte, 1) + ' GB'
      } else {
         return round(size / teraByte, 1) + ' TB'
      }
      return ''
   }

   timeout = (duration) => {
      let milliseconds = parseInt((duration % 1000) / 100),
         seconds = Math.floor((duration / 1000) % 60),
         minutes = Math.floor((duration / (1000 * 60)) % 60),
         hours = Math.floor((duration / (1000 * 60 * 60)) % 24),
         days = Math.floor(duration / (24 * 60 * 60 * 1000))
      let hoursF = (hours < 10) ? "0" + hours : hours
      let minutesF = (minutes < 10) ? "0" + minutes : minutes
      let secondsF = (seconds < 10) ? "0" + seconds : seconds
      let daysF = (days < 10) ? "0" + days : days
      // return hours + " Jam " + minutes + " Menit" + seconds + " Detik" + milliseconds;
      return hoursF + ":" + minutesF + ":" + secondsF
   }

   sizeLimit = (str, max) => {
      let data
      if (str.match('G') || str.match('GB') || str.match('T') || str.match('TB')) return data = {
         oversize: true
      }
      if (str.match('M') || str.match('MB')) {
         let first = str.replace(/MB|M|G|T/g, '').trim()
         if (isNaN(first)) return data = {
            oversize: true
         }
         if (first > max) return data = {
            oversize: true
         }
         return data = {
            oversize: false
         }
      } else {
         return data = {
            oversize: false
         }
      }
   }

   removeItem = (arr, value) => {
      let index = arr.indexOf(value)
      if (index > -1) arr.splice(index, 1)
      return arr
   }

   delay = time => new Promise(res => setTimeout(res, time))

   fetchJson = async (url, options = {}) => {
      try {
         const result = await (await axios.get(url, {
            ...options
         })).data
         return result
      } catch (e) {
         return ({
            status: false,
            msg: e.message
         })
      }
   }

   random = (arr) => arr[Math.floor(Math.random() * arr.length)]

   randomInt = (min, max) => {
      min = Math.ceil(min)
      max = Math.floor(max)
      return Math.floor(Math.random() * (max - min + 1)) + min
   }

   downloadFile = async (url, outputPath) => {
      try {
         const writer = fs.createWriteStream(outputPath)
         const response = await axios({
            url,
            method: 'GET',
            responseType: 'stream',
         })
         response.data.pipe(writer)
         return new Promise((resolve, reject) => {
            writer.on('finish', resolve)
            writer.on('error', reject)
         })
      } catch (e) {
         throw e
      }
   }

   timeToMs = timeString => {
      const timeParts = timeString.split(":")
      let hours = 0, minutes = 0, seconds = 0

      // Jika ada 3 bagian (hh:mm:ss)
      if (timeParts.length === 3) {
         hours = parseInt(timeParts[0], 10)
         minutes = parseInt(timeParts[1], 10)
         seconds = parseInt(timeParts[2], 10)
      }
      // Jika hanya ada 2 bagian (mm:ss) atau (hh:mm)
      else if (timeParts.length === 2) {
         minutes = parseInt(timeParts[0], 10)
         seconds = parseInt(timeParts[1], 10)
      }

      // Mengonversi ke milidetik
      return (hours * 3600 + minutes * 60 + seconds) * 1000
   }

   toTime = (ms) => {
      let h = Math.floor(ms / 3600000)
      let m = Math.floor(ms / 60000) % 60
      let s = Math.floor(ms / 1000) % 60
      return [h, m, s].map(v => v.toString().padStart(2, 0)).join(':')
   }

   getFolderSize = folderPath => {
      let totalSize = 0

      const files = fs.readdirSync(folderPath)

      files.forEach(file => {
         const filePath = path.join(folderPath, file)
         const stats = fs.statSync(filePath)

         if (stats.isFile()) {
            totalSize += stats.size // Ukuran file dalam byte
         } else if (stats.isDirectory()) {
            totalSize += getFolderSize(filePath) // Rekursif untuk subfolder
         }
      })

      return totalSize
   }
}

export default new Function