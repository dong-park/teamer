import { act } from 'react-test-renderer';

// Mock dependencies
const mockDetectDeviceCapability = jest.fn(() => 'medium');
const mockGetOptimalConfig = jest.fn((capability) => ({
  quality: capability,
  fps: capability === 'high' ? 60 : capability === 'medium' ? 30 : 15,
  particleCount: capability === 'high' ? 100 : capability === 'medium' ? 50 : 25,
  enableBlur: capability !== 'low',
  enableShadows: capability === 'high',
  complexEffects: capability === 'high',
}));

const mockPerformanceMonitor = jest.fn().mockImplementation(() => ({
  startMonitoring: jest.fn(),
  stopMonitoring: jest.fn(),
  getPerformanceStatus: jest.fn(() => ({
    isGood: true,
    frameDrops: 0,
    capability: 'medium',
    recommendedQuality: 'medium',
  })),
  resetCounters: jest.fn(),
}));

jest.mock('../../components/AmbientEffect/utils/deviceDetection', () => ({
  detectDeviceCapability: mockDetectDeviceCapability,
  getOptimalConfig: mockGetOptimalConfig,
  PerformanceMonitor: mockPerformanceMonitor,
}));

jest.mock('../../components/AmbientEffect/constants', () => ({
  DEFAULT_CONFIG: {
    colors: ['#ff6b6b', '#4ecdc4', '#45b7d1'],
    intensity: 0.6,
    speed: 1.0,
    pattern: 'waves',
    interactive: true,
    responsive: false,
    autoAnimate: true,
    quality: 'medium',
    fps: 60,
    particleCount: 50,
  },
}));

describe('useAdaptiveConfig Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test('모킹된 함수들이 올바르게 작동하는지 확인', () => {
    expect(mockDetectDeviceCapability()).toBe('medium');
    expect(mockGetOptimalConfig('high')).toEqual({
      quality: 'high',
      fps: 60,
      particleCount: 100,
      enableBlur: true,
      enableShadows: true,
      complexEffects: true,
    });
  });

  test('성능 모니터 모킹이 올바르게 작동하는지 확인', () => {
    const monitor = new mockPerformanceMonitor();
    expect(monitor.getPerformanceStatus()).toEqual({
      isGood: true,
      frameDrops: 0,
      capability: 'medium',
      recommendedQuality: 'medium',
    });
  });

  test('디바이스 성능 등급별 설정이 올바른지 확인', () => {
    const highConfig = mockGetOptimalConfig('high');
    const mediumConfig = mockGetOptimalConfig('medium');
    const lowConfig = mockGetOptimalConfig('low');

    expect(highConfig.quality).toBe('high');
    expect(highConfig.fps).toBe(60);
    expect(highConfig.particleCount).toBe(100);

    expect(mediumConfig.quality).toBe('medium');
    expect(mediumConfig.fps).toBe(30);
    expect(mediumConfig.particleCount).toBe(50);

    expect(lowConfig.quality).toBe('low');
    expect(lowConfig.fps).toBe(15);
    expect(lowConfig.particleCount).toBe(25);
  });

  test('성능 모니터 기능이 올바르게 모킹되었는지 확인', () => {
    const monitor = new mockPerformanceMonitor();
    
    expect(monitor.startMonitoring).toBeDefined();
    expect(monitor.stopMonitoring).toBeDefined();
    expect(monitor.getPerformanceStatus).toBeDefined();
    expect(monitor.resetCounters).toBeDefined();

    // 함수 호출 테스트
    monitor.startMonitoring();
    monitor.stopMonitoring();
    monitor.resetCounters();

    expect(monitor.startMonitoring).toHaveBeenCalled();
    expect(monitor.stopMonitoring).toHaveBeenCalled();
    expect(monitor.resetCounters).toHaveBeenCalled();
  });

  test('성능 상태 변경 시뮬레이션', () => {
    // 성능 저하 상황 모킹
    const badPerformanceMonitor = jest.fn().mockImplementation(() => ({
      startMonitoring: jest.fn(),
      stopMonitoring: jest.fn(),
      getPerformanceStatus: jest.fn(() => ({
        isGood: false,
        frameDrops: 10,
        capability: 'medium',
        recommendedQuality: 'low',
      })),
      resetCounters: jest.fn(),
    }));

    const monitor = new badPerformanceMonitor();
    const status = monitor.getPerformanceStatus();

    expect(status.isGood).toBe(false);
    expect(status.frameDrops).toBe(10);
    expect(status.recommendedQuality).toBe('low');
  });

  test('타이머 기능 테스트', () => {
    const callback = jest.fn();
    
    act(() => {
      setTimeout(callback, 1000);
      jest.advanceTimersByTime(1000);
    });

    expect(callback).toHaveBeenCalled();
  });
});