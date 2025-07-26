import React from 'react';
import { View, TouchableOpacity, Text } from 'react-native';

interface BottomMenuProps {
  activeIndex: number;
  onTabPress: (index: number) => void;
}

const BottomMenu: React.FC<BottomMenuProps> = ({ activeIndex, onTabPress }) => {
  const tabs = [
    { id: 0, symbol: '◗', label: '시간' },
    { id: 1, symbol: '●', label: '홈' },
    { id: 2, symbol: '◯', label: '그룹' },
  ];

  return (
    <View className="flex-row bg-white/0 dark:bg-gray-900/0 py-6 px-8">
      {tabs.map((tab) => (
        <TouchableOpacity
          key={tab.id}
          className="flex-1 items-center"
          onPress={() => onTabPress(tab.id)}
          activeOpacity={0.7}
        >
          <Text 
            className={`text-2xl ${
              activeIndex === tab.id 
                ? 'text-gray-900 dark:text-white' 
                : 'text-gray-400 dark:text-gray-600'
            }`}
          >
            {tab.symbol}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

export default BottomMenu;