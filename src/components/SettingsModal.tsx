import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { getGroqApiKey, setGroqApiKey } from "@/lib/groq";
import { playSound } from "@/lib/sound";
import { Key, Volume2, VolumeX, Mic, CheckCircle2, Sparkles, ExternalLink, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface SettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const SettingsModal = ({ open, onOpenChange }: SettingsModalProps) => {
  const [apiKey, setApiKeyInput] = useState("");
  const [isSaved, setIsSaved] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [ttsEnabled, setTtsEnabled] = useState(true);

  useEffect(() => {
    if (open) {
      const current = getGroqApiKey() || "";
      setApiKeyInput(current);
      setIsSaved(Boolean(current));
      setSoundEnabled(localStorage.getItem("prepped_sound_muted") !== "true");
      setTtsEnabled(localStorage.getItem("prepped_tts_muted") !== "true");
    }
  }, [open]);

  const handleSaveKey = () => {
    setGroqApiKey(apiKey);
    setIsSaved(Boolean(apiKey.trim()));
    playSound("success");
    toast.success(apiKey.trim() ? "Groq API key saved successfully!" : "Using built-in simulation mode");
  };

  const handleToggleSound = (checked: boolean) => {
    setSoundEnabled(checked);
    localStorage.setItem("prepped_sound_muted", checked ? "false" : "true");
    if (checked) playSound("click");
  };

  const handleToggleTts = (checked: boolean) => {
    setTtsEnabled(checked);
    localStorage.setItem("prepped_tts_muted", checked ? "false" : "true");
  };

  const handleClearHistory = () => {
    if (confirm("Are you sure you want to clear your interview history?")) {
      localStorage.removeItem("prepped_history");
      toast.success("History cleared");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-card/95 border-border backdrop-blur-2xl p-6 rounded-2xl shadow-2xl">
        <DialogHeader className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              <Sparkles className="h-4 w-4" />
            </div>
            <DialogTitle className="text-xl font-bold font-display">Preferences & AI Engine</DialogTitle>
          </div>
          <DialogDescription className="text-xs text-muted-foreground">
            Configure your AI connection, voice synthesis, and sound preferences.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 pt-3">
          {/* Status badge */}
          <div className="rounded-xl border border-border/80 bg-background/50 p-3.5 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className={`h-2.5 w-2.5 rounded-full ${isSaved ? "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]" : "bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.6)]"} animate-pulse`} />
              <div>
                <p className="text-xs font-semibold">
                  {isSaved ? "Groq LLaMA 3.3 70B Active" : "Interactive Simulation Mode"}
                </p>
                <p className="text-[11px] text-muted-foreground">
                  {isSaved ? "Direct low-latency AI inference" : "No API key required — ready to practice"}
                </p>
              </div>
            </div>
            {isSaved && <CheckCircle2 className="h-4 w-4 text-emerald-400" />}
          </div>

          {/* Groq API Key */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold flex items-center gap-1.5">
                <Key className="h-3.5 w-3.5" />
                Groq API Key
              </Label>
              <a
                href="https://console.groq.com/keys"
                target="_blank"
                rel="noreferrer"
                className="text-[11px] text-primary hover:underline inline-flex items-center gap-1"
              >
                Get free key <ExternalLink className="h-3 w-3" />
              </a>
            </div>
            <div className="flex gap-2">
              <Input
                type="password"
                placeholder="gsk_..."
                value={apiKey}
                onChange={(e) => setApiKeyInput(e.target.value)}
                className="bg-background/60 font-mono text-xs rounded-xl"
              />
              <Button size="sm" onClick={handleSaveKey} className="rounded-xl shrink-0 font-medium">
                Save
              </Button>
            </div>
            <p className="text-[11px] text-muted-foreground">
              Stored securely in your browser's localStorage. Never sent to any third-party server.
            </p>
          </div>

          {/* Voice & Sound settings */}
          <div className="space-y-3 pt-2 border-t border-border/60">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-xs font-semibold flex items-center gap-1.5">
                  <Mic className="h-3.5 w-3.5 text-primary" />
                  AI Voice Narration (TTS)
                </Label>
                <p className="text-[11px] text-muted-foreground">Interviewer speaks questions aloud</p>
              </div>
              <Switch checked={ttsEnabled} onCheckedChange={handleToggleTts} />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-xs font-semibold flex items-center gap-1.5">
                  {soundEnabled ? <Volume2 className="h-3.5 w-3.5 text-primary" /> : <VolumeX className="h-3.5 w-3.5 text-muted-foreground" />}
                  Sound Feedback
                </Label>
                <p className="text-[11px] text-muted-foreground">Chimes on score reveal and milestones</p>
              </div>
              <Switch checked={soundEnabled} onCheckedChange={handleToggleSound} />
            </div>
          </div>

          {/* Danger zone */}
          <div className="pt-2 border-t border-border/60 flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Reset saved interview data</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearHistory}
              className="text-destructive hover:bg-destructive/10 text-xs h-8 rounded-lg"
            >
              <Trash2 className="h-3.5 w-3.5 mr-1.5" />
              Clear History
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
