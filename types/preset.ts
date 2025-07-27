export interface TodoItem {
  id: string;
  title: string;
  description?: string;
  color: string;
  icon?: string;
  duration?: number; // 분 단위
  lastUsed?: Date;
}

export interface Preset {
  id: string;
  name: string;
  color: string; // 프리셋 대표 색상 (앰비언트 라이트에 사용)
  targetTime: number; // 전체 목표 시간 (분 단위)
  todos: TodoItem[];
  createdAt: Date;
  lastUsed: Date;
  usageCount: number;
}

export interface PresetMenuState {
  isVisible: boolean;
  selectedPreset?: Preset;
  recentPresets: Preset[];
}