import React, { useState, useRef } from 'react';
import { View, ScrollView, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import StartButton from '../StartButton';
import PresetMenu from '../PresetMenu';
import { useTimer } from '../../App';
import { usePreset } from '../../contexts/PresetContext';
import { Preset } from '../../types/preset';

const HomeScreen: React.FC = () => {
  const { isRunning, startTimer, stopTimer, elapsedTime, startTime, achievementRate, targetTime, setTargetTime } = useTimer();
  const { presetMenuState, showPresetMenu, hidePresetMenu, selectPreset, getRecentPresets, updatePresetUsage } = usePreset();
  const [showTargetSettings, setShowTargetSettings] = useState(false);
  const buttonLayoutRef = useRef<View>(null);
  const [buttonPosition, setButtonPosition] = useState({ x: 0, y: 0 });

  
  const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

  // 경과 시간을 포맷하는 함수
  const formatElapsedTime = (milliseconds: number): string => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  // 시작 시간을 포맷하는 함수
  const formatStartTime = (date: Date): string => {
    return date.toLocaleTimeString('ko-KR', { 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit' 
    });
  };

  // 목표 시간을 분 단위로 포맷하는 함수
  const formatTargetTime = (milliseconds: number): string => {
    const minutes = Math.round(milliseconds / (60 * 1000));
    return `${minutes}분`;
  };

  // 목표 시간 설정 함수
  const handleTargetTimeChange = (minutes: number) => {
    setTargetTime(minutes * 60 * 1000);
    setShowTargetSettings(false);
  };

  // 프리셋 시간 옵션들
  const timePresets = [1, 5, 10, 15, 20, 25, 30, 45, 60];

  const handleStartButtonPress = () => {
    if (isRunning) {
      stopTimer();
    } else {
      startTimer();
    }
  };

  // 길게 누르기 핸들러
  const handleLongPress = () => {
    // 버튼 위치 측정
    buttonLayoutRef.current?.measure((x, y, width, height, pageX, pageY) => {
      // 캔버스 중심 계산
      const canvasCenterX = pageX + width / 2;
      const canvasCenterY = pageY + height / 2;
      
      // 실제 버튼은 140x140이고 캔버스 중심에 위치하므로 좌표 보정 불필요
      // 하지만 실제 측정값을 보면 캔버스가 예상보다 아래에 위치함
      // 실제 시각적 중심으로 보정
      const actualButtonY = canvasCenterY - 65; // 65px 위쪽으로 보정
      

      
      setButtonPosition({
        x: canvasCenterX,
        y: actualButtonY,
      });
      showPresetMenu();
    });
  };

  // 프리셋 선택 핸들러
  const handlePresetSelect = (preset: Preset) => {
    // 선택된 프리셋의 사용량 업데이트
    updatePresetUsage(preset.id);
    
    // 첫 번째 할일의 지속 시간을 목표 시간으로 설정
    if (preset.todos.length > 0 && preset.todos[0].duration) {
      setTargetTime(preset.todos[0].duration * 60 * 1000);
    }
    
    // 타이머 시작
    if (!isRunning) {
      startTimer();
    }
    
    hidePresetMenu();
  };

  // 달성률에 따른 glowRadius 계산 (1.4 ~ 1.9)
  const calculateGlowRadius = (rate: number): number => {
    const minRadius = 1.25;
    const maxRadius = 2;
    // 0.0 ~ 1.0 달성률을 1.4 ~ 1.9 범위로 매핑
    return minRadius + (maxRadius - minRadius) * rate;
  };

  const dynamicGlowRadius = calculateGlowRadius(achievementRate);

  return (
    <View className="flex-1">
      {/* 디버깅 정보 표시 */}

      
      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
      >
      
        <View ref={buttonLayoutRef}>
          <StartButton 
            glowIntensity={0.8}
            glowRadius={dynamicGlowRadius}
            onPress={handleStartButtonPress}
            onLongPress={handleLongPress}
          />
        </View>
      </ScrollView>

      {/* 프리셋 메뉴 */}
      <PresetMenu
        isVisible={presetMenuState.isVisible}
        presets={getRecentPresets()}
        onSelectPreset={handlePresetSelect}
        onClose={hidePresetMenu}
        centerX={buttonPosition.x}
        centerY={buttonPosition.y}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
  },
});

export default HomeScreen;