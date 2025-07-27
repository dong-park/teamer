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