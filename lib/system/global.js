import 'dotenv/config.js'
import { promises as fsPromises } from 'fs'
import { join } from 'path'
import { constants } from 'fs'
import { readdir, rm, access } from 'fs/promises'
import os from 'node:os'
import path from 'path'
import SQL from './sql.js'
import _validate from './validator.js'

global.creator = `@kavionn – Pratama`

global.validator = {
   get: (req, params) => {
      return _validate(req.query, params, 'query string')
   },
   post: (req, params) => {
      return _validate(req.body, params, 'body')
   },
   params: (req, params) => {
      return _validate(req.params, params, 'route parameters')
   },
   delete: (req, params) => {
      let validationResult = _validate(req.params, params, 'route parameters')
      if (params.every(p => p in req.params)) return validationResult

      validationResult = _validate(req.query, params, 'query string')
      if (params.every(p => p in req.query)) return validationResult

      return _validate(req.body, params, 'body')
   },
   all: (req, rules) => {
      const locations = ['body', 'query', 'params']
      const errors = []

      for (const location of locations) {
         if (rules[location] && rules[location].length > 0) {
            const result = _validate(
               req[location],
               rules[location],
               location === 'query' ? 'query string' : (location === 'params' ? 'route parameters' : 'body')
            )

            if (!result.status) {
               errors.push(result.msg)
            }
         }
      }

      if (errors.length > 0) {
         return {
            creator: global.creator,
            status: false,
            msg: errors.join(' ')
         }
      }

      return { status: true }
   },
   url: (input) => {
      if (!input) {
         return {
            creator: global.creator,
            status: false,
            msg: 'Input value cannot be empty.'
         }
      }
      try {
         new URL(input)
         return { status: true }
      } catch (error) {
         return {
            creator: global.creator,
            status: false,
            msg: `The value "${input}" is not a valid URL.`
         }
      }
   },
   number: (input) => {
      if (input === null || input === undefined || String(input).trim() === '') {
         return {
            creator: global.creator,
            status: false,
            msg: 'Input value cannot be empty and must be a number.'
         }
      }
      if (!isFinite(input)) {
         return {
            creator: global.creator,
            status: false,
            msg: `The value "${input}" must be a valid number.`
         }
      }
      return { status: true }
   }
}

const clearTmp = async (dirPath) => {
   try {
      const files = await readdir(dirPath)
      await Promise.all(files.map(async (file) => {
         const filePath = join(dirPath, file)
         try {
            await access(filePath, constants.W_OK)
            await rm(filePath, { recursive: true, force: true })
         } catch (err) {
            console.error(`[CLEAR TMP] Failed to delete file ${filePath}: ${err.message}`)
         }
      }))
   } catch (error) {
      console.error(`Failed to clean directory ${dirPath}:`, error.message)
   }
}

global.db = new SQL(path.join(process.cwd(), process.env.DATABASE + '.db'))

export default async () => {
   try {
      await Promise.all([
         global.db.createTable('uploader', [
            { name: 'id', type: 'INTEGER PRIMARY KEY AUTOINCREMENT' },
            { name: 'code', type: 'TEXT' },
            { name: 'original', type: 'TEXT' },
            { name: 'filename', type: 'TEXT' },
            { name: 'bytes', type: 'INTEGER' },
            { name: 'size', type: 'TEXT' },
            { name: 'mime', type: 'TEXT' },
            { name: 'downloads', type: 'INTEGER' },
            { name: 'expired_at', type: 'INTEGER' },
         ]),
         global.db.createTable('shorten', [
            { name: 'id', type: 'INTEGER PRIMARY KEY AUTOINCREMENT' },
            { name: 'code', type: 'TEXT' },
            { name: 'url', type: 'TEXT' },
            { name: 'views', type: 'INTEGER' },
            { name: 'expired_at', type: 'INTEGER' },
         ]),
         global.db.createTable('statistic', [
            { name: 'visitor', type: 'INTEGER' },
            { name: 'hit', type: 'INTEGER' }
         ])
      ])

      const rows = await global.db.select('statistic')
      if (!rows?.length) {
         await global.db.insert('statistic', { visitor: 0, hit: 0 })
      }

      setInterval(async () => {
         try {
            await global.db.delete('shorten', 'expired_at <= ?', [Date.now()])

            const expiredFiles = await global.db.select('uploader', 'expired_at <= ? AND expired_at != -1', [Date.now()])

            if (expiredFiles.length > 0) {
               await global.db.delete('uploader', 'expired_at <= ? AND expired_at != -1', [Date.now()])

               for (const data of expiredFiles) {
                  try {
                     const filePath = path.join(process.cwd(), 'public/' + process.env.FILE_PATH + '/' + data.filename)
                     await fsPromises.unlink(filePath)
                  } catch (e) {
                     if (e.code !== 'ENOENT') {
                        console.error(`[UPLOADER CLEANUP] Failed to delete file ${data.filename}: ${e.message}`)
                     }
                  }
               }
            }
         } catch (mainErr) {
            console.error('[MAIN CLEANUP INTERVAL] An unexpected error occurred:', mainErr.message)
         }
      }, 1000 * 15)

      setInterval(() => clearTmp(os.tmpdir()), 10 * 60 * 1000)
   } catch (e) {
      console.error(`Initialization failed: ${e.message}`)
   }
}