import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { execSync } from 'child_process'
import { watch, existsSync, readFileSync, statSync, copyFileSync, mkdirSync, readdirSync } from 'fs'
import { join, resolve, extname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = fileURLToPath(new URL('.', import.meta.url))
const wallpapersDir = resolve(__dirname, 'wallpapers')

const MIME: Record<string, string> = {
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
}

function generateManifest() {
  try {
    execSync('node scripts/generate-manifest.mjs', { stdio: 'inherit' })
  } catch {}
}

function copyDir(src: string, dest: string) {
  if (!existsSync(dest)) mkdirSync(dest, { recursive: true })
  for (const entry of readdirSync(src, { withFileTypes: true })) {
    const s = join(src, entry.name)
    const d = join(dest, entry.name)
    if (entry.isDirectory()) copyDir(s, d)
    else copyFileSync(s, d)
  }
}

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'wallpaper-plugin',
      configureServer(server) {
        generateManifest()

        server.middlewares.use((req, res, next) => {
          const url = (req.url || '').split('?')[0]
          if (!url.startsWith('/wallpapers/')) return next()
          const relative = url.slice('/wallpapers/'.length)
          const filePath = join(wallpapersDir, relative)
          if (existsSync(filePath) && statSync(filePath).isFile()) {
            res.writeHead(200, { 'Content-Type': MIME[extname(filePath)] || 'application/octet-stream' })
            res.end(readFileSync(filePath))
          } else {
            next()
          }
        })

        try {
          watch(wallpapersDir, { recursive: true }, (_, filename) => {
            if (filename?.endsWith('.json')) {
              generateManifest()
              server.ws.send({ type: 'full-reload' })
            }
          })
        } catch {}
      },
      closeBundle() {
        for (const entry of readdirSync(wallpapersDir, { withFileTypes: true })) {
          const src = join(wallpapersDir, entry.name)
          const dest = resolve(__dirname, 'dist', entry.name)
          if (entry.isDirectory()) copyDir(src, dest)
          else copyFileSync(src, dest)
        }
      },
    },
  ],
  base: '/wallpapers/',
})
