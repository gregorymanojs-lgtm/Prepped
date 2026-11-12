import { InterviewSetup, Feedback } from "./types";

interface QuestionPool {
  role: string;
  type: string;
  questions: {
    question: string;
    focus: string;
    sampleIdeal: string;
    keyThemes: string[];
  }[];
}

const QUESTION_BANK: QuestionPool[] = [
  {
    role: "Software Engineer",
    type: "Technical",
    questions: [
      {
        question: "Can you explain how you would identify and resolve a severe performance bottleneck in a distributed web application where API response latency suddenly spiked by 400%?",
        focus: "Observability, Profiling & Distributed Systems",
        sampleIdeal: "I would start by checking APM metrics (Datadog/Prometheus) to pinpoint the bottleneck layer (database, network I/O, CPU, downstream microservices). I'd examine latency p95/p99 graphs, slow query logs, connection pools, and recent deployment diffs. After reproducing under load or isolating with feature flags, I'd apply targeted caching, index optimization, or query batching, followed by automated canary verification.",
        keyThemes: ["metrics", "latency", "database", "cache", "profiling", "logs", "canary", "index", "concurrency"]
      },
      {
        question: "Describe your approach to designing a robust retry strategy with idempotency for mission-critical webhook processing.",
        focus: "Reliability & Idempotency",
        sampleIdeal: "I'd implement exponential backoff with full jitter to prevent thundering herd problems. For idempotency, each incoming webhook payload must contain a unique idempotency key or event ID stored in a distributed key-value store (like Redis) or database with a unique constraint. If a duplicate arrives within the TTL window, return the cached result immediately without re-processing.",
        keyThemes: ["exponential backoff", "jitter", "idempotency", "redis", "ttl", "unique", "retry", "queue"]
      },
      {
        question: "How do you manage state and minimize unnecessary re-renders in a complex, data-heavy frontend dashboard with real-time WebSocket feeds?",
        focus: "Frontend Architecture & React Internals",
        sampleIdeal: "I decouple high-frequency incoming streaming data from the main React render tree using transient state (refs or Zustand selectors with shallow comparisons). I batch incoming WebSocket frames with requestAnimationFrame or throttle to 60fps, memoize heavy computations with useMemo, and virtualize large tables with TanStack Virtual to only mount visible DOM nodes.",
        keyThemes: ["zustand", "selector", "memo", "batch", "throttle", "websocket", "virtual", "render"]
      },
      {
        question: "Walk me through how you approach writing comprehensive tests for a critical payment checkout workflow.",
        focus: "Testing Strategy & Edge Cases",
        sampleIdeal: "I use the testing pyramid: unit tests for calculation logic, currency conversions, and discount engines; integration tests mocking Stripe/PayPal webhooks; contract tests for third-party schemas; and end-to-end tests in an isolated sandbox testing success, expired card, network failure, and double-submit edge cases.",
        keyThemes: ["pyramid", "unit", "integration", "e2e", "mock", "edge cases", "stripe", "double-submit"]
      },
      {
        question: "Tell me about a time you had to make a painful technical tradeoff between delivery speed and system scalability. What was the outcome?",
        focus: "Engineering Tradeoffs & Judgment",
        sampleIdeal: "When shipping a real-time collaborative workspace ahead of a major conference, we opted for Postgres JSONB and polling over WebSockets with CRDTs to hit the launch date. We documented the scale threshold (5,000 active rooms), built load telemetry, and successfully migrated to WebSockets and Redis PubSub during the next quarter without downtime.",
        keyThemes: ["tradeoff", "tech debt", "timeline", "scale", "migration", "decision", "monitoring"]
      }
    ]
  },
  {
    role: "Software Engineer",
    type: "Behavioral",
    questions: [
      {
        question: "Tell me about a time you strongly disagreed with a tech lead or senior engineer's architectural decision. How did you handle it?",
        focus: "Conflict Resolution & Disagree and Commit",
        sampleIdeal: "In my previous role, a senior architect proposed rewriting our sync service in an unfamiliar language 3 weeks before launch. Instead of arguing opinion, I drafted a quick POC benchmarking both approaches, outlined concrete operational risks, and presented them collaboratively in a design doc. We agreed on a phased hybrid approach, saving 6 weeks of delay.",
        keyThemes: ["star", "poc", "data", "compromise", "respect", "doc", "outcome"]
      },
      {
        question: "Describe a production outage or critical incident you caused or were the primary responder for. What happened and what did you learn?",
        focus: "Incident Response & Blameless Post-Mortem",
        sampleIdeal: "During a Friday migration, a database migration locked the users table, causing 12 minutes of 500 errors. I immediately rolled back using our automated pipeline, declared a sev-1 on Slack, and communicated with customer support. Afterwards, I led a blameless post-mortem, introduced zero-downtime column migrations, and added a linter rule to prevent locks.",
        keyThemes: ["post-mortem", "rollback", "incident", "blameless", "prevention", "learning"]
      },
      {
        question: "Give an example of a project where requirements were vague and rapidly changing. How did you guide it to completion?",
        focus: "Ambiguity & Stakeholder Management",
        sampleIdeal: "When building an AI search integration with evolving product specs, I broke down the initiative into weekly demonstrable prototypes. I held bi-weekly alignment check-ins with product and design, anchored on core user stories, and built modular interfaces so underlying AI models could be swapped with zero frontend refactor.",
        keyThemes: ["ambiguity", "prototypes", "communication", "iterations", "milestones"]
      },
      {
        question: "Tell me about how you mentor junior developers or lift the engineering quality of your team.",
        focus: "Mentorship & Team Impact",
        sampleIdeal: "I run weekly 1-on-1 pairing sessions, created onboarding runbooks that cut new-hire ramp up from 3 weeks to 4 days, and champion actionable, empathetic PR reviews focused on architectural principles rather than nitpicks.",
        keyThemes: ["mentorship", "pairing", "code review", "onboarding", "culture", "documentation"]
      },
      {
        question: "Why are you interested in this role, and what makes you uniquely equipped to excel here?",
        focus: "Motivation & Self-Awareness",
        sampleIdeal: "I thrive at the intersection of high-scale systems and polished product craftsmanship. My experience modernizing legacy distributed pipelines combined with my passion for developer velocity aligns directly with your mission to expand real-time capabilities.",
        keyThemes: ["mission", "skills", "passion", "impact", "alignment"]
      }
    ]
  },
  {
    role: "Product Manager",
    type: "Behavioral",
    questions: [
      {
        question: "Walk me through how you prioritize features when engineering, sales, and executive leadership all have competing high-urgency requests.",
        focus: "Prioritization Frameworks & Executive Alignment",
        sampleIdeal: "I anchor on our north-star metric and use the RICE framework (Reach, Impact, Confidence, Effort) to objectively score requests. I hold transparent roadmap reviews where trade-offs are explicitly visualized in terms of opportunity cost, ensuring stakeholders feel heard while protecting engineering focus.",
        keyThemes: ["rice", "north star", "tradeoffs", "stakeholders", "data", "alignment"]
      },
      {
        question: "Tell me about a product you launched that failed to meet expectations. What went wrong and how did you pivot?",
        focus: "Resilience & User Feedback",
        sampleIdeal: "We launched an automated onboarding wizard that experienced a 65% drop-off at step 3. Through customer call recordings and funnel analysis, we realized users felt overwhelmed by upfront permissions. We stripped out 4 non-critical inputs, shifted to progressive disclosure, and rebounded activation by 42%.",
        keyThemes: ["failure", "data", "funnel", "customer interviews", "iteration", "activation"]
      },
      {
        question: "How do you decide between building a feature requested by a single huge enterprise customer versus core improvements for the wider base?",
        focus: "Product Strategy & Custom vs Core",
        sampleIdeal: "I evaluate whether the enterprise need represents a repeatable pattern across other target tier-1 prospects or custom technical debt. If it's a generalizable capability (e.g. SAML SSO, audit logging), we prioritize it as a core platform feature. If one-off, we explore partner APIs or professional services integrations.",
        keyThemes: ["repeatable", "platform", "scalability", "enterprise", "tam", "retention"]
      },
      {
        question: "How do you collaborate with engineering when estimates are double what the product timeline allows?",
        focus: "Scope Negotiation & MVP Definition",
        sampleIdeal: "I treat engineers as strategic co-creators. We dissect the PRD to identify the 20% of scope that delivers 80% of customer value. By slicing non-essential animations, offline modes, or secondary edge cases into Phase 2, we hit release dates while preserving architectural health.",
        keyThemes: ["scoping", "mvp", "80/20", "collaboration", "phased release"]
      },
      {
        question: "Describe how you define and measure the success of an ambiguous new 0-to-1 product.",
        focus: "0-to-1 Metrics & Product-Market Fit",
        sampleIdeal: "For a 0-to-1 product, vanity metrics like signups are deceptive. I focus on retention cohorts (D30/W4 retention curves) and core task completion rates. I complement this with qualitative 'very disappointed' surveys (Sean Ellis PMF test) to ensure real customer dependency.",
        keyThemes: ["retention", "cohorts", "pmf", "qualitative", "activation", "satisfaction"]
      }
    ]
  },
  {
    role: "General",
    type: "General",
    questions: [
      {
        question: "Can you introduce yourself, highlight your top recent accomplishments, and explain what you're looking for next?",
        focus: "Executive Summary & Communication",
        sampleIdeal: "I am a results-driven professional with 5+ years driving high-impact initiatives. Recently, I spearheaded a core system redesign that reduced operational costs by 30% while boosting throughput. In my next chapter, I'm eager to bring this ownership to solve high-velocity challenges.",
        keyThemes: ["experience", "impact", "metrics", "goals", "strengths"]
      },
      {
        question: "Tell me about a complex project where you had to manage tight deadlines and high ambiguity.",
        focus: "Execution & Prioritization",
        sampleIdeal: "Using the STAR method: Under a 4-week regulatory deadline, I mapped critical-path milestones, delegated modular sub-tasks, and held daily 15-minute unblockers. We delivered 2 days ahead of schedule with zero compliance violations.",
        keyThemes: ["star", "timeline", "risk", "communication", "delivery"]
      },
      {
        question: "Describe a situation where you had to influence without formal authority to rally cross-functional teams.",
        focus: "Influence & Leadership",
        sampleIdeal: "I gathered customer quotes and user session replays into an intuitive 1-pager demonstrating how our fragmented workflow harmed conversions. By framing the solution around shared quarterly OKRs, design, marketing, and engineering rallied behind a unified roadmap.",
        keyThemes: ["influence", "shared goals", "empathy", "data", "alignment"]
      },
      {
        question: "What is your biggest professional weakness, and what deliberate steps have you taken to counteract it?",
        focus: "Self-Awareness & Growth Mindset",
        sampleIdeal: "Early on, I struggled with delegating early, often taking on excessive solo implementation. I recognized this bottleneck and adopted structured delegating frameworks with explicit ownership matrices (RACI) and bi-weekly checkpoints, empowering team members while scaling my bandwidth.",
        keyThemes: ["self-awareness", "growth", "delegation", "systems", "improvement"]
      },
      {
        question: "Do you have any questions for me as the hiring manager?",
        focus: "Curiosity & Critical Thinking",
        sampleIdeal: "What are the most critical challenges the person in this role must conquer in their first 90 days? And what differentiates someone who does this job well from someone who truly excels here?",
        keyThemes: ["first 90 days", "team culture", "success criteria", "vision", "curiosity"]
      }
    ]
  }
];

export function getSimulatedFirstQuestion(setup: InterviewSetup): string {
  const match = QUESTION_BANK.find(
    (q) =>
      (q.role.toLowerCase() === setup.role.toLowerCase() || setup.role.toLowerCase().includes(q.role.toLowerCase())) &&
      q.type.toLowerCase() === setup.type.toLowerCase()
  ) || QUESTION_BANK.find((q) => q.role.toLowerCase() === setup.role.toLowerCase()) || QUESTION_BANK[0];

  return match.questions[0].question;
}

export function generateSimulatedResponse(
  userAnswer: string,
  questionIndex: number,
  setup: InterviewSetup
): { feedback: Feedback; nextQuestion: string } {
  const wordCount = userAnswer.trim().split(/\s+/).filter(Boolean).length;
  const lowerAns = userAnswer.toLowerCase();

  // Find question pool
  const pool = QUESTION_BANK.find(
    (q) =>
      (q.role.toLowerCase() === setup.role.toLowerCase() || setup.role.toLowerCase().includes(q.role.toLowerCase())) &&
      q.type.toLowerCase() === setup.type.toLowerCase()
  ) || QUESTION_BANK.find((q) => q.role.toLowerCase() === setup.role.toLowerCase()) || QUESTION_BANK[QUESTION_BANK.length - 1];

  const currentQ = pool.questions[Math.min(questionIndex, pool.questions.length - 1)];
  const nextQ = pool.questions[Math.min(questionIndex + 1, pool.questions.length - 1)];

  // Scoring criteria based on answer richness
  let score = 5;
  const strengths: string[] = [];
  const gaps: string[] = [];

  // 1. Length & Detail
  if (wordCount > 90) {
    score += 2;
    strengths.push("Provided a detailed, comprehensive response with substantial context.");
  } else if (wordCount > 40) {
    score += 1;
    strengths.push("Direct, articulate answer with a clear main point.");
  } else {
    score -= 1;
    gaps.push("Answer was quite brief; missed the chance to walk through a concrete scenario.");
  }

  // 2. Metrics & Numbers
  const hasNumbers = /\d+%|\$\d+|\d+x|\d+\s*(ms|seconds|minutes|hours|days|engineers|users|customers)/i.test(userAnswer);
  if (hasNumbers) {
    score += 1;
    strengths.push("Strong quantifiable metrics and tangible business or technical results.");
  } else {
    gaps.push("Could be strengthened by anchoring with specific numbers, metrics, or measurable outcomes.");
  }

  // 3. STAR Framework or Structure
  const hasStructure = /situation|task|action|result|because|first|then|finally|initially|specifically|outcome/i.test(userAnswer);
  if (hasStructure) {
    score += 1;
    strengths.push("Well-structured thought progression following a clear beginning, middle, and resolution.");
  } else {
    gaps.push("Structure could be crisper: explicitly state the Challenge, the Action you took, and the End Result.");
  }

  // 4. Role keywords
  const matchedKeywords = currentQ.keyThemes.filter((kw) => lowerAns.includes(kw.toLowerCase()));
  if (matchedKeywords.length >= 2) {
    score += 1;
    strengths.push(`Excellent domain depth highlighting core concepts (${matchedKeywords.slice(0, 3).join(", ")}).`);
  } else if (matchedKeywords.length === 0) {
    gaps.push(`Did not explicitly cover key technical/strategic levers such as ${currentQ.keyThemes.slice(0, 2).join(" or ")}.`);
  }

  // Clamp score
  score = Math.max(4, Math.min(10, score));

  const finalStrength = strengths.length > 0 ? strengths.join(" ") : "Answer showed genuine intent and direct relevance to the question.";
  const finalGap = gaps.length > 0 ? gaps.join(" ") : "Refine your delivery pacing to highlight the most impressive technical decision upfront.";

  const totalQuestions = setup.questionCount || 5;
  const isLast = questionIndex + 1 >= totalQuestions;

  return {
    feedback: {
      score,
      strength: finalStrength,
      gap: finalGap,
      idealAnswer: currentQ.sampleIdeal,
      rubric: {
        clarity: Math.min(10, score + (wordCount > 60 ? 1 : -1)),
        technicalDepth: Math.min(10, score + (matchedKeywords.length >= 2 ? 1 : 0)),
        specificity: Math.min(10, hasNumbers ? 9 : 6),
      }
    },
    nextQuestion: isLast ? "" : nextQ.question,
  };
}
