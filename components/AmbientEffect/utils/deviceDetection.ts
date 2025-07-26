import { Platform, Dimensions } from 'react-native';
import { DeviceCapability } from '../types';

/**
 * 디바이스 성능을 감지하여 적절한 설정을 반환하는 유틸리티
 */

interface DeviceInfo {
  platform: string;
  screenWidth: number;
  screenHeight: number;
  pixelRatio: number;
  totalPixels: number;
}

interface PerformanceMetrics {
  frameDropThreshold: number;
  memoryUsageThreshold: number;
  renderingComplexity: number;
}

/**
 * 디바이스 하드웨어 정보 수집
 */
export const getDeviceInfo = (): DeviceInfo => {
  const { width, height } = Dimensions.get('window');
  const pixelRatio = Platform.select({
    ios: Math.min(3, Math.round(require('react-native').PixelRatio.get())),
    android: Math.min(3, Math.round(require('react-native').PixelRatio.get())),
    default: 2,
  });

  return {
    platform: Platform.OS,
    screenWidth: width,
    screenHeight: height,
    pixelRatio,
    totalPixels: width * height * pixelRatio,
  };
};

/**
 * 디바이스 성능 등급 계산
 */
export const calculateDeviceCapability = (deviceInfo: DeviceInfo): DeviceCapability => {
  const { platform, totalPixels, pixelRatio } = deviceInfo;
  
  // iOS 디바이스 성능 분류
  if (platform === 'ios') {
    // iPhone 14 Pro 이상급 (ProMotion, A16 Bionic+)
    if (totalPixels > 1100000 && pixelRatio >= 3) {
      return 'high';
    }
    // iPhone 12/13 급 (A14/A15 Bionic)
    if (totalPixels > 750000 && pixelRatio >= 2) {
      return 'medium';
    }
    // iPhone SE, 구형 모델
    return 'low';
  }
  
  // Android 디바이스 성능 분류
  if (platform === 'android') {
    // 플래그십 급 (고해상도 + 고픽셀비율)
    if (totalPixels > 2500000 && pixelRatio >= 2.5) {
      return 'high';
    }
    // 미드레인지 급
    if (totalPixels > 1500000 && pixelRatio >= 2) {
      return 'medium';
    }
    // 보급형
    return 'low';
  }
  
  // 기타 플랫폼 (기본값)
  return 'medium';
};

/**
 * 성능 등급별 메트릭스 반환
 */
export const getPerformanceMetrics = (capability: DeviceCapability): PerformanceMetrics => {
  switch (capability) {
    case 'high':
      return {
        frameDropThreshold: 2, // 2프레임 드롭까지 허용
        memoryUsageThreshold: 150, // MB
        renderingComplexity: 1.0, // 최대 복잡도
      };
    case 'medium':
      return {
        frameDropThreshold: 5, // 5프레임 드롭까지 허용
        memoryUsageThreshold: 100, // MB
        renderingComplexity: 0.7, // 중간 복잡도
      };
    case 'low':
      return {
        frameDropThreshold: 10, // 10프레임 드롭까지 허용
        memoryUsageThreshold: 50, // MB
        renderingComplexity: 0.4, // 낮은 복잡도
      };
  }
};

/**
 * 실시간 성능 모니터링 클래스
 */
export class PerformanceMonitor {
  private frameDropCount = 0;
  private lastFrameTime = 0;
  private isMonitoring = false;
  private capability: DeviceCapability;
  private metrics: PerformanceMetrics;
  
  constructor(capability: DeviceCapability) {
    this.capability = capability;
    this.metrics = getPerformanceMetrics(capability);
  }
  
  /**
   * 성능 모니터링 시작
   */
  startMonitoring() {
    this.isMonitoring = true;
    this.lastFrameTime = performance.now();
    this.frameDropCount = 0;
  }
  
  /**
   * 성능 모니터링 중지
   */
  stopMonitoring() {
    this.isMonitoring = false;
  }
  
  /**
   * 프레임 측정 (60fps 기준)
   */
  measureFrame(): boolean {
    if (!this.isMonitoring) return true;
    
    const currentTime = performance.now();
    const frameDuration = currentTime - this.lastFrameTime;
    const expectedFrameDuration = 1000 / 60; // 16.67ms for 60fps
    
    if (frameDuration > expectedFrameDuration * 1.5) {
      this.frameDropCount++;
    }
    
    this.lastFrameTime = currentTime;
    
    // 임계치 초과 시 성능 저하 감지
    return this.frameDropCount <= this.metrics.frameDropThreshold;
  }
  
  /**
   * 현재 성능 상태 반환
   */
  getPerformanceStatus(): {
    isGood: boolean;
    frameDrops: number;
    capability: DeviceCapability;
    recommendedQuality: string;
  } {
    const isGood = this.frameDropCount <= this.metrics.frameDropThreshold;
    
    return {
      isGood,
      frameDrops: this.frameDropCount,
      capability: this.capability,
      recommendedQuality: isGood 
        ? this.capability 
        : this.capability === 'high' ? 'medium' : 'low'
    };
  }
  
  /**
   * 성능 카운터 리셋
   */
  resetCounters() {
    this.frameDropCount = 0;
    this.lastFrameTime = performance.now();
  }
}

/**
 * 글로벌 디바이스 성능 감지 함수
 */
export const detectDeviceCapability = (): DeviceCapability => {
  const deviceInfo = getDeviceInfo();
  return calculateDeviceCapability(deviceInfo);
};

/**
 * 성능 등급별 최적 설정 반환
 */
export const getOptimalConfig = (capability: DeviceCapability) => {
  switch (capability) {
    case 'high':
      return {
        quality: 'high' as const,
        fps: 60 as const,
        particleCount: 100,
        enableBlur: true,
        enableShadows: true,
        complexEffects: true,
      };
    case 'medium':
      return {
        quality: 'medium' as const,
        fps: 30 as const,
        particleCount: 50,
        enableBlur: true,
        enableShadows: false,
        complexEffects: false,
      };
    case 'low':
      return {
        quality: 'low' as const,
        fps: 15 as const,
        particleCount: 25,
        enableBlur: false,
        enableShadows: false,
        complexEffects: false,
      };
  }
};