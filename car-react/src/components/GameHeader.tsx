import React from "react";
import type { GameState } from "../types/game";
import { GAME_CONFIG } from "../constants/gameConstants";
import styles from "../styles/GameHeader.module.css";

interface GameHeaderProps {
  gameState: GameState;
}

export const GameHeader: React.FC<GameHeaderProps> = ({ gameState }) => {
  return (
    <div className={styles.gameHeader}>
      {/* Score Display - stays at top */}

      {/* Health and Bonuses positioned above canvas */}
      <div className={styles.canvasUI}>
        <div className={styles.bonusesAndLivesContainer}>
          <div className={styles.bonusDisplay}>
            <div
              className={`${styles.activeBonus} ${gameState.activeBonuses.speedup ? "" : styles.hidden}`}
            >
              <div className={styles.bonusContainer}>
                <img
                  src="/static/speedup.png"
                  className={`${styles.bonusIcon} ${styles.speedup}`}
                  alt="Speedup"
                />
                <span className={styles.bonusTime}>
                  {Math.max(
                    0,
                    Math.ceil(
                      ((gameState.activeBonuses.speedup?.endTime || 0) -
                        Date.now()) /
                        1000,
                    ),
                  )}
                  s
                </span>
              </div>
            </div>
            <div
              className={`${styles.activeBonus} ${gameState.activeBonuses.shield ? "" : styles.hidden}`}
            >
              <div className={styles.bonusContainer}>
                <img
                  src="/static/shield.png"
                  className={`${styles.bonusIcon} ${styles.shield}`}
                  alt="Shield"
                />
                <span className={styles.bonusTime}>
                  {Math.max(
                    0,
                    Math.ceil(
                      ((gameState.activeBonuses.shield?.endTime || 0) -
                        Date.now()) /
                        1000,
                    ),
                  )}
                  s
                </span>
              </div>
            </div>
          </div>

          <div className={styles.livesContainer}>
            <div className={styles.heartDisplay}>
              {Array.from({ length: GAME_CONFIG.maxLives }, (_, index) => (
                <img
                  key={index}
                  src="/static/heart.png"
                  alt="Heart"
                  className={`${styles.heartIcon} ${index >= gameState.lives ? styles.empty : ""}`}
                />
              ))}
            </div>
          </div>
        </div>

        <div className={styles.scoreAndCoinContainer}>
          <div className={styles.scoreDisplay}>
            {Math.floor(gameState.publicScore)}m
          </div>
          <div className={styles.coinCounter}>
            <span className={styles.coinCount}>{gameState.coinsCollected}</span>
            <img
              src="/static/classic_coin.png"
              className={styles.coinIcon}
              alt="Coin"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
