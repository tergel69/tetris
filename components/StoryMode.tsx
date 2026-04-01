'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useGameState } from '@/hooks/useGameState';
import { useKeyboardControls } from '@/hooks/useKeyboardControls';
import {
  STORY_CHAPTERS,
  STORY_LEVELS,
  getLevelStars,
  getStoryObjectiveProgress,
  getStoryStars,
  getTotalStars,
  isLevelUnlocked,
  isStoryObjectiveComplete,
  saveLevelProgress,
  type StoryRunMetrics,
} from '@/lib/story';
import { BOARD_HEIGHT, BOARD_WIDTH } from '@/lib/gameLogic';
import { GamePiece } from '@/lib/types';

interface StoryModeProps {
  onBack: () => void;
}

const CELL_SIZE = 24;

function drawCell(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  color: string,
  isGhost = false
) {
  const pixelX = x * CELL_SIZE;
  const pixelY = y * CELL_SIZE;

  if (isGhost) {
    ctx.fillStyle = 'rgba(255, 255, 255, 0.12)';
    ctx.fillRect(pixelX + 1, pixelY + 1, CELL_SIZE - 2, CELL_SIZE - 2);
    return;
  }

  ctx.fillStyle = color;
  ctx.fillRect(pixelX + 1, pixelY + 1, CELL_SIZE - 2, CELL_SIZE - 2);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.22)';
  ctx.fillRect(pixelX + 3, pixelY + 3, 4, 4);
}

function calculateGhostPosition(
  board: (string | null)[][],
  piece: GamePiece
): { x: number; y: number } | null {
  let y = piece.position.y;

  while (y + 1 < BOARD_HEIGHT) {
    let valid = true;
    for (let py = 0; py < piece.shape.length; py++) {
      for (let px = 0; px < piece.shape[py].length; px++) {
        if (!piece.shape[py][px]) continue;
        const boardX = piece.position.x + px;
        const boardY = y + 1 + py;
        if (boardX < 0 || boardX >= BOARD_WIDTH || boardY >= BOARD_HEIGHT) {
          valid = false;
          break;
        }
        if (boardY >= 0 && board[boardY][boardX]) {
          valid = false;
          break;
        }
      }
      if (!valid) break;
    }
    if (!valid) break;
    y++;
  }

  return { x: piece.position.x, y };
}

export default function StoryMode({ onBack }: StoryModeProps) {
  const [selectedChapter, setSelectedChapter] = useState(1);
  const [selectedLevel, setSelectedLevel] = useState<number | null>(null);
  const [objectiveCounters, setObjectiveCounters] = useState({ doubles: 0, triples: 0, tetrises: 0, garbageCleared: 0 });
  const [isLoaded, setIsLoaded] = useState(false);
  const [runStartedAt, setRunStartedAt] = useState<number>(0);
  const [now, setNow] = useState(() => Date.now());

  const { gameState, movePiece, rotate, hardDrop, holdPiece, togglePause, resetGame } = useGameState('story');

  const boardCanvasRef = useRef<HTMLCanvasElement>(null);
  const nextCanvasRef = useRef<HTMLCanvasElement>(null);
  const holdCanvasRef = useRef<HTMLCanvasElement>(null);
  const lastClearTypeRef = useRef(gameState.lastClearType);
  const savedProgressRef = useRef(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setIsLoaded(true), 100);
    return () => window.clearTimeout(timer);
  }, []);

  const startLevel = (levelId: number) => {
    setSelectedLevel(levelId);
    setObjectiveCounters({ doubles: 0, triples: 0, tetrises: 0, garbageCleared: 0 });
    setRunStartedAt(now);
    lastClearTypeRef.current = 'none';
    savedProgressRef.current = false;
    resetGame();
  };

  const exitLevel = () => {
    setSelectedLevel(null);
    setObjectiveCounters({ doubles: 0, triples: 0, tetrises: 0, garbageCleared: 0 });
    setRunStartedAt(0);
    lastClearTypeRef.current = 'none';
    savedProgressRef.current = false;
    resetGame();
  };

  useEffect(() => {
    if (selectedLevel === null) return;
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, [selectedLevel]);

  useEffect(() => {
    if (!selectedLevel) return;

    const lastType = gameState.lastClearType;
    if (lastType === lastClearTypeRef.current) return;
    lastClearTypeRef.current = lastType;

    if (lastType === 'double') {
      window.requestAnimationFrame(() => {
        setObjectiveCounters(prev => ({ ...prev, doubles: prev.doubles + 1 }));
      });
    }
    if (lastType === 'triple') {
      window.requestAnimationFrame(() => {
        setObjectiveCounters(prev => ({ ...prev, triples: prev.triples + 1 }));
      });
    }
    if (lastType === 'tetris') {
      window.requestAnimationFrame(() => {
        setObjectiveCounters(prev => ({ ...prev, tetrises: prev.tetrises + 1 }));
      });
    }
  }, [gameState.lastClearType, selectedLevel]);

  const currentLevel = useMemo(
    () => STORY_LEVELS.find(level => level.id === selectedLevel) ?? null,
    [selectedLevel]
  );
  const chapterLevels = useMemo(() => STORY_LEVELS.filter(level => level.chapter === selectedChapter), [selectedChapter]);
  const currentChapter = useMemo(() => STORY_CHAPTERS.find(chapter => chapter.id === selectedChapter) ?? null, [selectedChapter]);

  const totalStars = getTotalStars();
  const levelStars = selectedLevel ? getLevelStars(selectedLevel) : 0;
  const elapsedSeconds = runStartedAt ? Math.max(0, Math.floor((now - runStartedAt) / 1000)) : 0;

  const objectiveMetrics: StoryRunMetrics = useMemo(() => ({
    score: gameState.score,
    level: gameState.level,
    lines: gameState.lines,
    combo: gameState.combo,
    doubles: objectiveCounters.doubles,
    triples: objectiveCounters.triples,
    tetrises: objectiveCounters.tetrises,
    garbageCleared: objectiveCounters.garbageCleared,
    elapsedSeconds,
  }), [
    elapsedSeconds,
    gameState.combo,
    gameState.level,
    gameState.lines,
    gameState.score,
    objectiveCounters.doubles,
    objectiveCounters.garbageCleared,
    objectiveCounters.triples,
    objectiveCounters.tetrises,
  ]);

  const objectiveProgress = currentLevel ? getStoryObjectiveProgress(currentLevel, objectiveMetrics) : 0;
  const objectiveComplete = currentLevel ? isStoryObjectiveComplete(currentLevel, objectiveMetrics) : false;
  const levelOutcome: 'playing' | 'complete' | 'failed' = !selectedLevel
    ? 'playing'
    : objectiveComplete
      ? 'complete'
      : gameState.gameOver
        ? 'failed'
        : 'playing';
  const progressPercent = currentLevel
    ? Math.min(100, (objectiveProgress / Math.max(1, currentLevel.objective.target)) * 100)
    : 0;

  useEffect(() => {
    if (!currentLevel || !selectedLevel || savedProgressRef.current) return;

    if (objectiveComplete) {
      const stars = getStoryStars(currentLevel, objectiveMetrics);
      saveLevelProgress(selectedLevel, stars, gameState.score);
      savedProgressRef.current = true;
      return;
    }

    if (gameState.gameOver) {
      saveLevelProgress(selectedLevel, 0, gameState.score);
      savedProgressRef.current = true;
    }
  }, [currentLevel, gameState.gameOver, gameState.score, objectiveComplete, objectiveMetrics, selectedLevel]);

  useKeyboardControls({
    enabled: selectedLevel !== null,
    isGameOver: levelOutcome !== 'playing' || gameState.gameOver,
    isPaused: gameState.isPaused,
    onMoveLeft: () => movePiece(-1, 0),
    onMoveRight: () => movePiece(1, 0),
    onSoftDrop: () => movePiece(0, 1),
    onRotate: rotate,
    onHardDrop: hardDrop,
    onHold: holdPiece,
    onTogglePause: togglePause,
    onRestart: exitLevel,
    onBack,
  });

  useEffect(() => {
    const canvas = boardCanvasRef.current;
    if (!canvas || !selectedLevel) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#080812';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    for (let y = 0; y < BOARD_HEIGHT; y++) {
      for (let x = 0; x < BOARD_WIDTH; x++) {
        const cell = gameState.board[y][x];
        if (cell && cell !== '#444444') {
          drawCell(ctx, x, y, cell);
        }
      }
    }

    if (gameState.currentPiece) {
      const ghost = calculateGhostPosition(gameState.board, gameState.currentPiece);
      if (ghost) {
        for (let y = 0; y < gameState.currentPiece.shape.length; y++) {
          for (let x = 0; x < gameState.currentPiece.shape[y].length; x++) {
            if (gameState.currentPiece.shape[y][x]) {
              drawCell(ctx, ghost.x + x, ghost.y + y, gameState.currentPiece.color, true);
            }
          }
        }
      }

      for (let y = 0; y < gameState.currentPiece.shape.length; y++) {
        for (let x = 0; x < gameState.currentPiece.shape[y].length; x++) {
          if (gameState.currentPiece.shape[y][x]) {
            drawCell(ctx, gameState.currentPiece.position.x + x, gameState.currentPiece.position.y + y, gameState.currentPiece.color);
          }
        }
      }
    }
  }, [gameState.board, gameState.currentPiece, selectedLevel]);

  useEffect(() => {
    const nextCanvas = nextCanvasRef.current;
    if (!nextCanvas) return;
    const ctx = nextCanvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, nextCanvas.width, nextCanvas.height);
    if (!gameState.nextPiece) return;

    const offsetX = (4 - gameState.nextPiece.shape[0].length) / 2;
    const offsetY = (4 - gameState.nextPiece.shape.length) / 2;
    for (let y = 0; y < gameState.nextPiece.shape.length; y++) {
      for (let x = 0; x < gameState.nextPiece.shape[y].length; x++) {
        if (gameState.nextPiece.shape[y][x]) {
          drawCell(ctx, offsetX + x, offsetY + y, gameState.nextPiece.color);
        }
      }
    }
  }, [gameState.nextPiece]);

  useEffect(() => {
    const holdCanvas = holdCanvasRef.current;
    if (!holdCanvas) return;
    const ctx = holdCanvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, holdCanvas.width, holdCanvas.height);
    if (!gameState.holdPiece) return;

    const offsetX = (4 - gameState.holdPiece.shape[0].length) / 2;
    const offsetY = (4 - gameState.holdPiece.shape.length) / 2;
    for (let y = 0; y < gameState.holdPiece.shape.length; y++) {
      for (let x = 0; x < gameState.holdPiece.shape[y].length; x++) {
        if (gameState.holdPiece.shape[y][x]) {
          drawCell(ctx, offsetX + x, offsetY + y, gameState.holdPiece.color);
        }
      }
    }
  }, [gameState.holdPiece]);

  if (selectedLevel === null) {
    return (
      <div className={`min-h-screen bg-[#050510] flex flex-col items-center p-6 text-white transition-opacity duration-700 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>
        <div className="w-full max-w-6xl">
          <div className="flex flex-col items-center text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-black tracking-[0.25em] uppercase bg-gradient-to-r from-purple-300 via-fuchsia-400 to-cyan-300 bg-clip-text text-transparent">
              Story Mode
            </h1>
            <p className="mt-3 max-w-2xl text-sm md:text-base text-gray-400">
              Progress through chapters, unlock rewards, and chase perfect runs with tracked objectives and saved stars.
            </p>
            <div className="mt-4 flex gap-4 text-xs uppercase tracking-[0.25em] text-gray-400">
              <span>Total Stars {totalStars}</span>
              <span>Levels {STORY_LEVELS.length}</span>
            </div>
          </div>

          <div className="flex flex-wrap justify-center gap-3 mb-8">
            {STORY_CHAPTERS.map(chapter => {
              const unlocked = chapter.id === 1 || totalStars >= chapter.starsRequired;
              return (
                <button
                  key={chapter.id}
                  onClick={() => unlocked && setSelectedChapter(chapter.id)}
                  disabled={!unlocked}
                  className={`px-5 py-3 rounded-full border text-sm uppercase tracking-[0.2em] transition-all ${
                    selectedChapter === chapter.id
                      ? 'bg-purple-500/15 border-purple-400 text-purple-200'
                      : unlocked
                        ? 'bg-white/5 border-white/15 text-gray-300 hover:border-cyan-300/50'
                        : 'bg-white/5 border-white/5 text-gray-600 cursor-not-allowed'
                  }`}
                >
                  Chapter {chapter.id}
                </button>
              );
            })}
          </div>

          {currentChapter && (
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-cyan-300">{currentChapter.name}</h2>
              <p className="text-gray-400 mt-2">{currentChapter.description}</p>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {chapterLevels.map(level => {
              const unlocked = isLevelUnlocked(level.id);
              const stars = getLevelStars(level.id);

              return (
                <button
                  key={level.id}
                  onClick={() => {
                    if (!unlocked) return;
                    startLevel(level.id);
                  }}
                  disabled={!unlocked}
                  className={`text-left rounded-2xl border p-5 transition-all duration-300 ${
                    unlocked
                      ? 'bg-white/5 border-white/10 hover:border-cyan-300/40 hover:bg-cyan-300/5'
                      : 'bg-white/5 border-white/5 opacity-50 cursor-not-allowed'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div>
                      <div className="text-xs uppercase tracking-[0.25em] text-gray-500">Level {level.id}</div>
                      <h3 className="text-xl font-semibold text-white mt-1">{level.name}</h3>
                    </div>
                    <div className="text-2xl">{level.isBoss ? 'Boss' : level.id}</div>
                  </div>
                  <p className="text-sm text-gray-400 min-h-[3rem]">{level.description}</p>
                  <div className="mt-4 flex items-center justify-between">
                    <div className="text-xs uppercase tracking-[0.2em] text-gray-500">{level.objective.description}</div>
                    <div className="text-yellow-300 text-sm">
                      {'*'.repeat(stars).padEnd(3, '.')}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="mt-8 flex justify-center">
            <button
              onClick={onBack}
              className="px-6 py-3 rounded-full border border-white/15 text-sm uppercase tracking-[0.25em] text-gray-300 hover:border-white/40 hover:text-white transition-all"
            >
              Back to Menu
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!currentLevel) {
    return null;
  }

  return (
    <div className={`min-h-screen bg-[#050510] text-white p-4 md:p-6 transition-opacity duration-700 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col lg:flex-row items-start justify-between gap-4 mb-6">
          <button
            onClick={() => {
              exitLevel();
            }}
            className="px-5 py-3 rounded-full border border-white/15 text-sm uppercase tracking-[0.25em] text-gray-300 hover:border-white/40 hover:text-white transition-all"
          >
            Back to Levels
          </button>

          <div className="flex-1 text-center lg:text-left">
            <div className="text-xs uppercase tracking-[0.3em] text-gray-500">Story Chapter {currentLevel.chapter}</div>
            <h2 className="text-2xl md:text-3xl font-bold text-cyan-300 mt-1">{currentLevel.name}</h2>
            <p className="text-sm md:text-base text-gray-400 mt-2">{currentLevel.description}</p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 min-w-[240px]">
            <div className="text-xs uppercase tracking-[0.25em] text-gray-500">Objective</div>
            <div className="text-sm text-purple-200 mt-1">{currentLevel.objective.description}</div>
            <div className="mt-3 h-2 rounded-full bg-white/10 overflow-hidden">
              <div className="h-full bg-gradient-to-r from-cyan-400 to-purple-400 transition-all" style={{ width: `${progressPercent}%` }} />
            </div>
            <div className="mt-2 text-xs text-gray-400">
              {objectiveProgress} / {currentLevel.objective.target}
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-[220px_minmax(0,1fr)_220px] gap-6 items-start">
          <div className="space-y-4">
            <Panel title="Hold">
              <canvas ref={holdCanvasRef} width={4 * CELL_SIZE} height={4 * CELL_SIZE} className="w-24 h-24 mx-auto" />
            </Panel>
            <Panel title="Run Stats">
              <Stat label="Score" value={gameState.score.toLocaleString()} />
              <Stat label="Level" value={gameState.level.toString()} />
              <Stat label="Lines" value={gameState.lines.toString()} />
              <Stat label="Combo" value={gameState.combo.toString()} />
            </Panel>
          </div>

          <div className="flex flex-col items-center">
            <div className="rounded-3xl p-3 bg-gradient-to-br from-purple-500/10 via-cyan-500/5 to-transparent border border-white/10 shadow-[0_0_40px_rgba(168,85,247,0.15)]">
              <canvas
                ref={boardCanvasRef}
                width={BOARD_WIDTH * CELL_SIZE}
                height={BOARD_HEIGHT * CELL_SIZE}
                className="block rounded-2xl bg-[#080812]"
                style={{ width: BOARD_WIDTH * CELL_SIZE, height: BOARD_HEIGHT * CELL_SIZE }}
              />
            </div>

            <div className="mt-4 flex flex-wrap justify-center gap-3">
              <button onClick={togglePause} className="px-5 py-2 rounded-full border border-cyan-400/30 text-cyan-200 hover:bg-cyan-400/10 transition-all">
                {gameState.isPaused ? 'Resume' : 'Pause'}
              </button>
              <button onClick={resetGame} className="px-5 py-2 rounded-full border border-white/15 text-gray-300 hover:border-white/40 hover:text-white transition-all">
                Restart
              </button>
            </div>
          </div>

          <div className="space-y-4">
            <Panel title="Next">
              <canvas ref={nextCanvasRef} width={4 * CELL_SIZE} height={4 * CELL_SIZE} className="w-24 h-24 mx-auto" />
            </Panel>
            <Panel title="Controls">
              <ControlRow label="Move" value="Arrows" />
              <ControlRow label="Rotate" value="Up / Space" />
              <ControlRow label="Drop" value="Down" />
              <ControlRow label="Hard drop" value="Enter" />
              <ControlRow label="Hold" value="Shift / C" />
              <ControlRow label="Pause" value="P / Esc" />
            </Panel>
          </div>
        </div>
      </div>

      {levelOutcome !== 'playing' && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-3xl border border-white/10 bg-[#090912] p-8 text-center shadow-[0_0_60px_rgba(0,0,0,0.6)]">
            <div className={`text-4xl md:text-5xl font-black uppercase tracking-[0.2em] ${levelOutcome === 'complete' ? 'text-cyan-300' : 'text-rose-400'}`}>
              {levelOutcome === 'complete' ? 'Level Complete' : 'Run Failed'}
            </div>
            <p className="mt-4 text-gray-300">
              {levelOutcome === 'complete'
                ? 'Nice work. Your progress has been saved and the next chapter is one step closer.'
                : 'The run ended before the objective was finished. Try again with a cleaner route.'}
            </p>
            <div className="mt-6 grid grid-cols-3 gap-3 text-sm">
              <Metric label="Score" value={gameState.score.toLocaleString()} />
              <Metric label="Stars" value={`${levelStars} / 3`} />
              <Metric label="Time" value={`${elapsedSeconds}s`} />
            </div>
            <button
              onClick={() => {
                exitLevel();
              }}
              className="mt-8 px-6 py-3 rounded-full border border-cyan-400/30 text-cyan-200 hover:bg-cyan-400/10 transition-all"
            >
              Return to Levels
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-md">
      <div className="mb-3 text-xs uppercase tracking-[0.25em] text-gray-500">{title}</div>
      {children}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-1">
      <span className="text-xs uppercase tracking-[0.2em] text-gray-500">{label}</span>
      <span className="text-sm font-semibold text-white">{value}</span>
    </div>
  );
}

function ControlRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-1 text-sm">
      <span className="text-gray-400">{label}</span>
      <span className="text-cyan-200">{value}</span>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 px-3 py-4">
      <div className="text-[10px] uppercase tracking-[0.25em] text-gray-500">{label}</div>
      <div className="mt-1 text-lg font-semibold text-white">{value}</div>
    </div>
  );
}
