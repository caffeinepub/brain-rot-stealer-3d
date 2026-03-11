import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  Gamepad2,
  Loader2,
  Plus,
  RefreshCw,
  Shield,
  Trash2,
  Users,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import {
  useAddCharacter,
  useGetCharacters,
  useGetLeaderboard,
  useIsCallerAdmin,
  useRemoveCharacter,
  useResetAllScores,
} from "../hooks/useQueries";

const ADMIN_PASSWORD = "brainrot2025";

interface AdminPanelProps {
  onBack: () => void;
}

// ─── Login Screen ────────────────────────────────────────────────────────────

function LoginScreen({ onLogin }: { onLogin: () => void }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [shake, setShake] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      onLogin();
    } else {
      setError("Wrong password! Did you even try? 💀");
      setShake(true);
      setTimeout(() => setShake(false), 600);
      setPassword("");
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.8, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: "spring", damping: 20 }}
        className={`w-full max-w-sm glass-panel rounded-2xl p-8 ${shake ? "animate-bounce" : ""}`}
      >
        <div className="text-center mb-8">
          <Shield
            className="mx-auto w-12 h-12 text-secondary mb-3 neon-text-pink"
            style={{ filter: "drop-shadow(0 0 8px oklch(0.65 0.28 340))" }}
          />
          <h1 className="font-display font-extrabold text-2xl text-primary neon-text-lime">
            ADMIN ACCESS
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Top secret brain rot control room
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label className="text-muted-foreground text-xs font-display mb-1.5 block">
              SECRET PASSWORD
            </Label>
            <Input
              data-ocid="admin.password.input"
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError("");
              }}
              placeholder="Enter da password..."
              className="bg-muted/30 border-border focus:border-primary font-body"
              autoFocus
            />
          </div>

          {error && (
            <motion.div
              data-ocid="admin.login.error_state"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 text-destructive text-sm font-body"
            >
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              {error}
            </motion.div>
          )}

          <Button
            data-ocid="admin.login.submit_button"
            type="submit"
            className="w-full font-display font-bold bg-primary text-primary-foreground hover:bg-primary/80 neon-border-lime"
          >
            ENTER THE ZONE
          </Button>
        </form>
      </motion.div>
    </div>
  );
}

// ─── Characters Table ─────────────────────────────────────────────────────────

function CharactersTable() {
  const { data: characters, isLoading, refetch } = useGetCharacters();
  const addMutation = useAddCharacter();
  const removeMutation = useRemoveCharacter();

  const [addOpen, setAddOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newPoints, setNewPoints] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState<bigint | null>(null);

  const activeChars = characters?.filter((c) => c.active) ?? [];

  const addCharacter = async (e: React.FormEvent) => {
    e.preventDefault();
    const pts = Number.parseInt(newPoints, 10);
    if (!newName.trim() || Number.isNaN(pts) || pts < 1) {
      toast.error("Name required and points must be >= 1");
      return;
    }
    try {
      await addMutation.mutateAsync({
        name: newName.trim(),
        pointValue: BigInt(pts),
      });
      setNewName("");
      setNewPoints("");
      setAddOpen(false);
      toast.success("New brain rot added to the roster!");
    } catch {
      toast.error("Failed to add character");
    }
  };

  const deleteChar = async (id: bigint) => {
    try {
      await removeMutation.mutateAsync(id);
      setDeleteConfirm(null);
      toast.success("Character yeeted!");
    } catch {
      toast.error("Failed to remove character");
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Gamepad2 className="text-primary w-5 h-5" />
          <h2 className="font-display font-bold text-lg text-foreground">
            Characters
          </h2>
          {!isLoading && (
            <Badge className="bg-primary/20 text-primary border-primary/30 font-body">
              {activeChars.length} active
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
            onClick={() => refetch()}
            disabled={isLoading}
          >
            <RefreshCw
              className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`}
            />
          </Button>
          <Button
            data-ocid="admin.character.add_button"
            size="sm"
            onClick={() => setAddOpen(true)}
            className="bg-primary text-primary-foreground hover:bg-primary/80 font-display font-bold gap-1 neon-border-lime"
          >
            <Plus className="w-4 h-4" /> Add Character
          </Button>
        </div>
      </div>

      <div
        data-ocid="admin.characters.table"
        className="rounded-xl overflow-hidden border border-border"
      >
        {isLoading ? (
          <div className="flex items-center justify-center py-8 text-muted-foreground gap-2">
            <Loader2 className="w-5 h-5 animate-spin text-primary" />
            <span className="font-body">Loading characters...</span>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/40 border-b border-border">
                <th className="px-4 py-3 text-left font-display font-bold text-muted-foreground text-xs uppercase tracking-wider">
                  Character
                </th>
                <th className="px-4 py-3 text-center font-display font-bold text-muted-foreground text-xs uppercase tracking-wider">
                  Points
                </th>
                <th className="px-4 py-3 text-right font-display font-bold text-muted-foreground text-xs uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {activeChars.length === 0 ? (
                <tr>
                  <td
                    colSpan={3}
                    className="px-4 py-8 text-center text-muted-foreground font-body"
                  >
                    No active characters. Add some brain rot!
                  </td>
                </tr>
              ) : (
                activeChars.map((char, idx) => (
                  <tr
                    key={char.id.toString()}
                    className="bg-card/40 hover:bg-muted/20 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="font-body font-medium text-foreground">
                          {char.name}
                        </span>
                        <span className="text-xs text-muted-foreground font-mono">
                          #{char.id.toString()}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <Badge className="font-display font-bold bg-primary/20 text-primary border-primary/30">
                        {char.pointValue.toString()} pts
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          data-ocid={`admin.character.delete_button.${idx + 1}`}
                          size="icon"
                          variant="ghost"
                          className="h-7 w-7 text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={() => setDeleteConfirm(char.id)}
                          disabled={removeMutation.isPending}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Add Character Dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent
          data-ocid="admin.add_character.dialog"
          className="glass-panel border-border"
        >
          <DialogHeader>
            <DialogTitle className="font-display font-bold text-foreground">
              Add New Brain Rot
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={addCharacter} className="space-y-4 pt-2">
            <div>
              <Label className="text-muted-foreground text-xs font-display mb-1.5 block">
                CHARACTER NAME
              </Label>
              <Input
                data-ocid="admin.add_character.name.input"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="e.g. Rizz Monkey Supreme"
                className="bg-muted/30 border-border font-body"
                autoFocus
              />
            </div>
            <div>
              <Label className="text-muted-foreground text-xs font-display mb-1.5 block">
                POINT VALUE
              </Label>
              <Input
                data-ocid="admin.add_character.points.input"
                type="number"
                value={newPoints}
                onChange={(e) => setNewPoints(e.target.value)}
                placeholder="5-50"
                className="bg-muted/30 border-border font-body"
                min={1}
                max={100}
              />
            </div>
            <DialogFooter className="gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setAddOpen(false)}
                className="font-display font-bold border-border"
              >
                Cancel
              </Button>
              <Button
                data-ocid="admin.add_character.submit_button"
                type="submit"
                disabled={addMutation.isPending}
                className="font-display font-bold bg-primary text-primary-foreground hover:bg-primary/80"
              >
                {addMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : null}
                Add to Roster
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm */}
      <AlertDialog
        open={!!deleteConfirm}
        onOpenChange={() => setDeleteConfirm(null)}
      >
        <AlertDialogContent className="glass-panel border-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-display font-bold text-foreground">
              Yeet this character?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground font-body">
              This brain rot will be permanently removed from the game. No
              take-backs!
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="font-display font-bold border-border">
              Keep it
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/80 font-display font-bold"
              onClick={() =>
                deleteConfirm !== null && deleteChar(deleteConfirm)
              }
              disabled={removeMutation.isPending}
            >
              {removeMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : null}
              YEET!
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// ─── Players Table ────────────────────────────────────────────────────────────

function PlayersTable() {
  const [confirmReset, setConfirmReset] = useState(false);
  const { data: leaderboard, isLoading, refetch } = useGetLeaderboard(true);
  const resetMutation = useResetAllScores();

  const entries = leaderboard ?? [];

  /** Shorten a principal string */
  function shortPrincipal(p: string): string {
    if (p.length <= 14) return p;
    return `${p.slice(0, 6)}…${p.slice(-4)}`;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Users className="text-secondary w-5 h-5" />
          <h2 className="font-display font-bold text-lg text-foreground">
            Player Stats
          </h2>
          {!isLoading && (
            <Badge className="bg-secondary/20 text-secondary border-secondary/30 font-body">
              {entries.length} players
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
            onClick={() => refetch()}
            disabled={isLoading}
          >
            <RefreshCw
              className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`}
            />
          </Button>
          <Button
            data-ocid="admin.reset_scores.delete_button"
            size="sm"
            variant="outline"
            onClick={() => setConfirmReset(true)}
            className="border-destructive/50 text-destructive hover:bg-destructive/10 font-display font-bold gap-1"
          >
            <RefreshCw className="w-4 h-4" /> Reset All
          </Button>
        </div>
      </div>

      <div
        data-ocid="admin.players.table"
        className="rounded-xl overflow-hidden border border-border"
      >
        {isLoading ? (
          <div className="flex items-center justify-center py-8 text-muted-foreground gap-2">
            <Loader2 className="w-5 h-5 animate-spin text-secondary" />
            <span className="font-body">Loading player stats...</span>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/40 border-b border-border">
                <th className="px-4 py-3 text-left font-display font-bold text-muted-foreground text-xs uppercase tracking-wider">
                  Rank
                </th>
                <th className="px-4 py-3 text-left font-display font-bold text-muted-foreground text-xs uppercase tracking-wider">
                  Player (Principal)
                </th>
                <th className="px-4 py-3 text-center font-display font-bold text-muted-foreground text-xs uppercase tracking-wider">
                  Score
                </th>
                <th className="px-4 py-3 text-center font-display font-bold text-muted-foreground text-xs uppercase tracking-wider">
                  Stolen
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {entries.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-4 py-8 text-center text-muted-foreground font-body"
                  >
                    No player data yet. Go steal some brain rot!
                  </td>
                </tr>
              ) : (
                entries.map((entry, idx) => (
                  <tr
                    key={entry.principal}
                    className="bg-card/40 hover:bg-muted/20 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <span className="font-display font-bold text-muted-foreground">
                        #{idx + 1}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className="font-mono text-xs text-foreground"
                        title={entry.principal}
                      >
                        {shortPrincipal(entry.principal)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="font-display font-bold text-primary">
                        {Number(entry.score).toLocaleString()}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="font-body text-muted-foreground">
                        {Number(entry.stolenCount)}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      <AlertDialog open={confirmReset} onOpenChange={setConfirmReset}>
        <AlertDialogContent className="glass-panel border-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-display font-bold text-foreground">
              Reset ALL scores?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground font-body">
              This will wipe all player scores from the canister. This is
              permanent and cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="font-display font-bold border-border">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/80 font-display font-bold"
              disabled={resetMutation.isPending}
              onClick={async () => {
                try {
                  await resetMutation.mutateAsync();
                  setConfirmReset(false);
                  toast.success("All scores wiped! Fresh start, no cap!");
                  refetch();
                } catch {
                  toast.error("Failed to reset scores");
                }
              }}
            >
              {resetMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : null}
              NUKE THE SCORES
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// ─── Main Admin Panel ─────────────────────────────────────────────────────────

export default function AdminPanel({ onBack }: AdminPanelProps) {
  const [authenticated, setAuthenticated] = useState(false);
  const { data: isOnChainAdmin, isLoading: adminCheckLoading } =
    useIsCallerAdmin(authenticated);

  if (!authenticated) {
    return <LoginScreen onLogin={() => setAuthenticated(true)} />;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="sticky top-0 z-10 glass-panel border-b border-border px-6 py-4"
      >
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield
              className="text-secondary w-6 h-6"
              style={{ filter: "drop-shadow(0 0 6px oklch(0.65 0.28 340))" }}
            />
            <div>
              <h1 className="font-display font-extrabold text-xl text-foreground">
                ADMIN PANEL
              </h1>
              <p className="text-xs text-muted-foreground font-body">
                Brain Rot Control Centre
              </p>
            </div>
            {/* On-chain admin badge */}
            {!adminCheckLoading && (
              <div className="ml-2">
                {isOnChainAdmin ? (
                  <Badge className="bg-primary/20 text-primary border-primary/30 font-body gap-1 text-xs">
                    <CheckCircle2 className="w-3 h-3" />
                    On-chain Admin
                  </Badge>
                ) : (
                  <Badge className="bg-muted/40 text-muted-foreground border-border font-body text-xs">
                    Read-only
                  </Badge>
                )}
              </div>
            )}
          </div>
          <Button
            data-ocid="admin.back.link"
            onClick={onBack}
            variant="outline"
            className="border-primary/40 text-primary hover:bg-primary/10 font-display font-bold gap-2 neon-border-lime"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Game
          </Button>
        </div>
      </motion.header>

      {/* Content */}
      <main className="max-w-5xl mx-auto px-4 md:px-6 py-8 space-y-10">
        {/* On-chain admin note */}
        <AnimatePresence>
          {!adminCheckLoading && !isOnChainAdmin && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="glass-panel rounded-xl p-4 border border-muted-foreground/20 flex items-center gap-3 text-muted-foreground text-sm"
            >
              <AlertTriangle className="w-4 h-4 flex-shrink-0 text-secondary" />
              <p className="font-body">
                You're not an on-chain admin. Character mutations (add/remove)
                and score resets require admin privileges.
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-panel rounded-2xl p-6"
        >
          <CharactersTable />
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-panel rounded-2xl p-6"
        >
          <PlayersTable />
        </motion.section>
      </main>

      {/* Footer */}
      <footer className="text-center py-6 text-muted-foreground text-xs font-body border-t border-border mt-8">
        © {new Date().getFullYear()}. Built with love using{" "}
        <a
          href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(typeof window !== "undefined" ? window.location.hostname : "")}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary hover:underline"
        >
          caffeine.ai
        </a>
      </footer>
    </div>
  );
}
