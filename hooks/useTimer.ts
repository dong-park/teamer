import { useState, useRef, useEffect, createContext, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Timer Context Types
export interface TimerContextType {
  isRunning: boolean;
  startTime: Date | null;
  elapsedTime: number;
  targetTime: number; // 목표 시간 (밀리초)
  achievementRate: number; // 달성률 (0.0 ~ 1.0)
  completedTasksCount: number; // 완료된 할일 개수
  startTimer: () => void;
  stopTimer: () => void;
  resetTimer: () => void;
  setTargetTime: (time: number) => void;
  incrementCompletedTasks: () => void;
  resetCompletedTasks: () => void;
}

// Timer Context
export const TimerContext = createContext<TimerContextType | undefined>(undefined);

// Timer Hook
export const useTimer = () => {
  const context = useContext(TimerContext);
  if (!context) {
    throw new Error('useTimer must be used within a TimerProvider');
  }
  return context;
};

// Timer Hook Logic (App 컴포넌트에서 사용할 로직)
export const useTimerLogic = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [targetTime, setTargetTime] = useState(25 * 60 * 1000); // 기본 25분 (포모도로)
  const [completedTasksCount, setCompletedTasksCount] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // AsyncStorage key
  const COMPLETED_TASKS_KEY = 'completed_tasks_count';
  
  // 달성률 계산 (0.0 ~ 1.0)
  const achievementRate = targetTime > 0 ? Math.min(elapsedTime / targetTime, 1.0) : 0;

  // 타이머 함수들
  const startTimer = () => {
    const now = new Date();
    setStartTime(now);
    setIsRunning(true);
    setElapsedTime(0);
  };

  const stopTimer = () => {
    setIsRunning(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const resetTimer = () => {
    setIsRunning(false);
    setStartTime(null);
    setElapsedTime(0);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  // AsyncStorage에서 성공 카운트 로드
  const loadCompletedTasksCount = async () => {
    try {
      const storedCount = await AsyncStorage.getItem(COMPLETED_TASKS_KEY);
      if (storedCount !== null) {
        setCompletedTasksCount(parseInt(storedCount, 10));
      }
    } catch (error) {
      console.error('성공 카운트 로드 실패:', error);
    }
  };

  // AsyncStorage에 성공 카운트 저장
  const saveCompletedTasksCount = async (count: number) => {
    try {
      await AsyncStorage.setItem(COMPLETED_TASKS_KEY, count.toString());
    } catch (error) {
      console.error('성공 카운트 저장 실패:', error);
    }
  };

  // 완료된 할일 개수 증가
  const incrementCompletedTasks = async () => {
    const newCount = completedTasksCount + 1;
    setCompletedTasksCount(newCount);
    await saveCompletedTasksCount(newCount);
  };

  // 완료된 할일 개수 초기화
  const resetCompletedTasks = async () => {
    setCompletedTasksCount(0);
    await saveCompletedTasksCount(0);
  };

  // 타이머 실행 useEffect
  useEffect(() => {
    if (isRunning && startTime) {
      intervalRef.current = setInterval(() => {
        const now = new Date();
        const elapsed = now.getTime() - startTime.getTime();
        
        // 목표 시간에 도달했는지 확인
        if (elapsed >= targetTime) {
          // 할일 완료 카운트 증가 (비동기로 저장)
          incrementCompletedTasks();
          
          // 타이머를 0으로 리셋하고 새로 시작 (휴식시간으로 전환)
          const newStartTime = new Date();
          setStartTime(newStartTime);
          setElapsedTime(0);
        } else {
          setElapsedTime(elapsed);
        }
      }, 100); // 100ms마다 업데이트 (부드러운 표시)
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, startTime, targetTime, completedTasksCount]);

  // 앱 시작 시 저장된 성공 카운트 로드
  useEffect(() => {
    loadCompletedTasksCount();
  }, []);

  return {
    isRunning,
    startTime,
    elapsedTime,
    targetTime,
    achievementRate,
    completedTasksCount,
    startTimer,
    stopTimer,
    resetTimer,
    setTargetTime,
    incrementCompletedTasks,
    resetCompletedTasks,
  };
};