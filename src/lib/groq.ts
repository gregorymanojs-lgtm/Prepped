import { InterviewSetup, Feedback } from "./types";
import { generateSimulatedResponse, getSimulatedFirstQuestion } from "./simulation";

const ENV_KEY = import.meta.env.VITE_GROQ_API_KEY as string | undefined;

// Primary model with fallback — 70b preferred, 8b as failover
const PRIMARY_MODEL = "llama-3.3-70b-versatile";
const FALLBACK_MODEL = "llama-3.1-8b-instant";

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

async function callGroqModel(
  apiKey: string,
  model: string,
  messages: { role: string; content: string }[],
  maxTokens = 1024
): Promise<Response> {
  return fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      max_tokens: maxTokens,
      temperature: 0.7,
      messages,
    }),
  });
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

      return `Strength: ${sim.feedback.strength}\nGap: ${sim.feedback.gap}\nScore: ${sim.feedback.score} / 10\nIdeal Answer: ${sim.feedback.idealAnswer}\n\n${sim.nextQuestion ? `Next Question: ${sim.nextQuestion}` : "That concludes our interview session! Thank you."}`;
    }

    throw new Error(
      "Groq API key not configured. Add your API key in Settings or continue in Demo Simulation mode."
    );
  }

  // Try primary model first, fall back to secondary on 404
  let response = await callGroqModel(apiKey, PRIMARY_MODEL, messages);

  // If 404 (model not found/no access), try the fallback model
  if (response.status === 404) {
    console.warn(`Model ${PRIMARY_MODEL} not found, retrying with ${FALLBACK_MODEL}...`);
    response = await callGroqModel(apiKey, FALLBACK_MODEL, messages);
  }

  if (!response.ok) {
    const err = await response.text();
    // If rate limited, quota exceeded, or auth error — fallback gracefully to simulation
    if (options?.setup && (response.status === 429 || response.status === 401 || response.status === 403)) {
      console.warn("Groq API quota/auth issue, falling back to smart simulation engine.");
      const isFirst = messages.length <= 2;
      if (isFirst) return getSimulatedFirstQuestion(options.setup);
      const lastUserMsg = [...messages].reverse().find((m) => m.role === "user")?.content || "";
      const qIndex = options.questionIndex ?? 0;
      const sim = generateSimulatedResponse(lastUserMsg, qIndex, options.setup);
      return `Strength: ${sim.feedback.strength}\nGap: ${sim.feedback.gap}\nScore: ${sim.feedback.score} / 10\nIdeal Answer: ${sim.feedback.idealAnswer}\n\n${sim.nextQuestion ? `Next Question: ${sim.nextQuestion}` : "That concludes our interview session! Thank you."}`;
    }
    throw new Error(`Groq API error: ${response.status} — ${err}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

/**
 * Generates a personalized AI summary of the interview session using the
 * candidate's resume text, feedbacks, and interview setup.
 */
export async function generateAISummary({
  setup,
  feedbacks,
  scores,
  durationSeconds,
}: {
  setup: InterviewSetup;
  feedbacks: Feedback[];
  scores: number[];
  durationSeconds: number;
}): Promise<string> {
  const apiKey = getGroqApiKey();
  const overallScore = scores.length
    ? (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1)
    : "N/A";

  const resumeContext = setup.resumeText
    ? `\n\nCandidate's Resume:\n"""\n${setup.resumeText.slice(0, 3000)}\n"""`
    : "";

  const feedbackSummary = feedbacks
    .map(
      (f, i) =>
        `Q${i + 1}: Strength: ${f.strength} | Gap: ${f.gap} | Score: ${f.score}/10`
    )
    .join("\n");

  const prompt = `You are an expert interview coach. A candidate just completed a ${setup.difficulty} ${setup.type} interview for ${setup.role}.${resumeContext}

Interview Results:
- Overall Score: ${overallScore}/10
- Duration: ${Math.floor(durationSeconds / 60)}m ${durationSeconds % 60}s
- Questions answered: ${scores.length}

Per-Question Breakdown:
${feedbackSummary}

Please write a concise, personalized executive summary (3-4 paragraphs) that:
1. References specific details from their resume (projects, technologies, experience) if provided
2. Highlights their strongest demonstrated competencies in this interview
3. Identifies the 2-3 highest-impact areas to focus on before their real interview
4. Gives a clear, honest readiness verdict and next steps

Write in second person ("you"), be direct and actionable. No fluff.`;

  if (!apiKey) {
    // Generate a decent simulation summary without API
    return generateSimulatedSummary(setup, feedbacks, scores, durationSeconds);
  }

  try {
    let response = await callGroqModel(
      apiKey,
      PRIMARY_MODEL,
      [{ role: "user", content: prompt }],
      800
    );
    if (response.status === 404) {
      response = await callGroqModel(
        apiKey,
        FALLBACK_MODEL,
        [{ role: "user", content: prompt }],
        800
      );
    }
    if (!response.ok) throw new Error("Summary generation failed");
    const data = await response.json();
    return data.choices[0].message.content;
  } catch {
    return generateSimulatedSummary(setup, feedbacks, scores, durationSeconds);
  }
}

function generateSimulatedSummary(
  setup: InterviewSetup,
  feedbacks: Feedback[],
  scores: number[],
  durationSeconds: number
): string {
  const avg = scores.length ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
  const topStrengths = feedbacks.slice(0, 2).map((f) => f.strength).join("; ");
  const topGaps = feedbacks.slice(0, 2).map((f) => f.gap).join("; ");
  const verdict =
    avg >= 8 ? "strong hire" : avg >= 6 ? "lean hire with coaching" : "needs dedicated prep";

  return `Your ${setup.difficulty} ${setup.type} interview for ${setup.role} yielded an overall score of ${
    avg.toFixed(1)
  }/10 — a ${verdict} signal based on your ${scores.length} responses over ${Math.floor(
    durationSeconds / 60
  )} minutes.

Your strongest demonstrated competencies were: ${topStrengths}. These are real differentiators that you should emphasize clearly in your actual interviews.

The highest-impact areas to work on before your real interview: ${topGaps}. Focus your next 48-72 hours of practice specifically on these.

Next steps: Run at least 2 more mock sessions in this same track, record yourself answering each question aloud, and apply the STAR framework rigorously to every behavioral answer. Consistency and specificity win interviews.`;
}
