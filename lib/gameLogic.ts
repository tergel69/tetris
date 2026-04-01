import { Board, GamePiece, Tetromino, Position, GameState, ClearType, PlayerState } from './types';
import { getRandomTetromino, getRandomTetrominoes } from './tetrominoes';

export const BOARD_WIDTH = 10;
export const BOARD_HEIGHT = 20;

export function createEmptyBoard(): Board {
  return Array.from({ length: BOARD_HEIGHT }, () =>
    Array.from({ length: BOARD_WIDTH }, () => null)
  );
}

export function createInitialGameState(gameMode: 'classic' | 'battle' | 'story' = 'classic'): GameState {
  const nextPieces = getRandomTetrominoes(4);
  
  const baseState: GameState = {
    board: createEmptyBoard(),
    currentPiece: spawnPiece(getRandomTetromino()),
    nextPiece: nextPieces[0],
    nextPieceQueue: nextPieces.slice(1),
    holdPiece: null,
    canHold: true,
    score: 0,
    level: 1,
    lines: 0,
    combo: 0,
    lastClearType: 'none',
    gameOver: false,
    isPaused: false,
    gameMode,
    cards: [],
  };

  if (gameMode === 'battle') {
    baseState.opponent = {
      board: createEmptyBoard(),
      score: 0,
      level: 1,
      lines: 0,
      garbagePending: 0,
      health: 100,
      isAI: true,
    };
  }

  return baseState;
}

export function createPlayerState(isAI: boolean = false): PlayerState {
  const nextPieces = getRandomTetrominoes(3);
  return {
    board: createEmptyBoard(),
    currentPiece: spawnPiece(getRandomTetromino()),
    nextPiece: nextPieces[0],
    nextPieceQueue: nextPieces.slice(1),
    holdPiece: null,
    canHold: true,
    score: 0,
    level: 1,
    lines: 0,
    combo: 0,
    lastClearType: 'none',
    gameOver: false,
    isPaused: false,
    health: 100,
    cards: [],
    garbagePending: 0,
    isAI,
  };
}

export function spawnPiece(tetromino: Tetromino): GamePiece {
  return {
    ...tetromino,
    position: {
      x: Math.floor((BOARD_WIDTH - tetromino.shape[0].length) / 2),
      y: tetromino.type === 'I' ? -1 : 0,
    },
    rotation: 0,
  };
}

export function isValidMove(
  board: Board,
  piece: GamePiece,
  newPosition: Position
): boolean {
  for (let y = 0; y < piece.shape.length; y++) {
    for (let x = 0; x < piece.shape[y].length; x++) {
      if (piece.shape[y][x]) {
        const newX = newPosition.x + x;
        const newY = newPosition.y + y;

        // Check boundaries
        if (newX < 0 || newX >= BOARD_WIDTH || newY >= BOARD_HEIGHT) {
          return false;
        }

        // Check collision with board (allow pieces at spawn to overlap top)
        if (newY >= 0 && board[newY][newX]) {
          return false;
        }
      }
    }
  }
  return true;
}

export function rotatePiece(piece: GamePiece): number[][] {
  const shape = piece.shape;
  const size = shape.length;
  const rotated: number[][] = [];

  for (let y = 0; y < size; y++) {
    rotated[y] = [];
    for (let x = 0; x < size; x++) {
      rotated[y][x] = shape[size - 1 - x][y];
    }
  }

  return rotated;
}

export function canRotate(board: Board, piece: GamePiece): boolean {
  const rotated = rotatePiece(piece);
  const testPiece = { ...piece, shape: rotated };
  return isValidMove(board, testPiece, piece.position);
}

// Enhanced rotation with wall kick support
export function rotateWithWallKick(board: Board, piece: GamePiece): { shape: number[][]; position: Position } | null {
  // Try basic rotation first
  const rotated = rotatePiece(piece);
  const testPiece = { ...piece, shape: rotated };
  
  if (isValidMove(board, testPiece, piece.position)) {
    return { shape: rotated, position: piece.position };
  }

  // Wall kick attempts for I piece
  if (piece.type === 'I') {
    const kicks = [
      { x: -1, y: 0 }, { x: 1, y: 0 },
      { x: -2, y: 0 }, { x: 2, y: 0 },
      { x: 0, y: -1 }, { x: 0, y: -2 },
    ];
    
    for (const kick of kicks) {
      const newPos = { x: piece.position.x + kick.x, y: piece.position.y + kick.y };
      if (isValidMove(board, testPiece, newPos)) {
        return { shape: rotated, position: newPos };
      }
    }
  } else {
    // Standard wall kicks
    const kicks = [{ x: -1, y: 0 }, { x: 1, y: 0 }, { x: 0, y: -1 }];
    
    for (const kick of kicks) {
      const newPos = { x: piece.position.x + kick.x, y: piece.position.y + kick.y };
      if (isValidMove(board, testPiece, newPos)) {
        return { shape: rotated, position: newPos };
      }
    }
  }

  return null;
}

// Detect T-spin
export function detectTSpin(board: Board, piece: GamePiece): boolean {
  if (piece.type !== 'T') return false;
  
  const { x, y } = piece.position;
  
  // Check corners around the T piece
  const corners = [
    { x: x - 1, y: y - 1 },
    { x: x + 1, y: y - 1 },
    { x: x - 1, y: y + 1 },
    { x: x + 1, y: y + 1 },
  ];
  
  let filledCorners = 0;
  for (const corner of corners) {
    if (corner.y < 0 || corner.y >= BOARD_HEIGHT || corner.x < 0 || corner.x >= BOARD_WIDTH) {
      filledCorners++;
    } else if (board[corner.y][corner.x]) {
      filledCorners++;
    }
  }
  
  return filledCorners >= 3;
}

export function lockPiece(board: Board, piece: GamePiece): Board {
  const newBoard = board.map(row => [...row]);

  for (let y = 0; y < piece.shape.length; y++) {
    for (let x = 0; x < piece.shape[y].length; x++) {
      if (piece.shape[y][x]) {
        const boardY = piece.position.y + y;
        const boardX = piece.position.x + x;
        if (boardY >= 0 && boardY < BOARD_HEIGHT && boardX >= 0 && boardX < BOARD_WIDTH) {
          newBoard[boardY][boardX] = piece.color;
        }
      }
    }
  }

  return newBoard;
}

export function clearLines(board: Board): { newBoard: Board; linesCleared: number; clearedRows: number[] } {
  const clearedRows: number[] = [];
  let linesCleared = 0;
  const newBoard = board.filter((row, index) => {
    const isFull = row.every(cell => cell !== null);
    if (isFull) {
      clearedRows.push(index);
      linesCleared++;
      return false;
    }
    return true;
  });

  // Add empty rows at the top
  while (newBoard.length < BOARD_HEIGHT) {
    newBoard.unshift(Array.from({ length: BOARD_WIDTH }, () => null));
  }

  return { newBoard, linesCleared, clearedRows };
}

// Determine clear type based on lines cleared and T-spin
export function determineClearType(linesCleared: number, isTSpin: boolean): ClearType {
  if (isTSpin) {
    switch (linesCleared) {
      case 1: return 'tspin-single';
      case 2: return 'tspin-double';
      case 3: return 'tspin-triple';
      default: return 'tspin';
    }
  }
  
  switch (linesCleared) {
    case 1: return 'single';
    case 2: return 'double';
    case 3: return 'triple';
    case 4: return 'tetris';
    default: return 'none';
  }
}

// Calculate attack lines to send in battle mode
export function calculateAttackLines(clearType: ClearType, combo: number): number {
  let baseLines = 0;
  
  switch (clearType) {
    case 'single': baseLines = 0; break;
    case 'double': baseLines = 1; break;
    case 'triple': baseLines = 2; break;
    case 'tetris': baseLines = 4; break;
    case 'tspin': baseLines = 2; break;
    case 'tspin-single': baseLines = 2; break;
    case 'tspin-double': baseLines = 4; break;
    case 'tspin-triple': baseLines = 6; break;
    default: baseLines = 0;
  }
  
  // Add combo bonus
  const comboBonus = Math.max(0, combo - 1);
  
  return baseLines + comboBonus;
}

// Enhanced scoring with combo multipliers
export function calculateScore(clearType: ClearType, level: number, combo: number): number {
  const baseScores: Record<ClearType, number> = {
    'none': 0,
    'single': 100,
    'double': 300,
    'triple': 500,
    'tetris': 800,
    'tspin': 400,
    'tspin-single': 800,
    'tspin-double': 1200,
    'tspin-triple': 1600,
  };
  
  const baseScore = baseScores[clearType] || 0;
  const levelMultiplier = level;
  
  // Combo multiplier (increases with combo count)
  const comboMultiplier = 1 + (combo * 0.1);
  
  return Math.floor(baseScore * levelMultiplier * comboMultiplier);
}

export function calculateLevel(totalLines: number): number {
  return Math.floor(totalLines / 10) + 1;
}

export function getDropSpeed(level: number): number {
  // Speed in milliseconds, gets faster with each level
  // Classic formula with modern tweaks
  const speeds = [
    1000, 900, 800, 700, 600, 500, 450, 400, 350, 300,
    250, 220, 200, 180, 160, 150, 140, 130, 120, 100,
  ];
  return speeds[Math.min(level - 1, speeds.length - 1)] || 50;
}

export function isGameOver(board: Board, piece: GamePiece): boolean {
  // Check if the newly spawned piece collides immediately
  return !isValidMove(board, piece, piece.position);
}

// Add garbage lines to board (for battle mode)
export function addGarbageLines(board: Board, lines: number, clearable: boolean = true): Board {
  const newBoard = board.map(row => [...row]);
  
  for (let i = 0; i < lines; i++) {
    // Remove top row
    newBoard.shift();
    
    // Create garbage row with optional clearable cell
    const garbageRow: (string | null)[] = [];
    const clearableX = clearable ? Math.floor(Math.random() * BOARD_WIDTH) : -1;
    
    for (let x = 0; x < BOARD_WIDTH; x++) {
      if (x === clearableX) {
        garbageRow.push(null); // Clearable cell
      } else {
        garbageRow.push('#444444'); // Gray garbage
      }
    }
    
    newBoard.push(garbageRow);
  }
  
  return newBoard;
}

// Clear garbage cells from board
export function clearGarbage(board: Board): Board {
  return board.map(row => 
    row.map(cell => cell === '#444444' ? null : cell)
  );
}

// Get cells for T-spin detection
export function getTSpinCorners(board: Board, piece: GamePiece): boolean[] {
  const { x, y } = piece.position;
  
  return [
    y > 0 && x > 0 && board[y - 1][x - 1] !== null, // Top-left
    y > 0 && x + 2 < BOARD_WIDTH && board[y - 1][x + 2] !== null, // Top-right
    y + 2 < BOARD_HEIGHT && x > 0 && board[y + 1][x - 1] !== null, // Bottom-left
    y + 2 < BOARD_HEIGHT && x + 2 < BOARD_WIDTH && board[y + 1][x + 2] !== null, // Bottom-right
  ];
}
