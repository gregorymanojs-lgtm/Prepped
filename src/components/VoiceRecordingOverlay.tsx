import { useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { MicOff } from "lucide-react";

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

  useEffect(() => {
    if (!isListening || !analyserNode || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const bufferLength = analyserNode.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      animFrameRef.current = requestAnimationFrame(draw);
      analyserNode.getByteFrequencyData(dataArray);

      const dpr = window.devicePixelRatio || 1;
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.scale(dpr, dpr);

      ctx.clearRect(0, 0, w, h);

      const barCount = 40;
      const gap = 3;
      const totalGaps = (barCount - 1) * gap;
      const barWidth = (w - totalGaps) / barCount;
      const centerY = h / 2;

      for (let i = 0; i < barCount; i++) {
        const dataIndex = Math.floor((i / barCount) * bufferLength);
        const value = dataArray[dataIndex] / 255;
        const barHeight = Math.max(3, value * centerY * 0.9);

        const x = i * (barWidth + gap);
        const hue = 200;
        const lightness = 50 + value * 15;

        ctx.fillStyle = `hsla(${hue}, 100%, ${lightness}%, ${0.5 + value * 0.5})`;
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="glass glass-border rounded-2xl p-4 space-y-3"
    >
      {/* Waveform */}
      <canvas
        ref={canvasRef}
        className="w-full h-16 rounded-lg"
        style={{ display: "block" }}
      />

      {/* Live transcript */}
      <div className="max-h-20 overflow-y-auto scrollbar-thin">
        <p className="text-sm text-foreground/80 leading-relaxed">
          {transcript || (
            <span className="text-muted-foreground italic">Listening…</span>
          )}
        </p>
      </div>

      {/* Stop button */}
      <button
        type="button"
        onClick={onStop}
        className="w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm font-medium hover:bg-destructive/20 transition-colors"
      >
        <MicOff className="h-4 w-4" />
        Stop Recording
      </button>
    </motion.div>
  );
};

export default VoiceRecordingOverlay;
