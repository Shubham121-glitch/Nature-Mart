import config from "../config/config.js"

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions"

export const chat = async (req, res) => {
  try {
    const { messages, model = "openrouter/free", max_tokens = 1024 } = req.body

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ message: "Messages array is required" })
    }

    if (!config.OPENROUTER_API_KEY) {
      return res.status(500).json({ message: "OpenRouter API key not configured" })
    }

    const response = await fetch(OPENROUTER_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${config.OPENROUTER_API_KEY}`,
      },
      body: JSON.stringify({ model, messages, max_tokens }),
    })

    const data = await response.json()

    if (data.error) {
      return res.status(response.status || 500).json({ message: data.error.message || "AI request failed" })
    }

    const reply = data.choices?.[0]?.message?.content || "Sorry, I couldn't generate a response."
    res.status(200).json({ reply })
  } catch (err) {
    console.error("Chat proxy error:", err.message)
    res.status(500).json({ message: "Chat request failed" })
  }
}
