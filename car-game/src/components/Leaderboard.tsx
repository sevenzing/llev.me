import React, { useState } from "react";
import type { LeaderboardEntry } from "../utils/leaderboardPersistence";
import styles from "../styles/Leaderboard.module.css";

type SortBy = "meters" | "coins";

interface LeaderboardProps {
  entries: LeaderboardEntry[];
  onRename: (id: string, newName: string) => void;
  onDelete: (id: string) => void;
  onClear: () => void;
  sortBy: SortBy;
  onSortChange: (sort: SortBy) => void;
  hidden: boolean;
  onToggleHidden: () => void;
}

function formatDate(ts: number): string {
  const d = new Date(ts);
  const day = d.getDate();
  const month = d.toLocaleString("default", { month: "short" });
  const hours = d.getHours().toString().padStart(2, "0");
  const minutes = d.getMinutes().toString().padStart(2, "0");
  return `${day} ${month}, ${hours}:${minutes}`;
}

function DifficultyBadge({ difficulty }: { difficulty: string }) {
  const colorMap: Record<string, string> = {
    easy: styles.badgeEasy,
    normal: styles.badgeNormal,
    hard: styles.badgeHard,
    insane: styles.badgeInsane,
  };
  return (
    <span className={`${styles.badge} ${colorMap[difficulty] ?? ""}`}>
      {difficulty}
    </span>
  );
}

function ModeBadge({ mode }: { mode: "manual" | "auto" }) {
  return (
    <span className={`${styles.badge} ${mode === "auto" ? styles.badgeAuto : styles.badgeManual}`}>
      {mode}
    </span>
  );
}

export const Leaderboard: React.FC<LeaderboardProps> = ({
  entries,
  onRename,
  onDelete,
  onClear,
  sortBy,
  onSortChange,
  hidden,
  onToggleHidden,
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  if (hidden) {
    return (
      <div className={styles.collapsed}>
        <button className={styles.expandBtn} onClick={onToggleHidden} title="Show leaderboard">
          ▶
        </button>
      </div>
    );
  }

  const sorted = [...entries].sort((a, b) =>
    sortBy === "meters" ? b.meters - a.meters : b.coins - a.coins
  );

  // Most recent entry by creation time (the "latest" badge)
  const latestId = entries.length > 0
    ? entries.reduce((a, b) => (a.createdAt > b.createdAt ? a : b)).id
    : null;

  const handleEditStart = (entry: LeaderboardEntry) => {
    setEditingId(entry.id);
    setEditValue(entry.name);
  };

  const handleEditCommit = (entry: LeaderboardEntry) => {
    const trimmed = editValue.trim();
    onRename(entry.id, trimmed || entry.name);
    setEditingId(null);
  };

  const handleEditKeyDown = (e: React.KeyboardEvent, entry: LeaderboardEntry) => {
    if (e.key === "Enter") handleEditCommit(entry);
    if (e.key === "Escape") setEditingId(null);
  };

  const handleClear = () => {
    if (window.confirm("Remove all leaderboard entries?")) {
      onClear();
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <span className={styles.title}>Leaderboard</span>
          <div className={styles.sortButtons}>
            <button
              className={`${styles.sortBtn} ${sortBy === "meters" ? styles.sortActive : ""}`}
              onClick={() => onSortChange("meters")}
            >
              Meters
            </button>
            <button
              className={`${styles.sortBtn} ${sortBy === "coins" ? styles.sortActive : ""}`}
              onClick={() => onSortChange("coins")}
            >
              Coins
            </button>
          </div>
        </div>
        <div className={styles.headerRight}>
          {entries.length > 0 && (
            <button className={styles.clearBtn} onClick={handleClear} title="Clear all entries">
              Clear
            </button>
          )}
          <button className={styles.toggleBtn} onClick={onToggleHidden} title="Hide leaderboard">
            ◀
          </button>
        </div>
      </div>

      <div className={styles.list}>
        {sorted.length === 0 ? (
          <div className={styles.empty}>No runs yet. Play a game!</div>
        ) : (
          sorted.map((entry, idx) => (
            <div
              key={entry.id}
              className={`${styles.row} ${entry.id === latestId ? styles.rowLatest : ""}`}
              onMouseEnter={() => setHoveredId(entry.id)}
              onMouseLeave={() => setHoveredId(null)}
            >
              <span className={styles.rank}>#{idx + 1}</span>
              <div className={styles.entryMain}>
                {/* Top line: score (meters + coins) + badges */}
                <div className={styles.entryTop}>
                  <span className={styles.scoreMeters}>
                    {Math.round(entry.meters)}m
                  </span>
                  <span className={styles.scoreCoins}>
                    {entry.coins}
                    <img src="/static/classic_coin.png" alt="coin" className={styles.coinIcon} />
                  </span>
                  <div className={styles.badges}>
                    <DifficultyBadge difficulty={entry.difficulty} />
                    <ModeBadge mode={entry.mode} />
                  </div>
                </div>
                {/* Bottom line: name + latest badge + date */}
                <div className={styles.entryBottom}>
                  {editingId === entry.id ? (
                    <input
                      className={styles.nameInput}
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      onBlur={() => handleEditCommit(entry)}
                      onKeyDown={(e) => handleEditKeyDown(e, entry)}
                      autoFocus
                      maxLength={40}
                    />
                  ) : (
                    <span
                      className={styles.name}
                      onClick={() => handleEditStart(entry)}
                      title="Click to rename"
                    >
                      {entry.name}
                    </span>
                  )}
                  <span className={styles.date}>{formatDate(entry.createdAt)}</span>
                </div>
              </div>
              <button
                className={`${styles.deleteBtn} ${hoveredId === entry.id ? styles.deleteBtnVisible : ""}`}
                onClick={() => onDelete(entry.id)}
                title="Delete entry"
              >
                ✕
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
