import React, { useEffect, useMemo, useCallback } from 'react';
import { Canvas, Circle, Group } from '@shopify/react-native-skia';
import { useSharedValue, withTiming, runOnJS } from 'react-native-reanimated';
import { ParticleSystem } from '../utils/particleSystem';
import { Particle, EffectPattern, Quality } from '../types';
import { detectDeviceCapability, getOptimalConfig, PerformanceMonitor } from '../utils/deviceDetection';

interface ParticleRendererProps {
  width: number;
  height: number;
  pattern: EffectPattern;
  intensity: number;
  isActive: boolean;
  quality: Quality;
  particleCount?: number;
  colors?: string[];
  onPerformanceChange?: (isGood: boolean) => void;
}

export const ParticleRenderer: React.FC<ParticleRendererProps> = ({
  width,
  height,
  pattern,
  intensity,
  isActive,
  quality,
  particleCount,
  onPerformanceChange,
}) => {
  // 성능 관련 상태
  const deviceCapability = useMemo(() => detectDeviceCapability(), []);
  const optimalConfig = useMemo(() => getOptimalConfig(deviceCapability), [deviceCapability]);
  const performanceMonitor = useMemo(() => new PerformanceMonitor(deviceCapability), [deviceCapability]);
  
  // 파티클 시스템 초기화
  const particleSystem = useMemo(() => {
    const count = particleCount || optimalConfig.particleCount;
    return new ParticleSystem(count, width, height, pattern);
  }, [width, height, pattern, particleCount, optimalConfig.particleCount]);

  // 애니메이션 값
  const animationProgress = useSharedValue(0);
  const lastFrameTime = useSharedValue(0);

  // 품질별 설정 계산
  const qualitySettings = useMemo(() => {
    const baseQuality = quality || optimalConfig.quality;
    
    switch (baseQuality) {
      case 'high':
        return {
          enableBlur: true,
          enableGlow: true,
          blurRadius: 3,
          glowIntensity: 1.0,
          updateInterval: 16, // 60fps
        };
      case 'medium':
        return {
          enableBlur: true,
          enableGlow: false,
          blurRadius: 2,
          glowIntensity: 0.7,
          updateInterval: 33, // 30fps
        };
      case 'low':
        return {
          enableBlur: false,
          enableGlow: false,
          blurRadius: 0,
          glowIntensity: 0.5,
          updateInterval: 66, // 15fps
        };
      default:
        return {
          enableBlur: false,
          enableGlow: false,
          blurRadius: 1,
          glowIntensity: 0.7,
          updateInterval: 33,
        };
    }
  }, [quality, optimalConfig.quality]);

  // 파티클 상태 업데이트
  const updateParticles = useCallback((currentTime: number) => {
    const deltaTime = lastFrameTime.value === 0 ? 16 : currentTime - lastFrameTime.value;
    lastFrameTime.value = currentTime;

    // 성능 측정
    const isPerformanceGood = performanceMonitor.measureFrame();
    
    if (!isPerformanceGood && onPerformanceChange) {
      runOnJS(onPerformanceChange)(false);
    }

    // 파티클 시스템 업데이트
    particleSystem.update(deltaTime, intensity);
    
    // 다음 프레임 스케줄링
    if (isActive) {
      setTimeout(() => {
        requestAnimationFrame(updateParticles);
      }, qualitySettings.updateInterval);
    }
  }, [lastFrameTime, performanceMonitor, onPerformanceChange, particleSystem, intensity, isActive, qualitySettings.updateInterval]);

  // 파티클 시스템 생명주기 관리
  useEffect(() => {
    if (isActive) {
      particleSystem.start();
      performanceMonitor.startMonitoring();
      animationProgress.value = withTiming(1, { duration: 500 });
      requestAnimationFrame(updateParticles);
    } else {
      particleSystem.stop();
      performanceMonitor.stopMonitoring();
      animationProgress.value = withTiming(0, { duration: 300 });
    }

    return () => {
      particleSystem.dispose();
      performanceMonitor.stopMonitoring();
    };
  }, [isActive, animationProgress, particleSystem, performanceMonitor, updateParticles]);

  // 패턴 변경 시 파티클 시스템 업데이트
  useEffect(() => {
    particleSystem.setPattern(pattern);
  }, [pattern, particleSystem]);

  // 파티클 렌더링 컴포넌트
  const renderParticle = (particle: Particle, index: number) => {
    const alpha = particle.opacity * animationProgress.value * intensity;
    
    return (
      <Circle
        key={`particle-${particle.id}-${index}`}
        cx={particle.x}
        cy={particle.y}
        r={particle.radius}
        color={particle.color}
        opacity={alpha}
      />
    );
  };

  // 글로우 효과 렌더링 (고품질 모드에서만)
  const renderGlowEffect = () => {
    if (!qualitySettings.enableGlow) return null;

    const particles = particleSystem.getParticles();
    
    return particles.map((particle, index) => {
      if (index % 3 !== 0) return null; // 성능 최적화: 1/3만 글로우 적용

      const glowAlpha = particle.opacity * 0.3 * qualitySettings.glowIntensity;

      return (
        <Circle
          key={`glow-${particle.id}-${index}`}
          cx={particle.x}
          cy={particle.y}
          r={particle.radius * 3}
          color={particle.color}
          opacity={glowAlpha}
        />
      );
    });
  };

  const particles = particleSystem.getParticles();

  const canvasStyle = { width, height, position: 'absolute' as const };

  return (
    <Canvas style={canvasStyle}>
      <Group>
        {/* 글로우 레이어 (배경) */}
        {renderGlowEffect()}
        
        {/* 메인 파티클 레이어 */}
        {particles.map(renderParticle)}
      </Group>
    </Canvas>
  );
};