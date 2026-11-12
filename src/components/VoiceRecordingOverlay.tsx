import { useRef, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { MicOff, Radio, Volume2 } from "lucide-react";

interface VoiceRecordingOverlayProps {
  isListening: boolean;
  transcript: string;
  analyserNode: AnalyserNode | null;
  onStop: () => void;
}

const VoiceRecordingOverlay = ({
  isListening,
  transcript,
  analyserNode,
  onStop,
}: VoiceRecordingOverlayProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number>(0);
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    if (!isListening) {
      setSeconds(0);
      return;
    }
    const interval = setInterval(() => {
      setSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isListening]);

  useEffect(() => {
    if (!isListening || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.scale(dpr, dpr);

    const bufferLength = analyserNode ? analyserNode.frequencyBinCount : 32;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      animFrameRef.current = requestAnimationFrame(draw);
      if (analyserNode) {
        analyserNode.getByteFrequencyData(dataArray);
      } else {
        // Fallback animated wave if analyserNode is not ready
        for (let j = 0; j < 32; j++) {
          dataArray[j] = Math.sin(Date.now() / 200 + j) * 80 + 90;
        }
      }

      ctx.clearRect(0, 0, w, h);

      const barCount = 48;
      const gap = 3;
      const totalGaps = (barCount - 1) * gap;
      const barWidth = Math.max(2, (w - totalGaps) / barCount);
      const centerY = h / 2;

      for (let i = 0; i < barCount; i++) {
        const dataIndex = Math.floor((i / barCount) * (bufferLength / 2));
        const rawValue = dataArray[dataIndex] || 0;
        const normalized = rawValue / 255;
        const barHeight = Math.max(4, normalized * centerY * 0.95);

        const x = i * (barWidth + gap);

        // Dynamic electric gradient
        const gradient = ctx.createLinearGradient(0, centerY - barHeight, 0, centerY + barHeight);
        gradient.addColorStop(0, "rgba(56, 189, 248, 0.9)");
        gradient.addColorStop(0.5, "rgba(129, 140, 248, 0.8)");
        gradient.addColorStop(1, "rgba(56, 189, 248, 0.9)");

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.roundRect(x, centerY - barHeight, barWidth, barHeight * 2, barWidth / 2);
        ctx.fill();
      }
    };

    draw();

    return () => {
      cancelAnimationFrame(animFrameRef.current);
    };
  }, [isListening, analyserNode]);

  if (!isListening) return null;

  const formatTime = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const s = sec % 60;
    return `${mins}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98, y: 15 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.98, y: 15 }}
      className="rounded-2xl border border-primary/40 bg-card/95 backdrop-blur-2xl p-4 sm:p-5 space-y-3.5 shadow-2xl glow-primary"
    >
      {/* Recording status header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="flex h-3 w-3 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-500 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500"></span>
          </span>
          <span className="text-xs font-bold uppercase tracking-wider text-rose-400 flex items-center gap-1.5">
            <Radio className="h-3.5 w-3.5" />
            Live Voice Transcription
          </span>
        </div>
        <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20">
          {formatTime(seconds)}
        </span>
      </div>

      {/* Waveform Canvas */}
      <div className="rounded-xl bg-background/60 border border-border/70 p-2 overflow-hidden">
        <canvas ref={canvasRef} className="w-full h-16 rounded-lg block" />
      </div>

      {/* Live transcript text */}
      <div className="min-h-12 max-h-24 overflow-y-auto rounded-xl bg-background/40 border border-border/50 p-3 text-xs leading-relaxed scrollbar-custom">
        {transcript ? (
          <p className="text-foreground/90 font-normal">{transcript}</p>
        ) : (
          <p className="text-muted-foreground italic flex items-center gap-2">
            <Volume2 className="h-3.5 w-3.5 animate-pulse text-primary" />
            Listening... Speak clearly into your microphone
          </p>
        )}
      </div>

      {/* Action controls */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={onStop}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white text-xs font-bold shadow-lg shadow-rose-500/20 transition-all hover:scale-[1.01]"
        >
          <MicOff className="h-4 w-4" />
          Stop & Keep Answer
        </button>
      </div>
    </motion.div>
  );
};

export default VoiceRecordingOverlay;
