import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Character } from "../backend";
import { useActor } from "./useActor";

export type { Character };

// ─── Characters ───────────────────────────────────────────────────────────────

export function useGetCharacters() {
  const { actor, isFetching } = useActor();
  return useQuery<Character[]>({
    queryKey: ["characters"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getCharacters();
    },
    enabled: !!actor && !isFetching,
    staleTime: 30_000,
  });
}

// ─── Leaderboard ──────────────────────────────────────────────────────────────

export interface LeaderboardEntry {
  principal: string;
  score: bigint;
  stolenCount: bigint;
}

export function useGetLeaderboard(enabled: boolean) {
  const { actor, isFetching } = useActor();
  return useQuery<LeaderboardEntry[]>({
    queryKey: ["leaderboard"],
    queryFn: async () => {
      if (!actor) return [];
      const raw = await actor.getLeaderboard();
      return raw.map(([principal, data]) => ({
        principal: principal.toString(),
        score: data.score,
        stolenCount: data.stolenCount,
      }));
    },
    enabled: enabled && !!actor && !isFetching,
    staleTime: 10_000,
  });
}

// ─── Admin check ──────────────────────────────────────────────────────────────

export function useIsCallerAdmin(enabled: boolean) {
  const { actor, isFetching } = useActor();
  return useQuery<boolean>({
    queryKey: ["isAdmin"],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: enabled && !!actor && !isFetching,
    staleTime: 60_000,
  });
}

// ─── Steal character ──────────────────────────────────────────────────────────

export function useStealCharacter() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation<bigint, Error, bigint>({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("No actor available");
      return actor.stealCharacter(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leaderboard"] });
    },
  });
}

// ─── Add character ────────────────────────────────────────────────────────────

export function useAddCharacter() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation<void, Error, { name: string; pointValue: bigint }>({
    mutationFn: async ({ name, pointValue }) => {
      if (!actor) throw new Error("No actor available");
      return actor.addCharacter(name, pointValue);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["characters"] });
    },
  });
}

// ─── Remove character ─────────────────────────────────────────────────────────

export function useRemoveCharacter() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation<void, Error, bigint>({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("No actor available");
      return actor.removeCharacter(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["characters"] });
    },
  });
}

// ─── Reset all scores ─────────────────────────────────────────────────────────

export function useResetAllScores() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation<void, Error, void>({
    mutationFn: async () => {
      if (!actor) throw new Error("No actor available");
      return actor.resetAllScores();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leaderboard"] });
    },
  });
}
