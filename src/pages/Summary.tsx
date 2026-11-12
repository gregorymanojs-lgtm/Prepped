import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { InterviewSetup, Feedback, SessionResult } from "@/lib/types";
import { useHistory } from "@/hooks/useHistory";
import { playSound } from "@/lib/sound";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Cell,
  Tooltip,
} from "recharts";
import LogoBrand from "@/components/LogoBrand";
import {
  RotateCcw,
  ArrowRight,
  Trophy,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  Target,
  BookOpen,
  Share2,
  Copy,
  Check,
  Clock,
  Sparkles,
  Download,
} from "lucide-react";
import { toast } from "sonner";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.5, ease: [0.16, 1, 0.3, 1] },
  }),
};

const Summary = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { addSession } = useHistory();
  const [copied, setCopied] = useState(false);
  const [checkedStudy, setCheckedStudy] = useState<Record<number, boolean>>({});

  const state = location.state as {
    setup: InterviewSetup;
    scores: number[];
    feedbacks: Feedback[];
    durationSeconds?: number;
  } | null;

  useEffect(() => {
    if (!state) {
      navigate("/", { replace: true });
      return;
    }

    playSound("complete");

    const { setup, scores, feedbacks, durationSeconds } = state;
    const overallScore = Math.round(scores.reduce((a, b) => a + b, 0) / (scores.length || 1));
    const verdict: SessionResult["verdict"] =
      overallScore >= 8 ? "Ready to Interview" : overallScore >= 5 ? "Almost There" : "Not Ready";

    const session: SessionResult = {
      id: crypto.randomUUID(),
      setup,
      messages: [],
      scores,
      overallScore,
      strengths: feedbacks.map((f) => f.strength).slice(0, 4),
      gaps: feedbacks.map((f) => f.gap).slice(0, 4),
      studyList: generateStudyList(feedbacks, setup),
      verdict,
      timestamp: Date.now(),
      durationSeconds: durationSeconds || 0,
      feedbacks,
    };

    addSession(session);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const { scores = [], feedbacks = [], setup, durationSeconds = 0 } = state || {};

  const overallScore = useMemo(
    () => (scores.length ? Number((scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1)) : 0),
    [scores]
  );

  const grade = useMemo(() => {
    if (overallScore >= 9.0) return { letter: "S-Tier", desc: "Top 2% · Strong Hire", color: "text-emerald-400" };
    if (overallScore >= 8.0) return { letter: "A+", desc: "Top 10% · High Offer Probability", color: "text-emerald-400" };
    if (overallScore >= 7.0) return { letter: "A-", desc: "Solid Hire · Minor gaps to polish", color: "text-sky-400" };
    if (overallScore >= 5.5) return { letter: "B", desc: "Almost There · Structured practice needed", color: "text-amber-400" };
    return { letter: "C+", desc: "Needs Dedicated Prep", color: "text-rose-400" };
  }, [overallScore]);

  const verdictConfig = {
    "Ready to Interview": {
      title: "STRONG HIRE RECOMMENDED",
      color: "text-emerald-400",
      bg: "border-emerald-500/30 bg-gradient-to-b from-emerald-500/10 via-card to-background",
      glow: "glow-score-high",
    },
    "Almost There": {
      title: "LEAN HIRE · ALMOST READY",
      color: "text-amber-400",
      bg: "border-amber-500/30 bg-gradient-to-b from-amber-500/10 via-card to-background",
      glow: "glow-score-mid",
    },
    "Not Ready": {
      title: "DEDICATED PRACTICE RECOMMENDED",
      color: "text-rose-400",
      bg: "border-rose-500/30 bg-gradient-to-b from-rose-500/10 via-card to-background",
      glow: "glow-score-low",
    },
  };

  const verdict =
    overallScore >= 7.5 ? "Ready to Interview" : overallScore >= 5 ? "Almost There" : "Not Ready";
  const vc = verdictConfig[verdict];

  const chartData = scores.map((s, i) => ({
    name: `Q${i + 1}`,
    score: s,
  }));

  const studyList = useMemo(() => {
    return setup ? generateStudyList(feedbacks, setup) : [];
  }, [feedbacks, setup]);

  const handleCopySummary = () => {
    if (!setup) return;
    const text = `PREPPED AI Mock Interview Report
Role: ${setup.role} (${setup.difficulty})
Focus: ${setup.type}
Overall Score: ${overallScore}/10 (${grade.letter})
Verdict: ${vc.title}

Top Strengths:
${feedbacks.map((f) => `- ${f.strength}`).slice(0, 3).join("\n")}

Areas to Improve:
${feedbacks.map((f) => `- ${f.gap}`).slice(0, 3).join("\n")}

Study Plan:
${studyList.map((item) => `- ${item}`).join("\n")}`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    playSound("click");
    toast.success("Executive summary copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  const formatDuration = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const s = sec % 60;
    return `${mins}m ${s}s`;
  };

  if (!state || !setup) return null;

  return (
    <div className="min-h-screen bg-background relative overflow-x-hidden pb-16 selection:bg-primary/20">
      <div className="fixed inset-0 bg-grid opacity-25 pointer-events-none" />
      <div className="fixed inset-0 bg-radial-glow pointer-events-none" />

      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border/70 backdrop-blur-2xl bg-card/65 px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <LogoBrand size="sm" />
          <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-secondary text-muted-foreground font-bold">
            Executive Scorecard
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopySummary}
            className="rounded-xl glass glass-border text-xs h-8 px-3"
          >
            {copied ? <Check className="h-3.5 w-3.5 mr-1.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5 mr-1.5" />}
            {copied ? "Copied" : "Share Summary"}
          </Button>
          <Button
            size="sm"
            onClick={() => navigate("/interview", { state: { setup } })}
            className="rounded-xl bg-primary text-primary-foreground font-semibold text-xs h-8 px-3"
          >
            <RotateCcw className="h-3.5 w-3.5 mr-1.5" />
            Retake Track
          </Button>
        </div>
      </header>

      <main className="relative z-10 max-w-3xl mx-auto px-4 py-8 space-y-7">
        {/* Hero Scorecard */}
        <motion.div
          className={`rounded-3xl border p-6 sm:p-8 text-center space-y-6 ${vc.bg} ${vc.glow} shadow-2xl relative overflow-hidden`}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          custom={0}
        >
          {/* Top pills */}
          <div className="flex items-center justify-center gap-2 flex-wrap">
            <span className="text-xs px-3 py-1 rounded-full bg-primary/15 text-primary font-bold border border-primary/25">
              {setup.role}
            </span>
            <span className="text-xs px-3 py-1 rounded-full bg-secondary text-foreground/80 font-medium">
              {setup.type}
            </span>
            <span className="text-xs px-3 py-1 rounded-full bg-secondary text-foreground/80 font-medium">
              {setup.difficulty}
            </span>
            {durationSeconds > 0 && (
              <span className="text-xs px-3 py-1 rounded-full bg-secondary text-muted-foreground font-mono flex items-center gap-1">
                <Clock className="h-3 w-3 text-primary" />
                {formatDuration(durationSeconds)}
              </span>
            )}
          </div>

          {/* Letter Grade + Score Ring */}
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground block">
              Interview Readiness Assessment
            </span>
            <h1 className={`text-2xl sm:text-3xl font-black font-display tracking-tight ${vc.color}`}>
              {vc.title}
            </h1>
            <p className="text-xs text-muted-foreground">{grade.desc}</p>
          </div>

          {/* Score Counter */}
          <div className="flex items-center justify-center gap-3 py-2">
            <div className="px-5 py-3 rounded-2xl bg-background/60 border border-border/80 flex items-baseline gap-1.5 shadow-inner">
              <span className="text-5xl sm:text-6xl font-black font-mono tracking-tight text-foreground">
                {overallScore}
              </span>
              <span className="text-lg text-muted-foreground font-mono">/ 10</span>
            </div>
            <div className="px-4 py-3 rounded-2xl bg-background/60 border border-border/80 text-left">
              <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">Tier</span>
              <span className={`text-3xl font-black font-display ${grade.color}`}>{grade.letter}</span>
            </div>
          </div>
        </motion.div>

        {/* Score Chart */}
        <motion.div
          className="glass glass-card rounded-3xl p-6 space-y-4"
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          custom={1}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-bold font-display">Score Breakdown by Question</h3>
            </div>
            <span className="text-xs font-mono text-muted-foreground">
              {scores.length} Questions Evaluated
            </span>
          </div>

          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(224, 16%, 16%)" />
              <XAxis dataKey="name" tick={{ fill: "hsl(215, 16%, 60%)", fontSize: 12 }} />
              <YAxis domain={[0, 10]} tick={{ fill: "hsl(215, 16%, 60%)", fontSize: 12 }} />
              <Tooltip
                contentStyle={{
                  background: "hsl(224, 22%, 9%)",
                  border: "1px solid hsl(224, 16%, 20%)",
                  borderRadius: 12,
                  fontSize: 12,
                  color: "#fff",
                }}
              />
              <Bar dataKey="score" radius={[8, 8, 0, 0]}>
                {chartData.map((entry, idx) => (
                  <Cell
                    key={idx}
                    fill={
                      entry.score >= 8
                        ? "hsl(152, 76%, 50%)"
                        : entry.score >= 5
                        ? "hsl(38, 95%, 55%)"
                        : "hsl(350, 89%, 60%)"
                    }
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Strengths & Gaps Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Strengths */}
          <motion.div
            className="glass glass-card rounded-3xl p-5 space-y-3.5 card-hover"
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={2}
          >
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                <CheckCircle2 className="h-4 w-4" />
              </div>
              <h3 className="text-sm font-bold font-display text-emerald-400">Key Strengths Demonstrated</h3>
            </div>
            <ul className="space-y-2.5">
              {feedbacks.slice(0, 3).map((f, i) => (
                <li key={i} className="text-xs text-foreground/85 flex gap-2 items-start leading-relaxed">
                  <span className="text-emerald-400 font-bold mt-0.5 shrink-0">✓</span>
                  <span>{f.strength}</span>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Gaps */}
          <motion.div
            className="glass glass-card rounded-3xl p-5 space-y-3.5 card-hover"
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={3}
          >
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400">
                <Target className="h-4 w-4" />
              </div>
              <h3 className="text-sm font-bold font-display text-amber-400">Highest-Impact Growth Areas</h3>
            </div>
            <ul className="space-y-2.5">
              {feedbacks.slice(0, 3).map((f, i) => (
                <li key={i} className="text-xs text-foreground/85 flex gap-2 items-start leading-relaxed">
                  <span className="text-amber-400 font-bold mt-0.5 shrink-0">→</span>
                  <span>{f.gap}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>

        {/* Actionable Study Roadmap with Interactive Checkboxes */}
        <motion.div
          className="glass glass-card rounded-3xl p-6 space-y-4 card-hover"
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          custom={4}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                <BookOpen className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold font-display">Custom Study Checklist</h3>
                <p className="text-[11px] text-muted-foreground">Action items tailored to your answers</p>
              </div>
            </div>
            <span className="text-[11px] font-mono text-muted-foreground">
              {Object.values(checkedStudy).filter(Boolean).length} / {studyList.length} Completed
            </span>
          </div>

          <div className="space-y-2.5">
            {studyList.map((item, idx) => {
              const isDone = Boolean(checkedStudy[idx]);
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setCheckedStudy((prev) => ({ ...prev, [idx]: !prev[idx] }));
                    playSound("click");
                  }}
                  className={`w-full text-left p-3 rounded-2xl border text-xs flex items-center gap-3 transition-all ${
                    isDone
                      ? "bg-emerald-500/10 border-emerald-500/30 text-muted-foreground line-through"
                      : "bg-background/40 border-border/70 text-foreground hover:bg-background/70 hover:border-primary/40"
                  }`}
                >
                  <div
                    className={`h-5 w-5 rounded-lg border flex items-center justify-center shrink-0 transition-colors ${
                      isDone
                        ? "bg-emerald-500 border-emerald-500 text-white"
                        : "border-border bg-background"
                    }`}
                  >
                    {isDone && <Check className="h-3 w-3 stroke-[3]" />}
                  </div>
                  <span className="leading-relaxed">{item}</span>
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          className="flex flex-col sm:flex-row gap-3 pt-2"
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          custom={5}
        >
          <Button
            variant="outline"
            className="flex-1 h-13 rounded-2xl glass glass-border text-sm font-semibold hover:border-primary/40"
            onClick={() => {
              playSound("click");
              navigate("/interview", { state: { setup } });
            }}
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Retake Interview
          </Button>

          <Button
            className="flex-1 h-13 rounded-2xl glow-primary bg-primary text-primary-foreground text-sm font-bold shadow-xl hover:scale-105 transition-all"
            onClick={() => {
              playSound("click");
              navigate("/");
            }}
          >
            Configure New Interview
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </motion.div>
      </main>
    </div>
  );
};

function generateStudyList(feedbacks: Feedback[], setup: InterviewSetup): string[] {
  const gaps = feedbacks.map((f) => f.gap);
  const items: string[] = [];

  gaps.forEach((gap) => {
    const lower = gap.toLowerCase();
    if (lower.includes("structure") || lower.includes("framework") || lower.includes("star")) {
      items.push("Master the STAR Method (Situation, Task, Action, Result) with 2-minute timed delivery.");
    }
    if (lower.includes("metric") || lower.includes("quantif") || lower.includes("number")) {
      items.push("Quantify key project achievements with concrete percentages, dollars saved, or latency gains.");
    }
    if (lower.includes("cache") || lower.includes("latency") || lower.includes("scale")) {
      items.push("Review multi-tier caching architectures (Redis, CDN, in-memory) and invalidation strategies.");
    }
    if (lower.includes("conflict") || lower.includes("leadership") || lower.includes("disagree")) {
      items.push("Draft 3 executive disagreement stories demonstrating 'Disagree and Commit' and blameless collaboration.");
    }
    if (lower.includes("tradeoff") || lower.includes("decision")) {
      items.push("Practice articulating the Pros, Cons, and Rejected Alternatives for your top 3 system architectures.");
    }
  });

  if (items.length < 3) {
    items.push(`Review top interview patterns for ${setup.role} (${setup.difficulty} level).`);
    items.push("Prepare 5 deep-dive technical stories from your past experience with architecture diagrams.");
    items.push("Practice answering under 2-minute time constraints to prevent rambling.");
  }

  return [...new Set(items)].slice(0, 5);
}

export default Summary;
