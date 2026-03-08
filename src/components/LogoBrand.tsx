import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Zap } from "lucide-react";

const LogoBrand = ({ size = "sm" }: { size?: "sm" | "lg" }) => {
  const navigate = useNavigate();
  const isLarge = size === "lg";

  return (
    <motion.button
      onClick={() => navigate("/")}
      className="flex items-center gap-2.5 group cursor-pointer"
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
    >
      <motion.div
        className={`${isLarge ? "h-10 w-10" : "h-7 w-7"} rounded-lg bg-primary flex items-center justify-center glow-primary-sm group-hover:glow-primary transition-shadow duration-300`}
        whileHover={{ rotate: 10 }}
      >
        <Zap className={`${isLarge ? "h-5 w-5" : "h-3.5 w-3.5"} text-primary-foreground`} />
      </motion.div>
      <span className={`${isLarge ? "text-2xl" : "text-sm"} font-black tracking-widest font-display uppercase`}>
        {"PREPPED".split("").map((letter, i) => (
          <motion.span
            key={i}
            className="inline-block gradient-text"
            whileHover={{ y: -2 }}
            transition={{ type: "spring", stiffness: 500, damping: 20 }}
          >
            {letter}
          </motion.span>
        ))}
      </span>
    </motion.button>
  );
};

export default LogoBrand;
