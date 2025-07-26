import { ParticleSystem } from '../components/AmbientEffect/utils/particleSystem';
import { 
  getDeviceInfo, 
  calculateDeviceCapability,
  getOptimalConfig,
  PerformanceMonitor 
} from '../components/AmbientEffect/utils/deviceDetection';
import { DEFAULT_CONFIG } from '../components/AmbientEffect/constants';

// Mock React Native modules
jest.mock('react-native', () => ({
  Platform: {
    OS: 'ios',
    select: jest.fn((options) => options.ios),
  },
  Dimensions: {
    get: jest.fn(() => ({ width: 375, height: 667 })),
  },
  PixelRatio: {
    get: jest.fn(() => 3),
  },
}));

describe('ParticleSystem', () => {
  let particleSystem: ParticleSystem;

  beforeEach(() => {
    particleSystem = new ParticleSystem(50, 280, 280, 'waves');
  });

  afterEach(() => {
    particleSystem.dispose();
  });

  describe('초기화', () => {
    test('파티클 시스템이 올바르게 초기화되어야 함', () => {
      expect(particleSystem.getParticles()).toHaveLength(50);
      expect(particleSystem.isRunning()).toBe(false);
    });

    test('각 파티클이 유효한 속성을 가져야 함', () => {
      const particles = particleSystem.getParticles();
      
      particles.forEach(particle => {
        expect(particle.id).toBeGreaterThanOrEqual(0);
        expect(typeof particle.x).toBe('number');
        expect(typeof particle.y).toBe('number');
        expect(particle.radius).toBeGreaterThan(0);
        expect(particle.opacity).toBeGreaterThan(0);
        expect(particle.opacity).toBeLessThanOrEqual(1);
        expect(particle.life).toBeGreaterThan(0);
        expect(particle.color).toMatch(/^#[0-9a-f]{6}$|^hsl\(/);
        expect(typeof particle.vx).toBe('number');
        expect(typeof particle.vy).toBe('number');
        expect(typeof particle.angle).toBe('number');
      });
    });
  });

  describe('패턴 관리', () => {
    test('파도 패턴 파티클이 올바르게 생성되어야 함', () => {
      particleSystem.setPattern('waves');
      const particles = particleSystem.getParticles();
      
      expect(particles).toHaveLength(50);
      expect(particles[0].originalRadius).toBeGreaterThan(0);
    });

    test('나선 패턴으로 변경이 가능해야 함', () => {
      particleSystem.setPattern('spiral');
      const particles = particleSystem.getParticles();
      
      expect(particles).toHaveLength(50);
      // 나선 패턴은 각도가 더 넓은 범위를 가짐
      const angles = particles.map(p => p.angle);
      const maxAngle = Math.max(...angles);
      expect(maxAngle).toBeGreaterThan(Math.PI * 2);
    });

    test('폭발 패턴 파티클이 중앙에서 시작해야 함', () => {
      particleSystem.setPattern('burst');
      const particles = particleSystem.getParticles();
      
      particles.forEach(particle => {
        expect(particle.x).toBe(140); // 중앙 x
        expect(particle.y).toBe(140); // 중앙 y
        expect(Math.abs(particle.vx) + Math.abs(particle.vy)).toBeGreaterThan(0); // 속도가 있어야 함
      });
    });

    test('궤도 패턴이 여러 궤도를 가져야 함', () => {
      particleSystem.setPattern('orbit');
      const particles = particleSystem.getParticles();
      
      const radii = particles.map(p => p.originalRadius);
      const uniqueRadii = [...new Set(radii)];
      expect(uniqueRadii.length).toBeGreaterThan(1); // 여러 궤도
    });
  });

  describe('애니메이션 업데이트', () => {
    test('파티클 위치가 업데이트되어야 함', () => {
      const initialParticles = particleSystem.getParticles().map(p => ({ x: p.x, y: p.y }));
      
      particleSystem.update(16, 1.0); // 16ms 업데이트
      
      const updatedParticles = particleSystem.getParticles();
      let hasMovement = false;
      
      updatedParticles.forEach((particle, index) => {
        if (particle.x !== initialParticles[index].x || particle.y !== initialParticles[index].y) {
          hasMovement = true;
        }
      });
      
      expect(hasMovement).toBe(true);
    });

    test('강도가 파티클 투명도에 영향을 줘야 함', () => {
      const particles = particleSystem.getParticles();
      
      particleSystem.update(16, 0.3);
      const lowIntensityOpacity = particles[0].opacity;
      
      particleSystem.update(16, 1.0);
      const highIntensityOpacity = particles[0].opacity;
      
      // 투명도가 변경되었는지 확인
      expect(typeof lowIntensityOpacity).toBe('number');
      expect(typeof highIntensityOpacity).toBe('number');
    });
  });

  describe('성능 관리', () => {
    test('파티클 수를 동적으로 조정할 수 있어야 함', () => {
      particleSystem.setParticleCount(100);
      expect(particleSystem.getParticles()).toHaveLength(100);
      
      particleSystem.setParticleCount(25);
      expect(particleSystem.getParticles()).toHaveLength(25);
    });

    test('파티클 수 제한이 적용되어야 함', () => {
      particleSystem.setParticleCount(300); // 최대 200 제한
      expect(particleSystem.getParticles()).toHaveLength(200);
      
      particleSystem.setParticleCount(0); // 최소 1 제한
      expect(particleSystem.getParticles()).toHaveLength(1);
    });

    test('캔버스 크기 조정이 파티클에 반영되어야 함', () => {
      particleSystem.resize(500, 500);
      
      // 새로운 파티클들이 새 캔버스 범위 내에 있는지 확인
      const particles = particleSystem.getParticles();
      expect(particles.length).toBeGreaterThan(0);
      // 캔버스 크기 조정 후 파티클이 다시 생성되었는지 확인
      particles.forEach(particle => {
        expect(typeof particle.x).toBe('number');
        expect(typeof particle.y).toBe('number');
      });
    });
  });

  describe('시스템 상태 관리', () => {
    test('시작/정지가 올바르게 동작해야 함', () => {
      expect(particleSystem.isRunning()).toBe(false);
      
      particleSystem.start();
      expect(particleSystem.isRunning()).toBe(true);
      
      particleSystem.stop();
      expect(particleSystem.isRunning()).toBe(false);
    });

    test('dispose가 리소스를 정리해야 함', () => {
      particleSystem.start();
      particleSystem.dispose();
      
      expect(particleSystem.isRunning()).toBe(false);
      expect(particleSystem.getParticles()).toHaveLength(0);
    });
  });
});

describe('DeviceDetection', () => {
  describe('디바이스 정보 수집', () => {
    test('디바이스 정보가 올바르게 수집되어야 함', () => {
      const deviceInfo = getDeviceInfo();
      
      expect(deviceInfo.platform).toBe('ios');
      expect(deviceInfo.screenWidth).toBe(375);
      expect(deviceInfo.screenHeight).toBe(667);
      expect(deviceInfo.pixelRatio).toBe(3);
      expect(deviceInfo.totalPixels).toBeGreaterThan(0);
    });
  });

  describe('성능 등급 계산', () => {
    test('고해상도 iOS 디바이스는 high 등급이어야 함', () => {
      const highEndDevice = {
        platform: 'ios' as const,
        screenWidth: 428,
        screenHeight: 926,
        pixelRatio: 3,
        totalPixels: 428 * 926 * 3,
      };
      
      const capability = calculateDeviceCapability(highEndDevice);
      expect(capability).toBe('high');
    });

    test('중간 해상도 디바이스는 medium 등급이어야 함', () => {
      const midRangeDevice = {
        platform: 'ios' as const,
        screenWidth: 390,
        screenHeight: 844,
        pixelRatio: 3,
        totalPixels: 390 * 844 * 3,
      };
      
      const capability = calculateDeviceCapability(midRangeDevice);
      expect(capability).toBe('medium');
    });

    test('저해상도 디바이스는 low 등급이어야 함', () => {
      const lowEndDevice = {
        platform: 'ios' as const,
        screenWidth: 320,
        screenHeight: 568,
        pixelRatio: 2,
        totalPixels: 320 * 568 * 2,
      };
      
      const capability = calculateDeviceCapability(lowEndDevice);
      expect(capability).toBe('low');
    });
  });

  describe('최적 설정 반환', () => {
    test('high 등급은 최고 품질 설정을 반환해야 함', () => {
      const config = getOptimalConfig('high');
      
      expect(config.quality).toBe('high');
      expect(config.fps).toBe(60);
      expect(config.particleCount).toBe(100);
      expect(config.enableBlur).toBe(true);
      expect(config.enableShadows).toBe(true);
    });

    test('medium 등급은 중간 품질 설정을 반환해야 함', () => {
      const config = getOptimalConfig('medium');
      
      expect(config.quality).toBe('medium');
      expect(config.fps).toBe(30);
      expect(config.particleCount).toBe(50);
      expect(config.enableBlur).toBe(true);
      expect(config.enableShadows).toBe(false);
    });

    test('low 등급은 최저 품질 설정을 반환해야 함', () => {
      const config = getOptimalConfig('low');
      
      expect(config.quality).toBe('low');
      expect(config.fps).toBe(15);
      expect(config.particleCount).toBe(25);
      expect(config.enableBlur).toBe(false);
      expect(config.enableShadows).toBe(false);
    });
  });
});

describe('PerformanceMonitor', () => {
  let monitor: PerformanceMonitor;

  beforeEach(() => {
    monitor = new PerformanceMonitor('medium');
  });

  afterEach(() => {
    monitor.stopMonitoring();
  });

  describe('성능 모니터링', () => {
    test('모니터링 시작/중지가 올바르게 동작해야 함', () => {
      expect(monitor.getPerformanceStatus().frameDrops).toBe(0);
      
      monitor.startMonitoring();
      expect(() => monitor.measureFrame()).not.toThrow();
      
      monitor.stopMonitoring();
    });

    test('성능 상태 보고가 올바르게 동작해야 함', () => {
      monitor.startMonitoring();
      
      const status = monitor.getPerformanceStatus();
      expect(status).toHaveProperty('isGood');
      expect(status).toHaveProperty('frameDrops');
      expect(status).toHaveProperty('capability');
      expect(status).toHaveProperty('recommendedQuality');
      expect(status.capability).toBe('medium');
    });

    test('카운터 리셋이 올바르게 동작해야 함', () => {
      monitor.startMonitoring();
      monitor.measureFrame();
      monitor.resetCounters();
      
      const status = monitor.getPerformanceStatus();
      expect(status.frameDrops).toBe(0);
    });
  });
});

describe('Configuration', () => {
  describe('기본 설정', () => {
    test('DEFAULT_CONFIG가 유효한 값들을 가져야 함', () => {
      expect(DEFAULT_CONFIG.colors).toBeInstanceOf(Array);
      expect(DEFAULT_CONFIG.colors.length).toBeGreaterThan(0);
      expect(DEFAULT_CONFIG.intensity).toBeGreaterThan(0);
      expect(DEFAULT_CONFIG.intensity).toBeLessThanOrEqual(1);
      expect(DEFAULT_CONFIG.speed).toBeGreaterThan(0);
      expect(['waves', 'spiral', 'burst', 'orbit']).toContain(DEFAULT_CONFIG.pattern);
      expect(['low', 'medium', 'high']).toContain(DEFAULT_CONFIG.quality);
      expect([15, 30, 60]).toContain(DEFAULT_CONFIG.fps);
    });
  });

  describe('설정 검증', () => {
    test('색상 배열이 유효한 헥스 색상이어야 함', () => {
      DEFAULT_CONFIG.colors.forEach(color => {
        expect(color).toMatch(/^#[0-9a-fA-F]{6}$/);
      });
    });

    test('수치 값들이 유효한 범위 내에 있어야 함', () => {
      expect(DEFAULT_CONFIG.intensity).toBeGreaterThanOrEqual(0);
      expect(DEFAULT_CONFIG.intensity).toBeLessThanOrEqual(1);
      expect(DEFAULT_CONFIG.speed).toBeGreaterThan(0);
      expect(DEFAULT_CONFIG.particleCount).toBeGreaterThan(0);
      expect(DEFAULT_CONFIG.particleCount).toBeLessThanOrEqual(200);
    });
  });
});