import React, { useState } from 'react';
import { View, ScrollView, Text, StyleSheet, TouchableOpacity } from 'react-native';
import StartButton from '../StartButton';
import { useTimer } from '../../App';

const HomeScreen: React.FC = () => {
  const { isRunning, startTimer, stopTimer, elapsedTime, startTime, achievementRate, targetTime, setTargetTime } = useTimer();
  const [showTargetSettings, setShowTargetSettings] = useState(false);

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
      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
      >
        {/* 타이머 상태 표시 영역 */}
        <View className="mb-8 items-center">
          {/* 경과 시간 표시 */}
          <Text className="text-4xl font-bold text-gray-800 dark:text-white mb-2">
            {formatElapsedTime(elapsedTime)}
          </Text>
          
          {/* 상태 표시 */}
          <View className="flex-row items-center mb-2">
            <View 
              className={`w-3 h-3 rounded-full mr-2 ${
                isRunning ? 'bg-green-500' : 'bg-gray-400'
              }`} 
            />
            <Text className="text-lg text-gray-600 dark:text-gray-300">
              {isRunning ? '실행 중' : '대기 중'}
            </Text>
          </View>
          
          {/* 시작 시간 표시 */}
          {startTime && (
            <Text className="text-sm text-gray-500 dark:text-gray-400">
              시작 시간: {formatStartTime(startTime)}
            </Text>
          )}
          
          {/* 달성률 표시 */}
          {isRunning && (
            <Text className="text-xs text-blue-500 dark:text-blue-400 mt-1">
              달성률: {Math.round(achievementRate * 100)}% 
              <Text className="text-gray-400"> (glow: {dynamicGlowRadius.toFixed(1)})</Text>
            </Text>
          )}
          
          {/* 목표 시간 설정 */}
          {!isRunning && (
            <View className="mt-3">
              <TouchableOpacity 
                onPress={() => setShowTargetSettings(!showTargetSettings)}
                className="mb-2"
              >
                <Text className="text-sm text-blue-500 dark:text-blue-400 text-center">
                  목표: {formatTargetTime(targetTime)} 
                  <Text className="text-gray-400"> (탭하여 변경)</Text>
                </Text>
              </TouchableOpacity>
              
              {/* 시간 프리셋 선택 */}
              {showTargetSettings && (
                <View className="flex-row flex-wrap justify-center gap-2 mt-2">
                  {timePresets.map((minutes) => (
                    <TouchableOpacity
                      key={minutes}
                      onPress={() => handleTargetTimeChange(minutes)}
                      className={`px-3 py-1 rounded-full border ${
                        Math.round(targetTime / (60 * 1000)) === minutes
                          ? 'bg-blue-500 border-blue-500'
                          : 'bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600'
                      }`}
                    >
                      <Text className={`text-xs ${
                        Math.round(targetTime / (60 * 1000)) === minutes
                          ? 'text-white'
                          : 'text-gray-700 dark:text-gray-300'
                      }`}>
                        {minutes}분
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          )}
        </View>

        <StartButton 
          glowIntensity={0.8}
          glowRadius={dynamicGlowRadius}
          onPress={handleStartButtonPress}
        />
      </ScrollView>
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