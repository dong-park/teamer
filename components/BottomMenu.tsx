import React from 'react';
import { View, TouchableOpacity, Text } from 'react-native';

interface BottomMenuProps {
  activeIndex: number;
  onTabPress: (index: number) => void;
}

const BottomMenu: React.FC<BottomMenuProps> = ({ activeIndex, onTabPress }) => {
  const tabs = [
    { id: 0, icon: '📊', label: '집중 시간' },
    { id: 1, icon: '🏠', label: '홈' },
    { id: 2, icon: '👥', label: '그룹' },
  ];

  return (
    <View className="flex-row bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 py-2">
      {tabs.map((tab) => (
        <TouchableOpacity
          key={tab.id}
          className="flex-1 items-center py-2"
          onPress={() => onTabPress(tab.id)}
        >
          <Text 
            className={`text-2xl mb-1 ${
              activeIndex === tab.id 
                ? 'opacity-100' 
                : 'opacity-50'
            }`}
          >
            {tab.icon}
          </Text>
          <Text 
            className={`text-xs ${
              activeIndex === tab.id 
                ? 'text-blue-600 dark:text-blue-400 font-medium' 
                : 'text-gray-500 dark:text-gray-400'
            }`}
          >
            {tab.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

export default BottomMenu;