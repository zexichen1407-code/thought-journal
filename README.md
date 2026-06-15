# 思考记录 · Thought Journal

> 用说话记录每天的思考,让 AI 帮你看清反复出现的主题,以及想法随时间的变化。

## 功能

- **语音记录** —— 点一下开始说,中文实时转文字;也支持手动输入。
- **每日自动小结** —— 当天的记录自动浓缩成一句话,无需手动触发。
- **近 7 天洞察** —— 跨多天提炼反复出现的主题、你当前的核心观点,以及它的演变。

所有记录仅存于本地浏览器,不上传。

## 技术栈

| 模块 | 选型 |
|------|------|
| 前端 | Vite · React · TypeScript(移动优先,无后端) |
| 语音转写 | Web Speech API(`zh-CN`) |
| 分析 | Groq —— Llama 3.3 70B / Qwen3-32B,客户端直连 |
| iOS | Capacitor(原生封装,进行中) |

## 快速开始

```bash
npm install
npm run dev
```

用 Chrome 打开 `http://localhost:5173`(语音识别最稳),并允许麦克风权限。主题分析需在「设置」中填入免费的 Groq API key(在 [console.groq.com](https://console.groq.com) 创建,无需绑卡;key 仅存于本地浏览器)。

## 路线图

- [x] 语音记录与本地存储
- [x] 每日小结与近 7 天主题分析
- [ ] Capacitor 原生 iOS app → App Store
- [ ] 多设备云端同步

---

# Thought Journal

> Capture daily thoughts by voice and let an LLM surface the themes you keep returning to — and how your thinking evolves over time.

## Features

- **Voice capture** — start talking and your speech is transcribed in real time (Chinese); manual typing is supported too.
- **Automatic daily summary** — each day's notes are condensed into a short recap, generated on its own.
- **7-day insight** — across recent days, it pulls out recurring themes, your current stance on each, and how it has shifted.

All entries are stored locally in the browser; nothing is uploaded.

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

Open `http://localhost:5173` in Chrome (most reliable for speech recognition) and allow microphone access. For theme analysis, add a free Groq API key under **Settings** — create one at [console.groq.com](https://console.groq.com) (no card required). The key is stored only in your browser.

## Roadmap

- [x] Voice capture and local storage
- [x] Daily summary and 7-day theme analysis
- [ ] Native iOS app via Capacitor → App Store
- [ ] Cross-device cloud sync
