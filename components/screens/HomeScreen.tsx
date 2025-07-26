import React from 'react';
import { View, ScrollView, Text, StyleSheet } from 'react-native';
import StartButton from '../StartButton';
import { useTimer } from '../../App';

const HomeScreen: React.FC = () => {
  const { isRunning, startTimer, stopTimer, elapsedTime, startTime } = useTimer();

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

  const handleStartButtonPress = () => {
    if (isRunning) {
      stopTimer();
    } else {
      startTimer();
    }
  };

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
        </View>

        <StartButton 
          glowIntensity={0.8}
          glowRadius={1.2}
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