import {
  addGarbageLines,
  calculateAttackLines,
  calculateLevel,
  calculateScore,
  clearGarbage,
  clearLines,
  detectTSpin,
  determineClearType,
  isGameOver,
  isValidMove,
  lockPiece,
  spawnPiece,
} from './gameLogic';
import { GamePiece, SessionState, Tetromino, ClearType, Board } from './types';
import { getRandomTetromino } from './tetrominoes';

export interface LockOutcome<T extends SessionState> {
  state: T;
  linesCleared: number;
  clearType: ClearType;
  scoreDelta: number;
  hardDropDistance: number;
}

export function refillNextQueue(queue: Tetromino[], minimumSize: number = 3): Tetromino[] {
  const nextQueue = [...queue];
  while (nextQueue.length < minimumSize) {
    nextQueue.push(getRandomTetromino());
  }
  return nextQueue;
}

export function canSpawnPiece(board: Board, piece: GamePiece): boolean {
  return isValidMove(board, piece, piece.position);
}

export function moveSessionPiece<T extends SessionState>(state: T, deltaX: number, deltaY: number): T {
  if (!state.currentPiece || state.gameOver || state.isPaused) return state;

  const newPosition = {
    x: state.currentPiece.position.x + deltaX,
    y: state.currentPiece.position.y + deltaY,
  };

  if (isValidMove(state.board, state.currentPiece, newPosition)) {
    return {
      ...state,
      currentPiece: {
        ...state.currentPiece,
        position: newPosition,
      },
    };
  }

  if (deltaY <= 0) return state;
  return resolveLock(state, state.currentPiece, state.nextPiece, state.nextPieceQueue, 0).state;
}

export function hardDropSession<T extends SessionState>(state: T): LockOutcome<T> {
  if (!state.currentPiece || state.gameOver || state.isPaused) {
    return {
      state,
      linesCleared: 0,
      clearType: 'none',
      scoreDelta: 0,
      hardDropDistance: 0,
    };
  }

  let newY = state.currentPiece.position.y;
  while (
    isValidMove(state.board, state.currentPiece, {
      x: state.currentPiece.position.x,
      y: newY + 1,
    })
  ) {
    newY++;
  }

  const droppedPiece = {
    ...state.currentPiece,
    position: { ...state.currentPiece.position, y: newY },
  };

  return resolveLock(state, droppedPiece, state.nextPiece, state.nextPieceQueue, newY - state.currentPiece.position.y);
}

export function holdSessionPiece<T extends SessionState>(
  state: T,
  spawnCurrent: (piece: Tetromino) => GamePiece
): T {
  if (!state.currentPiece || state.gameOver || state.isPaused || !state.canHold) return state;

  const currentTetromino: Tetromino = {
    type: state.currentPiece.type,
    shape: state.currentPiece.shape,
    color: state.currentPiece.color,
  };

  const nextTetromino = state.holdPiece ?? state.nextPiece;
  if (!nextTetromino) return state;

  const swappedPiece = spawnCurrent(nextTetromino);
  if (!isValidMove(state.board, swappedPiece, swappedPiece.position)) {
    return state;
  }

  return {
    ...state,
    currentPiece: swappedPiece,
    holdPiece: currentTetromino,
    canHold: false,
  };
}

export function rotateSessionPiece<T extends SessionState>(
  state: T,
  rotatePiece: (piece: GamePiece) => { shape: number[][]; position: { x: number; y: number } } | null
): T {
  if (!state.currentPiece || state.gameOver || state.isPaused) return state;

  const rotated = rotatePiece(state.currentPiece);
  if (!rotated) return state;

  return {
    ...state,
    currentPiece: {
      ...state.currentPiece,
      shape: rotated.shape,
      position: rotated.position,
      rotation: (state.currentPiece.rotation + 90) % 360,
    },
  };
}

export function resolveLock<T extends SessionState>(
  state: T,
  pieceToLock: GamePiece,
  nextPiece: Tetromino | null,
  nextQueue: Tetromino[],
  hardDropDistance: number
): LockOutcome<T> {
  const boardWithPiece = lockPiece(state.board, pieceToLock);
  const { newBoard, linesCleared } = clearLines(boardWithPiece);
  const isTSpin = detectTSpin(state.board, pieceToLock);
  const clearType = determineClearType(linesCleared, isTSpin);
  const scoreDelta = calculateScore(clearType, state.level, linesCleared > 0 ? state.combo + 1 : 0);
  const newLines = state.lines + linesCleared;
  const newLevel = calculateLevel(newLines);
  const queue = refillNextQueue([...nextQueue]);
  const queuedNextPiece = nextPiece ?? queue.shift() ?? getRandomTetromino();
  const resolvedQueue = refillNextQueue(queue);
  const nextSpawn = spawnPiece(queuedNextPiece);
  const nextState: T = {
    ...state,
    board: newBoard,
    currentPiece: nextSpawn,
    nextPiece: resolvedQueue[0] ?? null,
    nextPieceQueue: resolvedQueue.slice(1),
    score: state.score + scoreDelta + hardDropDistance * 2,
    level: newLevel,
    lines: newLines,
    combo: linesCleared > 0 ? state.combo + 1 : 0,
    lastClearType: clearType,
    canHold: true,
    gameOver: isGameOver(newBoard, nextSpawn),
  };

  return {
    state: nextState,
    linesCleared,
    clearType,
    scoreDelta,
    hardDropDistance,
  };
}

export function applyGarbageToBoard(board: Board, garbageLines: number, clearable = true): Board {
  return clearGarbage(addGarbageLines(board, garbageLines, clearable));
}

export function calculateBattleAttack(clearType: ClearType, combo: number): number {
  return calculateAttackLines(clearType, combo);
}
