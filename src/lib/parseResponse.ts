import { Feedback } from "./types";

export function parseAIResponse(content: string): {
  feedback: Feedback | null;
  nextQuestion: string;
} {
  const strengthMatch = content.match(/\*?\*?Strength\*?\*?:\s*(.+?)(?=\n\*?\*?Gap|$)/is);
  const gapMatch = content.match(/\*?\*?Gap\*?\*?:\s*(.+?)(?=\n\*?\*?Score|$)/is);
  const scoreMatch = content.match(/\*?\*?Score\*?\*?:\s*(\d+)\s*\/\s*10/i);
  const idealMatch = content.match(/\*?\*?Ideal Answer\*?\*?:\s*(.+?)(?=\n\n|\n\*?\*?(?:Question|Next)|$)/is);

  const hasFeedback = strengthMatch && gapMatch && scoreMatch;

  const feedback: Feedback | null = hasFeedback
    ? {
        strength: strengthMatch![1].trim(),
        gap: gapMatch![1].trim(),
        score: parseInt(scoreMatch![1], 10),
        idealAnswer: idealMatch ? idealMatch[1].trim() : "",
      }
    : null;

  // Extract next question: everything after the ideal answer section (or the whole thing if no feedback)
  let nextQuestion = content;
  if (feedback && idealMatch) {
    const idealEnd = content.indexOf(idealMatch[1]) + idealMatch[1].length;
    const rest = content.slice(idealEnd).trim();
    // Remove leading markers like "Next Question:" or "Question X:"
    nextQuestion = rest.replace(/^\*?\*?(?:Next\s+)?Question\s*\d*\s*:?\*?\*?\s*/i, "").trim();
  } else if (!feedback) {
    nextQuestion = content.trim();
  }

  return { feedback, nextQuestion };
}

export function buildSystemMessage(setup: {
  role: string;
  type: string;
  difficulty: string;
  jobDescription: string;
  resumeText: string;
}): string {
  let msg = `You are a senior interviewer at a top tech company conducting a ${setup.difficulty} level ${setup.type} interview for a ${setup.role} position.`;
  if (setup.jobDescription) {
    msg += ` The job description is: "${setup.jobDescription}". Tailor your questions to it.`;
  }
  if (setup.resumeText) {
    msg += ` The candidate's resume: "${setup.resumeText}". Reference the candidate's specific projects and experience.`;
  }
  msg += ` Ask one focused question at a time. After the user answers, respond in exactly this format — Strength: what they did well. Gap: what was missing. Score: X/10. Ideal Answer: a concise strong example. Then ask the next question. Be direct and honest. High standards. No fluff.`;
  return msg;
}
