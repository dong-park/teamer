import React, { useState } from 'react';
import { View, TouchableOpacity, Text, StyleSheet, useColorScheme, Vibration, Platform } from 'react-native';

// Color preset definitions
type ColorPreset = 'electric' | 'fire' | 'ocean' | 'forest' | 'sunset' | 'neon' | 'royal' | 'custom';

interface ColorTheme {
  primary: string;
  secondary: string;
  accent: string;
}

interface GooeyButtonProps {
  onPress?: () => void;
  buttonText?: {
    start: string;
    stop: string;
  };
  colorPreset?: ColorPreset;
  customColors?: ColorTheme;
  enableHaptic?: boolean;
  enableTouchFeedback?: boolean;
  size?: 'small' | 'medium' | 'large';
  bubbleIntensity?: 'low' | 'medium' | 'high';
  continuousBubbles?: boolean;
}

// Color preset configurations
const colorPresets: Record<ColorPreset, ColorTheme> = {
  electric: {
    primary: '#00CCFF',
    secondary: '#0099FF', 
    accent: '#66DDFF'
  },
  fire: {
    primary: '#FF5500',
    secondary: '#FF7744',
    accent: '#FF9966'
  },
  ocean: {
    primary: '#00FFDD',
    secondary: '#33CCAA',
    accent: '#66EEDD'
  },
  forest: {
    primary: '#44FF44',
    secondary: '#33CC33',
    accent: '#88FF88'
  },
  sunset: {
    primary: '#FF55AA',
    secondary: '#FF3388',
    accent: '#FF99CC'
  },
  neon: {
    primary: '#BBFF33',
    secondary: '#99FF00',
    accent: '#DDFF66'
  },
  royal: {
    primary: '#AA44FF',
    secondary: '#8833CC',
    accent: '#CC77FF'
  },
  custom: {
    primary: '#ff6b6b',
    secondary: '#ff8e8e',
    accent: '#ffb3b3'
  }
};

const GooeyButton: React.FC<GooeyButtonProps> = ({
  onPress,
  buttonText = { start: '시작', stop: '정지' },
  colorPreset = 'fire',
  customColors,
  enableHaptic = true,
  enableTouchFeedback = true,
  size = 'medium',
  bubbleIntensity = 'medium',
  continuousBubbles = false,
}) => {
  const [isStarted, setIsStarted] = useState(false);
  const [isPressed, setIsPressed] = useState(false);
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';

  // Get current color theme
  const getCurrentColors = () => {
    if (colorPreset === 'custom' && customColors) {
      return customColors;
    }
    return colorPresets[colorPreset] || colorPresets.fire;
  };

  const currentColors = getCurrentColors();

  // Size configurations
  const sizeConfig = {
    small: { 
      container: 200, 
      button: 100
    },
    medium: { 
      container: 280, 
      button: 140
    },
    large: { 
      container: 360, 
      button: 180
    }
  };

  const config = sizeConfig[size];

  // Haptic feedback
  const triggerHaptic = () => {
    if (enableHaptic) {
      if (Platform.OS === 'ios') {
        Vibration.vibrate();
      } else {
        Vibration.vibrate(50);
      }
    }
  };

  // Touch handlers
  const handlePressIn = () => {
    if (enableTouchFeedback) {
      setIsPressed(true);
    }
  };

  const handlePressOut = () => {
    if (enableTouchFeedback) {
      setIsPressed(false);
    }
  };

  const handlePress = () => {
    triggerHaptic();
    setIsStarted(!isStarted);
    onPress?.();
  };

  return (
    <View style={[styles.container, { width: config.container, height: config.container }]}>
      <TouchableOpacity
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={enableTouchFeedback ? 0.8 : 0.7}
        accessible={true}
        accessibilityRole="button"
        accessibilityLabel={isStarted ? buttonText.stop : buttonText.start}
        accessibilityHint={isStarted ? "탭하여 중지합니다" : "탭하여 시작합니다"}
        accessibilityState={{ selected: isStarted, busy: isPressed }}
      >
        <View
          style={[
            styles.button,
            { 
              width: config.button,
              height: config.button,
              borderRadius: config.button / 2,
              backgroundColor: isStarted ? currentColors.primary : currentColors.secondary,
              transform: [{ scale: isPressed ? 0.95 : 1 }],
              // 다크모드에 따른 그림자 및 테두리
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
            style={[
              styles.buttonText, 
              { 
                color: '#fff',
                fontSize: size === 'small' ? 20 : size === 'medium' ? 28 : 36
              }
            ]}
          >
            {isStarted ? buttonText.stop : buttonText.start}
          </Text>
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  button: {
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 12,
  },
  buttonText: {
    fontWeight: '700',
    letterSpacing: 1,
    textAlign: 'center',
  },
});

export default GooeyButton;