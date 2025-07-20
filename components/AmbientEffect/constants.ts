import { AmbientEffectConfig, PresetConfig } from './types';

export const DEFAULT_CONFIG: AmbientEffectConfig = {
  colors: ['#ff6b6b', '#4ecdc4', '#45b7d1'],
  intensity: 0.6,
  speed: 1.0,
  pattern: 'waves',
  interactive: true,
  responsive: false,
  autoAnimate: true,
  quality: 'medium',
  fps: 60,
  particleCount: 50,
};

export const PRESETS: PresetConfig = {
  calm: {
    pattern: 'waves',
    colors: ['#e3f2fd', '#bbdefb', '#90caf9'],
    intensity: 0.5,
    speed: 0.8,
    interactive: false,
    autoAnimate: true,
  },
  energetic: {
    pattern: 'particles',
    colors: ['#ff6b6b', '#feca57', '#48dbfb', '#ff9ff3'],
    intensity: 0.8,
    speed: 2.0,
    interactive: true,
    autoAnimate: true,
    particleCount: 80,
  },
  professional: {
    pattern: 'gradients',
    colors: ['#667eea', '#764ba2', '#f093fb'],
    intensity: 0.4,
    speed: 1.0,
    interactive: false,
    autoAnimate: true,
  },
  nightMode: {
    pattern: 'aurora',
    colors: ['#0f3443', '#34495e', '#1e3c72', '#2c3e50'],
    intensity: 0.3,
    speed: 0.5,
    interactive: true,
    autoAnimate: true,
  },
};

// Dark mode color adjustments
export const DARK_MODE_ADJUSTMENTS = {
  intensityMultiplier: 0.7,
  saturationMultiplier: 0.8,
};

// Performance thresholds
export const PERFORMANCE_THRESHOLDS = {
  lowEndDevice: {
    gpu: 1,
    cpu: 4,
    ram: 3,
  },
  midRangeDevice: {
    gpu: 2,
    cpu: 6,
    ram: 4,
  },
};

// Animation constants
export const ANIMATION_CONSTANTS = {
  waveSegments: 100,
  waveAmplitude: 50,
  particleMinRadius: 2,
  particleMaxRadius: 8,
  particleFadeDistance: 100,
  gradientStops: 5,
  auroraLayers: 4,
};