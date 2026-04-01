import { Tetromino, TetrominoType, Theme } from './types';

// Enhanced neon-style colors for modern Tetris
export const TETROMINOES: Record<TetrominoType, Tetromino> = {
  I: {
    type: 'I',
    shape: [
      [0, 0, 0, 0],
      [1, 1, 1, 1],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ],
    color: '#00FFFF', // Cyan neon
  },
  O: {
    type: 'O',
    shape: [
      [1, 1],
      [1, 1],
    ],
    color: '#FFD700', // Gold/Yellow neon
  },
  T: {
    type: 'T',
    shape: [
      [0, 1, 0],
      [1, 1, 1],
      [0, 0, 0],
    ],
    color: '#FF00FF', // Magenta neon
  },
  S: {
    type: 'S',
    shape: [
      [0, 1, 1],
      [1, 1, 0],
      [0, 0, 0],
    ],
    color: '#00FF88', // Mint green neon
  },
  Z: {
    type: 'Z',
    shape: [
      [1, 1, 0],
      [0, 1, 1],
      [0, 0, 0],
    ],
    color: '#FF3366', // Red/Pink neon
  },
  J: {
    type: 'J',
    shape: [
      [1, 0, 0],
      [1, 1, 1],
      [0, 0, 0],
    ],
    color: '#3366FF', // Blue neon
  },
  L: {
    type: 'L',
    shape: [
      [0, 0, 1],
      [1, 1, 1],
      [0, 0, 0],
    ],
    color: '#FF9900', // Orange neon
  },
};

// Alternative color schemes for themes
export const CLASSIC_COLORS: Record<TetrominoType, string> = {
  I: '#00F0F0',
  O: '#F0F000',
  T: '#A000F0',
  S: '#00F000',
  Z: '#F00000',
  J: '#0000F0',
  L: '#F0A000',
};

export const NEON_NIGHT_COLORS: Record<TetrominoType, string> = {
  I: '#00FFFF',
  O: '#FFFF00',
  T: '#FF00FF',
  S: '#00FF00',
  Z: '#FF0000',
  J: '#0000FF',
  L: '#FF8800',
};

export const CYBERPUNK_COLORS: Record<TetrominoType, string> = {
  I: '#00FFFF',
  O: '#FF0080',
  T: '#8000FF',
  S: '#00FF80',
  Z: '#FF0040',
  J: '#0080FF',
  L: '#FF8000',
};

export const SUNSET_COLORS: Record<TetrominoType, string> = {
  I: '#88FFFF',
  O: '#FFDD00',
  T: '#DD44FF',
  S: '#44FF88',
  Z: '#FF4444',
  J: '#4488FF',
  L: '#FF8844',
};

export const MONOCHROME_COLORS: Record<TetrominoType, string> = {
  I: '#FFFFFF',
  O: '#CCCCCC',
  T: '#999999',
  S: '#666666',
  Z: '#AAAAAA',
  J: '#777777',
  L: '#888888',
};

export const TETROMINO_TYPES: TetrominoType[] = ['I', 'O', 'T', 'S', 'Z', 'J', 'L'];

// Pre-defined themes
export const THEMES: Record<string, Theme> = {
  classic: {
    id: 'classic',
    name: 'Classic',
    pieceColors: CLASSIC_COLORS,
    backgroundColor: '#000000',
    gridColor: 'rgba(255, 255, 255, 0.2)',
    glowIntensity: 0,
    unlocked: true,
  },
  neonNight: {
    id: 'neonNight',
    name: 'Neon Night',
    pieceColors: NEON_NIGHT_COLORS,
    backgroundColor: '#050515',
    gridColor: 'rgba(255, 255, 255, 0.1)',
    glowIntensity: 1,
    unlocked: true,
  },
  cyberpunk: {
    id: 'cyberpunk',
    name: 'Cyberpunk',
    pieceColors: CYBERPUNK_COLORS,
    backgroundColor: '#0D0221',
    gridColor: 'rgba(0, 255, 255, 0.1)',
    glowIntensity: 1.5,
    unlocked: false,
  },
  sunset: {
    id: 'sunset',
    name: 'Sunset',
    pieceColors: SUNSET_COLORS,
    backgroundColor: '#1A0A0A',
    gridColor: 'rgba(255, 150, 100, 0.15)',
    glowIntensity: 0.8,
    unlocked: false,
  },
  monochrome: {
    id: 'monochrome',
    name: 'Monochrome',
    pieceColors: MONOCHROME_COLORS,
    backgroundColor: '#111111',
    gridColor: 'rgba(255, 255, 255, 0.15)',
    glowIntensity: 0.3,
    unlocked: false,
  },
};

export function getRandomTetromino(): Tetromino {
  const type = TETROMINO_TYPES[Math.floor(Math.random() * TETROMINO_TYPES.length)];
  return { ...TETROMINOES[type] };
}

export function getRandomTetrominoes(count: number): Tetromino[] {
  return Array.from({ length: count }, () => getRandomTetromino());
}

// Get rotation index (0-3) from rotation value
export function getRotationIndex(rotation: number): number {
  return ((rotation % 360) + 360) % 360;
}

// Check if piece is I tetromino
export function isIPiece(piece: Tetromino): boolean {
  return piece.type === 'I';
}

// Get the cells occupied by a piece at a given position
export function getPieceCells(piece: { shape: number[][]; position: { x: number; y: number } }): { x: number; y: number }[] {
  const cells: { x: number; y: number }[] = [];
  for (let py = 0; py < piece.shape.length; py++) {
    for (let px = 0; px < piece.shape[py].length; px++) {
      if (piece.shape[py][px]) {
        cells.push({
          x: piece.position.x + px,
          y: piece.position.y + py,
        });
      }
    }
  }
  return cells;
}
