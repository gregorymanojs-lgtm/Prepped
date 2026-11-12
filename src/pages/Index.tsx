import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import LogoBrand from "@/components/LogoBrand";
import SetupForm from "@/components/SetupForm";
import { HeroDemoPreview } from "@/components/HeroDemoPreview";
import { SettingsModal } from "@/components/SettingsModal";
import { Button } from "@/components/ui/button";
import { hasGroqApiKey } from "@/lib/groq";
import { playSound } from "@/lib/sound";
import {
  ArrowRight,
  History,
  Sparkles,
  Brain,
  Mic,
  BarChart3,
  FileText,
  Target,
  ChevronDown,
  Settings,
  ShieldCheck,
  Zap,
  Code2,
  Users,
  Compass,
  CheckCircle2,
  HelpCircle,
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.55, ease: [0.16, 1, 0.3, 1] },
  }),
};

const FEATURES = [
  {
    icon: Brain,
    title: "Adaptive AI Interviewer",
    tag: "LLaMA 3.3 70B",
    description: "Evaluates your answers in real time and dynamically escalates technical depth based on your demonstrated skill level.",
    gradient: "from-sky-500/20 to-blue-600/10",
  },
  {
    icon: Mic,
    title: "Real-Time Voice Recognition",
    tag: "Live Audio Waveform",
    description: "Speak your answers naturally using speech recognition with live frequency visualization and pause detection.",
    gradient: "from-emerald-500/20 to-teal-600/10",
  },
  {
    icon: BarChart3,
    title: "STAR Framework Evaluation",
    tag: "Instant 1-10 Rubric",
    description: "Every answer receives immediate scoring with pinpointed strengths, missed details, and an exemplary ideal answer.",
    gradient: "from-amber-500/20 to-orange-600/10",
  },
  {
    icon: FileText,
    title: "Resume & JD Calibration",
    tag: "PDF Parsing Engine",
    description: "Upload your resume PDF to receive customized questions tailored to your actual projects, tech stacks, and career gaps.",
    gradient: "from-indigo-500/20 to-purple-600/10",
  },
  {
    icon: Target,
    title: "Actionable Study Roadmap",
    tag: "Targeted Prep",
    description: "Converts identified answer gaps into a prioritized, actionable study checklist to accelerate your preparation.",
    gradient: "from-rose-500/20 to-pink-600/10",
  },
  {
    icon: ShieldCheck,
    title: "100% Private & Browser-Local",
    tag: "Zero Server Storage",
    description: "Your audio, resume text, and interview transcripts are stored entirely in your local browser storage.",
    gradient: "from-cyan-500/20 to-blue-600/10",
  },
];

const FAQS = [
  {
    q: "Do I need a paid API key to use PREPPED?",
    a: "No! PREPPED includes a built-in interactive simulation engine that provides full questions, voice input, and rich feedback right out of the box. If you have a free Groq API key, you can connect it in Settings for live LLaMA 3.3 70B inference.",
  },
  {
    q: "How does the voice interview feature work?",
    a: "Click the microphone button to dictate your answer. PREPPED visualizes your real-time vocal frequency waveform and transcribes your speech. The AI interviewer can also speak questions aloud with browser text-to-speech.",
  },
  {
    q: "What types of interviews are supported?",
    a: "PREPPED covers Technical Coding & Architecture, Behavioral (STAR method), System Design & Scalability, Product Management, Leadership, and Offer/Salary Negotiation across Junior to Staff/Principal levels.",
  },
  {
    q: "Is my resume kept confidential?",
    a: "Yes, 100%. Resume parsing runs locally inside your browser via client-side PDF.js. Your resume text is never sent to or stored on any central server.",
  },
];

const Index = () => {
  const navigate = useNavigate();
  const formRef = useRef<HTMLDivElement>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const isKeyConfigured = hasGroqApiKey();

  const scrollToForm = () => {
    playSound("click");
    formRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-background relative overflow-x-hidden selection:bg-primary/20">
      {/* Background ambient lighting */}
      <div className="fixed inset-0 bg-grid opacity-25 pointer-events-none" />
      <div className="fixed inset-0 bg-radial-glow pointer-events-none" />
      <div className="fixed -top-40 left-1/2 -translate-x-1/2 w-[1000px] h-[450px] bg-gradient-to-b from-primary/15 via-accent/5 to-transparent blur-3xl pointer-events-none" />

      {/* Global Header */}
      <header className="sticky top-0 z-50 border-b border-border/70 backdrop-blur-2xl bg-card/65 px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <LogoBrand size="sm" subtitle={false} />
          <button
            type="button"
            onClick={() => setSettingsOpen(true)}
            className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-border/80 bg-background/50 hover:bg-muted text-xs transition-colors"
          >
            <span
              className={`h-2 w-2 rounded-full ${
                isKeyConfigured ? "bg-emerald-400" : "bg-amber-400"
              } animate-pulse`}
            />
            <span className="text-[11px] text-muted-foreground font-medium">
              {isKeyConfigured ? "Groq 70B Active" : "Interactive Mode"}
            </span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              playSound("click");
              setSettingsOpen(true);
            }}
            className="rounded-xl text-muted-foreground hover:text-foreground h-9 px-2.5"
            title="Settings & API Key"
          >
            <Settings className="h-4 w-4" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              playSound("click");
              navigate("/history");
            }}
            className="rounded-xl text-muted-foreground hover:text-foreground h-9 px-3 text-xs"
          >
            <History className="h-4 w-4 mr-1.5" />
            History
          </Button>

          <Button
            size="sm"
            onClick={scrollToForm}
            className="rounded-xl glow-primary-sm bg-primary text-primary-foreground font-semibold h-9 px-4 text-xs hover:scale-105 transition-transform"
          >
            Start Practice
            <ArrowRight className="h-3.5 w-3.5 ml-1" />
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 flex flex-col items-center justify-center px-4 pt-16 sm:pt-24 pb-14 text-center max-w-5xl mx-auto">
        <motion.div
          className="space-y-6 max-w-3xl"
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          custom={0}
        >
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 border border-primary/25 text-primary text-xs font-semibold shadow-sm">
            <Sparkles className="h-3.5 w-3.5 animate-spin" style={{ animationDuration: "6s" }} />
            <span>Next-Gen AI Interview Coaching · Powered by LLaMA 3.3 70B</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-5xl sm:text-7xl font-black tracking-tight font-display uppercase leading-[1.08]">
            Walk Into Every Interview{" "}
            <span className="gradient-text block sm:inline">Ready to Win</span>
          </h1>

          {/* Subheading */}
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Practice real-world behavioral, technical, and system design interviews with an adaptive AI hiring manager.
            Get instant STAR scoring, speech-to-text waveforms, and personalized study checklists.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-3">
            <Button
              size="lg"
              onClick={scrollToForm}
              className="w-full sm:w-auto rounded-2xl glow-primary text-base font-bold h-13 px-8 bg-gradient-to-r from-primary to-accent hover:opacity-95 text-primary-foreground hover:scale-105 transition-all shadow-xl"
            >
              Start Free Practice
              <ArrowRight className="h-5 w-5 ml-2" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => {
                playSound("click");
                navigate("/history");
              }}
              className="w-full sm:w-auto rounded-2xl glass glass-border text-base h-13 px-7 hover:border-primary/40 transition-colors"
            >
              <History className="h-4 w-4 mr-2 text-muted-foreground" />
              View Session History
            </Button>
          </div>

          {/* Trust proof bar */}
          <div className="pt-6 border-t border-border/40 flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              Real-time STAR Evaluation
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              Live Voice Waveforms
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              Client-Side PDF Resume Parsing
            </span>
          </div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          className="mt-12 text-muted-foreground/60 cursor-pointer hover:text-foreground"
          onClick={scrollToForm}
          animate={{ y: [0, 6, 0] }}
          transition={{ repeat: Infinity, duration: 2.2 }}
        >
          <ChevronDown className="h-6 w-6" />
        </motion.div>
      </section>

      {/* Interactive Hero Product Preview */}
      <section className="relative z-10 px-4 pb-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <HeroDemoPreview
            onSelectPreset={(role, type) => {
              scrollToForm();
            }}
          />
        </motion.div>
      </section>

      {/* 3-Step Journey / How It Works */}
      <section className="relative z-10 px-4 py-20 border-t border-border/60 bg-gradient-to-b from-card/30 to-background">
        <div className="max-w-5xl mx-auto space-y-12">
          <div className="text-center space-y-3">
            <span className="text-xs font-bold uppercase tracking-widest text-primary">The Process</span>
            <h2 className="text-3xl sm:text-4xl font-black font-display tracking-tight">
              From Practice to <span className="gradient-text">Offer Letter</span> in 3 Steps
            </h2>
            <p className="text-muted-foreground text-sm max-w-lg mx-auto">
              Engineered to eliminate hesitation, calibrate responses to company bars, and boost interview confidence.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                step: "01",
                title: "Calibrate Your Track",
                desc: "Choose role, seniority level, and optionally drop in your resume PDF or target job description.",
                icon: Compass,
              },
              {
                step: "02",
                title: "Interactive Interview HUD",
                desc: "Answer dynamic questions using voice or keyboard. The AI escalates technical depth based on your answers.",
                icon: Mic,
              },
              {
                step: "03",
                title: "Instant Diagnostic & Plan",
                desc: "Receive 1-10 scores, STAR structure breakdowns, exemplary model answers, and a prioritized study roadmap.",
                icon: Target,
              },
            ].map((item, idx) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={item.step}
                  className="glass glass-card rounded-3xl p-6 space-y-4 relative overflow-hidden card-hover"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.12 }}
                >
                  <span className="text-4xl font-black font-mono text-muted/50 block">{item.step}</span>
                  <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-base font-bold font-display">{item.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="relative z-10 px-4 py-20">
        <div className="max-w-5xl mx-auto space-y-12">
          <motion.div
            className="text-center space-y-3"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className="text-xs font-bold uppercase tracking-widest text-primary">Feature Suite</span>
            <h2 className="text-3xl sm:text-4xl font-black font-display tracking-tight">
              Everything You Need to <span className="gradient-text">Ace the Interview</span>
            </h2>
            <p className="text-muted-foreground text-sm max-w-lg mx-auto">
              A comprehensive practice environment built around real hiring manager rubrics.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map((feature, i) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  className="glass glass-card rounded-3xl p-6 space-y-3.5 card-hover group relative overflow-hidden"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                >
                  <div className="flex items-center justify-between">
                    <div className="h-11 w-11 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-secondary text-muted-foreground">
                      {feature.tag}
                    </span>
                  </div>
                  <h3 className="font-bold font-display text-sm text-foreground">{feature.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{feature.description}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Setup Form Section */}
      <section ref={formRef} className="relative z-10 px-4 py-20 border-t border-border/60 bg-card/20">
        <div className="max-w-3xl mx-auto space-y-8">
          <motion.div
            className="text-center space-y-3"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold">
              <Zap className="h-3 w-3" />
              Instant Setup
            </div>
            <h2 className="text-3xl sm:text-4xl font-black font-display tracking-tight">
              Configure Your <span className="gradient-text">Mock Interview</span>
            </h2>
            <p className="text-muted-foreground text-sm">
              Tailor the AI hiring manager to your specific role, level, and focus area.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            <SetupForm />
          </motion.div>
        </div>
      </section>

      {/* FAQ Accordion */}
      <section className="relative z-10 px-4 py-20 border-t border-border/60">
        <div className="max-w-2xl mx-auto space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-2xl sm:text-3xl font-black font-display tracking-tight">
              Frequently Asked <span className="gradient-text">Questions</span>
            </h2>
            <p className="text-xs text-muted-foreground">Everything you need to know about PREPPED.</p>
          </div>

          <Accordion type="single" collapsible className="space-y-3">
            {FAQS.map((faq, idx) => (
              <AccordionItem
                key={idx}
                value={`item-${idx}`}
                className="glass glass-card rounded-2xl px-5 border border-border/60"
              >
                <AccordionTrigger className="text-xs sm:text-sm font-semibold hover:no-underline text-left py-4">
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className="text-xs text-muted-foreground leading-relaxed pb-4">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-border/60 backdrop-blur-2xl bg-card/40 px-6 py-8">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <LogoBrand size="sm" />
            <span className="text-xs text-muted-foreground">· Walk in ready.</span>
          </div>

          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <button
              onClick={() => setSettingsOpen(true)}
              className="hover:text-foreground transition-colors"
            >
              Preferences & API Key
            </button>
            <span>·</span>
            <button
              onClick={() => navigate("/history")}
              className="hover:text-foreground transition-colors"
            >
              Session History
            </button>
          </div>
        </div>
      </footer>

      {/* Settings Modal */}
      <SettingsModal open={settingsOpen} onOpenChange={setSettingsOpen} />
    </div>
  );
};

export default Index;
