import { useState, useRef, useEffect, createContext, useContext } from 'react';

// Timer Context Types
export interface TimerContextType {
  isRunning: boolean;
  startTime: Date | null;
  elapsedTime: number;
  targetTime: number; // 목표 시간 (밀리초)
  achievementRate: number; // 달성률 (0.0 ~ 1.0)
  startTimer: () => void;
  stopTimer: () => void;
  resetTimer: () => void;
  setTargetTime: (time: number) => void;
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
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  
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

  // 타이머 실행 useEffect
  useEffect(() => {
    if (isRunning && startTime) {
      intervalRef.current = setInterval(() => {
        const now = new Date();
        const elapsed = now.getTime() - startTime.getTime();
        setElapsedTime(elapsed);
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
  }, [isRunning, startTime]);

  return {
    isRunning,
    startTime,
    elapsedTime,
    targetTime,
    achievementRate,
    startTimer,
    stopTimer,
    resetTimer,
    setTargetTime,
  };
};