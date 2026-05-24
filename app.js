// ============================
// NEXUS CHAT — app.js
// Groq API + Advanced UX
// ============================

const API_KEY = "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";
const API_URL = "https://api.groq.com/openai/v1/chat/completions";

// النموذج البديل المعتمد بعد إيقاف gemma2-9b-it
const FALLBACK_MODEL = "llama-3.1-8b-instant";

// ── State ──────────────────────────────────────────
const state = {
  sessions: JSON.parse(localStorage.getItem("nexus_sessions") || "[]"),
  currentId: null,
  isLoading: false,
};

// ── DOM refs ───────────────────────────────────────
const $ = (id) => document.getElementById(id);
const messagesEl    = $("messages");
const messagesWrap  = $("messagesWrap");
const userInput     = $("userInput");
const sendBtn       = $("sendBtn");
const sidebar       = $("sidebar");
const sidebarToggle = $("sidebarToggle");
const menuBtn       = $("menuBtn");
const newChatBtn    = $("newChatBtn");
const chatHistory   = $("chatHistory");
const clearBtn      = $("clearBtn");
const modelSelect   = $("modelSelect");
const modelLabel    = $("modelLabel");

// ── Session helpers ────────────────────────────────
function getSession() {
  return state.sessions.find((s) => s.id === state.currentId) || null;
}

function saveState() {
  localStorage.setItem("nexus_sessions", JSON.stringify(state.sessions));
}

function getActiveModel(sessionModel) {
  const model = sessionModel || modelSelect.value;
  return model === "gemma2-9b-it" ? FALLBACK_MODEL : model;
}

function createSession() {
  const currentModel = modelSelect.value === "gemma2-9b-it" ? FALLBACK_MODEL : modelSelect.value;
  const session = {
    id: Date.now().toString(),
    title: "New conversation",
    model: currentModel,
    messages: [],
    createdAt: Date.now(),
  };
  state.sessions.unshift(session);
  state.currentId = session.id;
  saveState();
  renderHistory();
  return session;
}

// ── Markdown renderer (lightweight) ───────────────
function renderMarkdown(text) {
  return text
    // code blocks
    .replace(/```(\w*)\n?([\s\S]*?)```/g, (_, lang, code) =>
      `<pre><code class="lang-${lang}">${escapeHtml(code.trim())}</code></pre>`
    )
    // inline code
    .replace(/`([^`]+)`/g, (_, c) => `<code>${escapeHtml(c)}</code>`)
    // bold
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    // italic
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    // h3
    .replace(/^### (.+)$/gm, "<h3>$1</h3>")
    // h2
    .replace(/^## (.+)$/gm, "<h2>$1</h2>")
    // h1
    .replace(/^# (.+)$/gm, "<h1>$1</h1>")
    // blockquote
    .replace(/^> (.+)$/gm, "<blockquote>$1</blockquote>")
    // unordered list
    .replace(/^[*\-] (.+)$/gm, "<li>$1</li>")
    .replace(/(<li>.*<\/li>)/gs, "<ul>$1</ul>")
    // ordered list
    .replace(/^\d+\. (.+)$/gm, "<li>$1</li>")
    // line breaks to paragraphs
    .replace(/\n\n/g, "</p><p>")
    .replace(/\n/g, "<br/>")
    // wrap in paragraph if no block element
    .replace(/^(?!<[hupb]|<pre|<blockquote)(.+)/, "<p>$1</p>");
}

function escapeHtml(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// ── Render ─────────────────────────────────────────
function renderHistory() {
  chatHistory.innerHTML = "";
  if (state.sessions.length === 0) {
    chatHistory.innerHTML = `<div style="padding:12px 10px;color:var(--text2);font-size:12px;font-family:var(--font-mono)">No conversations yet</div>`;
    return;
  }
  state.sessions.forEach((s) => {
    const el = document.createElement("div");
    el.className = "history-item" + (s.id === state.currentId ? " active" : "");
    el.innerHTML = `
      <svg class="history-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
      </svg>
      ${escapeHtml(s.title)}
    `;
    el.title = s.title;
    el.addEventListener("click", () => loadSession(s.id));
    chatHistory.appendChild(el);
  });
}

function loadSession(id) {
  state.currentId = id;
  renderHistory();
  renderMessages();
  closeSidebarOnMobile();
}

function renderMessages() {
  const session = getSession();
  messagesEl.innerHTML = "";

  if (!session || session.messages.length === 0) {
    messagesEl.innerHTML = `<div id="welcome" class="welcome">
      <div class="welcome-icon">
        <div class="pulse-ring"></div>
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <circle cx="12" cy="12" r="10"/>
          <path d="M12 8v4l3 3"/>
          <path d="M12 2v2M12 20v2M2 12h2M20 12h2"/>
        </svg>
      </div>
      <h1 class="welcome-title">NEXUS AI</h1>
      <p class="welcome-sub">Next-generation conversational interface.<br/>Ask anything. Think deeper.</p>
      <div class="suggestions">
        <button class="suggestion-chip" data-text="Explain quantum entanglement simply">⚛ Quantum physics</button>
        <button class="suggestion-chip" data-text="Write a Python script to scrape domain prices">🐍 Code something</button>
        <button class="suggestion-chip" data-text="What domains in AI niche are worth investing in 2025?">🌐 Domain investing</button>
        <button class="suggestion-chip" data-text="Best crypto trading strategies for memecoins?">₿ Crypto alpha</button>
      </div>
    </div>`;
    bindChips();
    return;
  }

  session.messages.forEach((msg) => appendMessage(msg.role, msg.content, false));
  scrollBottom();
}

function appendMessage(role, content, animate = true) {
  // Remove welcome screen
  const welcome = document.getElementById("welcome");
  if (welcome) welcome.remove();

  const now = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  const isUser = role === "user";

  const el = document.createElement("div");
  el.className = `msg ${isUser ? "msg-user" : "msg-ai"}`;
  if (!animate) el.style.animation = "none";

  el.innerHTML = `
    <div class="msg-avatar">${isUser ? "YOU" : "N"}</div>
    <div class="msg-content">
      <div class="msg-meta">${isUser ? "You" : "NEXUS"} · ${now}</div>
      <div class="msg-bubble">${isUser ? escapeHtml(content) : renderMarkdown(content)}</div>
    </div>
  `;

  messagesEl.appendChild(el);
  if (animate) scrollBottom();
  return el;
}

function scrollBottom() {
  messagesWrap.scrollTo({ top: messagesWrap.scrollHeight, behavior: "smooth" });
}

// ── Typing indicator ───────────────────────────────
function showTyping() {
  const tpl = document.getElementById("typingTpl");
  const clone = tpl.content.cloneNode(true);
  messagesEl.appendChild(clone);
  scrollBottom();
}

function hideTyping() {
  const el = document.getElementById("typingIndicator");
  if (el) el.remove();
}

// ── Send message ───────────────────────────────────
async function send(text) {
  text = text.trim();
  if (!text || state.isLoading) return;

  // Ensure session
  if (!state.currentId) createSession();
  const session = getSession();

  // Add user message
  session.messages.push({ role: "user", content: text });
  if (session.title === "New conversation" && session.messages.length === 1) {
    session.title = text.slice(0, 40) + (text.length > 40 ? "…" : "");
  }
  saveState();
  appendMessage("user", text);
  renderHistory();

  // Reset input
  userInput.value = "";
  userInput.style.height = "auto";
  sendBtn.disabled = true;
  state.isLoading = true;

  // Show typing
  showTyping();

  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
                                                 
