export type TetrominoType = 'I' | 'O' | 'T' | 'S' | 'Z' | 'J' | 'L';

export interface Position {
  x: number;
  y: number;
}

export interface Tetromino {
  type: TetrominoType;
  shape: number[][];
  color: string;
}

export interface GamePiece extends Tetromino {
  position: Position;
  rotation: number; // 0, 90, 180, 270
}

export type Board = (string | null)[][];

// Game mode types
export type GameMode = 'classic' | 'battle' | 'story';

// Shared state for any single-board Tetris session.
export interface SessionState {
  // Core game data
  board: Board;
  currentPiece: GamePiece | null;
  nextPiece: Tetromino | null;
  nextPieceQueue: Tetromino[]; // Next 3 pieces
  holdPiece: Tetromino | null;
  canHold: boolean; // Can use hold (true until piece locks)
  
  // Score and progression
  score: number;
  level: number;
  lines: number;
  combo: number; // Consecutive line clears
  lastClearType: ClearType; // For combo and T-spin detection
  
  // Game status
  gameOver: boolean;
  isPaused: boolean;
}

// Extended GameState for enhanced features
export interface GameState extends SessionState {
  // Mode-specific
  gameMode: GameMode;
  
  // Cards (for battle mode)
  cards: Card[];
  
  // Battle mode specific
  opponent?: {
    board: Board;
    score: number;
    level: number;
    lines: number;
    garbagePending: number;
    health: number;
    isAI: boolean;
  };
  
  // Story mode specific
  storyLevel?: number;
  storyObjective?: StoryObjective;
  bossHealth?: number;
}

export type ClearType = 'none' | 'single' | 'double' | 'triple' | 'tetris' | 'tspin' | 'tspin-single' | 'tspin-double' | 'tspin-triple';

export interface StoryObjective {
  type: 'lines' | 'score' | 'time' | 'level' | 'wins' | 'garbage' | 'doubles' | 'triples' | 'tetrises' | 'boss';
  target: number;
  current: number;
  description: string;
}

// Card types for battle mode
export type CardType = 'offensive' | 'defensive' | 'utility';

export interface Card {
  id: string;
  name: string;
  description: string;
  type: CardType;
  cooldown: number; // seconds
  lastUsed: number; // timestamp
  icon: string;
}

export interface PlayerState extends SessionState {
  health: number;
  cards: Card[];
  garbagePending: number;
  isAI: boolean;
}

// Achievement types
export interface Achievement {
  id: string;
  name: string;
  description: string;
  category: 'classic' | 'battle' | 'story' | 'special';
  icon: string;
  unlocked: boolean;
  unlockedAt?: number;
  requirement: {
    type: string;
    value: number;
  };
}

// Player stats
export interface PlayerStats {
  totalGames: number;
  totalLinesCleared: number;
  totalScore: number;
  bestScore: number;
  bestLevel: number;
  bestTime: number;
  totalTetrises: number;
  maxCombo: number;
  classicWins: number;
  battleWins: number;
  battleLosses: number;
  cardsEarned: number;
  cardsUsed: number;
  storyProgress: number;
  starsCollected: number;
}

// Level definition for story mode
export interface StoryLevel {
  id: number;
  chapter: number;
  name: string;
  description: string;
  objective: StoryObjective;
  unlockRequirement: {
    type: 'level' | 'stars' | 'boss';
    value: number;
  };
  rewards: {
    cards: string[];
    stars: number;
  };
  isBoss: boolean;
  bossPattern?: string;
}

// Theme definition
export interface Theme {
  id: string;
  name: string;
  pieceColors: Record<TetrominoType, string>;
  backgroundColor: string;
  gridColor: string;
  glowIntensity: number;
  unlocked: boolean;
}

// Story chapter
export interface StoryChapter {
  id: number;
  name: string;
  description: string;
  levels: number[];
  unlocked: boolean;
  starsRequired: number;
}
