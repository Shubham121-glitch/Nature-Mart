import { useState, useEffect, useRef, useCallback } from "react"
import {
  MessageCircle, X, Send, Bot, User, Sparkles, Copy, Check,
  PanelLeftOpen, PanelLeftClose,
  Trash2, ToggleLeft, ToggleRight, ChevronDown, RefreshCw
} from "lucide-react"
import { useUser } from "../context/userContext"
import api from "../api"
import "./chatbot.css"

const STORAGE_KEY = "hortx-chatbot-conversations"
const MAX_SAVED = 50

const SYSTEM_PROMPT = `You are Nature Mart's AI gardening assistant. You help users with:
- Plant care tips and gardening advice
- Product recommendations from our store (plants, seeds, tools, pots, soil, fertilizers, decor, accessories, irrigation, lighting, pest control, compost, landscaping)
- Soil, fertilizer, and pest control guidance
- Order and account help
Keep responses helpful, friendly, and concise. Use markdown formatting when appropriate (bold, italic, lists, code).`

const SUGGESTION_SETS = [
  ["How do I care for succulents?", "Best indoor plants for beginners", "How to start a kitchen garden?"],
  ["What fertilizer should I use?", "How to repot a plant?", "Tips for growing tomatoes"],
  ["Recommended gardening tools", "How to deal with pests naturally?", "Best soil mix for raised beds"],
]

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
}

function loadConversations() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function saveConversations(convs) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(convs.slice(0, MAX_SAVED)))
}

function formatTime(ts) {
  if (!ts) return ""
  const d = new Date(ts)
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
}

/* ── Code Block ── */
function CodeBlock({ language, code }) {
  const [copied, setCopied] = useState(false)
  const handleCopy = () => {
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <div className="chat-code-block">
      <div className="chat-code-header">
        <span className="chat-code-lang">{language || "code"}</span>
        <button className="chat-code-copy" onClick={handleCopy}>
          {copied ? <Check size={12} /> : <Copy size={12} />}
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>
      <pre className="chat-code-pre"><code>{code}</code></pre>
    </div>
  )
}

/* ── Markdown Parsers ── */
function parseInlineMarkdown(text) {
  if (!text) return ""
  let html = text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
  html = html.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
  html = html.replace(/\*(.+?)\*/g, "<em>$1</em>")
  html = html.replace(/`(.+?)`/g, '<code class="chat-inline-code">$1</code>')
  html = html.replace(/^- (.+)$/gm, '<li class="chat-list-item">$1</li>')
  html = html.replace(/^(\d+)\. (.+)$/gm, '<li class="chat-list-item">$2</li>')
  html = html.replace(/(<li class="chat-list-item">[\s\S]*?<\/li>)/g, (m) => `<ul class="chat-list">${m}</ul>`)
  html = html.replace(/<\/ul>\s*<ul class="chat-list">/g, "")
  html = html.replace(/\n/g, "<br>")
  return html
}

function parseContent(text) {
  if (!text) return []
  const codeBlockRegex = /```(\w*)\n([\s\S]*?)```/g
  const segments = []
  let lastIndex = 0
  let match
  while ((match = codeBlockRegex.exec(text)) !== null) {
    if (match.index > lastIndex) segments.push({ type: "text", content: text.slice(lastIndex, match.index) })
    segments.push({ type: "code", language: match[1] || "", content: match[2].replace(/\n$/, "") })
    lastIndex = match.index + match[0].length
  }
  if (lastIndex < text.length) segments.push({ type: "text", content: text.slice(lastIndex) })
  return segments.length ? segments : [{ type: "text", content: text }]
}

/* ── Typewriter ── */
function TypewriterText({ text, onComplete }) {
  const [displayed, setDisplayed] = useState("")
  const [done, setDone] = useState(false)
  const indexRef = useRef(0)
  const intervalRef = useRef(null)

  useEffect(() => {
    if (!text) return
    indexRef.current = 0
    setDisplayed("") // eslint-disable-line react-hooks/set-state-in-effect
    setDone(false)
    intervalRef.current = setInterval(() => {
      indexRef.current++
      if (indexRef.current >= text.length) {
        setDisplayed(text)
        setDone(true)
        clearInterval(intervalRef.current)
        onComplete?.()
      } else {
        setDisplayed(text.slice(0, indexRef.current))
      }
    }, 18)
    return () => clearInterval(intervalRef.current)
  }, [text, onComplete])

  const skip = () => {
    clearInterval(intervalRef.current)
    setDisplayed(text)
    setDone(true)
    onComplete?.()
  }

  const segments = parseContent(displayed)
  return (
    <div className="typewriter-wrap">
      {segments.map((seg, i) =>
        seg.type === "code"
          ? <CodeBlock key={i} language={seg.language} code={seg.content} />
          : <span key={i} dangerouslySetInnerHTML={{ __html: parseInlineMarkdown(seg.content) }} />
      )}
      {!done && <button className="skip-btn" onClick={skip}>Skip</button>}
    </div>
  )
}

/* ── Message Bubble ── */
function MessageBubble({ msg, onRegenerate }) {
  const isUser = msg.role === "user"
  return (
    <div className={`chat-msg ${isUser ? "chat-msg-user" : "chat-msg-bot"}`}>
      <div className="chat-msg-avatar">
        {isUser ? <User size={14} /> : <Bot size={14} />}
      </div>
      <div className="chat-msg-content">
        <div className="chat-msg-body">
          {msg.isStreaming ? (
            <TypewriterText text={msg.content} />
          ) : (
            parseContent(msg.content).map((seg, i) =>
              seg.type === "code"
                ? <CodeBlock key={i} language={seg.language} code={seg.content} />
                : <span key={i} dangerouslySetInnerHTML={{ __html: parseInlineMarkdown(seg.content) }} />
            )
          )}
        </div>
        <div className="chat-msg-meta">
          <span className="chat-msg-time">{formatTime(msg.timestamp)}</span>
          {!isUser && !msg.isStreaming && onRegenerate && (
            <button className="chat-msg-regen" onClick={() => onRegenerate(msg)} title="Regenerate">
              <RefreshCw size={12} />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════
   MAIN WIDGET
   ═══════════════════════════════════════════ */
export default function ChatbotWidget() {
  const { user } = useUser()

  const [isOpen, setIsOpen] = useState(false)
  const [showSidebar, setShowSidebar] = useState(() => window.innerWidth > 768)
  const [isTemporary, setIsTemporary] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [input, setInput] = useState("")
  const [showScrollBtn, setShowScrollBtn] = useState(false)

  const [conversations, setConversations] = useState(loadConversations)
  const [activeConvId, setActiveConvId] = useState(null)
  const [messages, setMessages] = useState([])
  const [suggestionSet, setSuggestionSet] = useState(0)

  const messagesEndRef = useRef(null)
  const messagesContainerRef = useRef(null)
  const inputRef = useRef(null)

  const scrollToBottom = useCallback((smooth = true) => {
    messagesEndRef.current?.scrollIntoView({ behavior: smooth ? "smooth" : "instant" })
  }, [])

  useEffect(() => { scrollToBottom(false) }, [messages, scrollToBottom])

  useEffect(() => {
    if (isOpen) setTimeout(() => inputRef.current?.focus(), 300)
  }, [isOpen])

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape" && isOpen) setIsOpen(false)
    }
    document.addEventListener("keydown", handleEsc)
    return () => document.removeEventListener("keydown", handleEsc)
  }, [isOpen])

  const handleScroll = () => {
    const el = messagesContainerRef.current
    if (!el) return
    const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 80
    setShowScrollBtn(!atBottom)
  }

  const startNewChat = () => {
    setMessages([{
      role: "bot",
      content: `Hi ${user?.username || "there"}! I'm Nature Mart's AI assistant. Ask me about plant care, gardening tips, or product recommendations!`,
      // eslint-disable-next-line react-hooks/purity
      timestamp: Date.now(),
    }])
    setActiveConvId(null)
    setShowSidebar(false)
    setSuggestionSet((prev) => (prev + 1) % SUGGESTION_SETS.length)
  }

  const loadConversation = (conv) => {
    setMessages(conv.messages)
    setActiveConvId(conv.id)
    setShowSidebar(false)
  }

  const deleteConversation = (id) => {
    const updated = conversations.filter((c) => c.id !== id)
    setConversations(updated)
    saveConversations(updated)
    if (activeConvId === id) startNewChat()
  }

  const persistMessages = (msgs) => {
    if (isTemporary) return
    const firstUserMsg = msgs.find((m) => m.role === "user")
    if (!firstUserMsg) return
    const title = firstUserMsg.content.slice(0, 50) + (firstUserMsg.content.length > 50 ? "..." : "")
    const clean = msgs.map((m) => ({ ...m, isStreaming: false }))

    setConversations((prev) => {
      let updated
      if (activeConvId) {
        updated = prev.map((c) => c.id === activeConvId ? { ...c, messages: clean, title, updatedAt: Date.now() } : c)
      } else {
        const newConv = { id: generateId(), title, messages: clean, createdAt: Date.now(), updatedAt: Date.now() }
        updated = [newConv, ...prev]
        setActiveConvId(newConv.id)
      }
      saveConversations(updated)
      return updated
    })
  }

  const callAPI = async (apiMessages) => {
    const res = await api.post("/api/chat", { messages: apiMessages })
    if (res.data.error) throw new Error(res.data.message || "API request failed")
    return res.data.reply
  }

  const sendMessage = async (overrideText) => {
    const text = (overrideText || input).trim()
    if (!text || isLoading) return

    const userMsg = { role: "user", content: text, timestamp: Date.now() } // eslint-disable-line react-hooks/purity
    const newMessages = [...messages, userMsg]
    setMessages(newMessages)
    setInput("")
    setIsLoading(true)

    const apiMessages = [
      { role: "system", content: SYSTEM_PROMPT },
      ...newMessages
        .filter((m) => m.role !== "bot" || m.content !== messages[0]?.content)
        .map((m) => ({ role: m.role === "bot" ? "assistant" : "user", content: m.content })),
    ]

    try {
      const reply = await callAPI(apiMessages)
      const finalMessages = [...newMessages, { role: "bot", content: reply, isStreaming: true, timestamp: Date.now() }] // eslint-disable-line react-hooks/purity
      setMessages(finalMessages)
      persistMessages(finalMessages)
    } catch (err) {
      console.error("Chatbot error:", err)
      const errMsg = err.message.includes("401") ? "Please check your API key." : err.message
      const finalMessages = [...newMessages, { role: "bot", content: `Sorry, something went wrong. ${errMsg}`, timestamp: Date.now() }] // eslint-disable-line react-hooks/purity
      setMessages(finalMessages)
      persistMessages(finalMessages)
    } finally {
      setIsLoading(false)
    }
  }

  const regenerateMessage = async (botMsg) => {
    const msgIndex = messages.indexOf(botMsg)
    if (msgIndex < 1) return
    const trimmed = messages.slice(0, msgIndex)
    setMessages(trimmed)
    setIsLoading(true)

    const apiMessages = [
      { role: "system", content: SYSTEM_PROMPT },
      ...trimmed
        .filter((m) => m.role !== "bot" || m.content !== messages[0]?.content)
        .map((m) => ({ role: m.role === "bot" ? "assistant" : "user", content: m.content })),
    ]

    try {
      const reply = await callAPI(apiMessages)
      const finalMessages = [...trimmed, { role: "bot", content: reply, isStreaming: true, timestamp: Date.now() }]
      setMessages(finalMessages)
      persistMessages(finalMessages)
    } catch (err) {
      const errMsg = err.message.includes("401") ? "Please check your API key." : err.message
      const finalMessages = [...trimmed, { role: "bot", content: `Sorry, something went wrong. ${errMsg}`, timestamp: Date.now() }]
      setMessages(finalMessages)
      persistMessages(finalMessages)
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage() }
  }

  const suggestions = SUGGESTION_SETS[suggestionSet]
  const hasMessages = messages.length > 1

  return (
    <>
      {/* FAB */}
      <button
        className={`chatbot-fab ${isOpen ? "open" : ""}`}
        onClick={() => { setIsOpen(!isOpen); if (!isOpen && messages.length === 0) startNewChat() }}
        aria-label="Toggle AI Chat"
      >
        {isOpen ? <X size={22} /> : <MessageCircle size={22} />}
      </button>

      {/* Fullscreen Window */}
      <div className={`chatbot-window ${isOpen ? "open" : ""}`}>
        {/* Sidebar */}
        <div className={`chatbot-sidebar ${showSidebar ? "visible" : ""}`}>
          <div className="sidebar-header">
            <h4>Conversations</h4>
            <button className="sidebar-close" onClick={() => setShowSidebar(false)}>
              <PanelLeftClose size={18} />
            </button>
          </div>
          <button className="sidebar-new-chat" onClick={startNewChat}>
            <Sparkles size={15} /> New Chat
          </button>
          <div className="sidebar-list">
            {conversations.length === 0 && (
              <p className="sidebar-empty">No conversations yet</p>
            )}
            {conversations.map((conv) => (
              <div
                key={conv.id}
                className={`sidebar-item ${conv.id === activeConvId ? "active" : ""}`}
                onClick={() => loadConversation(conv)}
              >
                <div className="sidebar-item-content">
                  <span className="sidebar-item-title">{conv.title}</span>
                  <span className="sidebar-item-date">
                    {new Date(conv.updatedAt).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                  </span>
                </div>
                <button
                  className="sidebar-item-delete"
                  onClick={(e) => { e.stopPropagation(); deleteConversation(conv.id) }}
                  title="Delete"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Main content area */}
        <div className="chatbot-main">
          {/* Header */}
          <div className="chatbot-header">
            <button className="chatbot-sidebar-toggle" onClick={() => setShowSidebar(!showSidebar)} title="Conversations">
              {showSidebar ? <PanelLeftClose size={18} /> : <PanelLeftOpen size={18} />}
            </button>
            <div className="chatbot-header-center">
              <div className="chatbot-header-avatar">
                <Sparkles size={16} />
              </div>
              <div className="chatbot-header-text">
                <h4>Nature Mart AI</h4>
                <span className="chatbot-status">
                  <span className="status-dot"></span> Free
                </span>
              </div>
            </div>
            <div className="chatbot-header-actions">
              <button
                className={`chatbot-header-btn ${isTemporary ? "active" : ""}`}
                onClick={() => setIsTemporary(!isTemporary)}
                title={isTemporary ? "Turn off temp chat" : "Turn on temp chat"}
              >
                {isTemporary ? <ToggleRight size={17} /> : <ToggleLeft size={17} />}
                <span className="chatbot-btn-label">Temp</span>
              </button>
              <button className="chatbot-close" onClick={() => setIsOpen(false)} title="Close">
                <X size={17} />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="chatbot-messages" ref={messagesContainerRef} onScroll={handleScroll}>
          {!hasMessages ? (
            <div className="chatbot-welcome">
              <div className="chatbot-welcome-icon">
                <Sparkles size={36} />
              </div>
              <h5>What can I help with?</h5>
              <p className="chatbot-welcome-sub">Ask me about plant care, gardening tips, or products!</p>
              {isTemporary && (
                <span className="chatbot-temp-badge">
                  <ToggleRight size={12} /> Temporary — not saved
                </span>
              )}
              <div className="chatbot-suggestions">
                {suggestions.map((s) => (
                  <button key={s} className="chatbot-suggestion" onClick={() => sendMessage(s)}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <>
              {messages.map((msg, i) => (
                <MessageBubble key={i} msg={msg} onRegenerate={regenerateMessage} />
              ))}
              {isLoading && (
                <div className="chat-msg chat-msg-bot">
                  <div className="chat-msg-avatar"><Bot size={14} /></div>
                  <div className="chat-msg-body typing-indicator">
                    <span></span><span></span><span></span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </>
          )}

          {/* Scroll to bottom */}
          {showScrollBtn && (
            <button className="chatbot-scroll-btn" onClick={() => { scrollToBottom(); setShowScrollBtn(false) }}>
              <ChevronDown size={18} />
            </button>
          )}
        </div>

        {/* Input */}
        <div className="chatbot-input-area">
          {isTemporary && <div className="chatbot-temp-strip"></div>}
          <div className="chatbot-input-inner">
            <textarea
              ref={inputRef}
              className="chatbot-textarea"
              placeholder={isTemporary ? "Temporary chat..." : "Ask about plants, gardening..."}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isLoading}
              rows={1}
            />
            <button className="chatbot-send" onClick={() => sendMessage()} disabled={!input.trim() || isLoading}>
              {isLoading ? (
                <div className="send-spinner"></div>
              ) : (
                <Send size={18} />
              )}
            </button>
          </div>
        </div>
        </div>
      </div>
    </>
  )
}
