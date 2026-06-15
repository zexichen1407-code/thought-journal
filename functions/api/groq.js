// Cloudflare Pages Function — handles POST /api/groq.
// It forwards the request body to Groq, adding the API key server-side from the
// GROQ_API_KEY environment variable (set in the Pages project settings).
// The key never reaches the browser, so the repo and built JS can be public.
export async function onRequestPost(context) {
  const { request, env } = context
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
