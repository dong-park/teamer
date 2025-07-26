import React, { useState, useEffect } from 'react';
import { View, TouchableOpacity, Text, StyleSheet, useColorScheme, Vibration, Platform } from 'react-native';
import { Canvas, Circle, vec, RadialGradient, Path, Skia } from '@shopify/react-native-skia';
import { useSharedValue, withTiming, Easing, cancelAnimation, useAnimatedStyle, withSpring, withRepeat, interpolate, runOnJS } from 'react-native-reanimated';
import Animated from 'react-native-reanimated';

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
}) => {
  const [isStarted, setIsStarted] = useState(false);
  const [isPressed, setIsPressed] = useState(false);
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';
  const glowOpacity = useSharedValue(0);
  const pressScale = useSharedValue(1);
  const pressOpacity = useSharedValue(1);
  

  // Get current color theme based on preset or custom colors
  const currentColors = colorPreset === 'custom' && customColors ? customColors : colorPresets[colorPreset];
  const primaryColor = currentColors.primary;
  const secondaryColor = currentColors.secondary;
  const accentColor = currentColors.accent;
  
  
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
      <Canvas style={styles.canvas}>
        {/* Outer glow layer - largest, most diffused */}
        <Circle
          cx={140}
          cy={140}
          r={isDarkMode ? (100 * glowRadius) : (80 * glowRadius)}
          opacity={glowOpacity}
        >
          <RadialGradient
            c={vec(140, 140)}
            r={isDarkMode ? (100 * glowRadius) : (80 * glowRadius)}
            colors={isDarkMode ? 
              [primaryColor + Math.round(0xCC * glowIntensity).toString(16).padStart(2, '0'), 
               primaryColor + Math.round(0x88 * glowIntensity).toString(16).padStart(2, '0'), 
               'transparent'] : 
              [primaryColor + Math.round(0x77 * glowIntensity).toString(16).padStart(2, '0'), 
               primaryColor + Math.round(0x44 * glowIntensity).toString(16).padStart(2, '0'), 
               'transparent']}
            positions={isDarkMode ? [0.1, 0.5, 1.0] : [0.1, 0.6, 1.0]}
          />
        </Circle>
        
        {/* Inner glow layer - brightest, most focused */}
        <Circle
          cx={140}
          cy={140}
          r={isDarkMode ? (65 * glowRadius) : (55 * glowRadius)}
          opacity={glowOpacity}
        >
          <RadialGradient
            c={vec(140, 140)}
            r={isDarkMode ? (65 * glowRadius) : (55 * glowRadius)}
            colors={isDarkMode ? 
              [secondaryColor + Math.round(0xFF * glowIntensity).toString(16).padStart(2, '0'), 
               secondaryColor + Math.round(0xBB * glowIntensity).toString(16).padStart(2, '0'), 
               'transparent'] : 
              [secondaryColor + Math.round(0x99 * glowIntensity).toString(16).padStart(2, '0'), 
               secondaryColor + Math.round(0x55 * glowIntensity).toString(16).padStart(2, '0'), 
               'transparent']}
            positions={isDarkMode ? [0.2, 0.6, 1.0] : [0.2, 0.7, 1.0]}
          />
        </Circle>
        
        {/* Core intense glow - very bright center */}
        <Circle
          cx={140}
          cy={140}
          r={isDarkMode ? (50 * glowRadius) : (40 * glowRadius)}
          opacity={glowOpacity}
        >
          <RadialGradient
            c={vec(140, 140)}
            r={isDarkMode ? (50 * glowRadius) : (40 * glowRadius)}
            colors={isDarkMode ? 
              [accentColor + Math.round(0xFF * glowIntensity).toString(16).padStart(2, '0'), 
               accentColor + Math.round(0xDD * glowIntensity).toString(16).padStart(2, '0'), 
               'transparent'] : 
              [accentColor + Math.round(0xBB * glowIntensity).toString(16).padStart(2, '0'), 
               accentColor + Math.round(0x77 * glowIntensity).toString(16).padStart(2, '0'), 
               'transparent']}
            positions={isDarkMode ? [0.0, 0.4, 1.0] : [0.0, 0.4, 1.0]}
          />
        </Circle>
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
      >
        <Animated.View
          style={[
            styles.button,
            animatedButtonStyle,
            { 
              backgroundColor: isDarkMode ? '#f8f9fa' : '#1a1a1a',
              shadowColor: isDarkMode ? '#000' : '#000',
              shadowOffset: { width: 0, height: isDarkMode ? 6 : 4 },
              shadowOpacity: isDarkMode ? 0.25 : 0.15,
              shadowRadius: isDarkMode ? 12 : 8,
              borderWidth: isDarkMode ? 2 : 1,
              borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
            }
          ]}
        >
          <Text 
            style={[styles.buttonText, { color: isDarkMode ? '#1a1a1a' : '#fff' }]}
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
  },
  canvas: {
    position: 'absolute',
    width: 280,
    height: 280,
  },
  button: {
    width: 140,
    height: 140,
    
    borderRadius: 70,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 12,
  },
  buttonText: {
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: 1,
    textAlign: 'center',
  },
});

export default StartButton;