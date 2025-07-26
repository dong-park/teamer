import React from 'react';
import { View, ScrollView } from 'react-native';
import StartButton from '../StartButton';

const HomeScreen: React.FC = () => {
  return (
    <View className="flex-1">
      <ScrollView 
        contentContainerStyle={{ 
          flexGrow: 1, 
          justifyContent: 'center', 
          alignItems: 'center',
          paddingVertical: 20 
        }}
      >
        <StartButton 
          glowIntensity={0.8}
          glowRadius={1.2}
          onPress={() => console.log('Start button pressed!')}
        />
      </ScrollView>
    </View>
  );
};

export default HomeScreen;