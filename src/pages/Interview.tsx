import { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { InterviewSetup, InterviewMessage, Feedback } from "@/lib/types";
import { callGroq } from "@/lib/groq";
import { parseAIResponse, buildSystemMessage } from "@/lib/parseResponse";
import { useVoiceInput } from "@/hooks/useVoiceInput";
import { playSound, playTTS, stopTTS } from "@/lib/sound";
import VoiceRecordingOverlay from "@/components/VoiceRecordingOverlay";
import LogoBrand from "@/components/LogoBrand";
import {
  Mic,
  Send,
  Loader2,
  Bot,
  User,
  Volume2,
  VolumeX,
  Clock,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  HelpCircle,
  Flag,
  ArrowRight,
  Lightbulb,
} from "lucide-react";
import { toast } from "sonner";

const msgVariants = {
  hidden: { opacity: 0, y: 14, scale: 0.98 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] } },
};

const Interview = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const setup = (location.state as { setup: InterviewSetup } | null)?.setup;
  const totalQuestions = setup?.questionCount || 5;

  const [messages, setMessages] = useState<InterviewMessage[]>([]);
  const [apiMessages, setApiMessages] = useState<{ role: string; content: string }[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [scores, setScores] = useState<number[]>([]);
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [showStarGuide, setShowStarGuide] = useState(false);
  const [ttsEnabled, setTtsEnabled] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const chatEndRef = useRef<HTMLDivElement>(null);
  const { isListening, transcript, startListening, stopListening, supported, analyserNode } =
    useVoiceInput();

  // Redirect if no setup
  useEffect(() => {
    if (!setup) navigate("/", { replace: true });
  }, [setup, navigate]);

  // Session timer
  useEffect(() => {
    const timer = setInterval(() => {
      setTimerSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Sync TTS preference
  useEffect(() => {
    setTtsEnabled(localStorage.getItem("prepped_tts_muted") !== "true");
  }, []);

  // Initialize interview with first question
  useEffect(() => {
    if (!setup || messages.length > 0) return;
    const systemMsg = { role: "system", content: buildSystemMessage(setup) };
    const initMsgs = [
      systemMsg,
      { role: "user", content: "Start the interview. Ask me your first question." },
    ];
    setApiMessages(initMsgs);
    setLoading(true);

    callGroq(initMsgs, { setup, questionIndex: 0 })
      .then((reply) => {
        setApiMessages([...initMsgs, { role: "assistant", content: reply }]);
        const { nextQuestion } = parseAIResponse(reply);
        const questionText = nextQuestion || reply;
        setMessages([{ role: "assistant", content: reply, nextQuestion: questionText }]);
        playSound("chime");

        if (ttsEnabled) {
          setIsSpeaking(true);
          playTTS(questionText, () => setIsSpeaking(false));
        }
      })
      .catch((err) => {
        setMessages([
          {
            role: "assistant",
            content: `Notice: ${err.message}. Ready to continue in interactive simulation mode.`,
            nextQuestion: "Let's begin: Walk me through your most complex technical project and the core decisions you made.",
          },
        ]);
      })
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setup]);

  // Sync voice transcript to input
  useEffect(() => {
    if (transcript) setInput(transcript);
  }, [transcript]);

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const speakText = (text: string) => {
    if (!text) return;
    setIsSpeaking(true);
    playTTS(text, () => setIsSpeaking(false));
  };

  const handleCopyIdeal = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(idx);
    toast.success("Copied exemplary answer to clipboard");
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleSend = async () => {
    const text = input.trim();
    if (!text || loading) return;

    stopTTS();
    setIsSpeaking(false);
    playSound("click");

    const userMsg: InterviewMessage = { role: "user", content: text, timestamp: Date.now() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");

    const newApiMsgs = [...apiMessages, { role: "user" as const, content: text }];
    setApiMessages(newApiMsgs);
    setLoading(true);

    try {
      const currentQIndex = scores.length;
      const reply = await callGroq(newApiMsgs, {
        setup: setup!,
        questionIndex: currentQIndex,
      });

      const fullApiMsgs = [...newApiMsgs, { role: "assistant" as const, content: reply }];
      setApiMessages(fullApiMsgs);

      const { feedback, nextQuestion } = parseAIResponse(reply);
      const assistantMsg: InterviewMessage = {
        role: "assistant",
        content: reply,
        feedback: feedback ?? undefined,
        nextQuestion,
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, assistantMsg]);

      if (feedback) {
        const newScores = [...scores, feedback.score];
        const newFeedbacks = [...feedbacks, feedback];
        setScores(newScores);
        setFeedbacks(newFeedbacks);

        if (feedback.score >= 8) {
          playSound("success");
        } else {
          playSound("chime");
        }

        // Speak next question if exists
        if (nextQuestion && ttsEnabled) {
          setTimeout(() => {
            speakText(nextQuestion);
          }, 800);
        }

        // If completed all questions, navigate to summary
        if (newScores.length >= totalQuestions) {
          playSound("complete");
          setTimeout(() => {
            navigate("/summary", {
              state: {
                setup,
                scores: newScores,
                feedbacks: newFeedbacks,
                durationSeconds: timerSeconds,
              },
            });
          }, 2000);
        }
      }
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: `Error processing answer: ${errorMsg}` },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const finishEarly = () => {
    if (scores.length === 0) {
      navigate("/");
      return;
    }
    stopTTS();
    navigate("/summary", {
      state: {
        setup,
        scores,
        feedbacks,
        durationSeconds: timerSeconds,
      },
    });
  };

  const formatTimer = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const s = sec % 60;
    return `${mins}:${s.toString().padStart(2, "0")}`;
  };

  if (!setup) return null;

  return (
    <div className="min-h-screen flex flex-col bg-background relative overflow-hidden">
      {/* Subtle ambient lighting */}
      <div className="fixed inset-0 bg-grid opacity-20 pointer-events-none" />
      <div className="fixed inset-0 bg-radial-glow pointer-events-none" />

      {/* Header HUD */}
      <header className="relative z-20 border-b border-border/80 backdrop-blur-2xl bg-card/75 px-4 sm:px-8 py-3 flex items-center justify-between shrink-0 shadow-sm">
        <div className="flex items-center gap-3">
          <LogoBrand size="sm" />
          <div className="hidden sm:flex items-center gap-1.5 ml-2 border-l border-border/70 pl-3">
            <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-primary/10 text-primary font-bold">
              {setup.role}
            </span>
            <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-secondary text-muted-foreground font-medium">
              {setup.type}
            </span>
            <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-secondary text-muted-foreground font-medium">
              {setup.difficulty}
            </span>
          </div>
        </div>

        {/* Question Stepper Pills & Actions */}
        <div className="flex items-center gap-3">
          {/* Question Stepper */}
          <div className="hidden md:flex items-center gap-1.5 bg-background/60 p-1 rounded-xl border border-border/60">
            {Array.from({ length: totalQuestions }).map((_, i) => {
              const isCompleted = i < scores.length;
              const isCurrent = i === scores.length;
              return (
                <div
                  key={i}
                  className={`h-6 px-2.5 rounded-lg text-xs font-mono font-bold flex items-center justify-center transition-all ${
                    isCompleted
                      ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                      : isCurrent
                      ? "bg-primary text-primary-foreground shadow-sm shadow-primary/30"
                      : "text-muted-foreground/50 bg-secondary/50"
                  }`}
                >
                  Q{i + 1}
                  {isCompleted && " ✓"}
                </div>
              );
            })}
          </div>

          {/* Session Timer */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-background/50 border border-border/60 text-xs font-mono text-muted-foreground">
            <Clock className="h-3.5 w-3.5 text-primary" />
            <span>{formatTimer(timerSeconds)}</span>
          </div>

          {/* Audio toggle */}
          <button
            type="button"
            onClick={() => {
              const next = !ttsEnabled;
              setTtsEnabled(next);
              localStorage.setItem("prepped_tts_muted", next ? "false" : "true");
              if (!next) stopTTS();
            }}
            className={`p-2 rounded-xl border transition-colors ${
              ttsEnabled
                ? "bg-primary/10 border-primary/30 text-primary"
                : "bg-background/50 border-border/60 text-muted-foreground"
            }`}
            title={ttsEnabled ? "Mute AI Voice" : "Enable AI Voice"}
          >
            {ttsEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
          </button>

          {/* End Early Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={finishEarly}
            className="text-xs text-muted-foreground hover:text-foreground h-8 px-2.5 rounded-xl"
          >
            <Flag className="h-3.5 w-3.5 mr-1" />
            Finish
          </Button>
        </div>
      </header>

      {/* Progress Bar */}
      <div className="relative z-10 w-full bg-secondary/30">
        <Progress
          value={(scores.length / totalQuestions) * 100}
          className="h-1 rounded-none bg-transparent"
        />
      </div>

      {/* STAR Helper Notification Pill */}
      <div className="relative z-10 px-4 pt-2 max-w-3xl mx-auto w-full flex justify-between items-center">
        <button
          type="button"
          onClick={() => setShowStarGuide(!showStarGuide)}
          className="text-[11px] text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 transition-colors"
        >
          <Lightbulb className="h-3 w-3 text-amber-400" />
          {showStarGuide ? "Hide STAR Framework Guide" : "Need answer structure? View STAR Method"}
        </button>

        <span className="text-[11px] text-muted-foreground font-mono">
          Question {Math.min(scores.length + 1, totalQuestions)} of {totalQuestions}
        </span>
      </div>

      {/* STAR Guide Expandable */}
      <AnimatePresence>
        {showStarGuide && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="relative z-10 px-4 max-w-3xl mx-auto w-full overflow-hidden"
          >
            <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-3.5 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <div>
                <span className="font-bold text-amber-400 block">S · Situation</span>
                <span className="text-[11px] text-foreground/80">Set the stage & context in 1-2 sentences.</span>
              </div>
              <div>
                <span className="font-bold text-amber-400 block">T · Task</span>
                <span className="text-[11px] text-foreground/80">Your specific responsibility & objective.</span>
              </div>
              <div>
                <span className="font-bold text-amber-400 block">A · Action</span>
                <span className="text-[11px] text-foreground/80">Specific technical or leadership steps you led.</span>
              </div>
              <div>
                <span className="font-bold text-amber-400 block">R · Result</span>
                <span className="text-[11px] text-foreground/80">Measurable impact (% faster, $ saved, bugs down).</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat Messages */}
      <div className="relative z-10 flex-1 overflow-y-auto px-4 py-6 space-y-6 max-w-3xl mx-auto w-full scrollbar-custom">
        <AnimatePresence>
          {messages.map((msg, i) => (
            <motion.div key={i} variants={msgVariants} initial="hidden" animate="visible">
              <div className={`flex gap-3.5 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                {/* Assistant Avatar */}
                {msg.role === "assistant" && (
                  <div className="h-9 w-9 rounded-2xl bg-gradient-to-tr from-primary to-accent flex items-center justify-center text-primary-foreground shrink-0 shadow-md shadow-primary/20 mt-1">
                    <Bot className="h-4 w-4" />
                  </div>
                )}

                {/* Message Bubble */}
                <div
                  className={`max-w-[85%] rounded-3xl p-5 text-sm leading-relaxed ${
                    msg.role === "user"
                      ? "bg-gradient-to-r from-primary to-accent text-primary-foreground rounded-tr-sm shadow-xl font-medium"
                      : "glass glass-card rounded-tl-sm border border-border/80 shadow-lg"
                  }`}
                >
                  {/* Assistant response with optional Feedback card */}
                  {msg.feedback ? (
                    <div className="space-y-4">
                      {/* Evaluation Scorecard */}
                      <div
                        className={`rounded-2xl border p-4 space-y-3.5 ${
                          msg.feedback.score >= 8
                            ? "border-emerald-500/30 bg-emerald-500/5 glow-score-high"
                            : msg.feedback.score >= 5
                            ? "border-amber-500/30 bg-amber-500/5 glow-score-mid"
                            : "border-rose-500/30 bg-rose-500/5 glow-score-low"
                        }`}
                      >
                        <div className="flex items-center justify-between border-b border-border/40 pb-2.5">
                          <div className="flex items-center gap-2">
                            <Sparkles className="h-4 w-4 text-primary" />
                            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                              Answer Diagnostic
                            </span>
                          </div>
                          <div className="flex items-baseline gap-1">
                            <span
                              className={`text-2xl font-black font-mono ${
                                msg.feedback.score >= 8
                                  ? "text-emerald-400"
                                  : msg.feedback.score >= 5
                                  ? "text-amber-400"
                                  : "text-rose-400"
                              }`}
                            >
                              {msg.feedback.score}
                            </span>
                            <span className="text-xs text-muted-foreground font-mono">/ 10</span>
                          </div>
                        </div>

                        {/* Strengths */}
                        <div className="space-y-1">
                          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            What Worked Well
                          </span>
                          <p className="text-xs text-foreground/90 leading-relaxed pl-5">
                            {msg.feedback.strength}
                          </p>
                        </div>

                        {/* Gaps */}
                        <div className="space-y-1">
                          <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                            <AlertCircle className="h-3.5 w-3.5" />
                            Opportunity for Growth
                          </span>
                          <p className="text-xs text-foreground/90 leading-relaxed pl-5">
                            {msg.feedback.gap}
                          </p>
                        </div>

                        {/* Model Ideal Answer */}
                        {msg.feedback.idealAnswer && (
                          <div className="rounded-xl bg-background/60 border border-border/60 p-3 space-y-1.5">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-primary">
                                Exemplary Model Answer
                              </span>
                              <button
                                type="button"
                                onClick={() => handleCopyIdeal(msg.feedback!.idealAnswer, i)}
                                className="text-[10px] text-muted-foreground hover:text-foreground flex items-center gap-1"
                              >
                                {copiedIndex === i ? (
                                  <>
                                    <Check className="h-3 w-3 text-emerald-400" /> Copied
                                  </>
                                ) : (
                                  <>
                                    <Copy className="h-3 w-3" /> Copy
                                  </>
                                )}
                              </button>
                            </div>
                            <p className="text-xs text-foreground/80 leading-relaxed font-mono">
                              "{msg.feedback.idealAnswer}"
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Next Question if present */}
                      {msg.nextQuestion && (
                        <div className="space-y-2 pt-1">
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] font-bold uppercase tracking-wider text-primary">
                              Next Question
                            </span>
                            <button
                              type="button"
                              onClick={() => speakText(msg.nextQuestion!)}
                              className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1"
                              title="Listen to question"
                            >
                              <Volume2 className="h-3.5 w-3.5" />
                              <span className="text-[10px]">Play Audio</span>
                            </button>
                          </div>
                          <p className="text-sm font-medium leading-relaxed text-foreground">
                            {msg.nextQuestion}
                          </p>
                        </div>
                      )}
                    </div>
                  ) : (
                    /* Initial question or standard text */
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-primary">
                          AI Hiring Manager
                        </span>
                        {msg.role === "assistant" && (
                          <button
                            type="button"
                            onClick={() => speakText(msg.content)}
                            className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1"
                            title="Listen to question"
                          >
                            <Volume2 className="h-3.5 w-3.5" />
                            <span className="text-[10px]">Play Audio</span>
                          </button>
                        )}
                      </div>
                      <p className="text-sm font-medium leading-relaxed">{msg.content}</p>
                    </div>
                  )}
                </div>

                {/* User Avatar */}
                {msg.role === "user" && (
                  <div className="h-9 w-9 rounded-2xl bg-secondary flex items-center justify-center text-foreground shrink-0 border border-border mt-1">
                    <User className="h-4 w-4 text-muted-foreground" />
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Loading Indicator */}
        {loading && (
          <motion.div
            className="flex gap-3 justify-start"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="h-9 w-9 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0 mt-1">
              <Bot className="h-4 w-4 text-primary" />
            </div>
            <div className="glass glass-card rounded-3xl rounded-tl-sm px-5 py-3.5 flex items-center gap-3 text-xs text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin text-primary" />
              <span>Evaluating candidate response with rubric...</span>
            </div>
          </motion.div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Input Stage */}
      <div className="relative z-20 border-t border-border/80 backdrop-blur-2xl bg-card/85 px-4 py-4 shrink-0 shadow-2xl">
        <div className="max-w-3xl mx-auto relative">
          <AnimatePresence>
            {isListening ? (
              <VoiceRecordingOverlay
                isListening={isListening}
                transcript={transcript}
                analyserNode={analyserNode}
                onStop={stopListening}
              />
            ) : (
              <motion.div
                key="input-box"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="space-y-2"
              >
                <div className="relative flex gap-2 items-end">
                  <div className="relative flex-1 rounded-2xl border border-border/80 bg-background/60 focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/20 transition-all">
                    <Textarea
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      placeholder={
                        scores.length >= totalQuestions
                          ? "Interview completed! Preparing performance scorecard..."
                          : "Type your answer or click microphone to speak..."
                      }
                      disabled={loading || scores.length >= totalQuestions}
                      rows={3}
                      className="resize-none pr-12 text-sm bg-transparent border-0 focus-visible:ring-0 focus-visible:ring-offset-0 rounded-2xl max-h-36 overflow-y-auto scrollbar-custom"
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          handleSend();
                        }
                      }}
                    />

                    {/* Mic button inside textarea */}
                    {supported && (
                      <button
                        type="button"
                        onClick={startListening}
                        disabled={loading || scores.length >= totalQuestions}
                        className="absolute right-2.5 bottom-2.5 p-2 rounded-xl bg-primary/10 hover:bg-primary/20 text-primary transition-all hover:scale-105"
                        title="Speak your answer"
                      >
                        <Mic className="h-4 w-4" />
                      </button>
                    )}
                  </div>

                  {/* Send Button */}
                  <Button
                    onClick={handleSend}
                    disabled={!input.trim() || loading || scores.length >= totalQuestions}
                    size="icon"
                    className="h-12 w-12 shrink-0 rounded-2xl glow-primary-sm bg-primary text-primary-foreground hover:scale-105 transition-all shadow-md"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>

                {/* Micro helper bar */}
                <div className="flex items-center justify-between text-[11px] text-muted-foreground px-1">
                  <span>
                    {input.trim() ? `${input.trim().split(/\s+/).filter(Boolean).length} words` : "Tip: Press Enter to submit"}
                  </span>
                  <span>Shift + Enter for new line</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default Interview;
