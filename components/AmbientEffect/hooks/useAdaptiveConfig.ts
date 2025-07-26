import { useState, useEffect, useCallback, useMemo } from 'react';
import { AmbientEffectConfig, DeviceCapability, Quality, FPS } from '../types';
import { detectDeviceCapability, getOptimalConfig, PerformanceMonitor } from '../utils/deviceDetection';
import { DEFAULT_CONFIG } from '../constants';

interface AdaptiveConfigOptions {
  initialConfig?: Partial<AmbientEffectConfig>;
  enableAutoAdaptation?: boolean;
  performanceThreshold?: number;
  adaptationDelay?: number;
}

interface AdaptiveConfigReturn {
  config: AmbientEffectConfig;
  deviceCapability: DeviceCapability;
  isAdapting: boolean;
  performanceStatus: {
    isGood: boolean;
    frameDrops: number;
    recommendedQuality: string;
  };
  forceQuality: (quality: Quality) => void;
  resetToOptimal: () => void;
  updateConfig: (updates: Partial<AmbientEffectConfig>) => void;
}

/**
 * 디바이스 성능에 따라 자동으로 설정을 조정하는 훅
 */
export const useAdaptiveConfig = (
  options: AdaptiveConfigOptions = {}
): AdaptiveConfigReturn => {
  const {
    initialConfig = {},
    enableAutoAdaptation = true,
    adaptationDelay = 2000, // 2초 후 적응
  } = options;

  // 디바이스 성능 감지
  const deviceCapability = useMemo(() => detectDeviceCapability(), []);
  const optimalConfig = useMemo(() => getOptimalConfig(deviceCapability), [deviceCapability]);
  
  // 성능 모니터
  const performanceMonitor = useMemo(() => new PerformanceMonitor(deviceCapability), [deviceCapability]);

  // 상태 관리
  const [config, setConfig] = useState<AmbientEffectConfig>(() => ({
    ...DEFAULT_CONFIG,
    ...optimalConfig,
    ...initialConfig,
  }));

  const [isAdapting, setIsAdapting] = useState(false);
  const [performanceStatus, setPerformanceStatus] = useState({
    isGood: true,
    frameDrops: 0,
    recommendedQuality: deviceCapability,
  });

  const [adaptationTimer, setAdaptationTimer] = useState<NodeJS.Timeout | null>(null);
  const [lastAdaptation, setLastAdaptation] = useState<number>(0);

  /**
   * 성능 기반 설정 자동 조정
   */
  const adaptConfigToPerformance = useCallback((status: typeof performanceStatus) => {
    if (!enableAutoAdaptation) return;

    const now = Date.now();
    if (now - lastAdaptation < adaptationDelay) return;

    setIsAdapting(true);
    setLastAdaptation(now);

    // 성능이 좋지 않으면 품질을 낮춤
    if (!status.isGood) {
      setConfig(prevConfig => {
        const newQuality: Quality = 
          prevConfig.quality === 'high' ? 'medium' :
          prevConfig.quality === 'medium' ? 'low' : 'low';

        const newFps: FPS = 
          prevConfig.fps === 60 ? 30 :
          prevConfig.fps === 30 ? 15 : 15;

        const newParticleCount = Math.max(
          10, 
          Math.floor((prevConfig.particleCount || 50) * 0.7)
        );

        return {
          ...prevConfig,
          quality: newQuality,
          fps: newFps,
          particleCount: newParticleCount,
          intensity: Math.max(0.3, prevConfig.intensity * 0.8),
        };
      });
    }
    // 성능이 좋으면 점진적으로 품질을 높임
    else if (status.frameDrops === 0 && status.isGood) {
      setConfig(prevConfig => {
        const targetConfig = { ...optimalConfig, ...initialConfig };
        
        // 현재 설정이 최적 설정보다 낮으면 점진적으로 향상
        const newQuality: Quality = 
          prevConfig.quality === 'low' && targetConfig.quality !== 'low' ? 'medium' :
          prevConfig.quality === 'medium' && targetConfig.quality === 'high' ? 'high' :
          prevConfig.quality;

        const newFps: FPS = 
          prevConfig.fps === 15 && (targetConfig.fps || 30) >= 30 ? 30 :
          prevConfig.fps === 30 && (targetConfig.fps || 60) >= 60 ? 60 :
          prevConfig.fps;

        const maxParticles = targetConfig.particleCount || 50;
        const newParticleCount = Math.min(
          maxParticles,
          Math.floor((prevConfig.particleCount || 25) * 1.2)
        );

        return {
          ...prevConfig,
          quality: newQuality,
          fps: newFps,
          particleCount: newParticleCount,
          intensity: Math.min(1.0, prevConfig.intensity * 1.1),
        };
      });
    }

    // 적응 완료
    setTimeout(() => setIsAdapting(false), 500);
  }, [enableAutoAdaptation, optimalConfig, initialConfig, adaptationDelay, lastAdaptation]);

  /**
   * 성능 상태 업데이트
   */
  const updatePerformanceStatus = useCallback(() => {
    const status = performanceMonitor.getPerformanceStatus();
    setPerformanceStatus(status);

    // 성능 임계치를 넘어서면 자동 적응 시작
    if (!status.isGood && enableAutoAdaptation) {
      if (adaptationTimer) {
        clearTimeout(adaptationTimer);
      }

      const timer = setTimeout(() => {
        adaptConfigToPerformance(status);
      }, adaptationDelay);

      setAdaptationTimer(timer);
    }
  }, [performanceMonitor, enableAutoAdaptation, adaptConfigToPerformance, adaptationDelay, adaptationTimer]);

  /**
   * 품질 강제 설정
   */
  const forceQuality = useCallback((quality: Quality) => {
    const qualityConfig = getOptimalConfig(quality as DeviceCapability);
    
    setConfig(prevConfig => ({
      ...prevConfig,
      quality,
      fps: qualityConfig.fps,
      particleCount: qualityConfig.particleCount,
    }));

    // 자동 적응 일시 중지
    setLastAdaptation(Date.now() + adaptationDelay * 2);
  }, [adaptationDelay]);

  /**
   * 최적 설정으로 리셋
   */
  const resetToOptimal = useCallback(() => {
    setConfig({
      ...DEFAULT_CONFIG,
      ...optimalConfig,
      ...initialConfig,
    });
    setLastAdaptation(0);
    performanceMonitor.resetCounters();
  }, [optimalConfig, initialConfig, performanceMonitor]);

  /**
   * 설정 업데이트
   */
  const updateConfig = useCallback((updates: Partial<AmbientEffectConfig>) => {
    setConfig(prevConfig => ({
      ...prevConfig,
      ...updates,
    }));
  }, []);

  // 성능 모니터링 시작
  useEffect(() => {
    performanceMonitor.startMonitoring();
    
    // 정기적으로 성능 상태 체크
    const interval = setInterval(updatePerformanceStatus, 1000);

    return () => {
      performanceMonitor.stopMonitoring();
      clearInterval(interval);
      if (adaptationTimer) {
        clearTimeout(adaptationTimer);
      }
    };
  }, [updatePerformanceStatus, performanceMonitor, adaptationTimer]);

  return {
    config,
    deviceCapability,
    isAdapting,
    performanceStatus,
    forceQuality,
    resetToOptimal,
    updateConfig,
  };
};