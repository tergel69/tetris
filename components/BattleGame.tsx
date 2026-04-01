'use client';

import { useEffect, useRef, useCallback, useState, useMemo } from 'react';
import { useBattleState } from '@/hooks/useBattleState';
import { useKeyboardControls } from '@/hooks/useKeyboardControls';
import { BOARD_WIDTH, BOARD_HEIGHT } from '@/lib/gameLogic';
import { GamePiece, Card } from '@/lib/types';

const CELL_SIZE = 22;

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
    ctx.shadowBlur = 10 * glowIntensity;
  }
  ctx.fillStyle = color;
  ctx.fillRect(cellX + 1, cellY + 1, CELL_SIZE - 2, CELL_SIZE - 2);
  ctx.shadowBlur = 0;
};

const drawBoard = (ctx: CanvasRenderingContext2D, board: (string | null)[][], currentPiece: GamePiece | null, ghostPos: { x: number; y: number } | null, width: number, height: number, bgColor: string, borderColor: string) => {
  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, width, height);
  
  ctx.strokeStyle = borderColor;
  ctx.lineWidth = 2;
  ctx.strokeRect(0, 0, width, height);

  for (let y = 0; y < BOARD_HEIGHT; y++) {
    for (let x = 0; x < BOARD_WIDTH; x++) {
      const color = board[y][x];
      if (color && color !== '#444444') drawCell(ctx, x, y, color, false, 1.2);
    }
  }

  if (currentPiece && ghostPos) {
    for (let y = 0; y < currentPiece.shape.length; y++) {
      for (let x = 0; x < currentPiece.shape[y].length; x++) {
        if (currentPiece.shape[y][x]) drawCell(ctx, ghostPos.x + x, ghostPos.y + y, currentPiece.color, true, 0.2);
      }
    }
  }

  if (currentPiece) {
    for (let y = 0; y < currentPiece.shape.length; y++) {
      for (let x = 0; x < currentPiece.shape[y].length; x++) {
        if (currentPiece.shape[y][x]) drawCell(ctx, currentPiece.position.x + x, currentPiece.position.y + y, currentPiece.color, false, 1.5);
      }
    }
  }
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

function CardButton({ card, onClick, disabled }: { card: Card; onClick: () => void; disabled: boolean }) {
  const [cooldown, setCooldown] = useState(0);
  useEffect(() => {
    if (!disabled) return;
    const interval = setInterval(() => {
      setCooldown(Math.max(0, card.cooldown * 1000 - (Date.now() - card.lastUsed)));
    }, 100);
    return () => clearInterval(interval);
  }, [card, disabled]);
  
  const onCooldown = cooldown > 0;
  const typeColors = {
    offensive: 'border-red-500 bg-red-900/20 hover:shadow-[0_0_15px_rgba(239,68,68,0.5)]',
    defensive: 'border-blue-500 bg-blue-900/20 hover:shadow-[0_0_15px_rgba(59,130,246,0.5)]',
    utility: 'border-green-500 bg-green-900/20 hover:shadow-[0_0_15px_rgba(34,197,94,0.5)]'
  };
  
  return (
    <button
      onClick={onClick}
      disabled={disabled || onCooldown}
      className={`p-2 rounded-lg border-2 transition-all flex flex-col items-center w-20 h-24 ${
        onCooldown ? 'border-gray-600 bg-gray-900/50 opacity-40' : typeColors[card.type]
      }`}
    >
      <span className="text-xl mb-1">{card.icon}</span>
      <span className="text-[9px] text-center truncate w-full">{card.name}</span>
      {onCooldown && <span className="text-[10px] text-gray-400">{Math.ceil(cooldown / 1000)}s</span>}
    </button>
  );
}

export default function BattleGame() {
  const playerCanvasRef = useRef<HTMLCanvasElement>(null);
  const opponentCanvasRef = useRef<HTMLCanvasElement>(null);
  const drawPlayerBoardRef = useRef<() => void>(() => {});
  const drawOpponentBoardRef = useRef<() => void>(() => {});
  const { playerState, opponentState, battleStatus, movePiece, rotate, hardDrop, holdPiece, activateCard, togglePause, resetBattle, isPaused } = useBattleState({ aiDifficulty: 'medium', firstToWin: 3, isTimed: false, matchTime: 300 });
  const [showCards, setShowCards] = useState(true);
  
  const playerGhost = useMemo(() => playerState.currentPiece ? calculateGhostPosition(playerState.board, playerState.currentPiece) : null, [playerState.currentPiece, playerState.board]);
  const opponentGhost = useMemo(() => opponentState.currentPiece ? calculateGhostPosition(opponentState.board, opponentState.currentPiece) : null, [opponentState.currentPiece, opponentState.board]);

  const drawPlayerBoard = useCallback(() => {
    const canvas = playerCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    drawBoard(ctx, playerState.board, playerState.currentPiece, playerGhost, canvas.width, canvas.height, '#080812', 'rgba(0,255,255,0.3)');
  }, [playerState.board, playerState.currentPiece, playerGhost]);

  const drawOpponentBoard = useCallback(() => {
    const canvas = opponentCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    drawBoard(ctx, opponentState.board, opponentState.currentPiece, opponentGhost, canvas.width, canvas.height, '#180812', 'rgba(255,50,100,0.3)');
  }, [opponentState.board, opponentState.currentPiece, opponentGhost]);

  useEffect(() => {
    drawPlayerBoardRef.current = drawPlayerBoard;
    drawOpponentBoardRef.current = drawOpponentBoard;
  }, [drawPlayerBoard, drawOpponentBoard]);

  useEffect(() => {
    if (battleStatus !== 'playing' && !isPaused) {
      drawPlayerBoardRef.current();
      drawOpponentBoardRef.current();
      return;
    }
    
    let animId: number;
    const render = () => {
      drawPlayerBoardRef.current();
      drawOpponentBoardRef.current();
      animId = requestAnimationFrame(render);
    };
    
    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [battleStatus, isPaused]);
  useKeyboardControls({
    enabled: true,
    isGameOver: battleStatus !== 'playing',
    isPaused,
    onMoveLeft: () => movePiece(-1, 0),
    onMoveRight: () => movePiece(1, 0),
    onSoftDrop: () => movePiece(0, 1),
    onRotate: rotate,
    onHardDrop: hardDrop,
    onHold: holdPiece,
    onTogglePause: togglePause,
    onRestart: resetBattle,
  });

  return (
    <div className="min-h-screen bg-[#050510] flex flex-col items-center justify-center p-4">
      <h1 className="text-3xl font-bold tracking-[0.3em] mb-6">
        <span className="text-red-500">BATTLE</span>
        <span className="text-white"> MODE</span>
      </h1>

      {/* Health Bars */}
      <div className="w-full max-w-4xl flex justify-between items-center mb-6 gap-8">
        <div className="flex-1">
          <div className="flex justify-between mb-2">
            <span className="text-cyan-400 font-bold tracking-wider">PLAYER</span>
            <span className="text-cyan-400 font-bold">{playerState.health}%</span>
          </div>
          <div className="h-4 bg-gray-900 rounded-full overflow-hidden border border-cyan-500/30">
            <div className="h-full bg-gradient-to-r from-cyan-600 to-cyan-400 transition-all duration-500" style={{ width: `${playerState.health}%` }} />
          </div>
          <div className="flex justify-between mt-2 text-sm text-gray-400">
            <span>Score: <span className="text-yellow-400">{playerState.score}</span></span>
            <span>Lines: <span className="text-purple-400">{playerState.lines}</span></span>
          </div>
        </div>

        <div className="px-8">
          <span className="text-3xl font-black text-red-500">VS</span>
        </div>

        <div className="flex-1">
          <div className="flex justify-between mb-2">
            <span className="text-red-400 font-bold">{opponentState.health}%</span>
            <span className="text-red-400 font-bold tracking-wider">AI</span>
          </div>
          <div className="h-4 bg-gray-900 rounded-full overflow-hidden border border-red-500/30">
            <div className="h-full bg-gradient-to-r from-red-400 to-red-600 transition-all duration-500" style={{ width: `${opponentState.health}%` }} />
          </div>
          <div className="flex justify-between mt-2 text-sm text-gray-400 text-right">
            <span>Lines: <span className="text-purple-400">{opponentState.lines}</span></span>
            <span>Score: <span className="text-yellow-400">{opponentState.score}</span></span>
          </div>
        </div>
      </div>

      {/* Boards */}
      <div className="flex gap-12 items-start">
        {/* Player */}
        <div className="flex flex-col items-center">
          <div className="rounded-lg overflow-hidden" style={{ boxShadow: '0 0 30px rgba(0,255,255,0.2)' }}>
            <canvas ref={playerCanvasRef} width={BOARD_WIDTH * CELL_SIZE} height={BOARD_HEIGHT * CELL_SIZE} style={{ border: '2px solid rgba(0,255,255,0.3)' }} />
          </div>
          
          {/* Cards */}
          <div className="mt-4">
            <button onClick={() => setShowCards(!showCards)} className="mb-2 px-4 py-1 text-xs tracking-widest uppercase border border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/10 rounded-full">
              {showCards ? 'Hide' : 'Show'} Cards
            </button>
            {showCards && (
              <div className="flex gap-2">
                {playerState.cards.map(card => (
                  <CardButton key={card.id} card={card} onClick={() => activateCard(card.id)} disabled={battleStatus !== 'playing'} />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Opponent */}
        <div className="flex flex-col items-center">
          <div className="rounded-lg overflow-hidden" style={{ boxShadow: '0 0 30px rgba(255,50,100,0.2)' }}>
            <canvas ref={opponentCanvasRef} width={BOARD_WIDTH * CELL_SIZE} height={BOARD_HEIGHT * CELL_SIZE} style={{ border: '2px solid rgba(255,50,100,0.3)' }} />
          </div>
          <div className="mt-3 text-center">
            <div className="text-red-400 font-bold tracking-wider">AI OPPONENT</div>
            <div className="text-xs text-gray-500">Difficulty: Medium</div>
          </div>
        </div>
      </div>

      {/* Controls */}
        <div className="flex gap-4 mt-6">
          <button onClick={togglePause} className="px-6 py-2 text-sm tracking-widest uppercase border border-gray-600 text-gray-400 hover:text-white hover:border-white/40 rounded-full transition-all">
          {isPaused ? 'Resume' : 'Pause'}
          </button>
        <button onClick={resetBattle} className="px-6 py-2 text-sm tracking-widest uppercase border border-gray-600 text-gray-400 hover:text-white hover:border-white/40 rounded-full transition-all">
          Restart
        </button>
      </div>

      {/* Game Over Overlay */}
      {battleStatus !== 'playing' && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-50">
          <div className="bg-gray-900 border-2 rounded-2xl p-12 text-center" style={{ borderColor: battleStatus === 'player_win' ? 'rgba(0,255,0,0.5)' : 'rgba(255,0,0,0.5)' }}>
            <div className={`text-6xl font-black tracking-widest mb-4 ${battleStatus === 'player_win' ? 'text-green-500' : 'text-red-500'}`}>
              {battleStatus === 'player_win' ? 'VICTORY!' : 'DEFEAT'}
            </div>
            <div className="text-xl text-gray-300 mb-8">
              {battleStatus === 'player_win' ? '🎉 You defeated the AI!' : '😔 The AI got the best of you...'}
            </div>
            <button onClick={resetBattle} className="px-8 py-3 text-lg tracking-widest uppercase border border-cyan-500 text-cyan-400 hover:bg-cyan-500/10 rounded-full transition-all">
              Play Again
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
