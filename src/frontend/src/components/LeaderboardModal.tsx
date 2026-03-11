import { Button } from "@/components/ui/button";
import { Loader2, Skull, Trophy, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import type { LeaderboardEntry } from "../hooks/useQueries";
import { loadScores } from "../types/game";

interface LeaderboardModalProps {
  open: boolean;
  onClose: () => void;
  leaderboardData: LeaderboardEntry[] | null;
  isLoading: boolean;
  currentScore: number;
  stolen: number;
}

const RANK_COLORS = ["#ffd700", "#c0c0c0", "#cd7f32", "#00ff88", "#ff00cc"];
const RANK_ICONS = ["🥇", "🥈", "🥉", "4️⃣", "5️⃣", "6️⃣", "7️⃣", "8️⃣", "9️⃣", "🔟"];

/** Shorten a principal string: first 5 chars … last 3 chars */
function shortPrincipal(p: string): string {
  if (p.length <= 12) return p;
  return `${p.slice(0, 5)}…${p.slice(-3)}`;
}

interface DisplayEntry {
  key: string;
  name: string;
  score: number;
  stolen: number;
  isCurrentRun: boolean;
}

export default function LeaderboardModal({
  open,
  onClose,
  leaderboardData,
  isLoading,
  currentScore,
  stolen,
}: LeaderboardModalProps) {
  // Build display list: prefer backend data, fall back to localStorage
  const buildEntries = (): DisplayEntry[] => {
    let entries: DisplayEntry[] = [];

    if (leaderboardData && leaderboardData.length > 0) {
      entries = leaderboardData.map((e) => ({
        key: e.principal,
        name: shortPrincipal(e.principal),
        score: Number(e.score),
        stolen: Number(e.stolenCount),
        isCurrentRun: false,
      }));
    } else {
      // Fallback to localStorage
      const localScores = loadScores();
      entries = localScores.map((s) => ({
        key: s.id,
        name: s.name,
        score: s.score,
        stolen: s.stolen,
        isCurrentRun: false,
      }));
    }

    // Inject current session score if non-zero
    if (currentScore > 0) {
      entries.push({
        key: "current_run",
        name: "YOU (this run)",
        score: currentScore,
        stolen,
        isCurrentRun: true,
      });
    }

    return entries.sort((a, b) => b.score - a.score).slice(0, 10);
  };

  const allEntries = buildEntries();

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* Modal */}
          <motion.div
            data-ocid="leaderboard.modal"
            className="relative z-10 w-full max-w-md mx-4 glass-panel rounded-2xl overflow-hidden"
            initial={{ scale: 0.7, y: 60, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.8, y: 40, opacity: 0 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
          >
            {/* Header */}
            <div className="relative px-6 pt-6 pb-4 border-b border-primary/20">
              <div className="flex items-center gap-3">
                <Trophy className="text-primary w-7 h-7" />
                <h2 className="font-display font-bold text-2xl neon-text-lime text-primary">
                  LEADERBOARD
                </h2>
              </div>
              <p className="text-muted-foreground text-sm mt-1 font-body">
                Top brain rot stealers 🧠
              </p>
              <Button
                data-ocid="leaderboard.close_button"
                variant="ghost"
                size="icon"
                className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
                onClick={onClose}
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Scores */}
            <div className="px-6 py-4 space-y-2 max-h-80 overflow-y-auto">
              {isLoading ? (
                <div className="flex items-center justify-center py-8 text-muted-foreground gap-2">
                  <Loader2 className="w-5 h-5 animate-spin text-primary" />
                  <span className="font-body">Loading scores...</span>
                </div>
              ) : allEntries.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Skull className="mx-auto w-8 h-8 mb-2 opacity-50" />
                  <p>No scores yet... steal some brain rot!</p>
                </div>
              ) : (
                allEntries.map((entry, index) => (
                  <motion.div
                    key={entry.key}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`flex items-center justify-between p-3 rounded-lg ${
                      entry.isCurrentRun
                        ? "bg-primary/10 border border-primary/40"
                        : "bg-muted/30"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xl w-8 text-center">
                        {RANK_ICONS[index]}
                      </span>
                      <span
                        className="font-display font-semibold text-sm"
                        style={{ color: RANK_COLORS[index] ?? "#ffffff" }}
                      >
                        {entry.name}
                      </span>
                    </div>
                    <div className="text-right">
                      <div className="font-display font-bold text-primary neon-text-lime">
                        {entry.score.toLocaleString()} pts
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {entry.stolen} stolen
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>

            {/* Footer */}
            <div className="px-6 pb-5 pt-2">
              <Button
                data-ocid="leaderboard.close_button"
                className="w-full font-display font-bold bg-primary text-primary-foreground hover:bg-primary/80 neon-border-lime"
                onClick={onClose}
              >
                BACK TO STEALING
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
