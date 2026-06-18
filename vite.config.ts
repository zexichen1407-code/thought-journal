import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'

// Dev-only mirror of the production /api/groq route: forwards POST /api/groq to the
// deployed Cloudflare Worker, which holds GROQ_API_KEY as a Secret. So `npm run dev`
// gets working AI with no key on this machine and none in the client bundle.
const WORKER_API = 'https://thought-journal-real.zexichen1407.workers.dev/api/groq'

function groqDevProxy(): Plugin {
  return {
    name: 'groq-dev-proxy',
    configureServer(server) {
      server.middlewares.use('/api/groq', (req, res) => {
        if (req.method !== 'POST') {
          res.statusCode = 405
          res.end()
          return
        }
        let body = ''
        req.on('data', (c) => (body += c))
        req.on('end', async () => {
          try {
            const upstream = await fetch(WORKER_API, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body,
            })
            const text = await upstream.text()
            res.statusCode = upstream.status
            res.setHeader('Content-Type', 'application/json')
            res.end(text)
          } catch (e) {
            res.statusCode = 502
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ error: { message: String(e) } }))
          }
        })
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), groqDevProxy()],
  server: { host: true, allowedHosts: true },
  preview: { host: true, allowedHosts: true },
})
