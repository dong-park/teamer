import { ViewStyle } from 'react-native';
import { SharedValue } from 'react-native-reanimated';
import { SkiaValue } from '@shopify/react-native-skia';

export type EffectPattern = 'waves' | 'particles' | 'gradients' | 'mesh' | 'aurora';
export type Quality = 'low' | 'medium' | 'high';
export type FPS = 30 | 60;

export interface AmbientEffectConfig {
  // Visual properties
  colors: string[];
  intensity: number; // 0-1
  speed: number; // 0.5-3
  pattern: EffectPattern;
  
  // Behavior
  interactive: boolean;
  responsive: boolean;
  autoAnimate: boolean;
  
  // Performance
  quality: Quality;
  fps: FPS;
  particleCount?: number;
}

export interface AmbientEffectProps {
  config?: Partial<AmbientEffectConfig>;
  style?: ViewStyle;
  children?: React.ReactNode;
  onInteraction?: (x: number, y: number) => void;
  darkMode?: boolean;
  disabled?: boolean;
}

export interface AnimatedValues {
  phase: SharedValue<number>;
  touchX: SharedValue<number>;
  touchY: SharedValue<number>;
  time: SharedValue<number>;
}

export interface EffectProps {
  config: AmbientEffectConfig;
  animatedValues: AnimatedValues;
  darkMode: boolean;
  width: number;
  height: number;
}

export interface Particle {
  id: string;
  x: SharedValue<number>;
  y: SharedValue<number>;
  vx: SharedValue<number>;
  vy: SharedValue<number>;
  radius: number;
  opacity: SharedValue<number>;
  color: string;
}

export interface DeviceCapability {
  gpu: number; // 1-3
  cpu: number; // 2-8
  ram: number; // GB
}

export interface PresetConfig {
  calm: Partial<AmbientEffectConfig>;
  energetic: Partial<AmbientEffectConfig>;
  professional: Partial<AmbientEffectConfig>;
  nightMode: Partial<AmbientEffectConfig>;
}