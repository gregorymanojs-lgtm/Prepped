import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, User, CheckCircle2, AlertCircle, Sparkles, Volume2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DemoTrack {
  id: string;
  role: string;
  track: string;
  badge: string;
  question: string;
  answer: string;
  score: number;
  strength: string;
  gap: string;
  idealSnippet: string;
}

const DEMO_TRACKS: DemoTrack[] = [
  {
    id: "swe",
    role: "Senior Software Engineer",
    track: "System Design & Architecture",
    badge: "Staff Level",
    question: "How would you design a distributed rate limiter capable of handling 500,000 requests/sec with sub-millisecond overhead?",
    answer: "I'd use a Redis Token Bucket with sliding-window logs. To prevent Redis connection bottlenecks at 500k RPS, I'd deploy a local in-memory token cache (like a Guava/LRU bucket) per service pod that syncs in batches of 1,000 tokens every 100ms via Redis pipelines, failing open on network partitions.",
    score: 9.2,
    strength: "Superb latency optimization via local tiered caching and batch synchronization. Clear failure-mode awareness.",
    gap: "Could explicitly detail how to handle clock drift between worker nodes or multi-region replication consistency.",
    idealSnippet: "Layer 1: local in-memory token buffer (50μs) + Layer 2: Redis Cluster with Lua atomic scripts + Batch sync.",
  },
  {
    id: "pm",
    role: "Lead Product Manager",
    track: "Product Strategy & Execution",
    badge: "Senior Level",
    question: "Our flagship mobile app's 30-day user retention dropped by 14% last quarter. How do you diagnose and fix this?",
    answer: "First, I'd segment cohort curves by acquisition channel, device OS, and feature usage. If the drop is concentrated in new users, I'd audit the Day 0-3 activation funnel for friction points. I'd pair Mixpanel analytics with 15 qualitative exit interviews to identify drop-off triggers, then run a rapid A/B test on onboarding clarity.",
    score: 8.9,
    strength: "Exemplary hypothesis-driven segmentation combining quantitative cohort metrics with qualitative customer interviews.",
    gap: "Mention checking external factors such as recent competitor launches or app store performance reviews.",
    idealSnippet: "Cohort breakdown (Channel × OS × Cohort) → Micro-activation metric check → 5-day targeted retention experiment.",
  },
  {
    id: "behavioral",
    role: "Engineering Manager",
    track: "Behavioral & STAR Leadership",
    badge: "Executive",
    question: "Tell me about a high-stakes disagreement with senior leadership where you stood your ground.",
    answer: "Our VP wanted to ship a major overhaul before Black Friday. Telemetry showed our test pass rate was only 84% under simulated 10x traffic. Instead of an emotional clash, I built a risk matrix quantifying potential downtime loss ($1.2M/hr) vs revenue upside. We compromised on a phased 5% beta rollout, preventing what would have been a catastrophic outage.",
    score: 9.5,
    strength: "Flawless STAR delivery. Converted technical risk into executive financial metrics and proposed a win-win pilot.",
    gap: "Include what long-term preventive testing or CI/CD practices were established after the event.",
    idealSnippet: "STAR framework with concrete financial impact ($1.2M/hr) + objective risk matrix.",
  },
];

export const HeroDemoPreview = ({ onSelectPreset }: { onSelectPreset?: (role: string, type: string) => void }) => {
  const [activeTab, setActiveTab] = useState(DEMO_TRACKS[0].id);
  const current = DEMO_TRACKS.find((t) => t.id === activeTab) || DEMO_TRACKS[0];

  return (
    <div className="w-full max-w-4xl mx-auto rounded-3xl border border-border/80 bg-gradient-to-b from-card/90 via-card/60 to-background/90 p-4 sm:p-6 shadow-2xl backdrop-blur-2xl relative overflow-hidden">
      {/* Decorative ambient gradients */}
      <div className="absolute -top-24 -left-24 w-72 h-72 bg-primary/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-accent/15 rounded-full blur-3xl pointer-events-none" />

      {/* Header bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-5 border-b border-border/60">
        <div className="flex items-center gap-2">
          <div className="flex space-x-1.5">
            <span className="h-3 w-3 rounded-full bg-rose-500/80 inline-block" />
            <span className="h-3 w-3 rounded-full bg-amber-500/80 inline-block" />
            <span className="h-3 w-3 rounded-full bg-emerald-500/80 inline-block" />
          </div>
          <span className="text-xs font-mono text-muted-foreground ml-2">live-interview-session.ai</span>
        </div>

        {/* Tab pills */}
        <div className="flex flex-wrap items-center gap-1.5 bg-background/60 p-1 rounded-xl border border-border/60">
          {DEMO_TRACKS.map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === t.id
                  ? "bg-primary text-primary-foreground shadow-sm font-semibold"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              }`}
            >
              {t.role.split(" ")[0]} {t.track.split(" ")[0]}
            </button>
          ))}
        </div>
      </div>

      {/* Main interactive mockup */}
      <div className="py-6 space-y-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={current.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
            className="space-y-4"
          >
            {/* AI Question message */}
            <div className="flex gap-3 items-start">
              <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-primary to-accent flex items-center justify-center text-primary-foreground shrink-0 shadow-md shadow-primary/20">
                <Bot className="h-5 w-5" />
              </div>
              <div className="flex-1 rounded-2xl rounded-tl-sm bg-card/80 border border-border/80 p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-primary">AI Interviewer</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
                      {current.badge}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Volume2 className="h-3.5 w-3.5 text-primary animate-pulse" />
                    <span className="text-[11px] font-mono">Audio Active</span>
                  </div>
                </div>
                <p className="text-sm sm:text-base font-medium text-foreground leading-relaxed">
                  "{current.question}"
                </p>
              </div>
            </div>

            {/* Candidate answer */}
            <div className="flex gap-3 items-start justify-end">
              <div className="max-w-xl rounded-2xl rounded-tr-sm bg-primary/15 border border-primary/25 p-4 space-y-2 text-right">
                <div className="flex items-center justify-end gap-2">
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/20 text-primary font-mono font-medium">
                    Voice Input Transcribed (42s)
                  </span>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Candidate</span>
                </div>
                <p className="text-xs sm:text-sm text-foreground/90 leading-relaxed text-left">
                  {current.answer}
                </p>
              </div>
              <div className="h-9 w-9 rounded-xl bg-secondary flex items-center justify-center text-foreground shrink-0 border border-border">
                <User className="h-4 w-4 text-muted-foreground" />
              </div>
            </div>

            {/* AI Real-time Feedback Card */}
            <motion.div
              initial={{ scale: 0.98, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.15 }}
              className="rounded-2xl border border-score-high/40 bg-gradient-to-br from-score-high/10 via-card to-background p-4 sm:p-5 space-y-3.5 shadow-xl glow-score-high"
            >
              <div className="flex items-center justify-between border-b border-border/50 pb-3">
                <div className="flex items-center gap-2">
                  <div className="h-7 w-7 rounded-lg bg-score-high/20 flex items-center justify-center">
                    <Sparkles className="h-4 w-4 score-high" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider score-high">
                      Instant Answer Evaluation
                    </h4>
                    <p className="text-[11px] text-muted-foreground">STAR Framework & Technical Accuracy</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground font-mono">Score:</span>
                  <div className="px-3 py-1 rounded-xl bg-score-high/15 border border-score-high/30 flex items-baseline gap-1">
                    <span className="text-xl sm:text-2xl font-black font-mono score-high">{current.score}</span>
                    <span className="text-xs score-high font-medium">/ 10</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="rounded-xl bg-score-high/5 border border-score-high/20 p-3 space-y-1">
                  <div className="flex items-center gap-1.5 score-high font-bold">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Key Strengths
                  </div>
                  <p className="text-foreground/80 leading-relaxed text-[11px]">{current.strength}</p>
                </div>

                <div className="rounded-xl bg-amber-500/5 border border-amber-500/20 p-3 space-y-1">
                  <div className="flex items-center gap-1.5 text-amber-400 font-bold">
                    <AlertCircle className="h-3.5 w-3.5" />
                    Growth Gap
                  </div>
                  <p className="text-foreground/80 leading-relaxed text-[11px]">{current.gap}</p>
                </div>
              </div>

              {/* Exemplary snippet */}
              <div className="rounded-xl bg-background/50 border border-border/60 p-2.5 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    Model Benchmark:
                  </span>
                  <span className="text-[11px] font-mono text-primary truncate max-w-sm sm:max-w-md">
                    {current.idealSnippet}
                  </span>
                </div>
                {onSelectPreset && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onSelectPreset(current.role, current.track.split(" ")[0])}
                    className="text-xs text-primary hover:text-primary-foreground hover:bg-primary h-7 px-2.5 rounded-lg shrink-0"
                  >
                    Practice This Track <ArrowRight className="h-3 w-3 ml-1" />
                  </Button>
                )}
              </div>
            </motion.div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};
