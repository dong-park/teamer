import React from 'react';
import { View, Text } from 'react-native';

const GroupTrackerScreen: React.FC = () => {
  return (
    <View className="flex-1 justify-center items-center px-4">
      <View className="bg-gray-100 dark:bg-gray-800 rounded-xl p-6 w-full max-w-sm">
        <Text className="text-2xl font-bold text-gray-800 dark:text-white text-center mb-4">
          그룹 트래커
        </Text>
        <View className="items-center">
          <Text className="text-6xl mb-4">👥</Text>
          <Text className="text-gray-600 dark:text-gray-400 text-center">
            커뮤니티 기능이 곧 추가될 예정입니다
          </Text>
        </View>
      </View>
    </View>
  );
};

export default GroupTrackerScreen;