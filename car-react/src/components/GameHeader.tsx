import React from 'react';
import type { GameState } from '../types/game';
import { GAME_CONFIG } from '../constants/gameConstants';
import styles from '../styles/Game.module.css';

interface GameHeaderProps {
  gameState: GameState;
}

export const GameHeader: React.FC<GameHeaderProps> = ({ gameState }) => {
  return (
    <div className={styles.gameUI}>
      {/* Score Display */}
      <div className={styles.scoreDisplay}>Score: {Math.floor(gameState.score)}</div>
      
      {/* Heart Display */}
      <div className={styles.heartDisplay}>
        {Array.from({ length: GAME_CONFIG.maxLives }, (_, index) => (
          <img
            key={index}
            src="/static/heart.png"
            alt="Heart"
            className={`${styles.heartIcon} ${index >= gameState.lives ? styles.empty : ''}`}
          />
        ))}
      </div>

       {/* Bonus Display */}
       <div className={styles.bonusDisplay}>
        <div className={`${styles.activeBonus} ${gameState.activeBonuses.speedup ? '' : styles.hidden}`}>
          <div className={styles.bonusContainer}>
            <img src="/static/speedup.png" className={`${styles.bonusIcon} ${styles.speedup}`} alt="Speedup" />
            <span className={styles.bonusTime}>{Math.max(0, Math.ceil(((gameState.activeBonuses.speedup?.endTime || 0) - Date.now()) / 1000))}s</span>
          </div>
        </div>
        <div className={`${styles.activeBonus} ${gameState.activeBonuses.shield ? '' : styles.hidden}`}>
          <div className={styles.bonusContainer}>
            <img src="/static/shield.png" className={`${styles.bonusIcon} ${styles.shield}`} alt="Shield" />
            <span className={styles.bonusTime}>{Math.max(0, Math.ceil(((gameState.activeBonuses.shield?.endTime || 0) - Date.now()) / 1000))}s</span>
          </div>
        </div>
      </div>
    </div>
  );
}; 