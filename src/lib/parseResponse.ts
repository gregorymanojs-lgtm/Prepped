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
  jobDescription?: string;
  resumeText?: string;
  customQuestions?: string;
}): string {
  let msg = `You are a rigorous senior ${setup.type} interviewer at a top-tier tech company evaluating a ${setup.difficulty}-level ${setup.role} candidate.`;

  if (setup.resumeText) {
    msg += `\n\nCANDIDATE RESUME (use this extensively):\n"""\n${setup.resumeText.slice(0, 4000)}\n"""\n\nIMPORTANT: You MUST ask questions that directly reference the candidate's specific projects, technologies, companies, and experiences from their resume. Do NOT ask generic questions — always personalize to what's on the resume.`;
  }

  if (setup.jobDescription) {
    msg += `\n\nTARGET JOB DESCRIPTION:\n"""\n${setup.jobDescription}\n"""\nCalibrate every question to evaluate fit for the responsibilities and requirements in this listing.`;
  }

  if (setup.customQuestions) {
    msg += `\n\nCUSTOM QUESTIONS TO INCLUDE (incorporate these into the interview flow):\n${setup.customQuestions}`;
  }

  msg += `\n\nINTERVIEW RULES:
- Ask ONE focused question at a time
- After the candidate answers, respond in EXACTLY this format (no deviations):

Strength: [1-2 sentences on what they did well]
Gap: [1-2 sentences on what was missing or could be stronger]
Score: X/10
Ideal Answer: [A concise, exemplary 2-4 sentence model response they should have given]

Next Question: [Your next question, deeply tailored to their resume/background]

- Be direct, honest, and hold high standards. No flattery or fluff.
- For behavioral questions, evaluate using the STAR framework (Situation, Task, Action, Result).
- For technical questions, probe for depth, trade-offs, and real-world reasoning.`;

  return msg;
}
