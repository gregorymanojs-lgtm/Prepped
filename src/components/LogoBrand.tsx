import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Sparkles, Terminal } from "lucide-react";

interface LogoBrandProps {
  size?: "sm" | "md" | "lg";
  subtitle?: boolean;
}

const LogoBrand = ({ size = "sm", subtitle = false }: LogoBrandProps) => {
  const navigate = useNavigate();

  const iconSizes = {
    sm: "h-7 w-7 rounded-lg text-xs",
    md: "h-9 w-9 rounded-xl text-sm",
    lg: "h-11 w-11 rounded-2xl text-base",
  };

  const textSizes = {
    sm: "text-base tracking-widest",
    md: "text-xl tracking-wider",
    lg: "text-3xl tracking-widest",
  };

  return (
    <motion.button
      onClick={() => navigate("/")}
      className="flex items-center gap-2.5 group cursor-pointer text-left select-none"
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <div
        className={`${iconSizes[size]} relative bg-gradient-to-tr from-primary to-accent flex items-center justify-center font-bold text-white shadow-lg shadow-primary/25 group-hover:shadow-primary/50 group-hover:scale-105 transition-all duration-300`}
      >
        <Terminal className="h-4 w-4 text-primary-foreground stroke-[2.5]" />
        <span className="absolute -top-1 -right-1 flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
        </span>
      </div>

      <div className="flex flex-col">
        <div className="flex items-center gap-1.5">
          <span className={`${textSizes[size]} font-black font-display uppercase tracking-wider`}>
            {"PREPPED".split("").map((letter, i) => (
              <span
                key={i}
                className="inline-block gradient-text transition-transform duration-200 group-hover:-translate-y-0.5"
                style={{ transitionDelay: `${i * 20}ms` }}
              >
                {letter}
              </span>
            ))}
          </span>
          <span className="text-[9px] font-bold px-1.5 py-0.2 uppercase rounded bg-primary/15 text-primary border border-primary/20 tracking-wider">
            AI
          </span>
        </div>
        {subtitle && (
          <span className="text-[11px] text-muted-foreground flex items-center gap-1">
            <Sparkles className="h-2.5 w-2.5 text-primary" />
            Adaptive Interview Coach
          </span>
        )}
      </div>
    </motion.button>
  );
};

export default LogoBrand;
