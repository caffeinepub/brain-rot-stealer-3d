import { Button } from "@/components/ui/button";
import { Shield, Trophy, Zap } from "lucide-react";
import { motion } from "motion/react";
import { useCallback, useRef, useState } from "react";
import {
  useGetCharacters,
  useGetLeaderboard,
  useStealCharacter,
} from "../hooks/useQueries";
import {
  DEFAULT_CHARACTERS,
  backendCharToGame,
  saveScore,
} from "../types/game";
import type { BrainRotCharacter } from "../types/game";
import BrainRotScene from "./BrainRotScene";
import FloatingScore from "./FloatingScore";
import LeaderboardModal from "./LeaderboardModal";

interface FloatingPop {
  id: string;
  points: number;
  x: number;
  y: number;
}

interface GamePageProps {
  onNavigateAdmin: () => void;
}

let popIdCounter = 0;

export default function GamePage({ onNavigateAdmin }: GamePageProps) {
  const [score, setScore] = useState(0);
  const [stolen, setStolen] = useState(0);
  const [leaderboardOpen, setLeaderboardOpen] = useState(false);
  const [floatingPops, setFloatingPops] = useState<FloatingPop[]>([]);
  const [combo, setCombo] = useState(0);
  const comboTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const sessionId = useRef(`player_${Date.now()}`);

  // ── Backend data ──────────────────────────────────────────────────────────
  const { data: backendChars, isLoading: charsLoading } = useGetCharacters();
  const {
    data: leaderboardData,
    isLoading: lbLoading,
    refetch: refetchLeaderboard,
  } = useGetLeaderboard(leaderboardOpen);
  const stealMutation = useStealCharacter();

  // Map backend characters to game format; fall back to defaults while loading
  const characters: BrainRotCharacter[] =
    backendChars && backendChars.length > 0
      ? backendChars.filter((c) => c.active).map(backendCharToGame)
      : DEFAULT_CHARACTERS;

  // ── Steal handler ─────────────────────────────────────────────────────────
  const handleSteal = useCallback(
    (characterId: bigint, localPoints: number) => {
      // Combo system
      if (comboTimer.current) clearTimeout(comboTimer.current);
      setCombo((prev) => prev + 1);
      comboTimer.current = setTimeout(() => setCombo(0), 3000);

      const multiplier = combo >= 4 ? 3 : combo >= 2 ? 2 : 1;

      // Optimistically update score with local points × combo
      const optimisticEarned = localPoints * multiplier;
      setScore((prev) => prev + optimisticEarned);
      setStolen((prev) => prev + 1);

      // Show floating score pop immediately (optimistic)
      const popX =
        Math.random() * (window.innerWidth * 0.5) + window.innerWidth * 0.25;
      const popY =
        Math.random() * (window.innerHeight * 0.4) + window.innerHeight * 0.3;
      const popId = `pop_${++popIdCounter}`;
      setFloatingPops((prev) => [
        ...prev,
        { id: popId, points: optimisticEarned, x: popX, y: popY },
      ]);

      // Fire backend call — update score with actual server value if different
      stealMutation.mutate(characterId, {
        onSuccess: (actualPoints) => {
          const actualEarned = Number(actualPoints) * multiplier;
          // Reconcile if server points differ
          if (actualEarned !== optimisticEarned) {
            setScore((prev) => prev - optimisticEarned + actualEarned);
          }
          // Persist to localStorage for offline leaderboard fallback
          setStolen((prev) => {
            saveScore({
              id: sessionId.current,
              name: "YOU",
              score: score + actualEarned,
              stolen: prev,
              timestamp: Date.now(),
            });
            return prev;
          });
        },
        onError: () => {
          // Rollback optimistic update on error
          setScore((prev) => prev - optimisticEarned);
          setStolen((prev) => Math.max(0, prev - 1));
        },
      });
    },
    [combo, score, stealMutation],
  );

  const removePop = useCallback((id: string) => {
    setFloatingPops((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const handleOpenLeaderboard = () => {
    setLeaderboardOpen(true);
    refetchLeaderboard();
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#050510]">
      {/* 3D Canvas */}
      <div
        data-ocid="game.canvas_target"
        className="absolute inset-0 w-full h-full"
      >
        {!charsLoading && (
          <BrainRotScene characters={characters} onSteal={handleSteal} />
        )}
        {charsLoading && (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-center">
              <div className="text-primary neon-text-lime font-display font-bold text-2xl animate-pulse">
                Loading Brain Rot...
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Scanline overlay */}
      <div className="absolute inset-0 pointer-events-none scanline-bg opacity-20" />

      {/* HUD - Top bar */}
      <div className="absolute top-0 left-0 right-0 flex items-start justify-between p-4 pointer-events-none">
        {/* Title */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-panel rounded-xl px-4 py-2"
        >
          <h1 className="font-display font-extrabold text-xl md:text-2xl neon-text-lime text-primary leading-tight">
            BRAIN ROT
          </h1>
          <h2 className="font-display font-bold text-xs md:text-sm text-secondary neon-text-pink leading-none">
            STEALER 3D
          </h2>
        </motion.div>

        {/* Score */}
        <motion.div
          data-ocid="game.score.panel"
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-panel rounded-xl px-4 py-2 text-right"
        >
          <div className="font-display font-bold text-2xl text-primary neon-text-lime">
            {score.toLocaleString()}
          </div>
          <div className="text-xs text-muted-foreground font-body">
            <span className="text-accent">{stolen}</span> stolen
            {combo >= 2 && (
              <span className="ml-2 text-secondary font-bold animate-pulse neon-text-pink">
                x{combo} COMBO!
              </span>
            )}
          </div>
        </motion.div>
      </div>

      {/* HUD Buttons - Bottom center */}
      <motion.div
        className="absolute bottom-8 left-0 right-0 flex flex-col items-center gap-4 pointer-events-auto"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <p className="text-center font-display font-bold text-base text-muted-foreground neon-text-cyan px-4">
          <Zap className="inline w-4 h-4 text-primary mr-1" />
          Click the brain rot to steal their drip!
        </p>

        <div className="flex gap-3">
          <Button
            data-ocid="game.leaderboard.open_modal_button"
            onClick={handleOpenLeaderboard}
            className="glass-panel border border-primary/30 text-primary hover:bg-primary/10 font-display font-bold gap-2 neon-border-lime"
            variant="outline"
          >
            <Trophy className="w-4 h-4" />
            Leaderboard
          </Button>

          <Button
            data-ocid="game.admin.link"
            onClick={onNavigateAdmin}
            className="glass-panel border border-secondary/30 text-secondary hover:bg-secondary/10 font-display font-bold gap-2 neon-border-pink"
            variant="outline"
          >
            <Shield className="w-4 h-4" />
            Admin Panel
          </Button>
        </div>
      </motion.div>

      {/* Floating score pops */}
      {floatingPops.map((pop) => (
        <FloatingScore
          key={pop.id}
          id={pop.id}
          points={pop.points}
          x={pop.x}
          y={pop.y}
          onDone={removePop}
        />
      ))}

      {/* Leaderboard Modal */}
      <LeaderboardModal
        open={leaderboardOpen}
        onClose={() => setLeaderboardOpen(false)}
        leaderboardData={leaderboardData ?? null}
        isLoading={lbLoading}
        currentScore={score}
        stolen={stolen}
      />
    </div>
  );
}
