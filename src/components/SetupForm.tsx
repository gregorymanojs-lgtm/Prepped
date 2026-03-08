import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { InterviewSetup } from "@/lib/types";
import { ArrowRight, Upload, FileText, X } from "lucide-react";
import * as pdfjsLib from "pdfjs-dist";

pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.4.168/pdf.worker.min.mjs`;

const ROLES = [
  "Software Engineer",
  "Product Manager",
  "Data Scientist",
  "Designer",
  "Marketing",
];
const TYPES = ["Behavioral", "Technical", "System Design", "Salary Negotiation"];
const DIFFICULTIES = ["Junior", "Mid", "Senior", "Staff"];

const SetupForm = () => {
  const navigate = useNavigate();
  const [role, setRole] = useState("");
  const [customRole, setCustomRole] = useState("");
  const [type, setType] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [resumeText, setResumeText] = useState("");
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [parsingResume, setParsingResume] = useState(false);

  const effectiveRole = role === "custom" ? customRole : role;
  const canStart = effectiveRole && type && difficulty;

  const handleStart = () => {
    if (!canStart) return;
    const setup: InterviewSetup = {
      role: effectiveRole,
      type,
      difficulty,
      jobDescription,
      resumeText,
    };
    navigate("/interview", { state: { setup } });
  };

  return (
    <div className="space-y-5 glass glass-border rounded-2xl p-6 card-hover">
      {/* Role */}
      <div className="space-y-2">
        <Label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Job Role</Label>
        <Select value={role} onValueChange={setRole}>
          <SelectTrigger className="bg-background/50">
            <SelectValue placeholder="Select a role" />
          </SelectTrigger>
          <SelectContent>
            {ROLES.map((r) => (
              <SelectItem key={r} value={r}>
                {r}
              </SelectItem>
            ))}
            <SelectItem value="custom">Custom…</SelectItem>
          </SelectContent>
        </Select>
        {role === "custom" && (
          <Input
            placeholder="Enter custom role"
            value={customRole}
            onChange={(e) => setCustomRole(e.target.value)}
            className="mt-2 bg-background/50"
          />
        )}
      </div>

      {/* Type & Difficulty */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Type</Label>
          <Select value={type} onValueChange={setType}>
            <SelectTrigger className="bg-background/50">
              <SelectValue placeholder="Select" />
            </SelectTrigger>
            <SelectContent>
              {TYPES.map((t) => (
                <SelectItem key={t} value={t}>
                  {t}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Level</Label>
          <Select value={difficulty} onValueChange={setDifficulty}>
            <SelectTrigger className="bg-background/50">
              <SelectValue placeholder="Select" />
            </SelectTrigger>
            <SelectContent>
              {DIFFICULTIES.map((d) => (
                <SelectItem key={d} value={d}>
                  {d}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Job Description */}
      <div className="space-y-2">
        <Label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
          Job Description{" "}
          <span className="normal-case tracking-normal font-normal">(optional)</span>
        </Label>
        <Textarea
          placeholder="Paste the job description here…"
          value={jobDescription}
          onChange={(e) => setJobDescription(e.target.value)}
          rows={3}
          className="bg-background/50"
        />
      </div>

      {/* Resume Upload */}
      <div className="space-y-2">
        <Label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
          Resume{" "}
          <span className="normal-case tracking-normal font-normal">(optional — PDF)</span>
        </Label>
        {resumeFile ? (
          <div className="flex items-center gap-2 rounded-lg border border-primary/20 bg-primary/5 px-3 py-2.5 text-sm">
            <FileText className="h-4 w-4 text-primary shrink-0" />
            <span className="truncate flex-1 text-xs">{resumeFile.name}</span>
            <button
              type="button"
              onClick={() => { setResumeFile(null); setResumeText(""); }}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ) : (
          <label className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border hover:border-primary/40 bg-background/30 hover:bg-primary/5 cursor-pointer transition-all duration-300 px-4 py-6 group">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
              <Upload className="h-4 w-4 text-primary" />
            </div>
            <span className="text-xs text-muted-foreground group-hover:text-foreground transition-colors">
              {parsingResume ? "Parsing PDF…" : "Click to upload PDF"}
            </span>
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
                    text += content.items.map((item: any) => item.str).join(" ") + "\n";
                  }
                  setResumeText(text.trim());
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
        {resumeText && (
          <p className="text-[11px] text-muted-foreground flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-primary inline-block" />
            Resume parsed — {resumeText.split(/\s+/).length} words extracted
          </p>
        )}
      </div>

      {/* Start */}
      <Button
        className="w-full h-12 text-base font-semibold glow-primary rounded-xl transition-all duration-300 hover:scale-[1.02]"
        disabled={!canStart}
        onClick={handleStart}
      >
        Start Interview
        <ArrowRight className="h-4 w-4 ml-2" />
      </Button>
    </div>
  );
};

export default SetupForm;