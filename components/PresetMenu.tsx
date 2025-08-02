import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions, useColorScheme, TouchableOpacity } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring, 
  withTiming,
  withDelay,
  runOnJS,
  interpolate,
  Extrapolate,
  SharedValue
} from 'react-native-reanimated';
import { Preset } from '../types/preset';

// PresetItem 컴포넌트
interface PresetItemProps {
  preset: Preset;
  animation: {
    scale: SharedValue<number>;
    translateX: SharedValue<number>;
    translateY: SharedValue<number>;
    opacity: SharedValue<number>;
  };
  isDarkMode: boolean;
  onSelect: (preset: Preset) => void;
}

const PresetItem: React.FC<PresetItemProps> = ({ preset, animation, isDarkMode, onSelect }) => {
  const presetStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: animation.translateX.value },
      { translateY: animation.translateY.value },
      { scale: animation.scale.value },
    ],
    opacity: animation.opacity.value,
  }));

  return (
    <Animated.View style={[styles.presetWrapper, presetStyle]}>
      <TouchableOpacity
        style={[
          styles.presetCircle,
          isDarkMode ? styles.presetCircleDark : styles.presetCircleLight,
        ]}
        onPress={() => onSelect(preset)}
        activeOpacity={0.8}
      >
        {/* 프리셋 이모지 또는 색상 표시 */}
        {preset.emoji ? (
          <Text style={styles.emojiText}>
            {preset.emoji}
          </Text>
        ) : (
          <View 
            style={[
              styles.colorIndicator,
              { backgroundColor: preset.todos[0]?.color || '#3B82F6' }
            ]} 
          />
        )}
        <Text style={[
          styles.presetText,
          isDarkMode ? styles.presetTextDark : styles.presetTextLight
        ]}>
          {preset.name}
        </Text>
        <Text style={[
          styles.presetCount,
          isDarkMode ? styles.presetCountDark : styles.presetCountLight
        ]}>
          {preset.todos.length}개
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

interface PresetMenuProps {
  isVisible: boolean;
  presets: Preset[];
  onSelectPreset: (preset: Preset) => void;
  onClose: () => void;
  centerX: number;
  centerY: number;
}

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const PresetMenu: React.FC<PresetMenuProps> = ({
  isVisible,
  presets,
  onSelectPreset,
  onClose,
  centerX,
  centerY,
}) => {
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';
  
  // 애니메이션 값들
  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);
  
  // 프리셋 원들의 애니메이션 값 (고정 8개)
  const presetAnimations = [
    {
      scale: useSharedValue(0),
      translateX: useSharedValue(0),
      translateY: useSharedValue(0),
      opacity: useSharedValue(0),
    },
    {
      scale: useSharedValue(0),
      translateX: useSharedValue(0),
      translateY: useSharedValue(0),
      opacity: useSharedValue(0),
    },
    {
      scale: useSharedValue(0),
      translateX: useSharedValue(0),
      translateY: useSharedValue(0),
      opacity: useSharedValue(0),
    },
    {
      scale: useSharedValue(0),
      translateX: useSharedValue(0),
      translateY: useSharedValue(0),
      opacity: useSharedValue(0),
    },
    {
      scale: useSharedValue(0),
      translateX: useSharedValue(0),
      translateY: useSharedValue(0),
      opacity: useSharedValue(0),
    },
    {
      scale: useSharedValue(0),
      translateX: useSharedValue(0),
      translateY: useSharedValue(0),
      opacity: useSharedValue(0),
    },
    {
      scale: useSharedValue(0),
      translateX: useSharedValue(0),
      translateY: useSharedValue(0),
      opacity: useSharedValue(0),
    },
    {
      scale: useSharedValue(0),
      translateX: useSharedValue(0),
      translateY: useSharedValue(0),
      opacity: useSharedValue(0),
    },
  ];

  // 프리셋 개수에 따른 동적 배열 계산
  const actualPresets = Math.min(presets.length, 8);
  const menuRadius = 120;
  
  // 프리셋 개수에 따라 배열 패턴 결정
  const calculatePresetPositions = (count: number) => {
    if (count === 1) {
      // 1개: 위쪽에만
      return [{ x: 0, y: -menuRadius }];
    } else if (count === 2) {
      // 2개: 위, 아래
      return [
        { x: 0, y: -menuRadius },
        { x: 0, y: menuRadius }
      ];
    } else if (count === 3) {
      // 3개: 위, 좌하, 우하 (삼각형)
      return [
        { x: 0, y: -menuRadius },
        { x: -menuRadius * 0.866, y: menuRadius * 0.5 },
        { x: menuRadius * 0.866, y: menuRadius * 0.5 }
      ];
    } else if (count === 4) {
      // 4개: 십자 배열
      return [
        { x: 0, y: -menuRadius },
        { x: menuRadius, y: 0 },
        { x: 0, y: menuRadius },
        { x: -menuRadius, y: 0 }
      ];
    } else {
      // 5개 이상: 원형 배열
      const angleStep = (2 * Math.PI) / count;
      return Array.from({ length: count }, (_, index) => {
        const angle = index * angleStep - Math.PI / 2; // -90도부터 시작 (12시 방향)
        return {
          x: Math.cos(angle) * menuRadius,
          y: Math.sin(angle) * menuRadius,
        };
      });
    }
  };

  const presetPositions = calculatePresetPositions(actualPresets);

  // 메뉴 표시/숨김 애니메이션
  useEffect(() => {
    if (isVisible) {
      // 메뉴 표시
      scale.value = withSpring(1, { damping: 15, stiffness: 200 });
      opacity.value = withTiming(1, { duration: 300 });
      
      // 프리셋들을 동시에 애니메이션 (실제 프리셋 개수만큼)
      for (let index = 0; index < actualPresets; index++) {
        const position = presetPositions[index];
        const anim = presetAnimations[index];
        
        anim.scale.value = withSpring(1, { damping: 12, stiffness: 150 });
        anim.translateX.value = withSpring(position.x, { damping: 15, stiffness: 120 });
        anim.translateY.value = withSpring(position.y, { damping: 15, stiffness: 120 });
        anim.opacity.value = withTiming(1, { duration: 200 });
      }
    } else {
      // 메뉴 숨김
      scale.value = withSpring(0, { damping: 15, stiffness: 200 });
      opacity.value = withTiming(0, { duration: 200 });
      
      // 프리셋들 숨김
      presetAnimations.forEach((anim) => {
        anim.scale.value = withTiming(0, { duration: 150 });
        anim.translateX.value = withTiming(0, { duration: 150 });
        anim.translateY.value = withTiming(0, { duration: 150 });
        anim.opacity.value = withTiming(0, { duration: 150 });
      });
    }
  }, [isVisible, actualPresets]);

  // 메인 메뉴 애니메이션 스타일
  const menuStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
    ],
    opacity: opacity.value,
  }));

  // 프리셋 선택 핸들러
  const handleSelectPreset = (preset: Preset) => {
    onSelectPreset(preset);
    onClose();
  };

  if (!isVisible) return null;

  return (
    <View style={styles.overlay} pointerEvents="box-none">
      {/* 배경 터치 영역 (프리셋 버튼들 사이의 빈 공간 클릭 시 닫기) */}
      <TouchableOpacity 
        style={styles.backgroundTouchable} 
        onPress={onClose}
        activeOpacity={1}
      />

      {/* 메뉴 컨테이너 */}
      <Animated.View 
        style={[
          styles.menuContainer, 
          menuStyle,
          {
            left: centerX - 150, // 메뉴 크기의 절반만큼 왼쪽으로
            top: centerY - 150,  // 메뉴 크기의 절반만큼 위로
          }
        ]}
        pointerEvents="box-none"
      >
        {/* 프리셋 원들만 표시 (중앙 원 제거) */}
        {presets.slice(0, 8).map((preset, index) => (
          index < actualPresets ? (
            <PresetItem
              key={preset.id}
              preset={preset}
              animation={presetAnimations[index]}
              isDarkMode={isDarkMode}
              onSelect={handleSelectPreset}
            />
          ) : null
        ))}
      </Animated.View>

    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
  },
  backgroundTouchable: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  menuContainer: {
    position: 'absolute',
    width: 300,
    height: 300,
    justifyContent: 'center',
    alignItems: 'center',
  },

  presetWrapper: {
    position: 'absolute',
  },
  presetCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    position: 'relative',
  },
  presetCircleLight: {
    backgroundColor: 'rgba(255, 255, 255, 0.98)',
    borderColor: 'rgba(0, 0, 0, 0.1)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 6,
  },
  presetCircleDark: {
    backgroundColor: 'rgba(30, 30, 30, 0.98)',
    borderColor: 'rgba(255, 255, 255, 0.2)',
    shadowColor: '#fff',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 6,
  },
  colorIndicator: {
    width: 16,
    height: 16,
    borderRadius: 8,
    position: 'absolute',
    top: 8,
    right: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  emojiText: {
    fontSize: 24,
    textAlign: 'center',
    marginBottom: 4,
  },
  presetText: {
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 2,
  },
  presetTextLight: {
    color: '#374151',
  },
  presetTextDark: {
    color: '#e5e7eb',
  },
  presetCount: {
    fontSize: 9,
    textAlign: 'center',
  },
  presetCountLight: {
    color: '#6b7280',
  },
  presetCountDark: {
    color: '#9ca3af',
  },
});

export default PresetMenu;