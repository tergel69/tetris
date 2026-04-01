import { useState, useCallback, useRef, useEffect } from 'react';
import { GameState, GameMode } from '@/lib/types';
import {
  createInitialGameState,
  getDropSpeed,
} from '@/lib/gameLogic';
import {
  hardDropSession,
  holdSessionPiece,
  moveSessionPiece,
  rotateSessionPiece,
} from '@/lib/sessionEngine';
import { spawnPiece, rotateWithWallKick } from '@/lib/gameLogic';

export function useGameState(mode: GameMode = 'classic') {
  const [gameState, setGameState] = useState<GameState>(() => createInitialGameState(mode));
  const { gameOver, isPaused, level } = gameState;
  
  const dropIntervalRef = useRef<number>(1000);
  const dropTimerRef = useRef<number | null>(null);

  const movePiece = useCallback((deltaX: number, deltaY: number) => {
    setGameState(prev => moveSessionPiece(prev, deltaX, deltaY));
  }, []);

  const rotate = useCallback(() => {
    setGameState(prev => rotateSessionPiece(prev, piece => rotateWithWallKick(prev.board, piece)));
  }, []);

  const hardDrop = useCallback(() => {
    setGameState(prev => hardDropSession(prev).state);
  }, []);

  const holdPiece = useCallback(() => {
    setGameState(prev => holdSessionPiece(prev, spawnPiece));
  }, []);

  const togglePause = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      isPaused: !prev.isPaused,
    }));
  }, []);

  const resetGame = useCallback(() => {
    // Stop any existing game loop
    if (dropTimerRef.current) {
      window.clearInterval(dropTimerRef.current);
      dropTimerRef.current = null;
    }
    setGameState(createInitialGameState(mode));
  }, [mode]);

  const setGameMode = useCallback((newMode: 'classic' | 'battle' | 'story') => {
    if (dropTimerRef.current) {
      window.clearInterval(dropTimerRef.current);
      dropTimerRef.current = null;
    }
    setGameState(createInitialGameState(newMode));
  }, []);

  useEffect(() => {
    if (dropTimerRef.current) {
      window.clearInterval(dropTimerRef.current);
      dropTimerRef.current = null;
    }

    if (gameOver || isPaused) {
      return;
    }

    dropIntervalRef.current = getDropSpeed(level);
    dropTimerRef.current = window.setInterval(() => {
      setGameState(prev => {
        if (prev.gameOver || prev.isPaused) return prev;
        return moveSessionPiece(prev, 0, 1);
      });
    }, dropIntervalRef.current);
    
    return () => {
      if (dropTimerRef.current) {
        window.clearInterval(dropTimerRef.current);
        dropTimerRef.current = null;
      }
    };
  }, [gameOver, isPaused, level]);

  return {
    gameState,
    movePiece,
    rotate,
    hardDrop,
    holdPiece,
    togglePause,
    resetGame,
    setGameMode,
  };
}
