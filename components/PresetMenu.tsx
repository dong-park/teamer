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
import { BlurView } from '@react-native-community/blur';
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
        {/* 프리셋 색상 표시 */}
        <View 
          style={[
            styles.colorIndicator,
            { backgroundColor: preset.todos[0]?.color || '#3B82F6' }
          ]} 
        />
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
  const backgroundOpacity = useSharedValue(0);
  
  // 프리셋 원들의 애니메이션 값 (고정 6개)
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
  ];

  // 메뉴 중심에서 각 프리셋까지의 거리와 각도 계산
  const menuRadius = 120;
  const angleStep = (2 * Math.PI) / Math.min(presets.length, 6);
  
  const presetPositions = presets.slice(0, 6).map((_, index) => {
    const angle = index * angleStep - Math.PI / 2; // -90도부터 시작 (12시 방향)
    return {
      x: Math.cos(angle) * menuRadius,
      y: Math.sin(angle) * menuRadius,
    };
  });

  // 메뉴 표시/숨김 애니메이션
  useEffect(() => {
    if (isVisible) {
      // 메뉴 표시
      backgroundOpacity.value = withTiming(1, { duration: 200 });
      scale.value = withSpring(1, { damping: 15, stiffness: 200 });
      opacity.value = withTiming(1, { duration: 300 });
      
      // 프리셋들을 순차적으로 애니메이션 (실제 프리셋 개수만큼)
      const actualPresets = Math.min(presets.length, 6);
      for (let index = 0; index < actualPresets; index++) {
        const delay = index * 80; // 80ms 간격으로 순차 등장
        const position = presetPositions[index];
        const anim = presetAnimations[index];
        
        anim.scale.value = withDelay(delay, withSpring(1, { damping: 12, stiffness: 150 }));
        anim.translateX.value = withDelay(delay, withSpring(position.x, { damping: 15, stiffness: 120 }));
        anim.translateY.value = withDelay(delay, withSpring(position.y, { damping: 15, stiffness: 120 }));
        anim.opacity.value = withDelay(delay, withTiming(1, { duration: 200 }));
      }
    } else {
      // 메뉴 숨김
      backgroundOpacity.value = withTiming(0, { duration: 200 });
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
  }, [isVisible]);

  // 배경 애니메이션 스타일
  const backgroundStyle = useAnimatedStyle(() => ({
    opacity: backgroundOpacity.value,
  }));

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
    <View style={styles.overlay}>
      {/* 배경 블러 */}
      <Animated.View style={[styles.background, backgroundStyle]}>
        <BlurView
          style={styles.blurView}
          blurType={isDarkMode ? 'dark' : 'light'}
          blurAmount={10}
        />
        <TouchableOpacity 
          style={styles.backgroundTouchable} 
          onPress={onClose}
          activeOpacity={1}
        />
      </Animated.View>

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
      >
        {/* 중앙 원 */}
        <View style={[
          styles.centerCircle, 
          isDarkMode ? styles.centerCircleDark : styles.centerCircleLight
        ]}>
          <Text style={[
            styles.centerText,
            isDarkMode ? styles.centerTextDark : styles.centerTextLight
          ]}>
            할일 선택
          </Text>
        </View>

        {/* 프리셋 원들 */}
        {presets.slice(0, 6).map((preset, index) => (
          <PresetItem
            key={preset.id}
            preset={preset}
            animation={presetAnimations[index]}
            isDarkMode={isDarkMode}
            onSelect={handleSelectPreset}
          />
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
  background: {
    flex: 1,
  },
  blurView: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  backgroundTouchable: {
    flex: 1,
  },
  menuContainer: {
    position: 'absolute',
    width: 300,
    height: 300,
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    borderWidth: 2,
  },
  centerCircleLight: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderColor: 'rgba(0, 0, 0, 0.1)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  centerCircleDark: {
    backgroundColor: 'rgba(40, 40, 40, 0.9)',
    borderColor: 'rgba(255, 255, 255, 0.2)',
    shadowColor: '#fff',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  centerText: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  centerTextLight: {
    color: '#1f2937',
  },
  centerTextDark: {
    color: '#f9fafb',
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
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderColor: 'rgba(0, 0, 0, 0.1)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  presetCircleDark: {
    backgroundColor: 'rgba(30, 30, 30, 0.95)',
    borderColor: 'rgba(255, 255, 255, 0.2)',
    shadowColor: '#fff',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
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