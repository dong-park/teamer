import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Preset, TodoItem, PresetMenuState } from '../types/preset';

interface PresetContextType {
  presets: Preset[];
  currentPreset: Preset | null;
  presetMenuState: PresetMenuState;
  showPresetMenu: () => void;
  hidePresetMenu: () => void;
  selectPreset: (preset: Preset) => void;
  setCurrentPreset: (preset: Preset | null) => void;
  addPreset: (preset: Omit<Preset, 'id' | 'createdAt' | 'lastUsed' | 'usageCount'>) => void;
  updatePreset: (preset: Preset) => void;
  deletePreset: (presetId: string) => void;
  updatePresetUsage: (presetId: string) => void;
  getRecentPresets: () => Preset[];
}

const PresetContext = createContext<PresetContextType | undefined>(undefined);

const STORAGE_KEY = 'teamer_presets';
const MAX_RECENT_PRESETS = 8;

// 기본 샘플 프리셋들
const defaultPresets: Preset[] = [
  {
    id: '1',
    name: '개발 작업',
    color: '#3B82F6',
    targetTime: 1,
    todos: [
      { id: '1-1', title: '코딩', color: '#3B82F6' },
      { id: '1-2', title: '테스트', color: '#10B981' },
      { id: '1-3', title: '디버깅', color: '#F59E0B' },
    ],
    createdAt: new Date('2024-01-01'),
    lastUsed: new Date('2024-01-15'),
    usageCount: 15,
  },
  {
    id: '2',
    name: '공부',
    color: '#8B5CF6',
    targetTime: 45,
    todos: [
      { id: '2-1', title: '독서', color: '#8B5CF6' },
      { id: '2-2', title: '정리', color: '#06B6D4' },
      { id: '2-3', title: '복습', color: '#84CC16' },
    ],
    createdAt: new Date('2024-01-02'),
    lastUsed: new Date('2024-01-14'),
    usageCount: 12,
  },
  {
    id: '3',
    name: '운동',
    color: '#EF4444',
    targetTime: 30,
    todos: [
      { id: '3-1', title: '웜업', color: '#F97316' },
      { id: '3-2', title: '근력 운동', color: '#EF4444' },
      { id: '3-3', title: '스트레칭', color: '#14B8A6' },
    ],
    createdAt: new Date('2024-01-03'),
    lastUsed: new Date('2024-01-13'),
    usageCount: 8,
  },
  {
    id: '4',
    name: '창작2',
    color: '#EC4899',
    targetTime: 50,
    todos: [
      { id: '4-1', title: '아이디어 정리', color: '#EC4899' },
      { id: '4-2', title: '글쓰기', color: '#6366F1' },
      { id: '4-3', title: '검토', color: '#8B5CF6' },
    ],
    createdAt: new Date('2024-01-04'),
    lastUsed: new Date('2024-01-12'),
    usageCount: 5,
  },
  {
    id: '5',
    name: '요리',
    color: '#F59E0B',
    targetTime: 40,
    todos: [
      { id: '5-1', title: '재료 준비', color: '#F59E0B' },
      { id: '5-2', title: '조리', color: '#DC2626' },
      { id: '5-3', title: '마무리', color: '#059669' },
    ],
    createdAt: new Date('2024-01-05'),
    lastUsed: new Date('2024-01-11'),
    usageCount: 7,
  },
  // {
  //   id: '6',
  //   name: '청소',
  //   todos: [
  //     { id: '6-1', title: '정리', color: '#7C3AED', duration: 20 },
  //     { id: '6-2', title: '물걸레질', color: '#0EA5E9', duration: 25 },
  //     { id: '6-3', title: '마무리', color: '#22C55E', duration: 10 },
  //   ],
  //   createdAt: new Date('2024-01-06'),
  //   lastUsed: new Date('2024-01-10'),
  //   usageCount: 4,
  // },
  // {
  //   id: '7',
  //   name: '회의',
  //   todos: [
  //     { id: '7-1', title: '자료 준비', color: '#0891B2', duration: 15 },
  //     { id: '7-2', title: '회의 진행', color: '#DC2626', duration: 45 },
  //     { id: '7-3', title: '정리', color: '#16A34A', duration: 15 },
  //   ],
  //   createdAt: new Date('2024-01-07'),
  //   lastUsed: new Date('2024-01-09'),
  //   usageCount: 3,
  // },
  // {
  //   id: '8',
  //   name: '명상',
  //   todos: [
  //     { id: '8-1', title: '호흡 준비', color: '#A855F7', duration: 5 },
  //     { id: '8-2', title: '명상', color: '#6366F1', duration: 20 },
  //     { id: '8-3', title: '마무리', color: '#10B981', duration: 5 },
  //   ],
  //   createdAt: new Date('2024-01-08'),
  //   lastUsed: new Date('2024-01-08'),
  //   usageCount: 2,
  // },
];

export const PresetProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [presets, setPresets] = useState<Preset[]>(defaultPresets);
  const [currentPreset, setCurrentPreset] = useState<Preset | null>(null);
  const [presetMenuState, setPresetMenuState] = useState<PresetMenuState>({
    isVisible: false,
    recentPresets: [],
  });

  // AsyncStorage에서 프리셋 로드
  const loadPresets = useCallback(async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(defaultPresets));
        updateRecentPresets(defaultPresets);
      // if (stored) {
      //   const parsedPresets = JSON.parse(stored);
      //   setPresets(parsedPresets);
      //   updateRecentPresets(parsedPresets);
      // } else {
      //   // 기본 프리셋 저장
        
      // }
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

  // 프리셋 업데이트
  const updatePreset = useCallback(async (updatedPreset: Preset) => {
    const updatedPresets = presets.map(preset => 
      preset.id === updatedPreset.id ? updatedPreset : preset
    );
    setPresets(updatedPresets);
    await savePresets(updatedPresets);
    updateRecentPresets(updatedPresets);
  }, [presets, savePresets, updateRecentPresets]);

  // 프리셋 삭제
  const deletePreset = useCallback(async (presetId: string) => {
    const updatedPresets = presets.filter(preset => preset.id !== presetId);
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
    presets,
    currentPreset,
    presetMenuState,
    showPresetMenu,
    hidePresetMenu,
    selectPreset,
    setCurrentPreset,
    addPreset,
    updatePreset,
    deletePreset,
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