'use client';

import { useEffect, useRef, useCallback, useState, useMemo } from 'react';
import { useGameState } from '@/hooks/useGameState';
import { useKeyboardControls } from '@/hooks/useKeyboardControls';
import { BOARD_WIDTH, BOARD_HEIGHT } from '@/lib/gameLogic';
import { GamePiece, ClearType } from '@/lib/types';
import { Particle, createParticleBurst, createLineClearParticles, updateParticle, isParticleAlive } from '@/lib/effects';

const CELL_SIZE = 26;

const drawCell = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  color: string,
  isGhost = false,
  glowIntensity: number = 1.5
) => {
  const cellX = x * CELL_SIZE;
  const cellY = y * CELL_SIZE;

  if (isGhost) {
    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.fillRect(cellX + 1, cellY + 1, CELL_SIZE - 2, CELL_SIZE - 2);
    return;
  }

  if (glowIntensity > 0) {
    ctx.shadowColor = color;
    ctx.shadowBlur = 12 * glowIntensity;
  }

  ctx.fillStyle = color;
  ctx.fillRect(cellX + 1, cellY + 1, CELL_SIZE - 2, CELL_SIZE - 2);
  ctx.shadowBlur = 0;

  ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
  ctx.fillRect(cellX + 3, cellY + 3, 4, 4);

  ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
  ctx.lineWidth = 1;
  ctx.strokeRect(cellX + 1, cellY + 1, CELL_SIZE - 2, CELL_SIZE - 2);
};

const calculateGhostPosition = (board: (string | null)[][], piece: GamePiece): { x: number; y: number } | null => {
  if (!piece) return null;
  let ghostY = piece.position.y;
  const maxY = BOARD_HEIGHT - 1;
  if (ghostY >= maxY) return { x: piece.position.x, y: ghostY };

  while (ghostY < maxY) {
    const testY = ghostY + 1;
    if (testY >= BOARD_HEIGHT) break;
    let isValid = true;
    for (let py = 0; py < piece.shape.length; py++) {
      for (let px = 0; px < piece.shape[py].length; px++) {
        if (piece.shape[py][px]) {
          const newX = piece.position.x + px;
          const newY = testY + py;
          if (newX < 0 || newX >= BOARD_WIDTH || newY >= BOARD_HEIGHT) { isValid = false; break; }
          if (newY >= 0 && board[newY][newX]) { isValid = false; break; }
        }
      }
      if (!isValid) break;
    }
    if (!isValid) break;
    ghostY++;
  }
  return { x: piece.position.x, y: ghostY };
};

function getClearTypeText(clearType: ClearType): string {
  switch (clearType) {
    case 'tetris': return 'TETRIS!';
    case 'triple': return 'TRIPLE!';
    case 'double': return 'DOUBLE!';
    case 'single': return 'SINGLE';
    case 'tspin': case 'tspin-single': return 'T-SPIN!';
    case 'tspin-double': return 'T-SPIN DOUBLE!';
    case 'tspin-triple': return 'T-SPIN TRIPLE!';
    default: return '';
  }
}

export default function EnhancedTetrisGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const nextPieceCanvasRef = useRef<HTMLCanvasElement>(null);
  const holdCanvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  
  const { gameState, movePiece, rotate, hardDrop, holdPiece, togglePause, resetGame } = useGameState('classic');
  const [isLoaded, setIsLoaded] = useState(false);
  
  useEffect(() => { setTimeout(() => setIsLoaded(true), 100); }, []);
  
  // Memoize ghost position calculation to avoid recomputation on every render
  const ghostPosition = useMemo(
    () => gameState.currentPiece ? calculateGhostPosition(gameState.board, gameState.currentPiece) : null,
    [gameState.board, gameState.currentPiece]
  );
  
  // Memoize clear text to prevent unnecessary recalculations
  const showClearText = useMemo(
    () => gameState.lastClearType !== 'none' ? getClearTypeText(gameState.lastClearType) : '',
    [gameState.lastClearType]
  );

  const drawBoard = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#080812';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = 'rgba(0, 255, 255, 0.03)';
    ctx.lineWidth = 1;
    for (let y = 0; y <= BOARD_HEIGHT; y++) {
      ctx.beginPath(); ctx.moveTo(0, y * CELL_SIZE); ctx.lineTo(BOARD_WIDTH * CELL_SIZE, y * CELL_SIZE); ctx.stroke();
    }
    for (let x = 0; x <= BOARD_WIDTH; x++) {
      ctx.beginPath(); ctx.moveTo(x * CELL_SIZE, 0); ctx.lineTo(x * CELL_SIZE, BOARD_HEIGHT * CELL_SIZE); ctx.stroke();
    }

    for (let y = 0; y < BOARD_HEIGHT; y++) {
      for (let x = 0; x < BOARD_WIDTH; x++) {
        const color = gameState.board[y][x];
        if (color && color !== '#444444') drawCell(ctx, x, y, color, false, 1.3);
      }
    }

    if (gameState.currentPiece && ghostPosition) {
      const piece = gameState.currentPiece;
      for (let y = 0; y < piece.shape.length; y++) {
        for (let x = 0; x < piece.shape[y].length; x++) {
          if (piece.shape[y][x]) drawCell(ctx, ghostPosition.x + x, ghostPosition.y + y, piece.color, true, 0.2);
        }
      }
    }

    if (gameState.currentPiece) {
      const piece = gameState.currentPiece;
      for (let y = 0; y < piece.shape.length; y++) {
        for (let x = 0; x < piece.shape[y].length; x++) {
          if (piece.shape[y][x]) drawCell(ctx, piece.position.x + x, piece.position.y + y, piece.color, false, 1.8);
        }
      }
    }
  }, [gameState.board, gameState.currentPiece, ghostPosition]);

  const drawNextPiece = useCallback(() => {
    const canvas = nextPieceCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.fillStyle = 'transparent';
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (gameState.nextPiece) {
      const piece = gameState.nextPiece;
      const offsetX = (4 - piece.shape[0].length) / 2;
      const offsetY = (4 - piece.shape.length) / 2;
      for (let y = 0; y < piece.shape.length; y++) {
        for (let x = 0; x < piece.shape[y].length; x++) {
          if (piece.shape[y][x]) drawCell(ctx, offsetX + x, offsetY + y, piece.color, false, 1.2);
        }
      }
    }
  }, [gameState.nextPiece]);

  const drawHoldPiece = useCallback(() => {
    const canvas = holdCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.fillStyle = 'transparent';
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (gameState.holdPiece) {
      const piece = gameState.holdPiece;
      const offsetX = (4 - piece.shape[0].length) / 2;
      const offsetY = (4 - piece.shape.length) / 2;
      for (let y = 0; y < piece.shape.length; y++) {
        for (let x = 0; x < piece.shape[y].length; x++) {
          if (piece.shape[y][x]) drawCell(ctx, offsetX + x, offsetY + y, piece.color, false, 1.2);
        }
      }
    }
  }, [gameState.holdPiece]);

  useEffect(() => {
    // Only trigger particles on new line clears
    if (gameState.lastClearType !== 'none') {
      const colors = ['#00FFFF', '#FF00FF', '#00FF88', '#FFD700'];
      if (gameState.lastClearType === 'tetris' || gameState.lastClearType.includes('tspin')) {
        for (let i = 0; i < 30; i++) {
          particlesRef.current.push(...createParticleBurst(
            Math.random() * BOARD_WIDTH * CELL_SIZE,
            Math.random() * BOARD_HEIGHT * CELL_SIZE,
            colors[Math.floor(Math.random() * colors.length)],
            12, 'burst'
          ));
        }
      } else {
        const color = colors[Math.floor(Math.random() * colors.length)];
        particlesRef.current.push(...createLineClearParticles(BOARD_HEIGHT / 2, CELL_SIZE, color, BOARD_WIDTH));
      }
    }
  }, [gameState.lastClearType, gameState.lines]);

  // Optimized particle system using requestAnimationFrame
  useEffect(() => {
    let animationId: number;
    
    const updateParticles = () => {
      if (particlesRef.current.length > 0) {
        particlesRef.current = particlesRef.current.map(p => updateParticle(p, 0.5)).filter(p => isParticleAlive(p));
        // Trigger re-render only when particles exist
      }
      animationId = requestAnimationFrame(updateParticles);
    };
    
    animationId = requestAnimationFrame(updateParticles);
    return () => cancelAnimationFrame(animationId);
  }, []);

  // Draw on every animation frame when game is active
  useEffect(() => {
    if (gameState.gameOver || gameState.isPaused) return;
    
    let animationId: number;
    const render = () => {
      drawBoard();
      drawNextPiece();
      drawHoldPiece();
      animationId = requestAnimationFrame(render);
    };
    
    animationId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animationId);
  }, [drawBoard, drawNextPiece, drawHoldPiece, gameState.gameOver, gameState.isPaused]);
  
  // Draw static when paused or game over
  useEffect(() => {
    if (!gameState.gameOver && !gameState.isPaused) return;
    drawBoard();
    drawNextPiece();
    drawHoldPiece();
  }, [drawBoard, drawNextPiece, drawHoldPiece, gameState.gameOver, gameState.isPaused]);
  useKeyboardControls({
    enabled: true,
    isGameOver: gameState.gameOver,
    isPaused: gameState.isPaused,
    onMoveLeft: () => movePiece(-1, 0),
    onMoveRight: () => movePiece(1, 0),
    onSoftDrop: () => movePiece(0, 1),
    onRotate: rotate,
    onHardDrop: hardDrop,
    onHold: holdPiece,
    onTogglePause: togglePause,
    onRestart: resetGame,
  });

  const comboText = gameState.combo > 1 ? `${gameState.combo} COMBO!` : '';
  const levelProgress = (gameState.lines % 10) * 10;

  return (
    <div className={`min-h-screen bg-[#050510] flex flex-col items-center justify-center p-6 transition-opacity duration-1000 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>
      {/* Title */}
      <div className="text-center mb-6">
        <h1 className="text-4xl font-bold tracking-[0.2em]">
          <span className="bg-gradient-to-r from-cyan-400 via-white to-cyan-400 bg-clip-text text-transparent">
            TETRIS
          </span>
        </h1>
      </div>

      <div className="flex gap-8 items-start">
        {/* Left Panel */}
        <div className="w-40 space-y-4">
          <Panel title="HOLD" color="cyan">
            <canvas ref={holdCanvasRef} width={4 * CELL_SIZE} height={4 * CELL_SIZE} className="w-24 h-24" />
            <div className="text-xs text-gray-500 mt-2 text-center">C or Shift</div>
            {!gameState.canHold && <div className="text-xs text-red-500 text-center mt-1">Used</div>}
          </Panel>

          <Panel title="STATS" color="cyan">
            <StatItem label="SCORE" value={gameState.score.toLocaleString()} color="text-yellow-400" />
            <StatItem label="LEVEL" value={gameState.level.toString()} color="text-green-400" />
            <ProgressBar value={levelProgress} color="from-cyan-500 to-cyan-400" />
            <StatItem label="LINES" value={gameState.lines.toString()} color="text-purple-400" />
          </Panel>
        </div>

        {/* Main Board */}
        <div className="relative">
          <div className="relative rounded-lg overflow-hidden" style={{ boxShadow: '0 0 40px rgba(0,255,255,0.2), inset 0 0 60px rgba(0,0,0,0.5)' }}>
            <canvas ref={canvasRef} width={BOARD_WIDTH * CELL_SIZE} height={BOARD_HEIGHT * CELL_SIZE} className="block" style={{ border: '2px solid rgba(0,255,255,0.3)' }} />
            
            {showClearText && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <span className={`text-4xl font-black tracking-wider ${
                  gameState.lastClearType.includes('tspin') ? 'text-pink-500' :
                  gameState.lastClearType === 'tetris' ? 'text-yellow-400' : 'text-cyan-400'
                } animate-ping`}>
                  {showClearText}
                </span>
              </div>
            )}
            
            {comboText && (
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
                <span className="text-3xl font-bold text-orange-500 animate-bounce">{comboText}</span>
              </div>
            )}
          </div>

          <div className="flex justify-center gap-4 mt-4">
            <button onClick={togglePause} className="px-6 py-2 text-sm tracking-widest uppercase border border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/10 rounded-full transition-all">
              {gameState.isPaused ? 'Resume' : 'Pause'}
            </button>
            <button onClick={resetGame} className="px-6 py-2 text-sm tracking-widest uppercase border border-gray-600 text-gray-400 hover:text-white hover:border-white/40 rounded-full transition-all">
              Restart
            </button>
          </div>
        </div>

        {/* Right Panel */}
        <div className="w-40 space-y-4">
          <Panel title="NEXT" color="cyan">
            <canvas ref={nextPieceCanvasRef} width={4 * CELL_SIZE} height={4 * CELL_SIZE} className="w-24 h-24" />
          </Panel>

          <Panel title="CONTROLS" color="gray" smaller>
            <div className="space-y-1 text-xs text-gray-400">
              <div className="flex justify-between"><span>Move</span><span className="text-cyan-400">← →</span></div>
              <div className="flex justify-between"><span>Rotate</span><span className="text-cyan-400">↑ / Space</span></div>
              <div className="flex justify-between"><span>Soft Drop</span><span className="text-cyan-400">↓</span></div>
              <div className="flex justify-between"><span>Hard Drop</span><span className="text-cyan-400">Enter</span></div>
              <div className="flex justify-between"><span>Hold</span><span className="text-cyan-400">C / Shift</span></div>
            </div>
          </Panel>
        </div>
      </div>

      {/* Pause Overlay */}
      {gameState.isPaused && !gameState.gameOver && (
        <Overlay>
          <div className="text-center">
            <div className="text-5xl font-bold text-yellow-400 tracking-widest mb-4">PAUSED</div>
            <button onClick={togglePause} className="px-8 py-3 text-lg tracking-widest uppercase border border-cyan-500 text-cyan-400 hover:bg-cyan-500/10 rounded-full transition-all">
              Resume
            </button>
          </div>
        </Overlay>
      )}

      {/* Game Over Overlay */}
      {gameState.gameOver && (
        <Overlay>
          <div className="text-center">
            <div className="text-5xl font-bold text-red-500 tracking-widest mb-2">GAME OVER</div>
            <div className="text-2xl text-yellow-400 mb-2">Score: {gameState.score.toLocaleString()}</div>
            <div className="text-lg text-green-400 mb-2">Level: {gameState.level}</div>
            <div className="text-md text-purple-400 mb-6">Lines: {gameState.lines}</div>
            <button onClick={resetGame} className="px-8 py-3 text-lg tracking-widest uppercase border border-cyan-500 text-cyan-400 hover:bg-cyan-500/10 rounded-full transition-all">
              Play Again
            </button>
          </div>
        </Overlay>
      )}
    </div>
  );
}

// UI Components
function Panel({ title, children, color = 'cyan', smaller = false }: { title: string; children: React.ReactNode; color?: string; smaller?: boolean }) {
  return (
    <div className={`bg-black/40 backdrop-blur-md border rounded-xl p-4 ${smaller ? 'text-xs' : ''}`}
      style={{ borderColor: `rgba(${color === 'cyan' ? '0,255,255' : '255,255,255'}, 0.2)` }}>
      <h3 className={`text-${color}-400 font-bold tracking-widest uppercase mb-3 text-center`}>{title}</h3>
      {children}
    </div>
  );
}

function StatItem({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="flex justify-between items-center mb-2">
      <span className="text-gray-500 text-xs tracking-wider">{label}</span>
      <span className={`font-bold ${color}`}>{value}</span>
    </div>
  );
}

function ProgressBar({ value, color }: { value: number; color: string }) {
  return (
    <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden mb-3">
      <div className={`h-full bg-gradient-to-r ${color} transition-all duration-300`} style={{ width: `${value}%` }} />
    </div>
  );
}

function Overlay({ children }: { children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-50 animate-fade-in">
      {children}
    </div>
  );
}
