# ⚡ NEXUS — Advanced AI Chat Interface

> A next-generation chat UI that solves the "boring chatbox" problem.

![NEXUS Chat](https://img.shields.io/badge/AI-Groq%20API-00f5a0?style=flat-square) ![License](https://img.shields.io/badge/license-MIT-blue?style=flat-square)

---

## ✨ What makes it different

| Feature | Regular chatbot | NEXUS |
|---|---|---|
| Interface | Plain white box | Dark immersive UI with ambient effects |
| Streaming | ❌ Wait for full response | ✅ Real-time token streaming |
| Sessions | ❌ No history | ✅ Multi-session with localStorage |
| Models | ❌ Fixed | ✅ Switch between 4 LLMs live |
| Markdown | ❌ Plain text | ✅ Full markdown + code highlighting |
| UX | ❌ Static | ✅ Animations, suggestions, toast, auto-resize |

---

## 🚀 Deploy to GitHub Pages

### 1. Clone / upload
```bash
git init
git add .
git commit -m "feat: NEXUS chat interface"
git remote add origin https://github.com/YOUR_USERNAME/nexus-chat.git
git push -u origin main
```

### 2. Enable GitHub Pages
- Go to repo **Settings → Pages**
- Source: **Deploy from a branch → main → / (root)**
- Save → your site is live at `https://YOUR_USERNAME.github.io/nexus-chat`

---

## 🛠 Tech Stack

- **Vanilla HTML/CSS/JS** — zero dependencies, zero build step
- **Groq API** — ultra-fast LLM inference (free tier available)
- **Streaming** — Server-Sent Events for real-time output
- **localStorage** — persistent chat sessions

---

## 🤖 Models Available

| Model | Strength |
|---|---|
| Gemma 2 9B | Fast, general purpose |
| LLaMA 3.3 70B | Most capable |
| Mixtral 8×7B | Long context |
| LLaMA3 70B | Balanced |

---

## 📁 Structure

```
nexus-chat/
├── index.html       # Main interface
├── css/
│   └── style.css    # Full design system
├── js/
│   └── app.js       # Logic + API + streaming
└── README.md
```

---

## ⚠️ API Key Note

The API key is hardcoded for demo purposes. For production:
1. Move to a backend proxy (Node.js / Cloudflare Worker)
2. Use environment variables
3. Add rate limiting per user

---

## License

MIT — free to use, modify, and deploy.
