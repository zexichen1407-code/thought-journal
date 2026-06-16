// Cloudflare Worker entry point.
// - POST /api/groq  -> proxy to Groq, adding the API key server-side (env.GROQ_API_KEY).
//   The key never reaches the browser, so the repo and built JS stay safe to be public.
// - everything else -> serve the built SPA from ./dist via the ASSETS binding.
export default {
  async fetch(request, env) {
    const url = new URL(request.url)

    if (url.pathname === '/api/groq' && request.method === 'POST') {
      const key = env.GROQ_API_KEY
      if (!key) {
        return new Response(
          JSON.stringify({ error: { message: 'GROQ_API_KEY not configured on server.' } }),
          { status: 500, headers: { 'Content-Type': 'application/json' } },
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
        headers: { 'Content-Type': 'application/json' },
      })
    }

    return env.ASSETS.fetch(request)
  },
}
