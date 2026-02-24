import type { Difficulty } from "../types/game";

export interface LeaderboardEntry {
  id: string;
  name: string;
  difficulty: Difficulty;
  meters: number;
  coins: number;
  mode: "manual" | "auto";
  createdAt: number;
}

const STORAGE_KEY = "car-game:leaderboard:v1";

export function loadLeaderboard(): LeaderboardEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (e) =>
        e &&
        typeof e.id === "string" &&
        typeof e.name === "string" &&
        typeof e.difficulty === "string" &&
        typeof e.meters === "number" &&
        typeof e.coins === "number" &&
        (e.mode === "manual" || e.mode === "auto") &&
        typeof e.createdAt === "number"
    );
  } catch {
    return [];
  }
}

export function saveLeaderboard(entries: LeaderboardEntry[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  } catch (error) {
    console.warn("Failed to save leaderboard:", error);
  }
}

export function clearLeaderboard(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.warn("Failed to clear leaderboard:", error);
  }
}
