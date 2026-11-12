import { InterviewSetup, Feedback } from "./types";
import { generateSimulatedResponse, getSimulatedFirstQuestion } from "./simulation";

const ENV_KEY = import.meta.env.VITE_GROQ_API_KEY as string | undefined;

export function getGroqApiKey(): string | null {
  if (typeof window !== "undefined") {
    const local = localStorage.getItem("prepped_groq_api_key");
    if (local && local.trim().length > 0) return local.trim();
  }
  return ENV_KEY || null;
}

export function setGroqApiKey(key: string): void {
  if (typeof window !== "undefined") {
    if (!key.trim()) {
      localStorage.removeItem("prepped_groq_api_key");
    } else {
      localStorage.setItem("prepped_groq_api_key", key.trim());
    }
  }
}

export function hasGroqApiKey(): boolean {
  return Boolean(getGroqApiKey());
}

export async function callGroq(
  messages: { role: string; content: string }[],
  options?: {
    setup?: InterviewSetup;
    questionIndex?: number;
    allowSimulationFallback?: boolean;
  }
): Promise<string> {
  const apiKey = getGroqApiKey();

  // If no API key is configured and fallback is allowed (default true), use high-fidelity simulation
  if (!apiKey) {
    if (options?.allowSimulationFallback !== false && options?.setup) {
      // Simulate realistic network delay (700-1200ms) for natural feel
      await new Promise((r) => setTimeout(r, 850));

      const isFirst = messages.length <= 2;
      if (isFirst) {
        return getSimulatedFirstQuestion(options.setup);
      }

      const lastUserMsg = [...messages].reverse().find((m) => m.role === "user")?.content || "";
      const qIndex = options.questionIndex ?? 0;
      const sim = generateSimulatedResponse(lastUserMsg, qIndex, options.setup);

      return `Strength: ${sim.feedback.strength}
Gap: ${sim.feedback.gap}
Score: ${sim.feedback.score} / 10
Ideal Answer: ${sim.feedback.idealAnswer}

${sim.nextQuestion ? `Next Question: ${sim.nextQuestion}` : "That concludes our interview session! Thank you."}`;
    }

    throw new Error(
      "Groq API key not configured. Add your API key in Settings or continue in Demo Simulation mode."
    );
  }

  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      max_tokens: 1024,
      temperature: 0.7,
      messages,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    // If rate limited or quota exceeded, fallback gracefully to simulation if enabled
    if (options?.setup && (response.status === 429 || response.status === 401)) {
      console.warn("Groq API quota/auth issue, falling back to smart simulation engine.");
      const isFirst = messages.length <= 2;
      if (isFirst) return getSimulatedFirstQuestion(options.setup);
      const lastUserMsg = [...messages].reverse().find((m) => m.role === "user")?.content || "";
      const qIndex = options.questionIndex ?? 0;
      const sim = generateSimulatedResponse(lastUserMsg, qIndex, options.setup);
      return `Strength: ${sim.feedback.strength}
Gap: ${sim.feedback.gap}
Score: ${sim.feedback.score} / 10
Ideal Answer: ${sim.feedback.idealAnswer}

${sim.nextQuestion ? `Next Question: ${sim.nextQuestion}` : "That concludes our interview session! Thank you."}`;
    }
    throw new Error(`Groq API error: ${response.status} — ${err}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}
