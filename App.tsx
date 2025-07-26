/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, useColorScheme as useRNColorScheme, View, Dimensions, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native';
import { useColorScheme } from 'nativewind';
import './global.css';
import FocusTimeScreen from './components/screens/FocusTimeScreen';
import HomeScreen from './components/screens/HomeScreen';
import GroupTrackerScreen from './components/screens/GroupTrackerScreen';
import BottomMenu from './components/BottomMenu';
import { TimerContext, useTimerLogic, TimerContextType } from './hooks/useTimer';

// Re-export useTimer for backward compatibility
export { useTimer } from './hooks/useTimer';
function App() {
  // 시스템 다크모드 상태를 가져옵니다
  const systemIsDarkMode = useRNColorScheme() === 'dark';
  const { setColorScheme } = useColorScheme();
  
  // 화면 상태 관리
  const scrollViewRef = useRef<ScrollView>(null);
  const [currentPage, setCurrentPage] = useState(1); // 홈 화면을 기본으로
  const screenWidth = Dimensions.get('window').width;

  // 타이머 로직 사용
  const timerLogic = useTimerLogic();



  // 시스템 다크모드 상태가 변경될 때 NativeWind에 알림
  useEffect(() => {
    setColorScheme(systemIsDarkMode ? 'dark' : 'light');
  }, [systemIsDarkMode, setColorScheme]);

  // 다크모드에 따라 배경색을 다르게 적용합니다
  const backgroundColor = systemIsDarkMode ? '#1a202c' : '#fff';

  // 탭 선택 핸들러
  const handleTabPress = (index: number) => {
    setCurrentPage(index);
    scrollViewRef.current?.scrollTo({
      x: index * screenWidth,
      animated: true,
    });
  };

  // 스크롤 핸들러
  const handleScroll = (event: any) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const pageIndex = Math.round(offsetX / screenWidth);
    setCurrentPage(pageIndex);
  };

  // Timer context value
  const timerContextValue: TimerContextType = timerLogic;

  return (
    <TimerContext.Provider value={timerContextValue}>
      <SafeAreaView style={[styles.container, { backgroundColor }]}>
        <View style={styles.container}>
          <ScrollView
          ref={scrollViewRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={handleScroll}
          contentOffset={{ x: screenWidth, y: 0 }} // 홈 화면을 기본으로
          style={styles.scrollView}
        >
          <View style={[styles.page, { width: screenWidth, backgroundColor }]}>
            <FocusTimeScreen />
          </View>
          <View style={[styles.page, { width: screenWidth, backgroundColor }]}>
            <HomeScreen />
          </View>
          <View style={[styles.page, { width: screenWidth, backgroundColor }]}>
            <GroupTrackerScreen />
          </View>
        </ScrollView>
        
        <BottomMenu 
          activeIndex={currentPage} 
          onTabPress={handleTabPress} 
        />
      </View>
    </SafeAreaView>
    </TimerContext.Provider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  page: {
    flex: 1,
  },
});

export default App;
