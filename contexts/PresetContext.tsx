import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Preset, TodoItem, PresetMenuState } from '../types/preset';

interface PresetContextType {
  presetMenuState: PresetMenuState;
  showPresetMenu: () => void;
  hidePresetMenu: () => void;
  selectPreset: (preset: Preset) => void;
  addPreset: (preset: Omit<Preset, 'id' | 'createdAt' | 'lastUsed' | 'usageCount'>) => void;
  updatePresetUsage: (presetId: string) => void;
  getRecentPresets: () => Preset[];
}

const PresetContext = createContext<PresetContextType | undefined>(undefined);

const STORAGE_KEY = 'teamer_presets';
const MAX_RECENT_PRESETS = 6;

// 기본 샘플 프리셋들
const defaultPresets: Preset[] = [
  {
    id: '1',
    name: '개발 작업',
    todos: [
      { id: '1-1', title: '코딩', color: '#3B82F6', duration: 25 },
      { id: '1-2', title: '테스트', color: '#10B981', duration: 15 },
      { id: '1-3', title: '디버깅', color: '#F59E0B', duration: 20 },
    ],
    createdAt: new Date('2024-01-01'),
    lastUsed: new Date('2024-01-15'),
    usageCount: 15,
  },
  {
    id: '2',
    name: '공부',
    todos: [
      { id: '2-1', title: '독서', color: '#8B5CF6', duration: 30 },
      { id: '2-2', title: '정리', color: '#06B6D4', duration: 15 },
      { id: '2-3', title: '복습', color: '#84CC16', duration: 20 },
    ],
    createdAt: new Date('2024-01-02'),
    lastUsed: new Date('2024-01-14'),
    usageCount: 12,
  },
  {
    id: '3',
    name: '운동',
    todos: [
      { id: '3-1', title: '웜업', color: '#F97316', duration: 10 },
      { id: '3-2', title: '근력 운동', color: '#EF4444', duration: 30 },
      { id: '3-3', title: '스트레칭', color: '#14B8A6', duration: 10 },
    ],
    createdAt: new Date('2024-01-03'),
    lastUsed: new Date('2024-01-13'),
    usageCount: 8,
  },
  {
    id: '4',
    name: '창작',
    todos: [
      { id: '4-1', title: '아이디어 정리', color: '#EC4899', duration: 15 },
      { id: '4-2', title: '글쓰기', color: '#6366F1', duration: 25 },
      { id: '4-3', title: '검토', color: '#8B5CF6', duration: 10 },
    ],
    createdAt: new Date('2024-01-04'),
    lastUsed: new Date('2024-01-12'),
    usageCount: 5,
  },
];

export const PresetProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [presets, setPresets] = useState<Preset[]>(defaultPresets);
  const [presetMenuState, setPresetMenuState] = useState<PresetMenuState>({
    isVisible: false,
    recentPresets: [],
  });

  // AsyncStorage에서 프리셋 로드
  const loadPresets = useCallback(async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsedPresets = JSON.parse(stored);
        setPresets(parsedPresets);
        updateRecentPresets(parsedPresets);
      } else {
        // 기본 프리셋 저장
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(defaultPresets));
        updateRecentPresets(defaultPresets);
      }
    } catch (error) {
      console.error('프리셋 로드 실패:', error);
      updateRecentPresets(defaultPresets);
    }
  }, []);

  // AsyncStorage에 프리셋 저장
  const savePresets = useCallback(async (newPresets: Preset[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newPresets));
    } catch (error) {
      console.error('프리셋 저장 실패:', error);
    }
  }, []);

  // 최근 사용한 프리셋 업데이트
  const updateRecentPresets = useCallback((allPresets: Preset[]) => {
    const recent = allPresets
      .sort((a, b) => new Date(b.lastUsed).getTime() - new Date(a.lastUsed).getTime())
      .slice(0, MAX_RECENT_PRESETS);
    
    setPresetMenuState(prev => ({ ...prev, recentPresets: recent }));
  }, []);

  // 프리셋 메뉴 표시
  const showPresetMenu = useCallback(() => {
    setPresetMenuState(prev => ({ ...prev, isVisible: true }));
  }, []);

  // 프리셋 메뉴 숨김
  const hidePresetMenu = useCallback(() => {
    setPresetMenuState(prev => ({ 
      ...prev, 
      isVisible: false, 
      selectedPreset: undefined 
    }));
  }, []);

  // 프리셋 선택
  const selectPreset = useCallback((preset: Preset) => {
    setPresetMenuState(prev => ({ ...prev, selectedPreset: preset }));
  }, []);

  // 새 프리셋 추가
  const addPreset = useCallback(async (newPreset: Omit<Preset, 'id' | 'createdAt' | 'lastUsed' | 'usageCount'>) => {
    const preset: Preset = {
      ...newPreset,
      id: Date.now().toString(),
      createdAt: new Date(),
      lastUsed: new Date(),
      usageCount: 0,
    };

    const updatedPresets = [...presets, preset];
    setPresets(updatedPresets);
    await savePresets(updatedPresets);
    updateRecentPresets(updatedPresets);
  }, [presets, savePresets, updateRecentPresets]);

  // 프리셋 사용 횟수 업데이트
  const updatePresetUsage = useCallback(async (presetId: string) => {
    const updatedPresets = presets.map(preset => 
      preset.id === presetId 
        ? { 
            ...preset, 
            lastUsed: new Date(), 
            usageCount: preset.usageCount + 1 
          }
        : preset
    );

    setPresets(updatedPresets);
    await savePresets(updatedPresets);
    updateRecentPresets(updatedPresets);
  }, [presets, savePresets, updateRecentPresets]);

  // 최근 프리셋 가져오기
  const getRecentPresets = useCallback(() => {
    return presetMenuState.recentPresets;
  }, [presetMenuState.recentPresets]);

  useEffect(() => {
    loadPresets();
  }, [loadPresets]);

  const contextValue: PresetContextType = {
    presetMenuState,
    showPresetMenu,
    hidePresetMenu,
    selectPreset,
    addPreset,
    updatePresetUsage,
    getRecentPresets,
  };

  return (
    <PresetContext.Provider value={contextValue}>
      {children}
    </PresetContext.Provider>
  );
};

export const usePreset = (): PresetContextType => {
  const context = useContext(PresetContext);
  if (!context) {
    throw new Error('usePreset must be used within a PresetProvider');
  }
  return context;
};