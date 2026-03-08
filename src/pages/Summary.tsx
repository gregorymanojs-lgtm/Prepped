import { useEffect, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { InterviewSetup, Feedback, SessionResult } from "@/lib/types";
import { useHistory } from "@/hooks/useHistory";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Cell,
} from "recharts";
import LogoBrand from "@/components/LogoBrand";
import { RotateCcw, ArrowRight, Trophy, AlertTriangle, CheckCircle2, TrendingUp, Target, BookOpen } from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5 },
  }),
};

const Summary = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { addSession } = useHistory();

  const state = location.state as {
    setup: InterviewSetup;
    scores: number[];
    feedbacks: Feedback[];
  } | null;

  useEffect(() => {
    if (!state) navigate("/", { replace: true });
  }, [state, navigate]);

  useEffect(() => {
    if (!state) return;
    const { setup, scores, feedbacks } = state;
    const overallScore = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
    const verdict: SessionResult["verdict"] =
      overallScore >= 8 ? "Ready to Interview" : overallScore >= 5 ? "Almost There" : "Not Ready";

    const session: SessionResult = {
      id: crypto.randomUUID(),
      setup,
      messages: [],
      scores,
      overallScore,
      strengths: feedbacks.map((f) => f.strength).slice(0, 3),
      gaps: feedbacks.map((f) => f.gap).slice(0, 3),
      studyList: generateStudyList(feedbacks, setup),
      verdict,
      timestamp: Date.now(),
    };
    addSession(session);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const { scores, feedbacks, setup } = state || { scores: [], feedbacks: [], setup: null };

  const overallScore = useMemo(
    () => (scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0),
    [scores]
  );

  const verdict: SessionResult["verdict"] =
    overallScore >= 8 ? "Ready to Interview" : overallScore >= 5 ? "Almost There" : "Not Ready";

  const chartData = scores.map((s, i) => ({ name: `Q${i + 1}`, score: s }));

  const barColor = (score: number) =>
    score >= 8 ? "hsl(200, 100%, 55%)" : score >= 5 ? "hsl(43, 96%, 56%)" : "hsl(0, 72%, 55%)";

  const verdictConfig = {
    "Ready to Interview": {
      icon: CheckCircle2,
      color: "score-high",
      bg: "bg-score-high/10 border-score-high/30",
      glow: "glow-score-high",
    },
    "Almost There": {
      icon: AlertTriangle,
      color: "score-mid",
      bg: "bg-score-mid/10 border-score-mid/30",
      glow: "glow-score-mid",
    },
    "Not Ready": {
      icon: AlertTriangle,
      color: "score-low",
      bg: "bg-score-low/10 border-score-low/30",
      glow: "glow-score-low",
    },
  };

  const vc = verdictConfig[verdict];

  if (!state) return null;

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <div className="fixed inset-0 bg-grid opacity-20 pointer-events-none" />
      <div className="fixed inset-0 bg-radial-glow pointer-events-none" />

      {/* Header */}
      <header className="relative z-10 border-b glass-border px-6 py-3 flex items-center gap-2.5 glass">
        <LogoBrand />
        <span className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground font-medium ml-2">
          Session Summary
        </span>
      </header>

      <main className="relative z-10 max-w-2xl mx-auto px-4 py-8 space-y-6">
        {/* Verdict */}
        <motion.div
          className={`rounded-2xl border p-8 text-center space-y-4 ${vc.bg} ${vc.glow}`}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          custom={0}
        >
          <vc.icon className={`h-12 w-12 mx-auto ${vc.color}`} />
          <h2 className={`text-3xl font-black font-display ${vc.color}`}>{verdict}</h2>
          <div className="flex items-center justify-center gap-1.5">
            <Trophy className="h-5 w-5 text-muted-foreground" />
            <span className="text-5xl font-black font-mono">{overallScore}</span>
            <span className="text-xl text-muted-foreground font-light">/10</span>
          </div>
          <div className="flex items-center justify-center gap-2">
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
              {setup!.role}
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground font-medium">
              {setup!.type}
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground font-medium">
              {setup!.difficulty}
            </span>
          </div>
        </motion.div>

        {/* Chart */}
        <motion.div
          className="glass glass-border rounded-2xl p-6"
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          custom={1}
        >
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-semibold font-display">Score by Question</h3>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 14%, 18%)" />
              <XAxis dataKey="name" tick={{ fill: "hsl(215, 14%, 50%)", fontSize: 12 }} />
              <YAxis domain={[0, 10]} tick={{ fill: "hsl(215, 14%, 50%)", fontSize: 12 }} />
              <Bar dataKey="score" radius={[6, 6, 0, 0]}>
                {chartData.map((entry, i) => (
                  <Cell key={i} fill={barColor(entry.score)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Strengths & Gaps */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <motion.div
            className="glass glass-border rounded-2xl p-5 space-y-3 card-hover"
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={2}
          >
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 rounded-md bg-score-high/10 flex items-center justify-center">
                <CheckCircle2 className="h-3.5 w-3.5 score-high" />
              </div>
              <h3 className="text-sm font-semibold font-display score-high">Strengths</h3>
            </div>
            <ul className="space-y-2.5">
              {feedbacks.slice(0, 3).map((f, i) => (
                <li key={i} className="text-xs text-foreground/80 flex gap-2 items-start">
                  <span className="score-high font-bold mt-0.5">✓</span>
                  {f.strength}
                </li>
              ))}
            </ul>
          </motion.div>
          <motion.div
            className="glass glass-border rounded-2xl p-5 space-y-3 card-hover"
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={3}
          >
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 rounded-md bg-score-low/10 flex items-center justify-center">
                <Target className="h-3.5 w-3.5 score-low" />
              </div>
              <h3 className="text-sm font-semibold font-display score-low">Areas to Improve</h3>
            </div>
            <ul className="space-y-2.5">
              {feedbacks.slice(0, 3).map((f, i) => (
                <li key={i} className="text-xs text-foreground/80 flex gap-2 items-start">
                  <span className="score-low font-bold mt-0.5">✗</span>
                  {f.gap}
                </li>
              ))}
            </ul>
          </motion.div>
        </div>

        {/* Study List */}
        <motion.div
          className="glass glass-border rounded-2xl p-5 space-y-3 card-hover"
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          custom={4}
        >
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-md bg-primary/10 flex items-center justify-center">
              <BookOpen className="h-3.5 w-3.5 text-primary" />
            </div>
            <h3 className="text-sm font-semibold font-display">Study Recommendations</h3>
          </div>
          <ul className="space-y-2">
            {generateStudyList(feedbacks, setup!).map((item, i) => (
              <li key={i} className="text-xs text-foreground/80 flex gap-2.5 items-start">
                <span className="text-primary font-bold mt-0.5">→</span>
                {item}
              </li>
            ))}
          </ul>
        </motion.div>

        {/* Actions */}
        <motion.div
          className="flex gap-3"
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          custom={5}
        >
          <Button
            variant="outline"
            className="flex-1 h-12 rounded-xl glass"
            onClick={() => navigate("/interview", { state: { setup } })}
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Retake
          </Button>
          <Button
            className="flex-1 h-12 rounded-xl glow-primary"
            onClick={() => navigate("/")}
          >
            New Interview
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
    if (gap.toLowerCase().includes("structure") || gap.toLowerCase().includes("framework")) {
      items.push("Practice using the STAR method for structured answers");
    }
    if (gap.toLowerCase().includes("specific") || gap.toLowerCase().includes("example")) {
      items.push("Prepare 5 concrete examples from past experience");
    }
    if (gap.toLowerCase().includes("metric") || gap.toLowerCase().includes("quantif")) {
      items.push("Quantify impact in all project descriptions");
    }
    if (gap.toLowerCase().includes("technical") || gap.toLowerCase().includes("depth")) {
      items.push(`Deep-dive into ${setup.type} concepts for ${setup.role}`);
    }
  });
  if (items.length === 0) {
    items.push("Review common interview patterns for " + setup.role);
    items.push("Practice timed responses (2 min per question)");
  }
  return [...new Set(items)].slice(0, 5);
}

export default Summary;
