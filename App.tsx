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

type ColorPreset = 'electric' | 'fire' | 'ocean' | 'forest' | 'sunset' | 'neon' | 'royal';
type ButtonType = 'ambient';

function App() {
  // 시스템 다크모드 상태를 가져옵니다
  const systemIsDarkMode = useRNColorScheme() === 'dark';
  // 다크모드 토글 상태를 useState로 관리합니다 (초기값은 시스템 설정)
  const [isDarkMode, setIsDarkMode] = useState(systemIsDarkMode);
  const [selectedPreset, setSelectedPreset] = useState<ColorPreset>('electric');
  // Removed gooey button functionality - only ambient button remains
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
        

        <Text style={[styles.sectionTitle, { color: isDarkMode ? '#fff' : '#000' }]}>
          색깔 프리셋 선택
        </Text>
        
        <View style={styles.presetContainer}>
          {presets.map((preset) => (
            <TouchableOpacity
              key={preset.name}
              style={[
                styles.presetButton,
                {
                  backgroundColor: selectedPreset === preset.name 
                    ? (isDarkMode ? '#4a5568' : '#e2e8f0') 
                    : (isDarkMode ? '#2d3748' : '#f7fafc'),
                  borderColor: selectedPreset === preset.name 
                    ? (isDarkMode ? '#63b3ed' : '#3182ce') 
                    : (isDarkMode ? '#4a5568' : '#e2e8f0'),
                }
              ]}
              onPress={() => setSelectedPreset(preset.name)}
            >
              <Text style={[
                styles.presetButtonText,
                { color: isDarkMode ? '#fff' : '#000' }
              ]}>
                {preset.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <StartButton 
          colorPreset={selectedPreset}
          glowIntensity={0.8}
          glowRadius={1.2}
          enablePulse={true}
          enableHaptic={true}
          enableTouchFeedback={true}
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
    borderWidth: 2,
    margin: 4,
    minWidth: 80,
  },
  presetButtonText: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default App;
