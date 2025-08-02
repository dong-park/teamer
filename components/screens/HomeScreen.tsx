import React, { useState, useRef } from 'react';
import { View, ScrollView, Text, StyleSheet, TouchableOpacity, Dimensions, useColorScheme } from 'react-native';
import StartButton from '../StartButton';
import PresetMenu from '../PresetMenu';
import PresetManagementScreen from './PresetManagementScreen';
import SuccessCounter from '../SuccessCounter';
import { useTimer } from '../../App';
import { usePreset } from '../../contexts/PresetContext';
import { Preset } from '../../types/preset';

const HomeScreen: React.FC = () => {
  const { isRunning, startTimer, stopTimer, elapsedTime, startTime, achievementRate, targetTime, setTargetTime, completedTasksCount } = useTimer();
  const { currentPreset, presetMenuState, showPresetMenu, hidePresetMenu, selectPreset, setCurrentPreset, getRecentPresets, updatePresetUsage } = usePreset();
  const [showTargetSettings, setShowTargetSettings] = useState(false);
  const [showPresetManagement, setShowPresetManagement] = useState(false);
  const [showDebugInfo, setShowDebugInfo] = useState(false);
  const buttonLayoutRef = useRef<View>(null);
  const [buttonPosition, setButtonPosition] = useState({ x: 0, y: 0 });
  const isDarkMode = useColorScheme() === 'dark';

  
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
    
    // 현재 프리셋으로 설정
    setCurrentPreset(preset);
    
    // 프리셋의 목표 시간을 설정 (분 단위를 밀리초로 변환)
    setTargetTime(preset.targetTime * 60 * 1000);
    
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

  if (showPresetManagement) {
    return <PresetManagementScreen onClose={() => setShowPresetManagement(false)} />;
  }

  return (
    <View className="flex-1">
      {/* 플로팅 버튼들 */}
      <View style={styles.floatingButtonContainer}>
        <TouchableOpacity
          style={[styles.floatingButton, { backgroundColor: isDarkMode ? '#4a5568' : '#ffffff' }]}
          onPress={() => setShowDebugInfo(!showDebugInfo)}
        >
          <Text style={[styles.floatingButtonText, { color: isDarkMode ? '#ffffff' : '#000000' }]}>
            🐛
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.floatingButton, { backgroundColor: isDarkMode ? '#4a5568' : '#ffffff' }]}
          onPress={() => setShowPresetManagement(true)}
        >
          <Text style={[styles.floatingButtonText, { color: isDarkMode ? '#ffffff' : '#000000' }]}>
            ⚙️
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
      >
        {/* 디버깅 정보 표시 */}
        {showDebugInfo && (
          <View style={[styles.debugContainer, { backgroundColor: isDarkMode ? '#1a202c' : '#f7fafc' }]}>
            <Text style={[styles.debugTitle, { color: isDarkMode ? '#ffffff' : '#000000' }]}>
              디버깅 정보
            </Text>
            <Text style={[styles.debugText, { color: isDarkMode ? '#a0aec0' : '#4a5568' }]}>
              목표 시간: {formatTargetTime(targetTime)}
            </Text>
            <Text style={[styles.debugText, { color: isDarkMode ? '#a0aec0' : '#4a5568' }]}>
              경과 시간: {formatElapsedTime(elapsedTime)}
            </Text>
            <Text style={[styles.debugText, { color: isDarkMode ? '#a0aec0' : '#4a5568' }]}>
              달성률: {(achievementRate * 100).toFixed(1)}%
            </Text>
            <Text style={[styles.debugText, { color: isDarkMode ? '#a0aec0' : '#4a5568' }]}>
              타이머 상태: {isRunning ? '실행 중' : '정지'}
            </Text>
            {startTime && (
              <Text style={[styles.debugText, { color: isDarkMode ? '#a0aec0' : '#4a5568' }]}>
                시작 시간: {formatStartTime(startTime)}
              </Text>
            )}
            <Text style={[styles.debugText, { color: isDarkMode ? '#a0aec0' : '#4a5568' }]}>
              Glow Radius: {dynamicGlowRadius.toFixed(2)}
            </Text>
            <Text style={[styles.debugText, { color: isDarkMode ? '#a0aec0' : '#4a5568' }]}>
              현재 프리셋 색상: {currentPreset?.color || '없음'}
            </Text>
            <Text style={[styles.debugText, { color: isDarkMode ? '#a0aec0' : '#4a5568' }]}>
              ColorPreset: {currentPreset ? 'custom' : 'electric'}
            </Text>
            <Text style={[styles.debugText, { color: isDarkMode ? '#a0aec0' : '#4a5568' }]}>
              성공 카운트: {completedTasksCount}
            </Text>
            {currentPreset && (
              <Text style={[styles.debugText, { color: isDarkMode ? '#a0aec0' : '#4a5568' }]}>
                CustomColors: {JSON.stringify({
                  primary: currentPreset.color,
                  secondary: currentPreset.color,
                  accent: currentPreset.color
                })}
              </Text>
            )}
          </View>
        )}

        {/* 현재 프리셋 표시 */}
        {currentPreset && (
          <View style={[styles.currentPresetContainer, { backgroundColor: isDarkMode ? '#2d3748' : '#ffffff' }]}>
            <View style={styles.currentPresetInfo}>
              {currentPreset.emoji ? (
                <Text style={styles.currentPresetEmoji}>{currentPreset.emoji}</Text>
              ) : (
                <View style={[styles.currentPresetColor, { backgroundColor: currentPreset.color }]} />
              )}
              <Text style={[styles.currentPresetName, { color: isDarkMode ? '#ffffff' : '#000000' }]}>
                {currentPreset.name}
              </Text>
              <Text style={[styles.currentPresetTime, { color: isDarkMode ? '#a0aec0' : '#718096' }]}>
                {currentPreset.targetTime}분
              </Text>
              <TouchableOpacity 
                onPress={() => setCurrentPreset(null)}
                style={styles.clearPresetButton}
              >
                <Text style={[styles.clearPresetButtonText, { color: isDarkMode ? '#a0aec0' : '#718096' }]}>✕</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* 성공 카운트 표시 */}
        <SuccessCounter count={completedTasksCount} />
      
        <View ref={buttonLayoutRef}>
          <StartButton 
            glowIntensity={0.8}
            glowRadius={dynamicGlowRadius}
            onPress={handleStartButtonPress}
            onLongPress={handleLongPress}
            customColors={currentPreset ? {
              primary: currentPreset.color,
              secondary: currentPreset.color,
              accent: currentPreset.color
            } : undefined}
            colorPreset={currentPreset ? 'custom' : 'electric'}
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
  floatingButtonContainer: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    zIndex: 10,
    gap: 10,
  },
  floatingButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  floatingButtonText: {
    fontSize: 20,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 20,
  },
  debugContainer: {
    width: '100%',
    maxWidth: 350,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  debugTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  debugText: {
    fontSize: 14,
    marginBottom: 6,
    fontFamily: 'monospace',
  },
  currentPresetContainer: {
    width: '100%',
    maxWidth: 350,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  currentPresetInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  currentPresetEmoji: {
    fontSize: 18,
    marginRight: 12,
  },
  currentPresetColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  currentPresetName: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  currentPresetTime: {
    fontSize: 14,
    fontWeight: '500',
    marginRight: 8,
  },
  clearPresetButton: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
  },
  clearPresetButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  presetTargetTime: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 16,
  },
  currentPresetTodos: {
    gap: 8,
  },
  currentTodoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(0,0,0,0.02)',
  },
  todoColorDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 12,
  },
  todoTitle: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
  },
});

export default HomeScreen;