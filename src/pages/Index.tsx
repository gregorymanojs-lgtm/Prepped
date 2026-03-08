import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import LogoBrand from "@/components/LogoBrand";
import SetupForm from "@/components/SetupForm";
import { Button } from "@/components/ui/button";
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
} from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.5 },
  }),
};

const FEATURES = [
  {
    icon: Brain,
    title: "AI Interviewer",
    description: "Powered by advanced LLMs that adapt questions to your role, level, and resume.",
  },
  {
    icon: Mic,
    title: "Voice Input",
    description: "Speak your answers naturally with real-time waveform visualization and transcription.",
  },
  {
    icon: BarChart3,
    title: "Instant Feedback",
    description: "Get scored on each answer with detailed strengths, gaps, and ideal responses.",
  },
  {
    icon: FileText,
    title: "Resume-Aware",
    description: "Upload your PDF resume and get questions tailored to your actual experience.",
  },
  {
    icon: Target,
    title: "Study Plan",
    description: "Receive personalized study recommendations based on your weak areas.",
  },
  {
    icon: History,
    title: "Track Progress",
    description: "Monitor your scores over time and see your improvement across sessions.",
  },
];


const Index = () => {
  const navigate = useNavigate();
  const formRef = useRef<HTMLDivElement>(null);

  const scrollToForm = () => {
    formRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background effects */}
      <div className="fixed inset-0 bg-grid opacity-40 pointer-events-none" />
      <div className="fixed inset-0 bg-radial-glow pointer-events-none" />

      {/* Header */}
      <header className="sticky top-0 z-50 border-b glass-border px-6 py-4 flex items-center justify-between glass">
        <LogoBrand />
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/history")}
            className="text-muted-foreground hover:text-foreground"
          >
            <History className="h-4 w-4 mr-1.5" />
            History
          </Button>
          <Button size="sm" onClick={scrollToForm} className="rounded-xl glow-primary-sm">
            Get Started
          </Button>
        </div>
      </header>

      {/* Hero */}
      <section className="relative z-10 flex flex-col items-center justify-center px-4 pt-24 pb-20 text-center">
        <motion.div
          className="space-y-6 max-w-3xl"
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          custom={0}
        >
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-medium">
            <Sparkles className="h-3 w-3" />
            AI-Powered Mock Interviews
          </div>
          <h1 className="text-6xl sm:text-7xl font-black tracking-widest font-display uppercase leading-none">
            <span className="gradient-text">PREPPED</span>
          </h1>
          <p className="text-xl sm:text-2xl text-muted-foreground max-w-xl mx-auto leading-relaxed">
            Walk in ready. Practice interviews with AI that{" "}
            <span className="text-foreground font-medium">adapts to you</span>, gives{" "}
            <span className="text-foreground font-medium">real feedback</span>, and tracks your{" "}
            <span className="text-foreground font-medium">progress</span>.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Button
              size="lg"
              onClick={scrollToForm}
              className="rounded-xl glow-primary text-base font-semibold h-12 px-8"
            >
              Start Practicing
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => navigate("/history")}
              className="rounded-xl glass text-base h-12 px-8"
            >
              View Past Sessions
            </Button>
          </div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          className="mt-16 text-muted-foreground"
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
        >
          <ChevronDown className="h-5 w-5" />
        </motion.div>
      </section>

      {/* Features */}
      <section className="relative z-10 px-4 py-20">
        <div className="max-w-5xl mx-auto">
          <motion.div
            className="text-center mb-14"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl sm:text-4xl font-black font-display tracking-tight">
              Everything you need to <span className="gradient-text">ace the interview</span>
            </h2>
            <p className="text-muted-foreground mt-3 max-w-lg mx-auto">
              A complete practice toolkit designed to build real confidence, not just knowledge.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {FEATURES.map((feature, i) => (
              <motion.div
                key={feature.title}
                className="glass glass-border rounded-2xl p-6 space-y-3 card-hover group"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
              >
                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <feature.icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-bold font-display text-sm">{feature.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Setup Form */}
      <section ref={formRef} className="relative z-10 px-4 py-20 border-t glass-border">
        <div className="max-w-lg mx-auto space-y-8">
          <motion.div
            className="text-center space-y-3"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-black font-display tracking-tight">
              Ready to <span className="gradient-text">get started</span>?
            </h2>
            <p className="text-muted-foreground">Set up your mock interview in under a minute.</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.15 }}
          >
            <SetupForm />
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t glass-border glass px-6 py-6 text-center">
        <p className="text-xs text-muted-foreground">
          Your data stays in your browser. No sign-up required.
        </p>
      </footer>
    </div>
  );
};

export default Index;
