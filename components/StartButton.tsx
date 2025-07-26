import React, { useState } from 'react';
import { View, TouchableOpacity, Text, StyleSheet, useColorScheme, Vibration, Platform } from 'react-native';
import { Canvas, Circle, vec, RadialGradient } from '@shopify/react-native-skia';
import { useSharedValue, withTiming, Easing, cancelAnimation, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import Animated from 'react-native-reanimated';
import { ParticleRenderer } from './AmbientEffect/effects/ParticleRenderer';
import { useAdaptiveConfig } from './AmbientEffect/hooks/useAdaptiveConfig';
import { EffectPattern } from './AmbientEffect/types';

// Color preset definitions
type ColorPreset = 'electric' | 'fire' | 'ocean' | 'forest' | 'sunset' | 'neon' | 'royal' | 'custom';

interface ColorTheme {
  primary: string;
  secondary: string;
  accent: string;
}

interface StartButtonProps {
  colorPreset?: ColorPreset;
  customColors?: ColorTheme;
  onPress?: () => void;
  buttonText?: {
    start: string;
    stop: string;
  };
  glowIntensity?: number; // 0.0 to 1.0
  glowRadius?: number; // multiplier for glow size
  enablePulse?: boolean; // enable/disable pulse animation
  enableHaptic?: boolean; // enable haptic feedback
  enableTouchFeedback?: boolean; // enable visual touch feedback
  enableParticles?: boolean; // enable particle effects
  particlePattern?: EffectPattern; // particle animation pattern
  adaptiveQuality?: boolean; // enable automatic quality adjustment
}

// Color preset configurations with vibrant, highly visible colors optimized for both light and dark modes
const colorPresets: Record<ColorPreset, ColorTheme> = {
  electric: {
    primary: '#00CCFF',    // Bright Electric Blue - 다크모드에서 더 밝게
    secondary: '#0099FF',  // Bright Blue
    accent: '#66DDFF'      // Light Electric Blue
  },
  fire: {
    primary: '#FF5500',    // Bright Orange Red - 더 밝은 주황
    secondary: '#FF7744',  // Bright Coral
    accent: '#FF9966'      // Light Orange
  },
  ocean: {
    primary: '#00FFDD',    // Bright Cyan - 매우 밝은 청록
    secondary: '#33CCAA',  // Bright Teal
    accent: '#66EEDD'      // Light Cyan
  },
  forest: {
    primary: '#44FF44',    // Bright Lime - 매우 밝은 라임
    secondary: '#33CC33',  // Bright Green
    accent: '#88FF88'      // Light Lime
  },
  sunset: {
    primary: '#FF55AA',    // Bright Pink - 더 밝은 핑크
    secondary: '#FF3388',  // Hot Pink
    accent: '#FF99CC'      // Light Pink
  },
  neon: {
    primary: '#BBFF33',    // Bright Neon Yellow - 네온 옐로우
    secondary: '#99FF00',  // Bright Chartreuse
    accent: '#DDFF66'      // Light Neon
  },
  royal: {
    primary: '#AA44FF',    // Bright Purple - 더 밝은 보라
    secondary: '#8833CC',  // Bright Violet
    accent: '#CC77FF'      // Light Purple
  },
  custom: {
    primary: '#ff6b6b',    // Default fallback
    secondary: '#ff8e8e',
    accent: '#ffb3b3'
  }
};

// 라이트 모드용 세련된 색상 프리셋 (미적 매력도를 높인 색상)
const lightModeColorPresets: Record<ColorPreset, ColorTheme> = {
  electric: {
    primary: '#2563EB',    // Modern Electric Blue
    secondary: '#1D4ED8',  // Rich Blue
    accent: '#3B82F6'      // Bright Blue
  },
  fire: {
    primary: '#DC2626',    // Modern Red
    secondary: '#B91C1C',  // Deep Red
    accent: '#EF4444'      // Bright Red
  },
  ocean: {
    primary: '#0891B2',    // Modern Cyan
    secondary: '#0E7490',  // Deep Cyan
    accent: '#06B6D4'      // Bright Cyan
  },
  forest: {
    primary: '#059669',    // Modern Green
    secondary: '#047857',  // Deep Green
    accent: '#10B981'      // Bright Green
  },
  sunset: {
    primary: '#DB2777',    // Modern Pink
    secondary: '#BE185D',  // Deep Pink
    accent: '#EC4899'      // Bright Pink
  },
  neon: {
    primary: '#CA8A04',    // Modern Yellow
    secondary: '#A16207',  // Deep Yellow
    accent: '#EAB308'      // Bright Yellow
  },
  royal: {
    primary: '#7C3AED',    // Modern Purple
    secondary: '#6D28D9',  // Deep Purple
    accent: '#8B5CF6'      // Bright Purple
  },
  custom: {
    primary: '#DC2626',    // Modern fallback
    secondary: '#B91C1C',
    accent: '#EF4444'
  }
};

const StartButton: React.FC<StartButtonProps> = ({
  colorPreset = 'electric',
  customColors,
  onPress,
  buttonText = { start: '시작', stop: '정지' },
  glowIntensity = 1.0,
  glowRadius = 1.0,
  enablePulse = true,
  enableHaptic = true,
  enableTouchFeedback = true,
  enableParticles = true,
  particlePattern = 'waves',
  adaptiveQuality = true,
}) => {
  const [isStarted, setIsStarted] = useState(false);
  const [isPressed, setIsPressed] = useState(false);
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';
  const glowOpacity = useSharedValue(0);
  const pressScale = useSharedValue(1);
  const pressOpacity = useSharedValue(1);

  // Get current color theme based on preset or custom colors and color scheme
  const baseColors = colorPreset === 'custom' && customColors ? customColors : colorPresets[colorPreset];
  const lightColors = lightModeColorPresets[colorPreset];
  
  // 라이트 모드에서는 어두운 색상 사용, 다크 모드에서는 밝은 색상 사용
  const currentColors = isDarkMode ? baseColors : lightColors;
  const primaryColor = currentColors.primary;
  const secondaryColor = currentColors.secondary;
  const accentColor = currentColors.accent;

  // 적응형 설정 훅 사용
  const { 
    config: adaptiveConfig, 
    updateConfig 
  } = useAdaptiveConfig({
    enableAutoAdaptation: adaptiveQuality,
    initialConfig: {
      colors: [primaryColor, secondaryColor, accentColor],
      pattern: particlePattern,
      intensity: glowIntensity,
    }
  });

  // 성능 변화 감지 핸들러
  const handlePerformanceChange = (isGood: boolean) => {
    if (!isGood && adaptiveQuality) {
      // 성능이 좋지 않으면 글로우 강도 자동 감소
      updateConfig({ intensity: Math.max(0.3, adaptiveConfig.intensity * 0.8) });
    }
  };
  
  // Haptic feedback function
  const triggerHaptic = () => {
    if (enableHaptic) {
      if (Platform.OS === 'ios') {
        // iOS uses impact feedback
        Vibration.vibrate();
      } else {
        // Android uses vibration pattern
        Vibration.vibrate(50);
      }
    }
  };

  // Touch feedback handlers
  const handlePressIn = () => {
    if (enableTouchFeedback) {
      setIsPressed(true);
      pressScale.value = withSpring(0.95, {
        damping: 15,
        stiffness: 200,
      });
      pressOpacity.value = withTiming(0.8, { duration: 100 });
    }
  };

  const handlePressOut = () => {
    if (enableTouchFeedback) {
      setIsPressed(false);
      pressScale.value = withSpring(1, {
        damping: 15,
        stiffness: 200,
      });
      pressOpacity.value = withTiming(1, { duration: 150 });
    }
  };

  const handlePress = () => {
    // Trigger haptic feedback
    triggerHaptic();
    
    setIsStarted(!isStarted);
    
    if (!isStarted && enablePulse) {
      // Simple fade in to full brightness and stay there
      glowOpacity.value = withTiming(1.0, { 
        duration: 1000, // 1초에 걸쳐 천천히 올라가기
        easing: Easing.bezier(0.25, 0.1, 0.25, 1.0) // ease-out
      });
    } else {
      // Stop button pressed - fade to complete zero
      cancelAnimation(glowOpacity);
      
      // Fade to complete zero when stopping
      glowOpacity.value = withTiming(0, { 
        duration: 800,
        easing: Easing.bezier(0.4, 0.0, 0.2, 1.0) // ease-out
      });
    }
    
    onPress?.();
  };

  // Animated style for touch feedback
  const animatedButtonStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: pressScale.value }],
      opacity: pressOpacity.value,
    };
  });

  return (
    <View style={styles.container}>
      {/* 파티클 효과 레이어 (배경) */}
      {enableParticles && (
        <ParticleRenderer
          width={280}
          height={280}
          pattern={adaptiveConfig.pattern || particlePattern}
          intensity={adaptiveConfig.intensity * glowOpacity.value}
          isActive={isStarted}
          quality={adaptiveConfig.quality}
          particleCount={adaptiveConfig.particleCount}
          colors={adaptiveConfig.colors}
          onPerformanceChange={handlePerformanceChange}
        />
      )}
      
      {/* 글로우 효과 레이어 */}
      <Canvas style={styles.canvas}>
        {isDarkMode ? (
          // 다크 모드 - 기존 밝은 글로우 효과
          <>
            {/* Outer glow layer */}
            <Circle
              cx={140}
              cy={140}
              r={100 * glowRadius}
              opacity={glowOpacity}
            >
              <RadialGradient
                c={vec(140, 140)}
                r={100 * glowRadius}
                colors={[
                  primaryColor + Math.round(0xCC * glowIntensity).toString(16).padStart(2, '0'), 
                  primaryColor + Math.round(0x88 * glowIntensity).toString(16).padStart(2, '0'), 
                  'transparent'
                ]}
                positions={[0.1, 0.5, 1.0]}
              />
            </Circle>
            
            {/* Inner glow layer */}
            <Circle
              cx={140}
              cy={140}
              r={65 * glowRadius}
              opacity={glowOpacity}
            >
              <RadialGradient
                c={vec(140, 140)}
                r={65 * glowRadius}
                colors={[
                  secondaryColor + Math.round(0xFF * glowIntensity).toString(16).padStart(2, '0'), 
                  secondaryColor + Math.round(0xBB * glowIntensity).toString(16).padStart(2, '0'), 
                  'transparent'
                ]}
                positions={[0.2, 0.6, 1.0]}
              />
            </Circle>
            
            {/* Core glow */}
            <Circle
              cx={140}
              cy={140}
              r={50 * glowRadius}
              opacity={glowOpacity}
            >
              <RadialGradient
                c={vec(140, 140)}
                r={50 * glowRadius}
                colors={[
                  accentColor + Math.round(0xFF * glowIntensity).toString(16).padStart(2, '0'), 
                  accentColor + Math.round(0xDD * glowIntensity).toString(16).padStart(2, '0'), 
                  'transparent'
                ]}
                positions={[0.0, 0.4, 1.0]}
              />
            </Circle>
          </>
        ) : (
          // 라이트 모드 - 부드러운 단일 글로우 (층짐 방지)
          <>
            {/* 하나의 통합된 부드러운 글로우 */}
            <Circle
              cx={140}
              cy={140}
              r={100 * glowRadius}
              opacity={glowOpacity}
            >
              <RadialGradient
                c={vec(140, 140)}
                r={100 * glowRadius}
                colors={[
                  'transparent',
                  primaryColor + Math.round(0x08 * glowIntensity).toString(16).padStart(2, '0'),
                  primaryColor + Math.round(0x15 * glowIntensity).toString(16).padStart(2, '0'),
                  primaryColor + Math.round(0x25 * glowIntensity).toString(16).padStart(2, '0'),
                  primaryColor + Math.round(0x35 * glowIntensity).toString(16).padStart(2, '0'),
                  primaryColor + Math.round(0x40 * glowIntensity).toString(16).padStart(2, '0'),
                  primaryColor + Math.round(0x30 * glowIntensity).toString(16).padStart(2, '0'),
                  primaryColor + Math.round(0x20 * glowIntensity).toString(16).padStart(2, '0'),
                  primaryColor + Math.round(0x10 * glowIntensity).toString(16).padStart(2, '0'),
                  'transparent'
                ]}
                positions={[0.0, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0]}
              />
            </Circle>
          </>
        )}
      </Canvas>
      
      <TouchableOpacity
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={enableTouchFeedback ? 1 : 0.7}
        accessible={true}
        accessibilityRole="button"
        accessibilityLabel={isStarted ? buttonText.stop : buttonText.start}
        accessibilityHint={isStarted ? "탭하여 중지합니다" : "탭하여 시작합니다"}
        accessibilityState={{ selected: isStarted, busy: isPressed }}
        style={styles.touchableOpacity}
      >
        <Animated.View
          style={[
            styles.button,
            animatedButtonStyle,
            isDarkMode ? styles.buttonDark : styles.buttonLight,
            isPressed && (isDarkMode ? styles.buttonPressedDark : styles.buttonPressedLight),
          ]}
        >
          <Text 
            style={[styles.buttonText, isDarkMode ? styles.buttonTextDark : styles.buttonTextLight]}
            className="text-white dark:text-gray-800 font-bold"
          >
            {isStarted ? buttonText.stop : buttonText.start}
          </Text>
        </Animated.View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 280,
    height: 280,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  canvas: {
    position: 'absolute',
    width: 280,
    height: 280,
    zIndex: 1, // 글로우 효과를 파티클 위에 표시
  },
  button: {
    width: 140,
    height: 140,
    borderRadius: 70,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonLight: {
    backgroundColor: '#1a1a1a',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 12,
    },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 25,
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    // 라이트 모드에서 더 강한 입체감을 위한 내부 그림자 효과
  },
  buttonDark: {
    backgroundColor: '#f8f9fa',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 20,
    },
    shadowOpacity: 0.7,
    shadowRadius: 35,
    elevation: 40,
    borderWidth: 4,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    // 다크 모드에서 극적인 입체감 - 플로팅 효과
  },
  buttonPressedLight: {
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 12,
    transform: [{ translateY: 4 }],
  },
  buttonPressedDark: {
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 25,
    transform: [{ translateY: 8 }],
  },
  buttonText: {
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: 1,
    textAlign: 'center',
  },
  buttonTextDark: {
    color: '#1a1a1a',
  },
  buttonTextLight: {
    color: '#fff',
  },
  touchableOpacity: {
    zIndex: 2,
  },
});

export default StartButton;