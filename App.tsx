/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, useColorScheme as useRNColorScheme, Switch, View, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native';
import { useColorScheme } from 'nativewind';
import './global.css';
import StartButton from './components/StartButton';
import { detectDeviceCapability } from './components/AmbientEffect/utils/deviceDetection';

type ColorPreset = 'electric' | 'fire' | 'ocean' | 'forest' | 'sunset' | 'neon' | 'royal';
type ParticlePattern = 'waves' | 'spiral' | 'burst' | 'orbit';

function App() {
  // 시스템 다크모드 상태를 가져옵니다
  const systemIsDarkMode = useRNColorScheme() === 'dark';
  // 다크모드 토글 상태를 useState로 관리합니다 (초기값은 시스템 설정)
  const [isDarkMode, setIsDarkMode] = useState(systemIsDarkMode);
  const [selectedPreset, setSelectedPreset] = useState<ColorPreset>('electric');
  const [selectedPattern, setSelectedPattern] = useState<ParticlePattern>('waves');
  const [deviceCapability] = useState(() => detectDeviceCapability());
  const [adaptiveQuality, setAdaptiveQuality] = useState(true);
  const { setColorScheme } = useColorScheme();

  const presets: { name: ColorPreset; label: string }[] = [
    { name: 'electric', label: '⚡ Electric' },
    { name: 'fire', label: '🔥 Fire' },
    { name: 'ocean', label: '🌊 Ocean' },
    { name: 'forest', label: '🌲 Forest' },
    { name: 'sunset', label: '🌅 Sunset' },
    { name: 'neon', label: '💚 Neon' },
    { name: 'royal', label: '👑 Royal' },
  ];

  const patterns: { name: ParticlePattern; label: string }[] = [
    { name: 'waves', label: '🌊 Waves' },
    { name: 'spiral', label: '🌀 Spiral' },
    { name: 'burst', label: '💥 Burst' },
    { name: 'orbit', label: '🪐 Orbit' },
  ];

  // 다크모드 상태가 변경될 때 NativeWind에 알림
  useEffect(() => {
    setColorScheme(isDarkMode ? 'dark' : 'light');
  }, [isDarkMode, setColorScheme]);

  // 다크모드에 따라 배경색과 텍스트 색상을 다르게 적용합니다
  const backgroundColor = isDarkMode ? '#1a202c' : '#fff';

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.toggleRow}>
          <Text className="dark-mode-label">
            다크모드
          </Text>
          <Switch
            value={isDarkMode}
            onValueChange={setIsDarkMode}
          />
        </View>
        

        <Text style={[styles.sectionTitle, isDarkMode ? styles.sectionTitleDark : styles.sectionTitleLight]}>
          색깔 프리셋 선택
        </Text>
        
        <View style={styles.presetContainer}>
          {presets.map((preset) => (
            <TouchableOpacity
              key={preset.name}
              style={[
                styles.presetButton,
                isDarkMode ? styles.presetButtonDark : styles.presetButtonLight,
                selectedPreset === preset.name 
                  ? (isDarkMode ? styles.presetButtonSelectedDark : styles.presetButtonSelectedLight)
                  : null
              ]}
              onPress={() => setSelectedPreset(preset.name)}
            >
              <Text style={[
                styles.presetButtonText,
                selectedPreset === preset.name 
                  ? styles.presetButtonTextSelected
                  : (isDarkMode ? styles.presetButtonTextDark : styles.presetButtonTextLight)
              ]}>
                {preset.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={[styles.sectionTitle, isDarkMode ? styles.sectionTitleDark : styles.sectionTitleLight]}>
          파티클 패턴 선택
        </Text>
        
        <View style={styles.presetContainer}>
          {patterns.map((pattern) => (
            <TouchableOpacity
              key={pattern.name}
              style={[
                styles.presetButton,
                isDarkMode ? styles.presetButtonDark : styles.presetButtonLight,
                selectedPattern === pattern.name 
                  ? (isDarkMode ? styles.presetButtonSelectedDark : styles.presetButtonSelectedLight)
                  : null
              ]}
              onPress={() => setSelectedPattern(pattern.name)}
            >
              <Text style={[
                styles.presetButtonText,
                selectedPattern === pattern.name 
                  ? styles.presetButtonTextSelected
                  : (isDarkMode ? styles.presetButtonTextDark : styles.presetButtonTextLight)
              ]}>
                {pattern.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.deviceInfoContainer}>
          <Text style={[styles.deviceInfoTitle, isDarkMode ? styles.deviceInfoTitleDark : styles.deviceInfoTitleLight]}>
            디바이스 성능: {deviceCapability.toUpperCase()}
          </Text>
          <View style={styles.toggleRow}>
            <Text style={[styles.deviceInfoText, isDarkMode ? styles.deviceInfoTextDark : styles.deviceInfoTextLight]}>
              자동 품질 조정
            </Text>
            <Switch
              value={adaptiveQuality}
              onValueChange={setAdaptiveQuality}
            />
          </View>
        </View>

        <StartButton 
          colorPreset={selectedPreset}
          glowIntensity={0.8}
          glowRadius={1.2}
          enablePulse={true}
          enableHaptic={true}
          enableTouchFeedback={true}
          enableParticles={true}
          particlePattern={selectedPattern}
          adaptiveQuality={adaptiveQuality}
          onPress={() => console.log(`Ambient button pressed with ${selectedPreset} preset!`)}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    textAlign: 'center',
  },
  presetContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: 40,
    paddingHorizontal: 20,
    maxWidth: 400,
  },
  presetButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    margin: 4,
    minWidth: 80,
  },
  presetButtonLight: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  presetButtonDark: {
    backgroundColor: '#2d3748',
    borderWidth: 1,
    borderColor: '#4a5568',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  presetButtonSelectedLight: {
    backgroundColor: '#3182ce',
    borderColor: '#2c5aa0',
    shadowColor: '#3182ce',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
    transform: [{ scale: 1.05 }],
  },
  presetButtonSelectedDark: {
    backgroundColor: '#4299e1',
    borderColor: '#63b3ed',
    shadowColor: '#4299e1',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 10,
    transform: [{ scale: 1.05 }],
  },
  presetButtonText: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  deviceInfoContainer: {
    alignItems: 'center',
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  deviceInfoTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  deviceInfoText: {
    fontSize: 14,
    fontWeight: '500',
  },
  sectionTitleDark: {
    color: '#fff',
  },
  sectionTitleLight: {
    color: '#000',
  },
  presetButtonTextSelected: {
    color: '#fff',
  },
  presetButtonTextDark: {
    color: '#fff',
  },
  presetButtonTextLight: {
    color: '#000',
  },
  deviceInfoTitleDark: {
    color: '#fff',
  },
  deviceInfoTitleLight: {
    color: '#000',
  },
  deviceInfoTextDark: {
    color: '#ccc',
  },
  deviceInfoTextLight: {
    color: '#666',
  },
});

export default App;
