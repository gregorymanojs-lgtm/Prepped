const API_KEY = import.meta.env.VITE_GROQ_API_KEY as string | undefined;

export function getGroqApiKey(): string | null {
  return API_KEY || null;
}

export async function callGroq(
  messages: { role: string; content: string }[]
): Promise<string> {
  const apiKey = getGroqApiKey();
  if (!apiKey) {
    throw new Error("Groq API key not configured. Set VITE_GROQ_API_KEY environment variable.");
  }

  const response = await fetch(
    "https://api.groq.com/openai/v1/chat/completions",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        max_tokens: 1024,
        messages,
      }),
    }
  );

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Groq API error: ${response.status} — ${err}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}