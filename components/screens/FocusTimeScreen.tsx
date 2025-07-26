import React from 'react';
import { View, Text, useColorScheme } from 'react-native';

const FocusTimeScreen: React.FC = () => {
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <View className="flex-1 justify-center items-center px-4">
      <View className="bg-gray-100 dark:bg-gray-800 rounded-xl p-6 w-full max-w-sm">
        <Text className="text-2xl font-bold text-gray-800 dark:text-white text-center mb-4">
          오늘의 집중 시간
        </Text>
        <View className="items-center">
          <Text className="text-4xl font-bold text-blue-600 dark:text-blue-400 mb-2">
            0시간 0분
          </Text>
          <Text className="text-gray-600 dark:text-gray-400 text-center">
            아직 집중 시간이 없습니다
          </Text>
        </View>
      </View>
    </View>
  );
};

export default FocusTimeScreen;