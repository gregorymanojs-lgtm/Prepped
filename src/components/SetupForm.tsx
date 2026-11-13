import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { InterviewSetup } from "@/lib/types";
import { playSound } from "@/lib/sound";
import {
  ArrowRight,
  Upload,
  FileText,
  X,
  Code2,
  Briefcase,
  Cpu,
  Layers,
  Sparkles,
  Zap,
  Shield,
  HelpCircle,
  Clock,
  CheckCircle2,
} from "lucide-react";
import * as pdfjsLib from "pdfjs-dist";

pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.4.168/pdf.worker.min.mjs`;

interface RoleOption {
  id: string;
  name: string;
  icon: typeof Code2;
  desc: string;
}

const PRESET_ROLES: RoleOption[] = [
  { id: "Software Engineer", name: "Software Engineer", icon: Code2, desc: "Full-Stack, core CS & problem-solving" },
  { id: "Frontend Engineer", name: "Frontend Engineer", icon: Layers, desc: "React, UI performance & web architecture" },
  { id: "Backend Engineer", name: "Backend Engineer", icon: Cpu, desc: "APIs, distributed systems & databases" },
  { id: "Product Manager", name: "Product Manager", icon: Briefcase, desc: "Product sense, execution & metrics" },
  { id: "AI/ML Engineer", name: "AI/ML Engineer", icon: Sparkles, desc: "LLMs, pipelines & machine learning" },
  { id: "System Architect", name: "System Architect", icon: Shield, desc: "High scale, fault tolerance & design" },
];

const INTERVIEW_TRACKS = [
  {
    id: "Behavioral",
    title: "Behavioral & STAR",
    tagline: "Culture, leadership, conflict resolution & ownership",
    recommended: "All Roles",
  },
  {
    id: "Technical",
    title: "Technical & Coding",
    tagline: "Architecture, algorithms, debugging & code standards",
    recommended: "Engineers",
  },
  {
    id: "System Design",
    title: "System Design & Scale",
    tagline: "Distributed microservices, scalability, caching & DBs",
    recommended: "Senior+",
  },
  {
    id: "Salary Negotiation",
    title: "Offer & Negotiation",
    tagline: "Comp discussions, equity trade-offs & negotiation leverage",
    recommended: "Late Stage",
  },
];

const DIFFICULTY_LEVELS = [
  { id: "Junior", label: "Junior", tag: "0-2 yrs", icon: "🌱", color: "border-emerald-500/30 text-emerald-400" },
  { id: "Mid", label: "Mid-Level", tag: "2-5 yrs", icon: "⚡", color: "border-sky-500/30 text-sky-400" },
  { id: "Senior", label: "Senior", tag: "5-8 yrs", icon: "🚀", color: "border-indigo-500/30 text-indigo-400" },
  { id: "Staff", label: "Staff / Principal", tag: "8+ yrs", icon: "👑", color: "border-amber-500/30 text-amber-400" },
];

const LENGTH_OPTIONS = [
  { count: 3, label: "Quick Drill", time: "8 mins", desc: "Rapid 3-question warm up" },
  { count: 5, label: "Standard Session", time: "15 mins", desc: "Standard 5-question interview" },
  { count: 8, label: "Full Simulation", time: "25 mins", desc: "Deep 8-question deep dive" },
];

interface SetupFormProps {
  initialRole?: string;
  initialType?: string;
}

const SetupForm = ({ initialRole, initialType }: SetupFormProps) => {
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState(initialRole || "Software Engineer");
  const [customRole, setCustomRole] = useState("");
  const [isCustomRole, setIsCustomRole] = useState(false);
  const [interviewType, setInterviewType] = useState(initialType || "Behavioral");
  const [difficulty, setDifficulty] = useState("Senior");
  const [questionCount, setQuestionCount] = useState(5);
  const [jobDescription, setJobDescription] = useState("");
  const [showJd, setShowJd] = useState(false);
  const [customQuestions, setCustomQuestions] = useState("");
  const [showCustomQ, setShowCustomQ] = useState(false);
  const [resumeText, setResumeText] = useState("");
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [parsingResume, setParsingResume] = useState(false);

  const effectiveRole = isCustomRole ? customRole.trim() : selectedRole;
  const canStart = effectiveRole.length > 0 && interviewType && difficulty;

  const handleStart = () => {
    if (!canStart) return;
    playSound("pop");
    const setup: InterviewSetup = {
      role: effectiveRole,
      type: interviewType,
      difficulty,
      jobDescription: jobDescription.trim(),
      resumeText: resumeText.trim(),
      customQuestions: customQuestions.trim(),
      questionCount,
    };
    navigate("/interview", { state: { setup } });
  };

  const handlePresetSelect = (role: string, type: string, diff: string) => {
    setSelectedRole(role);
    setIsCustomRole(false);
    setInterviewType(type);
    setDifficulty(diff);
    playSound("click");
  };

  return (
    <div className="space-y-8 glass glass-card rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-2xl">
      {/* Ambient glow accent */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

      {/* Quick Launch Presets */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <Label className="text-xs uppercase tracking-wider text-muted-foreground font-bold flex items-center gap-1.5">
            <Zap className="h-3.5 w-3.5 text-primary" />
            Popular Practice Tracks
          </Label>
          <span className="text-[11px] text-muted-foreground">1-click setup</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {[
            { role: "Software Engineer", type: "Technical", diff: "Senior", label: "Google Senior SWE" },
            { role: "Product Manager", type: "Behavioral", diff: "Senior", label: "Amazon PM Leadership" },
            { role: "Backend Engineer", type: "System Design", diff: "Staff", label: "Stripe Scale & Systems" },
            { role: "Frontend Engineer", type: "Technical", diff: "Mid", label: "Meta React Specialist" },
          ].map((preset, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handlePresetSelect(preset.role, preset.type, preset.diff)}
              className="text-xs px-3 py-1.5 rounded-xl border border-border/70 bg-background/50 hover:bg-primary/10 hover:border-primary/40 text-foreground/80 hover:text-foreground transition-all duration-200 flex items-center gap-1.5"
            >
              <Sparkles className="h-3 w-3 text-primary" />
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      {/* 1. Job Role Grid */}
      <div className="space-y-3">
        <Label className="text-xs uppercase tracking-wider text-muted-foreground font-bold flex items-center gap-1.5">
          <Code2 className="h-3.5 w-3.5 text-primary" />
          Target Job Role
        </Label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
          {PRESET_ROLES.map((r) => {
            const Icon = r.icon;
            const isSelected = !isCustomRole && selectedRole === r.id;
            return (
              <button
                key={r.id}
                type="button"
                onClick={() => {
                  setSelectedRole(r.id);
                  setIsCustomRole(false);
                  playSound("click");
                }}
                className={`p-3 rounded-2xl border text-left transition-all duration-200 flex flex-col justify-between ${
                  isSelected
                    ? "border-primary bg-primary/10 shadow-lg shadow-primary/10 scale-[1.02]"
                    : "border-border/60 bg-background/40 hover:bg-background/80 hover:border-border"
                }`}
              >
                <div className="flex items-center justify-between w-full mb-1.5">
                  <div
                    className={`h-7 w-7 rounded-lg flex items-center justify-center ${
                      isSelected ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                  {isSelected && <CheckCircle2 className="h-4 w-4 text-primary" />}
                </div>
                <div>
                  <p className="text-xs font-bold leading-tight">{r.name}</p>
                  <p className="text-[10px] text-muted-foreground line-clamp-1 mt-0.5">{r.desc}</p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Custom role toggle */}
        <div className="pt-1">
          {isCustomRole ? (
            <div className="flex gap-2">
              <Input
                placeholder="Enter custom role (e.g., Security Engineer, Quantitative Trader)"
                value={customRole}
                onChange={(e) => setCustomRole(e.target.value)}
                autoFocus
                className="bg-background/60 rounded-xl text-xs"
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsCustomRole(false)}
                className="rounded-xl text-xs text-muted-foreground"
              >
                Cancel
              </Button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setIsCustomRole(true)}
              className="text-xs text-primary hover:underline font-medium inline-flex items-center gap-1"
            >
              + Or enter a custom role title
            </button>
          )}
        </div>
      </div>

      {/* 2. Interview Track / Type */}
      <div className="space-y-3">
        <Label className="text-xs uppercase tracking-wider text-muted-foreground font-bold flex items-center gap-1.5">
          <Layers className="h-3.5 w-3.5 text-primary" />
          Interview Focus Track
        </Label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {INTERVIEW_TRACKS.map((t) => {
            const isSelected = interviewType === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => {
                  setInterviewType(t.id);
                  playSound("click");
                }}
                className={`p-3.5 rounded-2xl border text-left transition-all duration-200 ${
                  isSelected
                    ? "border-primary bg-primary/10 shadow-lg shadow-primary/10"
                    : "border-border/60 bg-background/40 hover:bg-background/80 hover:border-border"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold">{t.title}</span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-secondary text-muted-foreground font-medium">
                    {t.recommended}
                  </span>
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed">{t.tagline}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Difficulty Level & Length */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Difficulty */}
        <div className="space-y-3">
          <Label className="text-xs uppercase tracking-wider text-muted-foreground font-bold flex items-center gap-1.5">
            <Shield className="h-3.5 w-3.5 text-primary" />
            Seniority & Bar
          </Label>
          <div className="grid grid-cols-2 gap-2">
            {DIFFICULTY_LEVELS.map((d) => {
              const isSelected = difficulty === d.id;
              return (
                <button
                  key={d.id}
                  type="button"
                  onClick={() => {
                    setDifficulty(d.id);
                    playSound("click");
                  }}
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    isSelected
                      ? `bg-primary/10 border-primary shadow-sm font-semibold`
                      : "border-border/60 bg-background/40 hover:bg-background/80"
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm">{d.icon}</span>
                    <span className="text-xs font-bold">{d.label}</span>
                  </div>
                  <span className="text-[10px] text-muted-foreground ml-5">{d.tag}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Question Count / Length */}
        <div className="space-y-3">
          <Label className="text-xs uppercase tracking-wider text-muted-foreground font-bold flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5 text-primary" />
            Interview Depth
          </Label>
          <div className="grid grid-cols-3 gap-2">
            {LENGTH_OPTIONS.map((l) => {
              const isSelected = questionCount === l.count;
              return (
                <button
                  key={l.count}
                  type="button"
                  onClick={() => {
                    setQuestionCount(l.count);
                    playSound("click");
                  }}
                  className={`p-2.5 rounded-xl border text-center transition-all ${
                    isSelected
                      ? "bg-primary/15 border-primary shadow-sm text-foreground"
                      : "border-border/60 bg-background/40 hover:bg-background/80 text-muted-foreground"
                  }`}
                >
                  <p className="text-base font-black font-mono text-primary">{l.count} Qs</p>
                  <p className="text-[10px] font-semibold text-foreground/90">{l.label}</p>
                  <p className="text-[9px] text-muted-foreground">{l.time}</p>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 4. Resume Upload — Prominent */}
      <div className="space-y-3 pt-2 border-t border-border/60">
        <Label className="text-xs uppercase tracking-wider text-muted-foreground font-bold flex items-center gap-1.5">
          <FileText className="h-3.5 w-3.5 text-primary" />
          Upload Your Resume
          <span className="text-[10px] text-primary font-normal ml-1 px-1.5 py-0.5 rounded-md bg-primary/10">Recommended</span>
        </Label>
        <p className="text-[11px] text-muted-foreground -mt-1">
          The AI will read your resume and ask questions about your actual projects, tech stack, and experience.
        </p>

        {/* Resume Dropzone */}
        <div>
          {resumeFile ? (
            <div className="flex items-center justify-between rounded-2xl border border-primary/40 bg-primary/8 px-4 py-3.5 shadow-sm shadow-primary/10">
              <div className="flex items-center gap-3 truncate">
                <div className="h-9 w-9 rounded-xl bg-primary/15 flex items-center justify-center text-primary shrink-0">
                  <FileText className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs font-semibold truncate">{resumeFile.name}</p>
                  <p className="text-[10px] text-primary font-medium">
                    ✓ {resumeText.split(/\s+/).filter(Boolean).length} words parsed · AI will personalize all questions
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setResumeFile(null);
                  setResumeText("");
                }}
                className="text-muted-foreground hover:text-foreground p-1.5 rounded-lg hover:bg-background/60 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <label className="flex items-center gap-4 rounded-2xl border-2 border-dashed border-primary/30 hover:border-primary/60 bg-primary/3 hover:bg-primary/8 p-5 cursor-pointer transition-all duration-200 group">
              <div className="h-11 w-11 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 group-hover:bg-primary/20 transition-all shrink-0">
                {parsingResume ? (
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                ) : (
                  <Upload className="h-5 w-5" />
                )}
              </div>
              <div className="text-left flex-1">
                <p className="text-sm font-bold text-foreground">
                  {parsingResume ? "Parsing your resume..." : "Drop your Resume PDF here"}
                </p>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  {parsingResume
                    ? "Extracting text for AI context..."
                    : "Questions will reference your real projects, technologies & career gaps"}
                </p>
              </div>
              <span className="text-[10px] font-mono text-muted-foreground shrink-0">PDF only</span>
              <input
                type="file"
                accept=".pdf"
                className="hidden"
                disabled={parsingResume}
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  setResumeFile(file);
                  setParsingResume(true);
                  try {
                    const buf = await file.arrayBuffer();
                    const pdf = await pdfjsLib.getDocument({ data: buf }).promise;
                    let text = "";
                    for (let i = 1; i <= pdf.numPages; i++) {
                      const page = await pdf.getPage(i);
                      const content = await page.getTextContent();
                      text +=
                        content.items
                          .map((item) => ("str" in item ? (item as { str: string }).str : ""))
                          .join(" ") + "\n";
                    }
                    setResumeText(text.trim());
                    playSound("chime");
                  } catch {
                    setResumeText("");
                    setResumeFile(null);
                  } finally {
                    setParsingResume(false);
                  }
                }}
              />
            </label>
          )}
        </div>
      </div>

      {/* 5. Optional Extras: JD & Custom Questions */}
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setShowJd(!showJd)}
            className={`text-[11px] px-3 py-1.5 rounded-xl border transition-all font-medium ${
              showJd
                ? "bg-primary/10 border-primary/40 text-primary"
                : "border-border/60 text-muted-foreground hover:text-foreground hover:border-border"
            }`}
          >
            {showJd ? "− Job Description" : "+ Job Description"}
          </button>
          <button
            type="button"
            onClick={() => setShowCustomQ(!showCustomQ)}
            className={`text-[11px] px-3 py-1.5 rounded-xl border transition-all font-medium ${
              showCustomQ
                ? "bg-primary/10 border-primary/40 text-primary"
                : "border-border/60 text-muted-foreground hover:text-foreground hover:border-border"
            }`}
          >
            {showCustomQ ? "− Custom Questions" : "+ Custom Questions"}
          </button>
        </div>

        <AnimatePresence>
          {showJd && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-1.5 overflow-hidden"
            >
              <Textarea
                placeholder="Paste the target job description or company responsibilities here..."
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                rows={3}
                className="bg-background/60 rounded-xl text-xs leading-relaxed"
              />
              <p className="text-[10px] text-muted-foreground">
                AI will calibrate questions to specifically evaluate responsibilities in this listing.
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showCustomQ && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-1.5 overflow-hidden"
            >
              <Textarea
                placeholder={`Enter specific questions you want the AI to ask, one per line. Example:\n- Tell me about your experience with distributed systems\n- Walk me through your largest engineering project\n- How do you approach system design tradeoffs?`}
                value={customQuestions}
                onChange={(e) => setCustomQuestions(e.target.value)}
                rows={4}
                className="bg-background/60 rounded-xl text-xs leading-relaxed font-mono"
              />
              <p className="text-[10px] text-muted-foreground">
                The AI will incorporate your questions into the natural interview flow.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Start Button */}
      <Button
        className="w-full h-13 text-base font-bold rounded-2xl glow-primary bg-gradient-to-r from-primary via-primary to-accent hover:opacity-95 transition-all duration-300 hover:scale-[1.01] shadow-xl text-primary-foreground"
        disabled={!canStart}
        onClick={handleStart}
      >
        <span className="flex items-center gap-2">
          Start {difficulty} {effectiveRole} Interview ({questionCount} Qs)
          <ArrowRight className="h-5 w-5" />
        </span>
      </Button>
    </div>
  );
};

export default SetupForm;
