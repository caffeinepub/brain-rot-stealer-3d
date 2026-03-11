import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";

interface FloatingScorepProps {
  id: string;
  points: number;
  x: number;
  y: number;
  onDone: (id: string) => void;
}

export default function FloatingScore({
  id,
  points,
  x,
  y,
  onDone,
}: FloatingScorepProps) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(() => onDone(id), 400);
    }, 800);
    return () => clearTimeout(timer);
  }, [id, onDone]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 1, y: 0, scale: 1 }}
          animate={{ opacity: 0, y: -60, scale: 1.4 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.9, ease: "easeOut" }}
          style={{ left: x, top: y, position: "fixed" }}
          className="pointer-events-none z-50 font-display font-bold text-2xl"
        >
          <span className="neon-text-lime text-primary">+{points} pts!</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
