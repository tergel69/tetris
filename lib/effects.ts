// Particle system for visual effects
export interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  life: number;
  maxLife: number;
  size: number;
  type: 'spark' | 'burst' | 'trail' | 'debris' | 'glow';
}

let particleIdCounter = 0;

export function createParticle(
  x: number,
  y: number,
  color: string,
  type: Particle['type'] = 'spark',
  life: number = 30
): Particle {
  const angle = Math.random() * Math.PI * 2;
  const speed = type === 'burst' ? 3 + Math.random() * 4 : 1 + Math.random() * 2;
  
  return {
    id: particleIdCounter++,
    x,
    y,
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed - (type === 'debris' ? 2 : 0),
    color,
    life,
    maxLife: life,
    size: type === 'debris' ? 4 + Math.random() * 4 : 2 + Math.random() * 3,
    type,
  };
}

export function createParticleBurst(
  centerX: number,
  centerY: number,
  color: string,
  count: number = 20,
  type: Particle['type'] = 'spark'
): Particle[] {
  const particles: Particle[] = [];
  for (let i = 0; i < count; i++) {
    particles.push(createParticle(centerX, centerY, color, type, 30 + Math.random() * 20));
  }
  return particles;
}

export function createLineClearParticles(
  lineY: number,
  cellSize: number,
  color: string,
  width: number = 10
): Particle[] {
  const particles: Particle[] = [];
  for (let x = 0; x < width; x++) {
    particles.push(createParticle(
      x * cellSize + cellSize / 2,
      lineY * cellSize + cellSize / 2,
      color,
      'burst',
      40 + Math.random() * 20
    ));
  }
  return particles;
}

export function createTetrisParticles(
  boardWidth: number,
  cellSize: number,
  colors: string[]
): Particle[] {
  const particles: Particle[] = [];
  const rows = 4;
  
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < boardWidth; x++) {
      const color = colors[Math.floor(Math.random() * colors.length)];
      particles.push(createParticle(
        x * cellSize + cellSize / 2,
        (BOARD_HEIGHT - rows + y) * cellSize + cellSize / 2,
        color,
        'burst',
        50 + Math.random() * 30
      ));
    }
  }
  
  return particles;
}

export function createGarbageParticles(
  boardX: number,
  boardY: number,
  cellSize: number
): Particle[] {
  const particles: Particle[] = [];
  for (let i = 0; i < 15; i++) {
    particles.push(createParticle(
      boardX + cellSize / 2,
      boardY + cellSize / 2,
      '#FF4444',
      'debris',
      20 + Math.random() * 10
    ));
  }
  return particles;
}

export function updateParticle(particle: Particle, deltaTime: number = 1): Particle {
  const gravity = particle.type === 'debris' ? 0.2 : 0;
  const friction = particle.type === 'glow' ? 0.98 : 0.95;
  
  return {
    ...particle,
    x: particle.x + particle.vx * deltaTime,
    y: particle.y + particle.vy * deltaTime,
    vy: particle.vy + gravity * deltaTime,
    vx: particle.vx * friction,
    life: particle.life - deltaTime,
    size: particle.size * (particle.life / particle.maxLife),
  };
}

export function isParticleAlive(particle: Particle): boolean {
  return particle.life > 0;
}

// Animation keyframes for smooth transitions
export interface Animation {
  id: number;
  type: 'scale' | 'shake' | 'flash' | 'slide';
  startTime: number;
  duration: number;
  from: number;
  to: number;
  easing: 'easeOut' | 'easeIn' | 'easeInOut' | 'linear';
}

export function createAnimation(
  type: Animation['type'],
  duration: number,
  from: number,
  to: number,
  easing: Animation['easing'] = 'easeOut'
): Animation {
  return {
    id: Math.random(),
    type,
    startTime: Date.now(),
    duration,
    from,
    to,
    easing,
  };
}

export function getAnimationValue(animation: Animation): number {
  const elapsed = Date.now() - animation.startTime;
  const progress = Math.min(elapsed / animation.duration, 1);
  
  const easedProgress = applyEasing(progress, animation.easing);
  
  return animation.from + (animation.to - animation.from) * easedProgress;
}

function applyEasing(t: number, easing: Animation['easing']): number {
  switch (easing) {
    case 'easeOut': return 1 - Math.pow(1 - t, 3);
    case 'easeIn': return t * t * t;
    case 'easeInOut': return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    case 'linear': return t;
    default: return t;
  }
}

// Screen shake effect
export interface ScreenShake {
  intensity: number;
  duration: number;
  startTime: number;
}

export function createScreenShake(intensity: number = 10, duration: number = 200): ScreenShake {
  return {
    intensity,
    duration,
    startTime: Date.now(),
  };
}

export function getShakeOffset(shake: ScreenShake): { x: number; y: number } {
  const elapsed = Date.now() - shake.startTime;
  if (elapsed >= shake.duration) {
    return { x: 0, y: 0 };
  }
  
  const intensity = shake.intensity * (1 - elapsed / shake.duration);
  
  return {
    x: (Math.random() - 0.5) * intensity,
    y: (Math.random() - 0.5) * intensity,
  };
}

// Glow effect parameters
export interface GlowEffect {
  color: string;
  intensity: number;
  blur: number;
}

export function createGlowEffect(color: string, intensity: number = 1): GlowEffect {
  return {
    color,
    intensity,
    blur: 10 * intensity,
  };
}

// Constants
const BOARD_HEIGHT = 20;
