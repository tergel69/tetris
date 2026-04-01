'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import { ACHIEVEMENTS, getTotalStars, isAchievementUnlocked } from '@/lib/story';
import { THEMES } from '@/lib/tetrominoes';

const EnhancedTetrisGame = dynamic(() => import('./OptimizedTetrisGame'), { ssr: false });
const BattleGame = dynamic(() => import('./BattleGame'), { ssr: false });
const StoryMode = dynamic(() => import('./StoryMode'), { ssr: false });

type GameMode = 'menu' | 'classic' | 'battle' | 'story';

export default function MainMenu() {
  const [currentMode, setCurrentMode] = useState<GameMode>('menu');
  const [showSettings, setShowSettings] = useState(false);
  const [showAchievements, setShowAchievements] = useState(false);
  const [showThemes, setShowThemes] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState('neonNight');
  const [totalStars, setTotalStars] = useState(0);
  const [achievements, setAchievements] = useState<string[]>([]);
  const [bestScore, setBestScore] = useState(0);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const savedTheme = localStorage.getItem('tetris_theme');
      if (savedTheme) {
        setSelectedTheme(savedTheme);
      }

      const savedBestScore = localStorage.getItem('tetris_best_score');
      setBestScore(savedBestScore ? parseInt(savedBestScore, 10) || 0 : 0);

      const storyProgress = localStorage.getItem('tetris_story_progress');
      if (storyProgress) {
        setAchievements(ACHIEVEMENTS.filter(achievement => isAchievementUnlocked(achievement.id)).map(achievement => achievement.id));
        setTotalStars(getTotalStars());
      }
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  const handleClassicStart = () => setCurrentMode('classic');
  const handleBattleStart = () => setCurrentMode('battle');
  const handleStoryStart = () => setCurrentMode('story');

  const handleBackToMenu = () => {
    setCurrentMode('menu');
    setShowSettings(false);
    setShowAchievements(false);
    setShowThemes(false);
  };

  const selectTheme = (themeId: string) => {
    setSelectedTheme(themeId);
    localStorage.setItem('tetris_theme', themeId);
  };

  if (currentMode === 'menu') {
    return (
      <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[#050510] p-4">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute left-1/4 top-1/4 h-96 w-96 animate-pulse rounded-full bg-cyan-500/10 blur-[100px]" />
          <div
            className="absolute bottom-1/4 right-1/4 h-96 w-96 animate-pulse rounded-full bg-purple-500/10 blur-[100px]"
            style={{ animationDelay: '1s' }}
          />
          <div
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage:
                'linear-gradient(rgba(0,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,255,255,0.03) 1px, transparent 1px)',
              backgroundSize: '50px 50px',
            }}
          />
        </div>

        <div className="relative z-10 translate-y-0 opacity-100 transition-all duration-700">
          <div className="mb-12 text-center">
            <h1 className="mb-2 text-6xl font-bold tracking-[0.3em] sm:text-7xl">
              <span className="bg-gradient-to-r from-cyan-400 via-white to-cyan-400 bg-clip-text text-transparent">
                TETRIS
              </span>
            </h1>
            <h2 className="text-xl font-light uppercase tracking-[0.5em] text-cyan-300/80 sm:text-2xl">
              Unleashed
            </h2>
          </div>

          <div className="mb-10 flex justify-center">
            <div className="flex items-center gap-6 rounded-full border border-cyan-500/20 bg-black/40 px-8 py-3 backdrop-blur-md">
              <div className="flex items-center gap-2">
                <span className="text-sm text-yellow-400">Stars</span>
                <span className="font-mono text-white">{totalStars}</span>
              </div>
              <div className="h-6 w-px bg-white/20" />
              <div className="flex items-center gap-2">
                <span className="text-sm text-cyan-400">Goals</span>
                <span className="font-mono text-white">
                  {achievements.length}/{ACHIEVEMENTS.length}
                </span>
              </div>
              <div className="h-6 w-px bg-white/20" />
              <div className="flex items-center gap-2">
                <span className="text-sm text-green-400">Best</span>
                <span className="font-mono text-white">{bestScore.toLocaleString()}</span>
              </div>
            </div>
          </div>

          <div className="mb-10 flex flex-col gap-4">
            <ModeButton
              onClick={handleClassicStart}
              label="Classic"
              icon="C"
              accent="cyan"
              border="rgba(0,255,255,0.3)"
              shadow="rgba(0,255,255,0.1)"
            />
            <ModeButton
              onClick={handleBattleStart}
              label="Battle"
              icon="V"
              accent="red"
              border="rgba(255,50,100,0.3)"
              shadow="rgba(255,50,100,0.1)"
            />
            <ModeButton
              onClick={handleStoryStart}
              label="Story"
              icon="S"
              accent="purple"
              border="rgba(168,85,247,0.3)"
              shadow="rgba(168,85,247,0.1)"
            />
          </div>

          <div className="flex justify-center gap-4">
            <SecondaryButton onClick={() => setShowThemes(true)}>Themes</SecondaryButton>
            <SecondaryButton onClick={() => setShowAchievements(true)}>Achievements</SecondaryButton>
            <SecondaryButton onClick={() => setShowSettings(true)}>Settings</SecondaryButton>
          </div>
        </div>

        {showThemes && (
          <AnimatedModal onClose={() => setShowThemes(false)} title="Select Theme">
            <div className="grid grid-cols-2 gap-4">
              {Object.entries(THEMES).map(([id, theme]) => (
                <button
                  key={id}
                  onClick={() => {
                    selectTheme(id);
                    setShowThemes(false);
                  }}
                  disabled={!theme.unlocked}
                  className={`rounded-xl border p-6 text-left transition-all duration-300 ${
                    selectedTheme === id
                      ? 'scale-105 border-cyan-400 bg-cyan-900/40'
                      : theme.unlocked
                        ? 'border-gray-600 bg-gray-800/50 hover:border-cyan-500/50 hover:bg-gray-800'
                        : 'border-gray-800 bg-gray-900/50 opacity-50'
                  }`}
                >
                  <div className="mb-2 text-lg font-bold">{theme.name}</div>
                  <div className="mb-2 flex gap-1">
                    {Object.values(theme.pieceColors)
                      .slice(0, 4)
                      .map((color, index) => (
                        <div key={index} className="h-4 w-4 rounded-sm" style={{ backgroundColor: color }} />
                      ))}
                  </div>
                  {!theme.unlocked && <div className="text-xs text-gray-500">Locked until Story is complete</div>}
                </button>
              ))}
            </div>
          </AnimatedModal>
        )}

        {showAchievements && (
          <AnimatedModal
            onClose={() => setShowAchievements(false)}
            title={`Achievements (${achievements.length}/${ACHIEVEMENTS.length})`}
          >
            <div className="max-h-[400px] space-y-3 overflow-y-auto pr-2">
              {ACHIEVEMENTS.map(achievement => {
                const unlocked = achievements.includes(achievement.id);
                return (
                  <div
                    key={achievement.id}
                    className={`rounded-xl border p-4 transition-all duration-300 ${
                      unlocked ? 'border-yellow-500/50 bg-yellow-900/20' : 'border-gray-700 bg-gray-800/30'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <span className={`text-3xl transition-transform ${unlocked ? 'scale-100' : 'scale-75 opacity-50'}`}>
                        {achievement.icon}
                      </span>
                      <div className="flex-1">
                        <div className={`font-bold ${unlocked ? 'text-yellow-400' : 'text-gray-500'}`}>
                          {achievement.name}
                        </div>
                        <div className="text-sm text-gray-400">{achievement.description}</div>
                      </div>
                      {unlocked && <span className="text-xl text-green-400">OK</span>}
                    </div>
                  </div>
                );
              })}
            </div>
          </AnimatedModal>
        )}

        {showSettings && (
          <AnimatedModal onClose={() => setShowSettings(false)} title="Settings">
            <div className="space-y-6">
              <div className="rounded-xl bg-gray-800/50 p-4">
                <h3 className="mb-3 font-bold text-cyan-400">Controls</h3>
                <div className="grid grid-cols-2 gap-2 text-sm text-gray-300">
                  <div>
                    <span className="text-white/60">Move</span> Left / Right
                  </div>
                  <div>
                    <span className="text-white/60">Soft Drop</span> Down
                  </div>
                  <div>
                    <span className="text-white/60">Rotate</span> Up / Space
                  </div>
                  <div>
                    <span className="text-white/60">Hard Drop</span> Enter
                  </div>
                  <div>
                    <span className="text-white/60">Hold</span> C / Shift
                  </div>
                  <div>
                    <span className="text-white/60">Pause</span> P / Esc
                  </div>
                </div>
              </div>

              <div className="rounded-xl bg-gray-800/50 p-4">
                <h3 className="mb-3 font-bold text-cyan-400">Scoring</h3>
                <div className="space-y-1 text-sm text-gray-300">
                  <div>
                    <span className="text-white/60">Single</span> 100 x level
                  </div>
                  <div>
                    <span className="text-white/60">Double</span> 300 x level
                  </div>
                  <div>
                    <span className="text-white/60">Triple</span> 500 x level
                  </div>
                  <div>
                    <span className="text-white/60">Tetris</span> 800 x level
                  </div>
                  <div>
                    <span className="text-white/60">T-Spin</span> 400-1600 x level
                  </div>
                </div>
              </div>
            </div>
          </AnimatedModal>
        )}
      </div>
    );
  }

  return (
    <div className="relative">
      {currentMode === 'classic' && (
        <>
          <EnhancedTetrisGame />
          <BackButton onClick={handleBackToMenu} />
        </>
      )}

      {currentMode === 'battle' && (
        <>
          <BattleGame />
          <BackButton onClick={handleBackToMenu} />
        </>
      )}

      {currentMode === 'story' && <StoryMode onBack={handleBackToMenu} />}
    </div>
  );
}

function ModeButton({
  onClick,
  label,
  icon,
  accent,
  border,
  shadow,
}: {
  onClick: () => void;
  label: string;
  icon: string;
  accent: 'cyan' | 'red' | 'purple';
  border: string;
  shadow: string;
}) {
  const accentClasses = {
    cyan: 'text-cyan-400 group-hover:text-white',
    red: 'text-red-400 group-hover:text-white',
    purple: 'text-purple-400 group-hover:text-white',
  }[accent];

  const accentGlow = {
    cyan: 'from-cyan-500/20',
    red: 'from-red-500/20',
    purple: 'from-purple-500/20',
  }[accent];

  return (
    <button
      onClick={onClick}
      className="group relative px-16 py-5 text-lg font-semibold uppercase tracking-widest transition-all duration-300 hover:scale-105"
      style={{
        background: `linear-gradient(135deg, ${shadow} 0%, rgba(0,0,0,0.05) 100%)`,
        border: `1px solid ${border}`,
        boxShadow: `0 0 30px ${shadow}, inset 0 0 30px rgba(255,255,255,0.03)`,
      }}
    >
      <span className={`relative z-10 flex items-center justify-center gap-4 transition-colors ${accentClasses}`}>
        <span className="text-2xl">{icon}</span>
        {label}
      </span>
      <div className={`absolute inset-0 bg-gradient-to-r ${accentGlow} to-transparent opacity-0 transition-opacity group-hover:opacity-100`} />
      <div className="absolute bottom-0 left-0 h-0.5 w-0 bg-gradient-to-r from-transparent via-current to-transparent transition-all duration-500 group-hover:w-full" />
    </button>
  );
}

function SecondaryButton({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className="rounded-full border border-white/20 px-6 py-2 text-sm uppercase tracking-widest text-white/60 transition-all duration-300 hover:border-white/40 hover:bg-white/5 hover:text-white"
    >
      {children}
    </button>
  );
}

function AnimatedModal({ children, title, onClose }: { children: React.ReactNode; title: string; onClose: () => void }) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 10);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center transition-all duration-300 ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
      <div
        className={`relative z-10 transition-all duration-500 ${
          isVisible ? 'scale-100 translate-y-0' : 'scale-90 translate-y-10'
        }`}
        onClick={event => event.stopPropagation()}
      >
        <div className="max-h-[80vh] w-full max-w-lg overflow-hidden rounded-2xl border border-cyan-500/30 bg-gray-900 p-8 shadow-[0_0_50px_rgba(0,255,255,0.2)]">
          <h2 className="mb-6 text-center text-2xl font-bold uppercase tracking-widest text-cyan-400">{title}</h2>
          {children}
          <button
            onClick={onClose}
            className="mt-6 w-full rounded-full border border-gray-600 py-3 text-sm uppercase tracking-widest text-gray-400 transition-all hover:border-white/40 hover:text-white"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

function BackButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="fixed left-6 top-6 z-50 rounded-full border border-white/20 bg-black/50 px-6 py-3 text-sm uppercase tracking-widest text-white/80 backdrop-blur-md transition-all duration-300 hover:scale-105 hover:border-white/40 hover:text-white"
    >
      Back to Menu
    </button>
  );
}
