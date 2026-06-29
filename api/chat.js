const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions"

const SYSTEM_PROMPT = `
You are the website assistant for Oma Carpentry & Handyman Services.
Answer visitor questions clearly and briefly.

Company focus:
- Carpentry and handyman services.
- Services include custom carpentry, decks, fences, outdoor builds, interior finishing, doors, trim, flooring, cabinetry, repairs, fixture installs, and small renovations.
- The contact phone number is (604) 698-7185.

Helpful behavior:
- Encourage visitors to use the contact form for quotes and project-specific details.
- Do not invent exact prices, warranties, installation timelines, or availability.
- If a question is outside carpentry or handyman work, politely steer back to Oma Carpentry's services.
`.trim()

const allowedRoles = new Set(["user", "assistant"])

function cleanMessages(messages) {
  if (!Array.isArray(messages)) return []

  return messages
    .filter(
      (message) =>
        allowedRoles.has(message?.role) &&
        typeof message?.content === "string" &&
        message.content.trim()
    )
    .slice(-10)
    .map((message) => ({
      role: message.role,
      content: message.content.trim().slice(0, 1200),
    }))
}

export default async function handler(req, res) {
  if (req.method === "OPTIONS") {
    res.setHeader("Allow", "POST, OPTIONS")
    res.status(204).end()
    return
  }

  if (req.method !== "POST") {
    res.setHeader("Allow", "POST, OPTIONS")
    res.status(405).json({ error: "Method not allowed" })
    return
  }

  const apiKey = process.env.OPENROUTER_API_KEY

  if (!apiKey) {
    res.status(500).json({
      error: "OpenRouter is not configured. Add OPENROUTER_API_KEY.",
    })
    return
  }

  const visitorMessages = cleanMessages(req.body?.messages)

  if (visitorMessages.length === 0) {
    res.status(400).json({ error: "Please send a message first." })
    return
  }

  try {
    const openRouterResponse = await fetch(OPENROUTER_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer":
          process.env.SITE_URL || req.headers.origin || "http://localhost:4180",
        "X-Title": "Oma Carpentry & Handyman Services",
      },
      body: JSON.stringify({
        model: process.env.OPENROUTER_MODEL || "openai/gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: SYSTEM_PROMPT,
          },
          ...visitorMessages,
        ],
        max_tokens: 450,
        temperature: 0.35,
      }),
    })

    const data = await openRouterResponse.json()

    if (!openRouterResponse.ok) {
      console.error("OpenRouter error:", data)
      res.status(openRouterResponse.status).json({
        error: data?.error?.message || "The assistant could not respond.",
      })
      return
    }

    const reply = data?.choices?.[0]?.message?.content?.trim()

    if (!reply) {
      res.status(502).json({ error: "The assistant returned an empty reply." })
      return
    }

    res.status(200).json({ reply })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: "The assistant is unavailable right now." })
  }
}
