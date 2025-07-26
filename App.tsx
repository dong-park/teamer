/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, { useEffect } from 'react';
import { StyleSheet, useColorScheme as useRNColorScheme, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native';
import { useColorScheme } from 'nativewind';
import './global.css';
import StartButton from './components/StartButton';




function App() {
  // 시스템 다크모드 상태를 가져옵니다
  const systemIsDarkMode = useRNColorScheme() === 'dark';
  const { setColorScheme } = useColorScheme();

  // 시스템 다크모드 상태가 변경될 때 NativeWind에 알림
  useEffect(() => {
    setColorScheme(systemIsDarkMode ? 'dark' : 'light');
  }, [systemIsDarkMode, setColorScheme]);

  // 다크모드에 따라 배경색을 다르게 적용합니다
  const backgroundColor = systemIsDarkMode ? '#1a202c' : '#fff';

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>




        <StartButton 
          glowIntensity={0.8}
          glowRadius={1.2}
          onPress={() => console.log('Start button pressed!')}
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


});

export default App;
