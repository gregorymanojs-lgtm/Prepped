import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useHistory } from "@/hooks/useHistory";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import LogoBrand from "@/components/LogoBrand";
import { playSound } from "@/lib/sound";
import {
  ArrowLeft,
  Trophy,
  Hash,
  Trash2,
  TrendingUp,
  Search,
  Calendar,
  CheckCircle2,
  AlertCircle,
  BookOpen,
  ChevronDown,
  RotateCcw,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.06, duration: 0.45, ease: [0.16, 1, 0.3, 1] },
  }),
};

const History = () => {
  const navigate = useNavigate();
  const { sessions, clearHistory, personalBest, totalSessions } = useHistory();
  const [roleFilter, setRoleFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedSessionId, setExpandedSessionId] = useState<string | null>(null);

  const roles = useMemo(() => ["all", ...new Set(sessions.map((s) => s.setup.role))], [sessions]);
  const types = useMemo(() => ["all", ...new Set(sessions.map((s) => s.setup.type))], [sessions]);

  const filtered = useMemo(() => {
    return sessions.filter((s) => {
      const matchRole = roleFilter === "all" || s.setup.role === roleFilter;
      const matchType = typeFilter === "all" || s.setup.type === typeFilter;
      const matchSearch =
        searchQuery.trim() === "" ||
        s.setup.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.setup.type.toLowerCase().includes(searchQuery.toLowerCase());
      return matchRole && matchType && matchSearch;
    });
  }, [sessions, roleFilter, typeFilter, searchQuery]);

  const averageScore = useMemo(() => {
    if (sessions.length === 0) return 0;
    const sum = sessions.reduce((acc, s) => acc + s.overallScore, 0);
    return Number((sum / sessions.length).toFixed(1));
  }, [sessions]);

  const chartData = useMemo(() => {
    return [...filtered].reverse().map((s, i) => ({
      name: `#${i + 1}`,
      score: s.overallScore,
      role: s.setup.role,
      date: new Date(s.timestamp).toLocaleDateString(),
    }));
  }, [filtered]);

  const verdictColor = (v: string) => {
    if (v === "Ready to Interview") return "text-emerald-400 bg-emerald-500/10 border-emerald-500/20";
    if (v === "Almost There") return "text-amber-400 bg-amber-500/10 border-amber-500/20";
    return "text-rose-400 bg-rose-500/10 border-rose-500/20";
  };

  const handleClear = () => {
    if (confirm("Are you sure you want to permanently clear all interview history?")) {
      clearHistory();
      playSound("click");
      toast.success("History cleared");
    }
  };

  const toggleExpand = (id: string) => {
    playSound("click");
    setExpandedSessionId(expandedSessionId === id ? null : id);
  };

  return (
    <div className="min-h-screen bg-background relative overflow-x-hidden pb-16 selection:bg-primary/20">
      <div className="fixed inset-0 bg-grid opacity-25 pointer-events-none" />
      <div className="fixed inset-0 bg-radial-glow pointer-events-none" />

      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border/70 backdrop-blur-2xl bg-card/65 px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <LogoBrand size="sm" />
          <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-secondary text-muted-foreground font-bold">
            Analytics & History
          </span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            playSound("click");
            navigate("/");
          }}
          className="rounded-xl text-muted-foreground hover:text-foreground text-xs h-8 px-3"
        >
          <ArrowLeft className="h-4 w-4 mr-1.5" />
          Back to Home
        </Button>
      </header>

      <main className="relative z-10 max-w-3xl mx-auto px-4 py-8 space-y-7">
        {/* Stats Ribbon */}
        <motion.div
          className="grid grid-cols-2 sm:grid-cols-3 gap-3.5"
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          custom={0}
        >
          {/* Personal Best */}
          <div className="glass glass-card rounded-3xl p-5 flex items-center gap-3.5 card-hover">
            <div className="h-11 w-11 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
              <Trophy className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-baseline gap-1">
                <p className="text-2xl sm:text-3xl font-black font-mono text-foreground">{personalBest}</p>
                <span className="text-xs text-muted-foreground font-mono">/10</span>
              </div>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Personal Best</p>
            </div>
          </div>

          {/* Average Score */}
          <div className="glass glass-card rounded-3xl p-5 flex items-center gap-3.5 card-hover">
            <div className="h-11 w-11 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 shrink-0">
              <TrendingUp className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-baseline gap-1">
                <p className="text-2xl sm:text-3xl font-black font-mono text-foreground">{averageScore}</p>
                <span className="text-xs text-muted-foreground font-mono">/10</span>
              </div>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Average Score</p>
            </div>
          </div>

          {/* Total Sessions */}
          <div className="glass glass-card rounded-3xl p-5 flex items-center gap-3.5 card-hover col-span-2 sm:col-span-1">
            <div className="h-11 w-11 rounded-2xl bg-accent/15 flex items-center justify-center text-accent shrink-0">
              <Hash className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-black font-mono text-foreground">{totalSessions}</p>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Sessions Completed</p>
            </div>
          </div>
        </motion.div>

        {/* Filters & Search */}
        <motion.div
          className="flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center justify-between"
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          custom={1}
        >
          <div className="flex items-center gap-2 flex-1">
            <div className="relative flex-1">
              <Search className="h-3.5 w-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search past sessions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 bg-card/60 rounded-xl text-xs h-9 border-border/80"
              />
            </div>

            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-32 sm:w-36 bg-card/60 rounded-xl text-xs h-9 border-border/80">
                <SelectValue placeholder="Role" />
              </SelectTrigger>
              <SelectContent>
                {roles.map((r) => (
                  <SelectItem key={r} value={r} className="text-xs">
                    {r === "all" ? "All Roles" : r}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-28 sm:w-32 bg-card/60 rounded-xl text-xs h-9 border-border/80">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                {types.map((t) => (
                  <SelectItem key={t} value={t} className="text-xs">
                    {t === "all" ? "All Types" : t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {sessions.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClear}
              className="text-xs text-destructive hover:bg-destructive/10 h-9 rounded-xl"
            >
              <Trash2 className="h-3.5 w-3.5 mr-1" />
              Clear
            </Button>
          )}
        </motion.div>

        {/* Progress Chart */}
        {chartData.length > 1 && (
          <motion.div
            className="glass glass-card rounded-3xl p-6 space-y-4"
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={2}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-primary" />
                <h3 className="text-sm font-bold font-display">Performance Trajectory</h3>
              </div>
              <span className="text-[11px] font-mono text-muted-foreground">Historical Progression</span>
            </div>

            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="scoreGlow" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(200, 100%, 52%)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(200, 100%, 52%)" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(224, 16%, 16%)" />
                <XAxis dataKey="name" tick={{ fill: "hsl(215, 16%, 60%)", fontSize: 11 }} />
                <YAxis domain={[0, 10]} tick={{ fill: "hsl(215, 16%, 60%)", fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    background: "hsl(224, 22%, 9%)",
                    border: "1px solid hsl(224, 16%, 20%)",
                    borderRadius: 12,
                    fontSize: 12,
                    color: "#fff",
                  }}
                  formatter={(val) => [`${val} / 10`, "Overall Score"]}
                />
                <Area
                  type="monotone"
                  dataKey="score"
                  stroke="hsl(200, 100%, 52%)"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#scoreGlow)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </motion.div>
        )}

        {/* Sessions List */}
        {filtered.length === 0 ? (
          <motion.div
            className="text-center py-20 space-y-4 glass glass-card rounded-3xl p-8"
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={2}
          >
            <div className="h-16 w-16 rounded-3xl bg-primary/10 flex items-center justify-center mx-auto text-primary">
              <Sparkles className="h-7 w-7" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold font-display">No sessions found</h3>
              <p className="text-xs text-muted-foreground">
                {sessions.length === 0
                  ? "You haven't completed any mock interviews yet."
                  : "No past interviews match your selected filters."}
              </p>
            </div>
            <Button
              className="rounded-2xl glow-primary bg-primary text-primary-foreground font-bold text-xs h-10 px-6"
              onClick={() => {
                playSound("click");
                navigate("/");
              }}
            >
              Start Practice Session
            </Button>
          </motion.div>
        ) : (
          <div className="space-y-3">
            {filtered.map((s, i) => {
              const isExpanded = expandedSessionId === s.id;
              return (
                <motion.div
                  key={s.id}
                  className="glass glass-card rounded-3xl border border-border/80 overflow-hidden transition-all duration-200"
                  variants={fadeUp}
                  initial="hidden"
                  animate="visible"
                  custom={2 + i * 0.05}
                >
                  {/* Card Header / Summary Row */}
                  <div
                    onClick={() => toggleExpand(s.id)}
                    className="p-5 flex items-center justify-between cursor-pointer hover:bg-card/40 transition-colors"
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold font-display text-foreground">{s.setup.role}</h4>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-secondary text-foreground/80 font-medium">
                          {s.setup.type}
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-secondary text-muted-foreground font-medium">
                          {s.setup.difficulty}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        <span>{new Date(s.timestamp).toLocaleDateString()}</span>
                        <span>·</span>
                        <span>{s.scores.length} Questions</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className="flex items-baseline justify-end gap-1">
                          <span className="text-xl font-black font-mono text-foreground">{s.overallScore}</span>
                          <span className="text-xs text-muted-foreground font-mono">/ 10</span>
                        </div>
                        <span
                          className={`text-[9px] px-2 py-0.5 rounded-full font-bold border uppercase tracking-wider ${verdictColor(
                            s.verdict
                          )}`}
                        >
                          {s.verdict}
                        </span>
                      </div>
                      <ChevronDown
                        className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${
                          isExpanded ? "rotate-180 text-foreground" : ""
                        }`}
                      />
                    </div>
                  </div>

                  {/* Expandable Details Drawer */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="px-5 pb-5 pt-2 border-t border-border/60 space-y-4 bg-background/30"
                      >
                        {/* Strengths & Gaps */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                          <div className="rounded-2xl bg-emerald-500/5 border border-emerald-500/20 p-3 space-y-1.5">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1">
                              <CheckCircle2 className="h-3 w-3" /> Strengths
                            </span>
                            <ul className="space-y-1 text-[11px] text-foreground/85">
                              {s.strengths.slice(0, 2).map((str, idx) => (
                                <li key={idx} className="line-clamp-2">
                                  • {str}
                                </li>
                              ))}
                            </ul>
                          </div>

                          <div className="rounded-2xl bg-amber-500/5 border border-amber-500/20 p-3 space-y-1.5">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1">
                              <AlertCircle className="h-3 w-3" /> Growth Gaps
                            </span>
                            <ul className="space-y-1 text-[11px] text-foreground/85">
                              {s.gaps.slice(0, 2).map((gap, idx) => (
                                <li key={idx} className="line-clamp-2">
                                  • {gap}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>

                        {/* Retake Button */}
                        <div className="flex justify-end">
                          <Button
                            size="sm"
                            onClick={() => {
                              playSound("click");
                              navigate("/interview", { state: { setup: s.setup } });
                            }}
                            className="rounded-xl text-xs h-8 bg-primary text-primary-foreground font-semibold"
                          >
                            <RotateCcw className="h-3 w-3 mr-1.5" />
                            Retake This Track
                          </Button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};

export default History;
