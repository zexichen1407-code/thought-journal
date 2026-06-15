# 思考记录 · Thought Journal

A voice-first journaling app. Speak your thoughts, get them transcribed, and let an LLM surface the themes you keep returning to — and how your thinking shifts over time.

## Features

- **Voice capture** — start talking and your speech is transcribed in real time (Chinese); manual typing is supported too.
- **Automatic daily summary** — each day's notes are condensed into a short recap, generated on its own.
- **7-day insight** — across recent days, the app pulls out recurring themes, your current stance on each, and how it has evolved.

Entries are stored locally in the browser; nothing is uploaded.

## Tech Stack

| Area | Choice |
|------|--------|
| Frontend | Vite · React · TypeScript (mobile-first, no backend) |
| Speech-to-text | Web Speech API (`zh-CN`) |
| Analysis | Groq — Llama 3.3 70B / Qwen3-32B, called from the client |
| iOS | Capacitor (native shell, in progress) |

## Getting Started

```bash
npm install
npm run dev
```

Open `http://localhost:5173` in Chrome (most reliable for speech recognition) and allow microphone access.

For theme analysis, add a free Groq API key under **Settings** — create one at [console.groq.com](https://console.groq.com) (no card required). The key is stored only in your browser.

## Roadmap

- [x] Voice capture and local storage
- [x] Daily summary and 7-day theme analysis
- [ ] Native iOS app via Capacitor → App Store
- [ ] Cross-device cloud sync
