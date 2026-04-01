import { useEffect } from 'react';

export interface KeyboardControls {
  onMoveLeft?: () => void;
  onMoveRight?: () => void;
  onSoftDrop?: () => void;
  onRotate?: () => void;
  onHardDrop?: () => void;
  onHold?: () => void;
  onTogglePause?: () => void;
  onRestart?: () => void;
  onBack?: () => void;
}

export interface UseKeyboardControlsOptions extends KeyboardControls {
  enabled: boolean;
  isGameOver?: boolean;
  isPaused?: boolean;
  repeatInitialDelayMs?: number;
  repeatIntervalMs?: number;
}

const REPEATABLE_KEYS = new Set(['ArrowLeft', 'ArrowRight', 'ArrowDown']);

export function useKeyboardControls({
  enabled,
  isGameOver = false,
  isPaused = false,
  repeatInitialDelayMs = 150,
  repeatIntervalMs = 50,
  onMoveLeft,
  onMoveRight,
  onSoftDrop,
  onRotate,
  onHardDrop,
  onHold,
  onTogglePause,
  onRestart,
  onBack,
}: UseKeyboardControlsOptions) {
  useEffect(() => {
    if (!enabled) return;

    const pressedKeys = new Set<string>();
    const timers = new Map<string, number>();
    const intervals = new Map<string, number>();

    const clearKeyTimers = (key: string) => {
      const timeoutId = timers.get(key);
      const intervalId = intervals.get(key);
      if (timeoutId) {
        window.clearTimeout(timeoutId);
        timers.delete(key);
      }
      if (intervalId) {
        window.clearInterval(intervalId);
        intervals.delete(key);
      }
    };

    const execute = (key: string) => {
      if (isGameOver) {
        if (key === 'Enter') onRestart?.();
        if (key === 'Escape' || key === 'p' || key === 'P') onBack?.();
        return;
      }

      if (isPaused) {
        if (key === 'Escape' || key === 'p' || key === 'P') onTogglePause?.();
        if (key === 'Enter') onRestart?.();
        return;
      }

      switch (key) {
        case 'ArrowLeft':
          onMoveLeft?.();
          break;
        case 'ArrowRight':
          onMoveRight?.();
          break;
        case 'ArrowDown':
          onSoftDrop?.();
          break;
        case 'ArrowUp':
        case ' ':
          onRotate?.();
          break;
        case 'Enter':
          onHardDrop?.();
          break;
        case 'Shift':
        case 'c':
        case 'C':
          onHold?.();
          break;
        case 'Escape':
        case 'p':
        case 'P':
          onTogglePause?.();
          break;
        default:
          break;
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (pressedKeys.has(event.key)) return;
      pressedKeys.add(event.key);
      execute(event.key);

      if (!isGameOver && !isPaused && REPEATABLE_KEYS.has(event.key)) {
        timers.set(
          event.key,
          window.setTimeout(() => {
            intervals.set(
              event.key,
              window.setInterval(() => {
                if (pressedKeys.has(event.key)) {
                  execute(event.key);
                } else {
                  clearKeyTimers(event.key);
                }
              }, repeatIntervalMs)
            );
          }, repeatInitialDelayMs)
        );
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      pressedKeys.delete(event.key);
      clearKeyTimers(event.key);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      pressedKeys.clear();
      timers.forEach(timeoutId => window.clearTimeout(timeoutId));
      intervals.forEach(intervalId => window.clearInterval(intervalId));
    };
  }, [
    enabled,
    isGameOver,
    isPaused,
    onMoveLeft,
    onMoveRight,
    onSoftDrop,
    onRotate,
    onHardDrop,
    onHold,
    onTogglePause,
    onRestart,
    onBack,
    repeatInitialDelayMs,
    repeatIntervalMs,
  ]);
}

