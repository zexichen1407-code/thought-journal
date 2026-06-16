import { defineConfig, loadEnv, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'

import { cloudflare } from "@cloudflare/vite-plugin";

// Dev-only mirror of the Cloudflare Pages Function: serves POST /api/groq locally,
// reading the key from .env.local (gitignored) so `npm run dev` works without a key
// ever reaching the client bundle.
function groqDevProxy(key: string): Plugin {
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
          if (!key) {
            res.statusCode = 500
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ error: { message: 'GROQ_API_KEY missing in .env.local' } }))
            return
          }
          try {
            const upstream = await fetch('https://api.groq.com/openai/v1/chat/completions', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
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
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  return {
    plugins: [react(), groqDevProxy(env.GROQ_API_KEY ?? ''), cloudflare()],
    server: { host: true, allowedHosts: true },
    preview: { host: true, allowedHosts: true },
  };
})