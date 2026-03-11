import type { Character as BackendCharacter } from "../hooks/useQueries";

export interface BrainRotCharacter {
  /** String version of the bigint id (for React keys / localStorage compat) */
  id: string;
  /** Original bigint id for backend calls */
  bigintId: bigint;
  name: string;
  points: number;
  color: string;
  emote: string;
}

export interface PlayerScore {
  id: string;
  name: string;
  score: number;
  stolen: number;
  timestamp: number;
}

// Assign a stable color + emote based on the character name hash
const COLORS = [
  "#00ff88",
  "#ff00cc",
  "#00ccff",
  "#ffcc00",
  "#ff6699",
  "#99ff00",
  "#cc66ff",
  "#ff9900",
  "#00ffcc",
  "#ff3366",
];
const EMOTES = ["🚽", "🦈", "🐊", "🥁", "🩰", "🐒", "👾", "🍌", "🎭", "💀"];

function charHash(name: string): number {
  let h = 0;
  for (let i = 0; i < name.length; i++) {
    h = (Math.imul(31, h) + name.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

export function backendCharToGame(c: BackendCharacter): BrainRotCharacter {
  const h = charHash(c.name);
  return {
    id: c.id.toString(),
    bigintId: c.id,
    name: c.name,
    points: Number(c.pointValue),
    color: COLORS[h % COLORS.length] ?? "#00ff88",
    emote: EMOTES[h % EMOTES.length] ?? "👾",
  };
}

export const DEFAULT_CHARACTERS: BrainRotCharacter[] = [
  {
    id: "1",
    bigintId: 1n,
    name: "Skibidi Toilet",
    points: 10,
    color: "#00ff88",
    emote: "🚽",
  },
  {
    id: "2",
    bigintId: 2n,
    name: "Tralalero Tralala",
    points: 15,
    color: "#ff00cc",
    emote: "🦈",
  },
  {
    id: "3",
    bigintId: 3n,
    name: "Bombardiro Crocodillo",
    points: 20,
    color: "#00ccff",
    emote: "🐊",
  },
  {
    id: "4",
    bigintId: 4n,
    name: "Tung Tung Sahur",
    points: 8,
    color: "#ffcc00",
    emote: "🥁",
  },
  {
    id: "5",
    bigintId: 5n,
    name: "Ballerina Cappuccina",
    points: 12,
    color: "#ff6699",
    emote: "🩰",
  },
  {
    id: "6",
    bigintId: 6n,
    name: "Brr Brr Patapim",
    points: 7,
    color: "#99ff00",
    emote: "🐒",
  },
  {
    id: "7",
    bigintId: 7n,
    name: "Glorbo Finkus",
    points: 18,
    color: "#cc66ff",
    emote: "👾",
  },
  {
    id: "8",
    bigintId: 8n,
    name: "Chimpanzini Bananini",
    points: 5,
    color: "#ff9900",
    emote: "🍌",
  },
  {
    id: "9",
    bigintId: 9n,
    name: "Cappuccino Assassino",
    points: 25,
    color: "#ff3366",
    emote: "☕",
  },
  {
    id: "10",
    bigintId: 10n,
    name: "Lirili Larila",
    points: 9,
    color: "#00ffcc",
    emote: "🎶",
  },
  {
    id: "11",
    bigintId: 11n,
    name: "Bobritto Bandito",
    points: 14,
    color: "#ff6600",
    emote: "🦫",
  },
  {
    id: "12",
    bigintId: 12n,
    name: "Frigo Camelo",
    points: 11,
    color: "#33ccff",
    emote: "🐪",
  },
  {
    id: "13",
    bigintId: 13n,
    name: "Giraffa Celeste",
    points: 17,
    color: "#aaff00",
    emote: "🦒",
  },
  {
    id: "14",
    bigintId: 14n,
    name: "Trippi Troppi",
    points: 22,
    color: "#ff00ff",
    emote: "🦋",
  },
  {
    id: "15",
    bigintId: 15n,
    name: "Burbaloni Luigini",
    points: 6,
    color: "#66ffaa",
    emote: "🫧",
  },
  {
    id: "16",
    bigintId: 16n,
    name: "Shark Grazie Mille",
    points: 30,
    color: "#0077ff",
    emote: "🦷",
  },
];

export const STORAGE_KEYS = {
  SCORES: "brainrot_scores",
};

export function loadScores(): PlayerScore[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.SCORES);
    return stored ? (JSON.parse(stored) as PlayerScore[]) : [];
  } catch {
    return [];
  }
}

export function saveScore(score: PlayerScore): void {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.SCORES);
    const existing: PlayerScore[] = stored ? JSON.parse(stored) : [];
    const idx = existing.findIndex((s) => s.id === score.id);
    if (idx >= 0) {
      existing[idx] = score;
    } else {
      existing.push(score);
    }
    localStorage.setItem(STORAGE_KEYS.SCORES, JSON.stringify(existing));
  } catch {
    // ignore
  }
}

export function resetScores(): void {
  localStorage.removeItem(STORAGE_KEYS.SCORES);
}
