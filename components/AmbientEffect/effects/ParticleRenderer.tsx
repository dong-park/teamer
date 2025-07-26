import React, { useEffect, useMemo, useCallback, useState } from 'react';
import { Canvas, Circle, Group } from '@shopify/react-native-skia';

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
  const [animationOpacity, setAnimationOpacity] = useState(0);
  // 성능 관련 상태
  const deviceCapability = useMemo(() => detectDeviceCapability(), []);
  const optimalConfig = useMemo(() => getOptimalConfig(deviceCapability), [deviceCapability]);
  const performanceMonitor = useMemo(() => new PerformanceMonitor(deviceCapability), [deviceCapability]);
  
  // 파티클 시스템 초기화
  const particleSystem = useMemo(() => {
    const count = particleCount || optimalConfig.particleCount;
    return new ParticleSystem(count, width, height, pattern);
  }, [width, height, pattern, particleCount, optimalConfig.particleCount]);



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

  // 현재 시간 추적을 위한 일반 변수
  let lastTime = 0;

  // 파티클 상태 업데이트
  const updateParticles = useCallback((currentTime: number) => {
    const deltaTime = lastTime === 0 ? 16 : currentTime - lastTime;
    lastTime = currentTime;

    // 성능 측정
    const isPerformanceGood = performanceMonitor.measureFrame();
    
    if (!isPerformanceGood && onPerformanceChange) {
      onPerformanceChange(false);
    }

    // 파티클 시스템 업데이트
    particleSystem.update(deltaTime, intensity);
    
    // 다음 프레임 스케줄링
    if (isActive) {
      setTimeout(() => {
        requestAnimationFrame(updateParticles);
      }, qualitySettings.updateInterval);
    }
  }, [performanceMonitor, onPerformanceChange, particleSystem, intensity, isActive, qualitySettings.updateInterval]);

  // 파티클 시스템 생명주기 관리
  useEffect(() => {
    if (isActive) {
      particleSystem.start();
      performanceMonitor.startMonitoring();
      requestAnimationFrame(updateParticles);
      
      // Fade in animation
      setTimeout(() => setAnimationOpacity(1), 100);
    } else {
      particleSystem.stop();
      performanceMonitor.stopMonitoring();
      
      // Fade out animation
      setAnimationOpacity(0);
    }

    return () => {
      particleSystem.dispose();
      performanceMonitor.stopMonitoring();
    };
  }, [isActive, particleSystem, performanceMonitor, updateParticles]);

  // 패턴 변경 시 파티클 시스템 업데이트
  useEffect(() => {
    particleSystem.setPattern(pattern);
  }, [pattern, particleSystem]);

  // 파티클 렌더링 컴포넌트
  const renderParticle = (particle: Particle, index: number) => {
    const alpha = particle.opacity * intensity * animationOpacity;
    
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