import { useCallback, useEffect, useRef, useState } from 'react';
import { Card, GamePiece, PlayerState, Position } from '@/lib/types';
import {
  createPlayerState,
  isValidMove,
  rotateWithWallKick,
  getDropSpeed,
  clearLines,
  lockPiece,
  detectTSpin,
  determineClearType,
  calculateAttackLines,
  calculateLevel as calcLevel,
  addGarbageLines,
  clearGarbage,
  spawnPiece,
  rotatePiece,
} from '@/lib/gameLogic';
import { STARTING_CARDS, getCardById } from '@/lib/story';
import { calculateBattleAttack, holdSessionPiece, moveSessionPiece, resolveLock } from '@/lib/sessionEngine';

type AIDifficulty = 'easy' | 'medium' | 'hard' | 'expert';

interface BattleOptions {
  aiDifficulty: AIDifficulty;
  firstToWin: number;
  isTimed: boolean;
  matchTime: number;
}

const DEFAULT_BATTLE_OPTIONS: BattleOptions = {
  aiDifficulty: 'medium',
  firstToWin: 3,
  isTimed: false,
  matchTime: 300,
};

function createStartingCards(): Card[] {
  return STARTING_CARDS.map(id => getCardById(id)).filter((card): card is Card => Boolean(card));
}

function makeAIMove(
  board: (string | null)[][],
  piece: GamePiece,
  difficulty: AIDifficulty
): { deltaX: number; shouldRotate: boolean } {
  const skill = {
    easy: 0.35,
    medium: 0.6,
    hard: 0.85,
    expert: 0.98,
  }[difficulty];

  let bestX = piece.position.x;
  let bestRotation = 0;
  let bestScore = -Infinity;

  for (let rot = 0; rot < 4; rot++) {
    const testPiece = { ...piece, shape: piece.shape };
    for (let r = 0; r < rot; r++) {
      testPiece.shape = rotatePiece(testPiece);
    }

    for (let x = -2; x < 12; x++) {
      const testPos = { ...testPiece.position, x };
      if (!isValidMove(board, testPiece, testPos)) continue;

      let score = 0;
      score -= testPos.y * 2;
      score -= Math.abs(x - 5) * 0.5;
      const testBoard = lockPiece(board, { ...testPiece, position: testPos });
      const { linesCleared } = clearLines(testBoard);
      score += linesCleared * 12;

      for (let y = 1; y < testBoard.length; y++) {
        for (let x2 = 0; x2 < testBoard[0].length; x2++) {
          if (testBoard[y][x2] === null && testBoard[y - 1][x2] !== null) {
            score -= 2;
          }
        }
      }

      if (score > bestScore && Math.random() < skill) {
        bestScore = score;
        bestX = x;
        bestRotation = rot;
      }
    }
  }

  if (Math.random() > skill) {
    return {
      deltaX: Math.random() > 0.5 ? 1 : -1,
      shouldRotate: false,
    };
  }

  return {
    deltaX: bestX - piece.position.x,
    shouldRotate: bestRotation > 0,
  };
}

export function useBattleState(options: BattleOptions = DEFAULT_BATTLE_OPTIONS) {
  const [playerState, setPlayerState] = useState<PlayerState>(() => {
    const state = createPlayerState(false);
    state.cards = createStartingCards();
    return state;
  });

  const [opponentState, setOpponentState] = useState<PlayerState>(() => {
    const state = createPlayerState(true);
    state.level = 3;
    return state;
  });

  const [isPaused, setIsPaused] = useState(false);

  const dropIntervalRef = useRef<number>(800);
  const lastDropTimeRef = useRef<number>(0);
  const animationFrameRef = useRef<number | null>(null);
  const opponentComboRef = useRef<number>(0);
  const battleStatus: 'playing' | 'player_win' | 'opponent_win' =
    playerState.health <= 0 ? 'opponent_win' : opponentState.health <= 0 ? 'player_win' : 'playing';

  const processGarbage = useCallback((state: PlayerState): PlayerState => {
    if (state.garbagePending <= 0) return state;
    const linesToAdd = Math.min(state.garbagePending, 5);
    return {
      ...state,
      board: clearGarbage(addGarbageLines(state.board, linesToAdd, true)),
      garbagePending: Math.max(0, state.garbagePending - linesToAdd),
    };
  }, []);

  const applyAttackToOpponent = useCallback((attackLines: number) => {
    if (attackLines <= 0) return;
    setOpponentState(prev => ({
      ...prev,
      garbagePending: prev.garbagePending + attackLines,
      health: Math.max(0, prev.health - attackLines * 2),
    }));
  }, []);

  const applyAttackToPlayer = useCallback((attackLines: number) => {
    if (attackLines <= 0) return;
    setPlayerState(prev => ({
      ...prev,
      garbagePending: prev.garbagePending + attackLines,
      health: Math.max(0, prev.health - attackLines * 2),
    }));
  }, []);

  const movePiece = useCallback((deltaX: number, deltaY: number) => {
    setPlayerState(prev => {
      if (!prev.currentPiece || prev.health <= 0 || battleStatus !== 'playing' || isPaused) return prev;

      if (deltaY === 0) {
        return moveSessionPiece<PlayerState>(prev, deltaX, 0);
      }

      const newPosition: Position = {
        x: prev.currentPiece.position.x + deltaX,
        y: prev.currentPiece.position.y + deltaY,
      };

      if (isValidMove(prev.board, prev.currentPiece, newPosition)) {
        return {
          ...prev,
          currentPiece: {
            ...prev.currentPiece,
            position: newPosition,
          },
        };
      }

      const outcome = resolveLock<PlayerState>(prev, prev.currentPiece, prev.nextPiece, prev.nextPieceQueue, 0);
      const attackLines = calculateBattleAttack(outcome.clearType, outcome.state.combo);
      applyAttackToOpponent(attackLines);
      return processGarbage(outcome.state) as PlayerState;
    });
  }, [applyAttackToOpponent, battleStatus, isPaused, processGarbage]);

  const rotate = useCallback(() => {
    setPlayerState(prev => {
      if (!prev.currentPiece || prev.health <= 0 || battleStatus !== 'playing' || isPaused) return prev;
      const rotated = rotateWithWallKick(prev.board, prev.currentPiece);
      if (!rotated) return prev;
      return {
        ...prev,
        currentPiece: {
          ...prev.currentPiece,
          shape: rotated.shape,
          position: rotated.position,
          rotation: (prev.currentPiece.rotation + 90) % 360,
        },
      };
    });
  }, [battleStatus, isPaused]);

  const hardDrop = useCallback(() => {
    setPlayerState(prev => {
      if (!prev.currentPiece || prev.health <= 0 || battleStatus !== 'playing' || isPaused) return prev;

      let newY = prev.currentPiece.position.y;
      while (
        isValidMove(prev.board, prev.currentPiece, {
          x: prev.currentPiece.position.x,
          y: newY + 1,
        })
      ) {
        newY++;
      }

      const droppedPiece = {
        ...prev.currentPiece,
        position: { ...prev.currentPiece.position, y: newY },
      };

      const outcome = resolveLock<PlayerState>(prev, droppedPiece, prev.nextPiece, prev.nextPieceQueue, newY - prev.currentPiece.position.y);
      const attackLines = calculateBattleAttack(outcome.clearType, outcome.state.combo);
      applyAttackToOpponent(attackLines);
      return processGarbage(outcome.state) as PlayerState;
    });
  }, [applyAttackToOpponent, battleStatus, isPaused, processGarbage]);

  const holdPiece = useCallback(() => {
    setPlayerState(prev => {
      if (!prev.currentPiece || prev.health <= 0 || battleStatus !== 'playing' || isPaused) return prev;
      return holdSessionPiece(prev, spawnPiece);
    });
  }, [battleStatus, isPaused]);

  const activateCard = useCallback((cardId: string) => {
    const now = Date.now();
    const card = getCardById(cardId);
    if (!card || now - card.lastUsed < card.cooldown * 1000) return;

    setPlayerState(prev => {
      const cardIndex = prev.cards.findIndex(c => c.id === cardId);
      if (cardIndex === -1) return prev;

      const cards = [...prev.cards];
      cards[cardIndex] = { ...card, lastUsed: now };

      switch (cardId) {
        case 'garbage_rain':
          setOpponentState(opp => ({
            ...opp,
            garbagePending: opp.garbagePending + 4,
            health: Math.max(0, opp.health - 8),
          }));
          break;
        case 'clear_garbage':
          return { ...prev, cards, garbagePending: 0 };
        case 'shield':
          return { ...prev, cards, health: Math.min(100, prev.health + 10) };
        default:
          break;
      }

      return { ...prev, cards };
    });
  }, []);

  const togglePause = useCallback(() => {
    setIsPaused(prev => !prev);
  }, []);

  const resetBattle = useCallback(() => {
    opponentComboRef.current = 0;
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    setPlayerState(() => {
      const state = createPlayerState(false);
      state.cards = createStartingCards();
      return state;
    });
    setOpponentState(() => {
      const state = createPlayerState(true);
      state.level = 3;
      return state;
    });
    setIsPaused(false);
  }, []);

  useEffect(() => {
    if (battleStatus !== 'playing' || isPaused) {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      return;
    }

    const aiTimer = window.setInterval(() => {
      setOpponentState(prev => {
        if (!prev.currentPiece || prev.health <= 0) return prev;

        const difficulty = options.aiDifficulty;
        const move = makeAIMove(prev.board, prev.currentPiece, difficulty);
        let nextPiece = { ...prev.currentPiece };

        if (move.shouldRotate) {
          const rotated = rotateWithWallKick(prev.board, nextPiece);
          if (rotated) {
            nextPiece = { ...nextPiece, shape: rotated.shape, position: rotated.position };
          }
        }

        const newPosition = { ...nextPiece.position, x: nextPiece.position.x + move.deltaX };
        if (isValidMove(prev.board, nextPiece, newPosition)) {
          nextPiece = { ...nextPiece, position: newPosition };
        }

        const downPosition = { ...nextPiece.position, y: nextPiece.position.y + 1 };
        if (isValidMove(prev.board, nextPiece, downPosition)) {
          return { ...prev, currentPiece: { ...nextPiece, position: downPosition } };
        }

        const outcome = resolveLock(prev, nextPiece, prev.nextPiece, prev.nextPieceQueue, 0);
        const isTSpin = detectTSpin(prev.board, nextPiece);
        const clearType = determineClearType(outcome.linesCleared, isTSpin);

        if (outcome.linesCleared > 0) {
          opponentComboRef.current += 1;
        } else {
          opponentComboRef.current = 0;
        }

        const attackLines = calculateAttackLines(clearType, opponentComboRef.current);
        applyAttackToPlayer(attackLines);

        return processGarbage({
          ...outcome.state,
          level: calcLevel(outcome.state.lines),
          combo: opponentComboRef.current,
          lastClearType: clearType,
        });
      });
    }, options.aiDifficulty === 'easy' ? 500 : options.aiDifficulty === 'medium' ? 300 : options.aiDifficulty === 'hard' ? 150 : 80);

    dropIntervalRef.current = getDropSpeed(playerState.level);
    lastDropTimeRef.current = Date.now();

    const gameLoop = () => {
      const now = Date.now();
      const deltaTime = now - lastDropTimeRef.current;

      if (deltaTime >= dropIntervalRef.current) {
        movePiece(0, 1);
        lastDropTimeRef.current = now;
      }

      if (battleStatus === 'playing' && !isPaused) {
        animationFrameRef.current = requestAnimationFrame(gameLoop);
      }
    };

    animationFrameRef.current = requestAnimationFrame(gameLoop);

    return () => {
      window.clearInterval(aiTimer);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    };
  }, [applyAttackToPlayer, battleStatus, isPaused, movePiece, options.aiDifficulty, playerState.level, processGarbage]);

  return {
    playerState,
    opponentState,
    battleStatus,
    movePiece,
    rotate,
    hardDrop,
    holdPiece,
    activateCard,
    togglePause,
    resetBattle,
    isPaused,
  };
}
