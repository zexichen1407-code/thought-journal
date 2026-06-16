// Cloudflare Worker entry point.
// - /api/groq: proxy POST to Groq, adding the API key server-side (env.GROQ_API_KEY),
//   with CORS so the native iOS app (origin capacitor://localhost) can call it cross-origin.
//   The key never reaches the client, so the repo and built JS stay safe to be public.
// - everything else: serve the built SPA from ./dist via the ASSETS binding.
const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Max-Age': '86400',
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url)

    if (url.pathname === '/api/groq') {
      if (request.method === 'OPTIONS') {
        return new Response(null, { status: 204, headers: CORS })
      }
      if (request.method !== 'POST') {
        return new Response('Method Not Allowed', { status: 405, headers: CORS })
      }

      const key = env.GROQ_API_KEY
      if (!key) {
        return new Response(
          JSON.stringify({ error: { message: 'GROQ_API_KEY not configured on server.' } }),
          { status: 500, headers: { 'Content-Type': 'application/json', ...CORS } },
        )
      }

      const body = await request.text()
      const upstream = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${key}`,
        },
        body,
      })
      // Pass status + body through verbatim so the frontend's 401/429/413 handling still works.
      const text = await upstream.text()
      return new Response(text, {
        status: upstream.status,
        headers: { 'Content-Type': 'application/json', ...CORS },
      })
    }

    return env.ASSETS.fetch(request)
  },
}
