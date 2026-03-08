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
import VoiceRecordingOverlay from "@/components/VoiceRecordingOverlay";
import LogoBrand from "@/components/LogoBrand";
import { Mic, Send, Loader2, Bot, User } from "lucide-react";

const TOTAL_QUESTIONS = 5;

const msgVariants = {
  hidden: { opacity: 0, y: 12, scale: 0.97 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.35 } },
};

const Interview = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const setup = (location.state as { setup: InterviewSetup } | null)?.setup;

  const [messages, setMessages] = useState<InterviewMessage[]>([]);
  const [apiMessages, setApiMessages] = useState<{ role: string; content: string }[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [questionCount, setQuestionCount] = useState(0);
  const [scores, setScores] = useState<number[]>([]);
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const { isListening, transcript, startListening, stopListening, supported, analyserNode } =
    useVoiceInput();

  useEffect(() => {
    if (!setup) navigate("/", { replace: true });
  }, [setup, navigate]);

  useEffect(() => {
    if (!setup || messages.length > 0) return;
    const systemMsg = { role: "system", content: buildSystemMessage(setup) };
    const initMsgs = [systemMsg, { role: "user", content: "Start the interview. Ask me your first question." }];
    setApiMessages(initMsgs);
    setLoading(true);
    callGroq(initMsgs)
      .then((reply) => {
        setApiMessages([...initMsgs, { role: "assistant", content: reply }]);
        setMessages([{ role: "assistant", content: reply }]);
        setQuestionCount(1);
      })
      .catch((err) => {
        setMessages([{ role: "assistant", content: `Error: ${err.message}` }]);
      })
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setup]);

  useEffect(() => {
    if (transcript) setInput(transcript);
  }, [transcript]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || loading) return;

    const userMsg: InterviewMessage = { role: "user", content: text };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");

    const newApiMsgs = [...apiMessages, { role: "user" as const, content: text }];
    setApiMessages(newApiMsgs);
    setLoading(true);

    try {
      const reply = await callGroq(newApiMsgs);
      const fullApiMsgs = [...newApiMsgs, { role: "assistant" as const, content: reply }];
      setApiMessages(fullApiMsgs);

      const { feedback, nextQuestion } = parseAIResponse(reply);
      const assistantMsg: InterviewMessage = {
        role: "assistant",
        content: reply,
        feedback: feedback ?? undefined,
        nextQuestion,
      };
      setMessages((prev) => [...prev, assistantMsg]);

      if (feedback) {
        const newScores = [...scores, feedback.score];
        const newFeedbacks = [...feedbacks, feedback];
        setScores(newScores);
        setFeedbacks(newFeedbacks);
        const newCount = questionCount + (questionCount < TOTAL_QUESTIONS ? 1 : 0);
        setQuestionCount(newCount);

        if (newScores.length >= TOTAL_QUESTIONS) {
          setTimeout(() => {
            navigate("/summary", {
              state: { setup, scores: newScores, feedbacks: newFeedbacks },
            });
          }, 1500);
        }
      }
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: `Error: ${err.message}` },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const scoreColor = (score: number) =>
    score >= 8 ? "border-score-high bg-score-high/10" : score >= 5 ? "border-score-mid bg-score-mid/10" : "border-score-low bg-score-low/10";

  const scoreTextColor = (score: number) =>
    score >= 8 ? "score-high" : score >= 5 ? "score-mid" : "score-low";

  const scoreGlow = (score: number) =>
    score >= 8 ? "glow-score-high" : score >= 5 ? "glow-score-mid" : "glow-score-low";

  if (!setup) return null;

  return (
    <div className="min-h-screen flex flex-col bg-background relative">
      <div className="fixed inset-0 bg-grid opacity-20 pointer-events-none" />

      {/* Header */}
      <header className="relative z-10 border-b glass-border px-6 py-3 flex items-center justify-between shrink-0 glass">
        <div className="flex items-center gap-2.5">
          <LogoBrand />
          <div className="hidden sm:flex items-center gap-1.5 ml-3">
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
              {setup.role}
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground font-medium">
              {setup.type}
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground font-medium">
              {setup.difficulty}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-muted-foreground font-mono">
            {Math.min(scores.length + 1, TOTAL_QUESTIONS)}/{TOTAL_QUESTIONS}
          </span>
        </div>
      </header>

      {/* Progress */}
      <div className="relative z-10 px-6 pt-3">
        <Progress
          value={(scores.length / TOTAL_QUESTIONS) * 100}
          className="h-1"
        />
      </div>

      {/* Chat */}
      <div className="relative z-10 flex-1 overflow-y-auto px-4 py-6 space-y-5 max-w-3xl mx-auto w-full">
        <AnimatePresence>
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              variants={msgVariants}
              initial="hidden"
              animate="visible"
            >
              <div className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                {msg.role === "assistant" && (
                  <div className="h-7 w-7 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0 mt-1">
                    <Bot className="h-3.5 w-3.5 text-primary" />
                  </div>
                )}
                <div
                  className={`max-w-[78%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                    msg.role === "user"
                      ? "bg-primary text-primary-foreground rounded-br-md"
                      : "glass glass-border rounded-bl-md"
                  }`}
                >
                  {msg.feedback ? (
                    <div className="space-y-3">
                      <div className={`rounded-xl border p-3.5 space-y-2.5 ${scoreColor(msg.feedback.score)} ${scoreGlow(msg.feedback.score)}`}>
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                            Feedback
                          </span>
                          <span className={`text-xl font-black font-mono ${scoreTextColor(msg.feedback.score)}`}>
                            {msg.feedback.score}/10
                          </span>
                        </div>
                        <div className="space-y-0.5">
                          <span className="text-[10px] font-bold uppercase tracking-wider score-high">Strength</span>
                          <p className="text-xs text-foreground/80">{msg.feedback.strength}</p>
                        </div>
                        <div className="space-y-0.5">
                          <span className="text-[10px] font-bold uppercase tracking-wider score-low">Gap</span>
                          <p className="text-xs text-foreground/80">{msg.feedback.gap}</p>
                        </div>
                        {msg.feedback.idealAnswer && (
                          <div className="space-y-0.5">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Ideal</span>
                            <p className="text-xs text-foreground/80">{msg.feedback.idealAnswer}</p>
                          </div>
                        )}
                      </div>
                      {msg.nextQuestion && (
                        <p className="text-sm leading-relaxed">{msg.nextQuestion}</p>
                      )}
                    </div>
                  ) : (
                    <p>{msg.content}</p>
                  )}
                </div>
                {msg.role === "user" && (
                  <div className="h-7 w-7 rounded-lg bg-muted flex items-center justify-center shrink-0 mt-1">
                    <User className="h-3.5 w-3.5 text-muted-foreground" />
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        {loading && (
          <motion.div
            className="flex gap-3 justify-start"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="h-7 w-7 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0 mt-1">
              <Bot className="h-3.5 w-3.5 text-primary" />
            </div>
            <div className="glass glass-border rounded-2xl rounded-bl-md px-4 py-3 flex items-center gap-2.5 text-sm text-muted-foreground">
              <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
              Thinking…
            </div>
          </motion.div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Input */}
      <div className="relative z-10 border-t glass-border px-4 py-3 shrink-0 glass">
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
                key="text-input"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="flex gap-2 items-end"
              >
                <div className="relative flex-1">
                  <Textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder={
                      scores.length >= TOTAL_QUESTIONS
                        ? "Interview complete!"
                        : "Type your answer…"
                    }
                    disabled={loading || scores.length >= TOTAL_QUESTIONS}
                    rows={2}
                    className="resize-none pr-12 text-sm bg-background/50 rounded-xl max-h-32 overflow-y-auto scrollbar-custom"
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSend();
                      }
                    }}
                  />
                  {supported && (
                    <button
                      type="button"
                      onClick={startListening}
                      disabled={loading || scores.length >= TOTAL_QUESTIONS}
                      className="absolute right-2 bottom-2 p-1.5 rounded-lg hover:bg-muted transition-colors"
                    >
                      <Mic className="h-4 w-4 text-muted-foreground" />
                    </button>
                  )}
                </div>
                <Button
                  onClick={handleSend}
                  disabled={!input.trim() || loading || scores.length >= TOTAL_QUESTIONS}
                  size="icon"
                  className="h-10 w-10 shrink-0 rounded-xl glow-primary-sm"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default Interview;
