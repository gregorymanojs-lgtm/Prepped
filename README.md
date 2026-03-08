# PREPPED — AI Mock Interview Practice

Practice interviews with an AI that adapts to your role, gives real feedback, and tracks your progress. Walk in ready.

## Features

- **AI Interviewer** — Powered by Groq LLMs that adapt questions to your role, level, and resume
- **Voice Input** — Speak your answers naturally with real-time waveform visualization and transcription
- **Instant Feedback** — Get scored on each answer with detailed strengths, gaps, and ideal responses
- **Resume-Aware** — Upload your PDF resume and get questions tailored to your actual experience
- **Study Plan** — Receive personalized study recommendations based on your weak areas
- **Progress Tracking** — Monitor your scores over time and see improvement across sessions

## Tech Stack

- React + TypeScript + Vite
- Tailwind CSS + shadcn/ui
- Framer Motion
- Groq API (LLaMA 3.3 70B)
- Web Speech API (voice input)
- pdfjs-dist (resume parsing)

## Getting Started

### Prerequisites

- Node.js 18+
- A free [Groq API key](https://console.groq.com)

### Installation

```bash
git clone https://github.com/your-username/prepped.git
cd prepped
npm install
```

### Environment Variables

Create a `.env` file in the root directory:

```env
VITE_GROQ_API_KEY=gsk_your_api_key_here
```

### Development

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Build

```bash
npm run build
```

## Deploying to Vercel

1. Push your repo to GitHub
2. Import the project in [Vercel](https://vercel.com)
3. Add `VITE_GROQ_API_KEY` to Environment Variables in project settings
4. Deploy

## License

MIT
