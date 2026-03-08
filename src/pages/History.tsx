import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useHistory } from "@/hooks/useHistory";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import LogoBrand from "@/components/LogoBrand";
import { ArrowLeft, Trophy, Hash, Trash2, TrendingUp } from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.5 },
  }),
};

const History = () => {
  const navigate = useNavigate();
  const { sessions, clearHistory, getFilteredSessions, personalBest, totalSessions } =
    useHistory();
  const [roleFilter, setRoleFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");

  const roles = useMemo(() => ["all", ...new Set(sessions.map((s) => s.setup.role))], [sessions]);
  const types = useMemo(() => ["all", ...new Set(sessions.map((s) => s.setup.type))], [sessions]);

  const filtered = getFilteredSessions(roleFilter, typeFilter);

  const chartData = useMemo(
    () =>
      [...filtered].reverse().map((s, i) => ({
        name: `#${i + 1}`,
        score: s.overallScore,
        date: new Date(s.timestamp).toLocaleDateString(),
      })),
    [filtered]
  );

  const verdictColor = (v: string) =>
    v === "Ready to Interview" ? "score-high" : v === "Almost There" ? "score-mid" : "score-low";

  const verdictBg = (v: string) =>
    v === "Ready to Interview"
      ? "bg-score-high/10"
      : v === "Almost There"
      ? "bg-score-mid/10"
      : "bg-score-low/10";

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <div className="fixed inset-0 bg-grid opacity-20 pointer-events-none" />
      <div className="fixed inset-0 bg-radial-glow pointer-events-none" />

      {/* Header */}
      <header className="relative z-10 border-b glass-border px-6 py-3 flex items-center justify-between glass">
        <div className="flex items-center gap-2.5">
          <LogoBrand />
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground font-medium ml-1">
            History
          </span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/")}
          className="text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back
        </Button>
      </header>

      <main className="relative z-10 max-w-2xl mx-auto px-4 py-8 space-y-6">
        {/* Stats */}
        <motion.div
          className="grid grid-cols-2 gap-4"
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          custom={0}
        >
          <div className="glass glass-border rounded-2xl p-5 flex items-center gap-4 card-hover">
            <div className="h-11 w-11 rounded-xl bg-primary/10 flex items-center justify-center">
              <Trophy className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-black font-mono">{personalBest}<span className="text-sm text-muted-foreground font-normal">/10</span></p>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Personal Best</p>
            </div>
          </div>
          <div className="glass glass-border rounded-2xl p-5 flex items-center gap-4 card-hover">
            <div className="h-11 w-11 rounded-xl bg-primary/10 flex items-center justify-center">
              <Hash className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-black font-mono">{totalSessions}</p>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Total Sessions</p>
            </div>
          </div>
        </motion.div>

        {/* Filters */}
        <motion.div
          className="flex gap-3"
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          custom={1}
        >
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="w-40 bg-background/50 rounded-xl">
              <SelectValue placeholder="Role" />
            </SelectTrigger>
            <SelectContent>
              {roles.map((r) => (
                <SelectItem key={r} value={r}>
                  {r === "all" ? "All Roles" : r}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-40 bg-background/50 rounded-xl">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              {types.map((t) => (
                <SelectItem key={t} value={t}>
                  {t === "all" ? "All Types" : t}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {sessions.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="ml-auto text-destructive hover:text-destructive"
              onClick={clearHistory}
            >
              <Trash2 className="h-3.5 w-3.5 mr-1" />
              Clear
            </Button>
          )}
        </motion.div>

        {/* Chart */}
        {chartData.length > 1 && (
          <motion.div
            className="glass glass-border rounded-2xl p-6"
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={2}
          >
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-semibold font-display">Progress Over Time</h3>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 14%, 18%)" />
                <XAxis dataKey="name" tick={{ fill: "hsl(215, 14%, 50%)", fontSize: 12 }} />
                <YAxis domain={[0, 10]} tick={{ fill: "hsl(215, 14%, 50%)", fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    background: "hsl(220, 18%, 9%)",
                    border: "1px solid hsl(220, 14%, 18%)",
                    borderRadius: 12,
                    fontSize: 12,
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="score"
                  stroke="hsl(200, 100%, 55%)"
                  strokeWidth={2}
                  dot={{ fill: "hsl(200, 100%, 55%)", r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </motion.div>
        )}

        {/* Sessions */}
        {filtered.length === 0 ? (
          <motion.div
            className="text-center py-20 space-y-4"
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={2}
          >
            <div className="h-16 w-16 rounded-2xl bg-muted flex items-center justify-center mx-auto">
              <Trophy className="h-7 w-7 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground">No sessions yet.</p>
            <Button className="glow-primary rounded-xl" onClick={() => navigate("/")}>
              Start Your First Interview
            </Button>
          </motion.div>
        ) : (
          <div className="space-y-3">
            {filtered.map((s, i) => (
              <motion.div
                key={s.id}
                className="glass glass-border rounded-2xl p-4 flex items-center justify-between card-hover"
                variants={fadeUp}
                initial="hidden"
                animate="visible"
                custom={3 + i * 0.3}
              >
                <div className="space-y-1.5">
                  <p className="text-sm font-semibold font-display">
                    {s.setup.role} · {s.setup.type}
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground font-medium">
                      {s.setup.difficulty}
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      {new Date(s.timestamp).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <div className="text-right space-y-1">
                  <p className="text-xl font-black font-mono">
                    {s.overallScore}<span className="text-xs text-muted-foreground font-normal">/10</span>
                  </p>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${verdictColor(s.verdict)} ${verdictBg(s.verdict)}`}>
                    {s.verdict}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default History;
