export interface InterviewSetup {
  role: string;
  type: string;
  difficulty: string;
  jobDescription: string;
  resumeText: string;
}

export interface Feedback {
  strength: string;
  gap: string;
  score: number;
  idealAnswer: string;
}

export interface InterviewMessage {
  role: "user" | "assistant" | "system";
  content: string;
  feedback?: Feedback;
  nextQuestion?: string;
}

export interface SessionResult {
  id: string;
  setup: InterviewSetup;
  messages: InterviewMessage[];
  scores: number[];
  overallScore: number;
  strengths: string[];
  gaps: string[];
  studyList: string[];
  verdict: "Not Ready" | "Almost There" | "Ready to Interview";
  timestamp: number;
}
