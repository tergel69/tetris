# TETRIS UNLEASHED - Complete Game Specification

## Project Overview

**Project Name:** Tetris Unleashed  
**Project Type:** Browser-based Arcade Puzzle Game  
**Core Functionality:** A modern, feature-rich Tetris game with multiple game modes, power-ups, visual effects, progression system, and story content  
**Target Users:** Casual gamers, competitive players, Tetris enthusiasts

---

## Game Modes

### 1. Classic Mode
The traditional Tetris experience with modern enhancements.

**Features:**
- Standard 10x20 board
- 7 standard tetrominoes with classic colors
- Level-based progression (levels 1-15+)
- Scoring: 40/100/300/1200 × level for 1/2/3/4 lines
- Ghost piece showing landing position
- Hold piece functionality (swap current piece)
- Modern visual effects and animations

**Modern Enhancements:**
- Infinite hold piece (can swap anytime)
- Wall kick system (rotation near walls)
- T-spin detection and bonus
- Combo system for consecutive clears
- Piece preview queue (next 3 pieces)
- Modern neon aesthetic with glow effects

### 2. Battle Royale Mode (Versus)
Competitive multiplayer-style gameplay against AI or local 2-player.

**Board Setup:**
- Player 1: Left side
- Player 2 (AI or Human): Right side
- Split-screen layout

**Mechanics:**
- **Attack System:** Send garbage lines to opponent
  - Single: 0 lines
  - Double: 1 line
  - Triple: 2 lines
  - Tetris (4 lines): 4 lines
  - Combo multiplier: Additional lines based on combo count

- **Garbage Handling:**
  - Garbage lines appear at bottom
  - Garbage has one random clearable cell
  - Can clear garbage by completing lines through it
  - Defensive cards can clear garbage

- **AI Difficulty Levels:**
  - Easy: Basic moves, slow reaction
  - Medium: Some strategy, moderate speed
  - Hard: Optimal placements, fast
  - Expert: Aggressive attacks, near-perfect play

**Match Options:**
- First to [X] wins
- Time attack (most points in [X] minutes)
- Survival (last player standing)

### 3. Story Mode
Single-player campaign with levels and progression.

**Structure:**
```
Story Mode
├── Chapter 1: The Beginning
│   ├── Level 1: "First Steps" - Clear 50 lines
│   ├── Level 2: "Building Up" - Reach level 5
│   └── Level 3: "Speed Demon" - Score 5000 points
├── Chapter 2: Rising Challenges
│   ├── Level 4: "Double Trouble" - Clear 10 doubles
│   ├── Level 5: "Triple Threat" - Clear 5 triples
│   └── Level 6: "Tetris Master" - Clear 3 tetrises
├── Chapter 3: Battle Preparations
│   ├── Level 7: "Garbage Training" - Handle 20 garbage lines
│   ├── Level 8: "Attack & Defend" - Win versus match (Easy)
│   └── Level 9: "Speed Challenge" - Survive 3 minutes
└── Chapter 4: The Gauntlet
    ├── Boss: "Block Bot" - Defeat first boss
    ├── Level 10: "Marathon" - Clear 100 lines
    ├── Level 11: "Versus Pro" - Win versus match (Medium)
    └── Final Boss: "The Algorithm" - Ultimate challenge
```

**Progression:**
- Complete levels to unlock next chapter
- Earn stars per level (1-3 stars based on performance)
- Collect power-up cards as rewards
- Unlock new themes and cosmetics

---

## Power-Up Card System

Cards are earned through Story Mode and can be used in Battle Royale matches.

### Offensive Cards
| Card Name | Effect | Cooldown |
|-----------|--------|----------|
| Garbage Rain | Send 4 garbage lines | 30s |
| Line Bomb | Clear any 2 lines instantly | 45s |
| Mini Tetris | Send 6 garbage lines | 60s |
| Earthquake | Shake opponent's board | 25s |
| Chaos Mode | Randomize opponent's next 3 pieces | 50s |
| Speed Up | Force opponent to drop faster | 20s |

### Defensive Cards
| Card Name | Effect | Cooldown |
|-----------|--------|----------|
| Shield | Block next attack (absorbs 6 lines) | 40s |
| Clear Garbage | Remove all garbage lines | 35s |
| Mirror | Reflectgarbage back to sender | 45s |
| Wall Build | Create protective wall | 30s |
| Second Chance | Continue after game over (once per match) | 120s |

### Utility Cards
| Card Name | Effect | Cooldown |
|-----------|--------|----------|
| Speed Boost | Double your drop speed for 15s | 25s |
| Slow Time | Slow game speed for 20s | 40s |
| Hold Freeze | Freeze hold piece timer | 30s |
| Piece Vision | Show ghost piece + next 3 | 35s |
| Score Multiplier | 2x score for 30s | 45s |

### Card Deck System
- Each player has a deck of 5 cards
- Cards have cooldown after use
- Strategic card usage is key to winning

---

## Visual Effects System

### Particle Effects
- **Line Clear:** Exploding particles in line color
- **Piece Lock:** Small landing particles
- **Tetris Clear:** Massive celebration burst
- **Combo Fire:** Increasing flames for combos
- **Garbage Receive:** Red warning flash + debris
- **Attack Send:** Green energy beam to opponent

### Glow & Post-Processing
- **Neon Glow:** All pieces have colored glow
- **Background:** Dynamic gradient with subtle animation
- **Screen Shake:** On hard landing and garbage
- **Flash Effects:** On special events

### Animations
- **Piece Movement:** Smooth interpolation
- **Rotation:** Quick rotation animation
- **Line Clear:** Row flashes and dissolves
- **Level Up:** Celebration animation
- **Game Over:** Dramatic collapse effect

### Modern UI Elements
- **Score Display:** Animated number counting
- **Level Progress:** Visual progress bar
- **Combo Counter:** Large, centered combo display
- **Card Display:** Card hand with cooldown indicators
- **Health Bar:** In Battle Royale mode

---

## Progression & Achievements

### Achievement Categories
1. **Classic Achievements**
   - "Novice": Complete first game
   - "Getting Good": Reach level 10
   - "Tetris Pro": Clear 100 tetrises
   - "Perfectionist": Score 1 million points

2. **Battle Achievements**
   - "First Blood": Win first versus match
   - "Champion": Win 50 matches
   - "Invincible": Win 10 matches without losing
   - "Garbage Master": Send 1000 total lines

3. **Story Achievements**
   - "Chapter 1 Complete"
   - "Storyteller": Complete all story levels
   - "Boss Slayer": Defeat all bosses
   - "Star Collector": Get 3 stars on all levels

4. **Special Achievements**
   - "Speed Demon": Complete level in under 2 minutes
   - "Combo King": Achieve 10+ combo
   - "Survivor": Win after receiving 50+ garbage

### Unlockables
- **Themes:** 5 different color themes
  - Classic (original colors)
  - Neon Night (bright neon)
  - Cyberpunk (cyan/magenta)
  - Sunset (warm colors)
  - Monochrome (black/white)
- **Skins:** Custom piece styles
- **Backgrounds:** 5 animated backgrounds

### Statistics Tracking
- Total games played
- Total lines cleared
- Total score earned
- Best time in each mode
- Win/loss ratio (Battle Royale)
- Cards collected and used

---

## Technical Architecture

### Game State Management
```
GameMode
├── ClassicMode
│   ├── Standard rules
│   ├── Level progression
│   └── High score tracking
├── BattleMode
│   ├── Player states (2)
│   ├── Attack queue
│   ├── Card decks
│   └── Match timer/score
└── StoryMode
    ├── Level progress
    ├── Unlocked chapters
    ├── Star counts
    └── Boss states
```

### Component Structure
```
/app
├── page.tsx (main entry)
├── layout.tsx (providers)
└── globals.css (styles)

/components
├── Game/
│   ├── TetrisGame.tsx (main game)
│   ├── Board.tsx (rendering)
│   ├── Piece.tsx (piece rendering)
│   ├── Particles.tsx (effects)
│   └── CardDisplay.tsx (battle cards)
├── Menu/
│   ├── MainMenu.tsx
│   ├── ModeSelect.tsx
│   └── Settings.tsx
├── Story/
│   ├── StoryMenu.tsx
│   ├── LevelSelect.tsx
│   └── BossBattle.tsx
└── UI/
    ├── ScoreDisplay.tsx
    ├── ProgressBar.tsx
    └── AchievementPopup.tsx

/lib
├── gameLogic.ts (core mechanics)
├── tetrominoes.ts (piece definitions)
├── types.ts (TypeScript types)
├── effects.ts (particle system)
├── cards.ts (power-up definitions)
├── story/
│   ├── levels.ts (level definitions)
│   └── bosses.ts (boss patterns)
└── progression/
    ├── achievements.ts
    └── stats.ts
```

---

## UI/UX Design

### Main Menu Layout
```
┌─────────────────────────────────────────┐
│            TETRIS UNLEASHED             │
│         (animated title logo)           │
├─────────────────────────────────────────┤
│                                         │
│  [🎮 CLASSIC]    [⚔️ BATTLE]   [📖 STORY]│
│                                         │
│  [🎨 THEMES]    [🏆 ACHIEVEMENTS]       │
│                                         │
│            [⚙️ SETTINGS]                │
│                                         │
│  Best Score: XXXXXXX   |  Level: XX     │
└─────────────────────────────────────────┘
```

### Game HUD - Classic Mode
```
┌────────────┬────────────┐
│ SCORE      │  NEXT      │
│ 1234567    │  ┌──┐      │
│            │  └──┘      │
│ LEVEL      │            │
│    7       │  HOLD      │
│ ████████░░ │  ┌──┐      │
│            │  └──┘      │
│ LINES      │            │
│   47       │  [CARDS]   │
│ ████░░░░░░ │  🎴🎴🎴    │
└────────────┴────────────┘
      [GAME BOARD]
```

### Color Scheme
- **Primary Background:** #050515 (deep space blue)
- **Panel Background:** rgba(20, 20, 40, 0.8)
- **Primary Accent:** #00FFFF (cyan neon)
- **Secondary Accent:** #FF00FF (magenta)
- **Success:** #00FF00 (green)
- **Warning:** #FF6600 (orange)
- **Danger:** #FF0044 (red)
- **Text Primary:** #FFFFFF
- **Text Secondary:** #AAAAAA

### Typography
- **Title Font:** Orbitron (futuristic)
- **Body Font:** Rajdhani (modern, readable)
- **Numbers:** Share Tech Mono (monospace for scores)

---

## Implementation Priority

### Phase 1: Core Game (Week 1)
1. Enhanced classic mode with modern features
2. Improved visual rendering with glow effects
3. Ghost piece and hold piece
4. Basic UI overhaul

### Phase 2: Battle Mode (Week 2)
1. Two-player board setup
2. Garbage line mechanics
3. AI opponent
4. Card system implementation

### Phase 3: Story Mode (Week 3)
1. Level definitions
2. Progress tracking
3. Boss battle mechanics
4. Unlock system

### Phase 4: Polish (Week 4)
1. Particle effects
2. Animations
3. Achievements
4. Themes
5. Sound effects
6. Performance optimization

---

## Acceptance Criteria

### Classic Mode
- [ ] Game plays standard Tetris rules
- [ ] Ghost piece shows landing position
- [ ] Hold piece swaps current piece
- [ ] Level increases every 10 lines
- [ ] Score calculates correctly
- [ ] Visual effects on line clears
- [ ] Game over detection works

### Battle Mode
- [ ] Two boards render side by side
- [ ] Lines sent correctly to opponent
- [ ] Garbage lines appear with clearable cell
- [ ] AI makes reasonable moves
- [ ] Card usage works correctly
- [ ] Win condition triggers properly

### Story Mode
- [ ] Level selection shows locked/unlocked
- [ ] Level objectives display correctly
- [ ] Progress saves between sessions
- [ ] Boss battles have unique mechanics
- [ ] Stars calculate based on performance

### Visual Effects
- [ ] Particles render on events
- [ ] Glow effects visible on pieces
- [ ] Animations smooth (60fps target)
- [ ] UI elements responsive
- [ ] Theme switching works

### Progression
- [ ] Achievements unlock correctly
- [ ] Stats persist between sessions
- [ ] Unlockables apply to game
- [ ] High scores save per mode
