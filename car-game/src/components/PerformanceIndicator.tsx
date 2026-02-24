import React from 'react';
import type { GameState } from '../types/game';

interface PerformanceIndicatorProps {
  gameState: GameState;
}

export const PerformanceIndicator: React.FC<PerformanceIndicatorProps> = ({ gameState }) => {
  if (!gameState.isRunning) return null;

  return (
    <div style={{
      position: 'absolute',
      top: '10px',
      right: '10px',
      background: 'rgba(0, 0, 0, 0.7)',
      color: 'white',
      padding: '8px 12px',
      borderRadius: '6px',
      fontSize: '12px',
      fontFamily: 'monospace',
      zIndex: 1000,
      minWidth: '120px',
    }}>
      <div style={{ marginBottom: '4px' }}>
        FPS: <span style={{ 
          color: gameState.currentFPS < 15 ? '#ff0000' :
                 gameState.currentFPS < 30 ? '#ff6b6b' : 
                 gameState.currentFPS < 45 ? '#ffd93d' : '#6bcf7f' 
        }}>
          {gameState.currentFPS.toFixed(1)}
        </span>
      </div>
      {gameState.isLowPerformanceMode && (
        <div style={{ 
          color: gameState.adaptiveSpeedMultiplier >= 3 ? '#ff0000' : '#ff6b6b', 
          fontWeight: 'bold',
          fontSize: '11px',
          textTransform: 'uppercase'
        }}>
          ⚡ {gameState.adaptiveSpeedMultiplier >= 3 ? 'CRITICAL' : 'ADAPTIVE'} SPEED: {gameState.adaptiveSpeedMultiplier.toFixed(1)}x
        </div>
      )}
    </div>
  );
}; 