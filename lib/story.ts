import { StoryLevel, StoryChapter, Card, Achievement, PlayerStats } from './types';

// Story Mode Levels
export const STORY_LEVELS: StoryLevel[] = [
  // Chapter 1: The Beginning
  {
    id: 1,
    chapter: 1,
    name: 'First Steps',
    description: 'Clear 50 lines to begin your journey',
    objective: { type: 'lines', target: 50, current: 0, description: 'Clear 50 lines' },
    unlockRequirement: { type: 'level', value: 0 },
    rewards: { cards: ['speed_boost'], stars: 1 },
    isBoss: false,
  },
  {
    id: 2,
    chapter: 1,
    name: 'Building Up',
    description: 'Reach level 5 to prove your skills',
    objective: { type: 'level', target: 5, current: 0, description: 'Reach Level 5' },
    unlockRequirement: { type: 'level', value: 1 },
    rewards: { cards: ['shield'], stars: 1 },
    isBoss: false,
  },
  {
    id: 3,
    chapter: 1,
    name: 'Speed Demon',
    description: 'Score 5000 points in record time',
    objective: { type: 'score', target: 5000, current: 0, description: 'Score 5,000 points' },
    unlockRequirement: { type: 'level', value: 2 },
    rewards: { cards: ['clear_garbage'], stars: 1 },
    isBoss: false,
  },
  // Chapter 2: Rising Challenges
  {
    id: 4,
    chapter: 2,
    name: 'Double Trouble',
    description: 'Clear 10 double line combos',
    objective: { type: 'doubles', target: 10, current: 0, description: 'Clear 10 doubles' },
    unlockRequirement: { type: 'stars', value: 3 },
    rewards: { cards: ['garbage_rain'], stars: 1 },
    isBoss: false,
  },
  {
    id: 5,
    chapter: 2,
    name: 'Triple Threat',
    description: 'Clear 5 triple line combos',
    objective: { type: 'triples', target: 5, current: 0, description: 'Clear 5 triples' },
    unlockRequirement: { type: 'level', value: 4 },
    rewards: { cards: ['line_bomb'], stars: 1 },
    isBoss: false,
  },
  {
    id: 6,
    chapter: 2,
    name: 'Tetris Master',
    description: 'Clear 3 tetrises (4-line clears)',
    objective: { type: 'tetrises', target: 3, current: 0, description: 'Clear 3 tetrises' },
    unlockRequirement: { type: 'level', value: 5 },
    rewards: { cards: ['mini_tetris'], stars: 2 },
    isBoss: false,
  },
  // Chapter 3: Battle Preparations
  {
    id: 7,
    chapter: 3,
    name: 'Garbage Training',
    description: 'Handle 20 incoming garbage lines',
    objective: { type: 'garbage', target: 20, current: 0, description: 'Handle 20 garbage' },
    unlockRequirement: { type: 'stars', value: 6 },
    rewards: { cards: ['mirror'], stars: 1 },
    isBoss: false,
  },
  {
    id: 8,
    chapter: 3,
    name: 'Attack & Defend',
    description: 'Win your first versus match',
    objective: { type: 'wins', target: 1, current: 0, description: 'Win 1 versus match' },
    unlockRequirement: { type: 'level', value: 7 },
    rewards: { cards: ['earthquake'], stars: 2 },
    isBoss: false,
  },
  {
    id: 9,
    chapter: 3,
    name: 'Speed Challenge',
    description: 'Survive for 3 minutes',
    objective: { type: 'time', target: 180, current: 0, description: 'Survive 3 minutes' },
    unlockRequirement: { type: 'level', value: 8 },
    rewards: { cards: ['slow_time'], stars: 1 },
    isBoss: false,
  },
  // Chapter 4: The Gauntlet
  {
    id: 10,
    chapter: 4,
    name: 'Block Bot',
    description: 'Defeat the first boss - Block Bot',
    objective: { type: 'boss', target: 1, current: 0, description: 'Defeat Block Bot' },
    unlockRequirement: { type: 'stars', value: 9 },
    rewards: { cards: ['second_chance'], stars: 2 },
    isBoss: true,
    bossPattern: 'blockbot',
  },
  {
    id: 11,
    chapter: 4,
    name: 'Marathon',
    description: 'Clear 100 lines in one game',
    objective: { type: 'lines', target: 100, current: 0, description: 'Clear 100 lines' },
    unlockRequirement: { type: 'boss', value: 10 },
    rewards: { cards: ['score_multiplier'], stars: 2 },
    isBoss: false,
  },
  {
    id: 12,
    chapter: 4,
    name: 'Versus Pro',
    description: 'Win against Medium AI',
    objective: { type: 'wins', target: 3, current: 0, description: 'Win 3 versus matches' },
    unlockRequirement: { type: 'level', value: 11 },
    rewards: { cards: ['chaos_mode'], stars: 3 },
    isBoss: false,
  },
  {
    id: 13,
    chapter: 4,
    name: 'The Algorithm',
    description: 'Defeat the ultimate boss',
    objective: { type: 'boss', target: 1, current: 0, description: 'Defeat The Algorithm' },
    unlockRequirement: { type: 'stars', value: 15 },
    rewards: { cards: ['all'], stars: 3 },
    isBoss: true,
    bossPattern: 'algorithm',
  },
];

// Story Chapters
export const STORY_CHAPTERS: StoryChapter[] = [
  {
    id: 1,
    name: 'The Beginning',
    description: 'Learn the basics of Tetris',
    levels: [1, 2, 3],
    unlocked: true,
    starsRequired: 0,
  },
  {
    id: 2,
    name: 'Rising Challenges',
    description: 'Master advanced techniques',
    levels: [4, 5, 6],
    unlocked: false,
    starsRequired: 3,
  },
  {
    id: 3,
    name: 'Battle Preparations',
    description: 'Prepare for versus combat',
    levels: [7, 8, 9],
    unlocked: false,
    starsRequired: 6,
  },
  {
    id: 4,
    name: 'The Gauntlet',
    description: 'Face the ultimate challenge',
    levels: [10, 11, 12, 13],
    unlocked: false,
    starsRequired: 9,
  },
];

// Battle Cards
export const BATTLE_CARDS: Card[] = [
  // Offensive Cards
  {
    id: 'garbage_rain',
    name: 'Garbage Rain',
    description: 'Send 4 garbage lines to opponent',
    type: 'offensive',
    cooldown: 30,
    lastUsed: 0,
    icon: '🌧️',
  },
  {
    id: 'line_bomb',
    name: 'Line Bomb',
    description: 'Clear any 2 lines instantly',
    type: 'offensive',
    cooldown: 45,
    lastUsed: 0,
    icon: '💣',
  },
  {
    id: 'mini_tetris',
    name: 'Mini Tetris',
    description: 'Send 6 garbage lines',
    type: 'offensive',
    cooldown: 60,
    lastUsed: 0,
    icon: '🧱',
  },
  {
    id: 'earthquake',
    name: 'Earthquake',
    description: 'Shake opponent screen',
    type: 'offensive',
    cooldown: 25,
    lastUsed: 0,
    icon: '🌋',
  },
  {
    id: 'chaos_mode',
    name: 'Chaos Mode',
    description: 'Randomize opponent next pieces',
    type: 'offensive',
    cooldown: 50,
    lastUsed: 0,
    icon: '🎲',
  },
  {
    id: 'speed_up',
    name: 'Speed Up',
    description: 'Force opponent drop faster',
    type: 'offensive',
    cooldown: 20,
    lastUsed: 0,
    icon: '⚡',
  },
  // Defensive Cards
  {
    id: 'shield',
    name: 'Shield',
    description: 'Block next attack (6 lines)',
    type: 'defensive',
    cooldown: 40,
    lastUsed: 0,
    icon: '🛡️',
  },
  {
    id: 'clear_garbage',
    name: 'Clear Garbage',
    description: 'Remove all garbage lines',
    type: 'defensive',
    cooldown: 35,
    lastUsed: 0,
    icon: '🧹',
  },
  {
    id: 'mirror',
    name: 'Mirror',
    description: 'Reflect garbage back',
    type: 'defensive',
    cooldown: 45,
    lastUsed: 0,
    icon: '🪞',
  },
  {
    id: 'wall_build',
    name: 'Wall Build',
    description: 'Create protective wall',
    type: 'defensive',
    cooldown: 30,
    lastUsed: 0,
    icon: '🏰',
  },
  {
    id: 'second_chance',
    name: 'Second Chance',
    description: 'Auto-revive once per match',
    type: 'defensive',
    cooldown: 120,
    lastUsed: 0,
    icon: '💖',
  },
  // Utility Cards
  {
    id: 'speed_boost',
    name: 'Speed Boost',
    description: '2x drop speed 15s',
    type: 'utility',
    cooldown: 25,
    lastUsed: 0,
    icon: '🚀',
  },
  {
    id: 'slow_time',
    name: 'Slow Time',
    description: 'Slow game 20s',
    type: 'utility',
    cooldown: 40,
    lastUsed: 0,
    icon: '⏳',
  },
  {
    id: 'score_multiplier',
    name: 'Score x2',
    description: '2x score for 30s',
    type: 'utility',
    cooldown: 45,
    lastUsed: 0,
    icon: '💎',
  },
  {
    id: 'piece_vision',
    name: 'Piece Vision',
    description: 'Show ghost + next 3',
    type: 'utility',
    cooldown: 35,
    lastUsed: 0,
    icon: '👁️',
  },
];

// Starting cards for each mode
export const STARTING_CARDS: string[] = ['speed_boost', 'clear_garbage'];

// Achievements
export const ACHIEVEMENTS: Achievement[] = [
  // Classic Achievements
  {
    id: 'novice',
    name: 'Novice',
    description: 'Complete your first game',
    category: 'classic',
    icon: '🎮',
    unlocked: false,
    requirement: { type: 'games', value: 1 },
  },
  {
    id: 'getting_good',
    name: 'Getting Good',
    description: 'Reach level 10',
    category: 'classic',
    icon: '📈',
    unlocked: false,
    requirement: { type: 'level', value: 10 },
  },
  {
    id: 'tetris_pro',
    name: 'Tetris Pro',
    description: 'Clear 100 tetrises',
    category: 'classic',
    icon: '🏆',
    unlocked: false,
    requirement: { type: 'tetrises', value: 100 },
  },
  {
    id: 'perfectionist',
    name: 'Perfectionist',
    description: 'Score 1 million points',
    category: 'classic',
    icon: '💯',
    unlocked: false,
    requirement: { type: 'score', value: 1000000 },
  },
  {
    id: 'combo_master',
    name: 'Combo Master',
    description: 'Achieve a 10+ combo',
    category: 'classic',
    icon: '🔥',
    unlocked: false,
    requirement: { type: 'max_combo', value: 10 },
  },
  // Battle Achievements
  {
    id: 'first_blood',
    name: 'First Blood',
    description: 'Win your first versus match',
    category: 'battle',
    icon: '⚔️',
    unlocked: false,
    requirement: { type: 'wins', value: 1 },
  },
  {
    id: 'champion',
    name: 'Champion',
    description: 'Win 50 versus matches',
    category: 'battle',
    icon: '👑',
    unlocked: false,
    requirement: { type: 'wins', value: 50 },
  },
  {
    id: 'invincible',
    name: 'Invincible',
    description: 'Win 10 matches without losing',
    category: 'battle',
    icon: '🛡️',
    unlocked: false,
    requirement: { type: 'streak', value: 10 },
  },
  {
    id: 'garbage_master',
    name: 'Garbage Master',
    description: 'Send 1000 total garbage lines',
    category: 'battle',
    icon: '🗑️',
    unlocked: false,
    requirement: { type: 'garbage_sent', value: 1000 },
  },
  // Story Achievements
  {
    id: 'chapter_1_complete',
    name: 'Chapter 1 Complete',
    description: 'Complete all Chapter 1 levels',
    category: 'story',
    icon: '📖',
    unlocked: false,
    requirement: { type: 'chapter', value: 1 },
  },
  {
    id: 'storyteller',
    name: 'Storyteller',
    description: 'Complete all story levels',
    category: 'story',
    icon: '📚',
    unlocked: false,
    requirement: { type: 'levels', value: 13 },
  },
  {
    id: 'boss_slayer',
    name: 'Boss Slayer',
    description: 'Defeat all bosses',
    category: 'story',
    icon: '👹',
    unlocked: false,
    requirement: { type: 'bosses', value: 2 },
  },
  {
    id: 'star_collector',
    name: 'Star Collector',
    description: 'Get 3 stars on all levels',
    category: 'story',
    icon: '⭐',
    unlocked: false,
    requirement: { type: 'stars', value: 39 },
  },
  // Special Achievements
  {
    id: 'speed_demon_achievement',
    name: 'Speed Demon',
    description: 'Complete a level in under 2 minutes',
    category: 'special',
    icon: '💨',
    unlocked: false,
    requirement: { type: 'time', value: 120 },
  },
  {
    id: 'survivor',
    name: 'Survivor',
    description: 'Win after receiving 50+ garbage',
    category: 'special',
    icon: '🏃',
    unlocked: false,
    requirement: { type: 'garbage_received', value: 50 },
  },
];

// Default Player Stats
export const DEFAULT_PLAYER_STATS: PlayerStats = {
  totalGames: 0,
  totalLinesCleared: 0,
  totalScore: 0,
  bestScore: 0,
  bestLevel: 1,
  bestTime: 0,
  totalTetrises: 0,
  maxCombo: 0,
  classicWins: 0,
  battleWins: 0,
  battleLosses: 0,
  cardsEarned: 0,
  cardsUsed: 0,
  storyProgress: 0,
  starsCollected: 0,
};

// Get card by ID
export function getCardById(id: string): Card | undefined {
  return BATTLE_CARDS.find(card => card.id === id);
}

// Get level by ID
export function getLevelById(id: number): StoryLevel | undefined {
  return STORY_LEVELS.find(level => level.id === id);
}

// Get chapter by ID
export function getChapterById(id: number): StoryChapter | undefined {
  return STORY_CHAPTERS.find(chapter => chapter.id === id);
}

// Check if level is unlocked
export function isLevelUnlocked(levelId: number): boolean {
  const level = getLevelById(levelId);
  if (!level) return false;
  
  if (level.unlockRequirement.type === 'level') {
    // Check if previous levels completed
    const prevLevels = STORY_LEVELS.filter(l => l.chapter === level.chapter && l.id < levelId);
    return prevLevels.every(l => {
      const stars = getLevelStars(l.id);
      return stars > 0;
    });
  }
  
  if (level.unlockRequirement.type === 'stars') {
    // Check total stars
    return getTotalStars() >= level.unlockRequirement.value;
  }
  
  if (level.unlockRequirement.type === 'boss') {
    const bossLevel = getLevelById(level.unlockRequirement.value);
    if (!bossLevel) return false;
    return getLevelStars(bossLevel.id) > 0;
  }
  
  return true;
}

// Get stars for a level (placeholder - would load from storage)
export function getLevelStars(levelId: number): number {
  if (typeof window === 'undefined') return 0;
  const saved = localStorage.getItem(`tetris_level_${levelId}_stars`);
  return saved ? parseInt(saved) : 0;
}

// Get total stars
export function getTotalStars(): number {
  if (typeof window === 'undefined') return 0;
  let total = 0;
  STORY_LEVELS.forEach(level => {
    total += getLevelStars(level.id);
  });
  return total;
}

// Save level progress
export function saveLevelProgress(levelId: number, stars: number, score: number) {
  if (typeof window === 'undefined') return;
  const existing = getLevelStars(levelId);
  if (stars > existing) {
    localStorage.setItem(`tetris_level_${levelId}_stars`, stars.toString());
  }
  localStorage.setItem(`tetris_level_${levelId}_score`, score.toString());
}

// Save achievement
export function unlockAchievement(achievementId: string) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(`tetris_achievement_${achievementId}`, Date.now().toString());
}

// Check if achievement is unlocked
export function isAchievementUnlocked(achievementId: string): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(`tetris_achievement_${achievementId}`) !== null;
}

export interface StoryRunMetrics {
  score: number;
  level: number;
  lines: number;
  combo: number;
  doubles: number;
  triples: number;
  tetrises: number;
  garbageCleared: number;
  elapsedSeconds: number;
}

export function getStoryObjectiveProgress(level: StoryLevel, metrics: StoryRunMetrics): number {
  switch (level.objective.type) {
    case 'lines':
      return metrics.lines;
    case 'score':
      return metrics.score;
    case 'level':
      return metrics.level;
    case 'doubles':
      return metrics.doubles;
    case 'triples':
      return metrics.triples;
    case 'tetrises':
      return metrics.tetrises;
    case 'garbage':
      return metrics.garbageCleared;
    case 'time':
      return metrics.elapsedSeconds;
    case 'wins':
      return Math.floor(metrics.score / 5000);
    case 'boss':
      return Math.floor((metrics.score + metrics.lines * 100) / 10000);
    default:
      return 0;
  }
}

export function isStoryObjectiveComplete(level: StoryLevel, metrics: StoryRunMetrics): boolean {
  return getStoryObjectiveProgress(level, metrics) >= level.objective.target;
}

export function getStoryStars(level: StoryLevel, metrics: StoryRunMetrics): number {
  if (!isStoryObjectiveComplete(level, metrics)) return 0;
  const efficiency = metrics.score >= 15000 || metrics.elapsedSeconds <= 120 ? 3 : metrics.score >= 8000 || metrics.elapsedSeconds <= 180 ? 2 : 1;
  return Math.max(level.rewards.stars, efficiency);
}
