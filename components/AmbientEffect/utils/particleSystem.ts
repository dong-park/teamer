import { Particle, EffectPattern } from '../types';

/**
 * 파티클 시스템 관리 클래스
 */
export class ParticleSystem {
  private particles: Particle[] = [];
  private maxParticles: number;
  private canvasWidth: number;
  private canvasHeight: number;
  private pattern: EffectPattern;
  private isActive = false;
  private animationId?: number;

  constructor(
    maxParticles: number,
    canvasWidth: number,
    canvasHeight: number,
    pattern: EffectPattern = 'waves'
  ) {
    this.maxParticles = maxParticles;
    this.canvasWidth = canvasWidth;
    this.canvasHeight = canvasWidth;
    this.pattern = pattern;
    this.initializeParticles();
  }

  /**
   * 파티클 초기화
   */
  private initializeParticles(): void {
    this.particles = [];
    
    for (let i = 0; i < this.maxParticles; i++) {
      this.particles.push(this.createParticle(i));
    }
  }

  /**
   * 개별 파티클 생성
   */
  private createParticle(index: number): Particle {
    const centerX = this.canvasWidth / 2;
    const centerY = this.canvasHeight / 2;
    
    switch (this.pattern) {
      case 'waves':
        return this.createWaveParticle(index, centerX, centerY);
      case 'spiral':
        return this.createSpiralParticle(index, centerX, centerY);
      case 'burst':
        return this.createBurstParticle(index, centerX, centerY);
      case 'orbit':
        return this.createOrbitParticle(index, centerX, centerY);
      default:
        return this.createWaveParticle(index, centerX, centerY);
    }
  }

  /**
   * 파도 패턴 파티클 생성
   */
  private createWaveParticle(index: number, centerX: number, centerY: number): Particle {
    const angle = (index / this.maxParticles) * Math.PI * 2;
    const radius = 50 + Math.random() * 100;
    
    return {
      id: index,
      x: centerX + Math.cos(angle) * radius,
      y: centerY + Math.sin(angle) * radius,
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5,
      radius: 2 + Math.random() * 4,
      opacity: 0.3 + Math.random() * 0.7,
      color: `hsl(${200 + Math.random() * 60}, 70%, 60%)`,
      life: 1.0,
      maxLife: 1.0,
      speed: 0.5 + Math.random() * 1.5,
      angle: angle,
      originalRadius: radius,
    };
  }

  /**
   * 나선 패턴 파티클 생성
   */
  private createSpiralParticle(index: number, centerX: number, centerY: number): Particle {
    const spiralAngle = (index / this.maxParticles) * Math.PI * 8; // 4바퀴
    const radius = (index / this.maxParticles) * 120;
    
    return {
      id: index,
      x: centerX + Math.cos(spiralAngle) * radius,
      y: centerY + Math.sin(spiralAngle) * radius,
      vx: 0,
      vy: 0,
      radius: 1 + Math.random() * 3,
      opacity: 0.4 + Math.random() * 0.6,
      color: `hsl(${280 + Math.random() * 80}, 80%, 70%)`,
      life: 1.0,
      maxLife: 1.0,
      speed: 1 + Math.random() * 2,
      angle: spiralAngle,
      originalRadius: radius,
    };
  }

  /**
   * 폭발 패턴 파티클 생성
   */
  private createBurstParticle(index: number, centerX: number, centerY: number): Particle {
    const angle = (index / this.maxParticles) * Math.PI * 2;
    const speed = 2 + Math.random() * 3;
    
    return {
      id: index,
      x: centerX,
      y: centerY,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      radius: 1.5 + Math.random() * 2.5,
      opacity: 0.8 + Math.random() * 0.2,
      color: `hsl(${30 + Math.random() * 60}, 90%, 70%)`,
      life: 1.0,
      maxLife: 1.0,
      speed: speed,
      angle: angle,
      originalRadius: 0,
    };
  }

  /**
   * 궤도 패턴 파티클 생성
   */
  private createOrbitParticle(index: number, centerX: number, centerY: number): Particle {
    const orbitRadius = 40 + (index % 3) * 30; // 3개 궤도
    const angle = (index / this.maxParticles) * Math.PI * 2;
    
    return {
      id: index,
      x: centerX + Math.cos(angle) * orbitRadius,
      y: centerY + Math.sin(angle) * orbitRadius,
      vx: 0,
      vy: 0,
      radius: 2 + Math.random() * 2,
      opacity: 0.5 + Math.random() * 0.5,
      color: `hsl(${180 + Math.random() * 180}, 75%, 65%)`,
      life: 1.0,
      maxLife: 1.0,
      speed: 0.8 + Math.random() * 0.4,
      angle: angle,
      originalRadius: orbitRadius,
    };
  }

  /**
   * 파티클 업데이트 (애니메이션 프레임마다 호출)
   */
  update(deltaTime: number, intensity: number = 1.0): void {
    const centerX = this.canvasWidth / 2;
    const centerY = this.canvasHeight / 2;
    
    this.particles.forEach(particle => {
      this.updateParticleByPattern(particle, deltaTime, intensity, centerX, centerY);
      this.updateParticleLife(particle, deltaTime);
    });
  }

  /**
   * 패턴별 파티클 업데이트
   */
  private updateParticleByPattern(
    particle: Particle,
    deltaTime: number,
    intensity: number,
    centerX: number,
    centerY: number
  ): void {
    switch (this.pattern) {
      case 'waves':
        this.updateWaveParticle(particle, deltaTime, intensity, centerX, centerY);
        break;
      case 'spiral':
        this.updateSpiralParticle(particle, deltaTime, intensity, centerX, centerY);
        break;
      case 'burst':
        this.updateBurstParticle(particle, deltaTime, intensity);
        break;
      case 'orbit':
        this.updateOrbitParticle(particle, deltaTime, intensity, centerX, centerY);
        break;
    }
  }

  /**
   * 파도 패턴 업데이트
   */
  private updateWaveParticle(
    particle: Particle,
    deltaTime: number,
    intensity: number,
    centerX: number,
    centerY: number
  ): void {
    particle.angle += particle.speed * deltaTime * 0.01 * intensity;
    const waveAmplitude = Math.sin(particle.angle * 3) * 20 * intensity;
    
    particle.x = centerX + Math.cos(particle.angle) * (particle.originalRadius + waveAmplitude);
    particle.y = centerY + Math.sin(particle.angle) * (particle.originalRadius + waveAmplitude);
    particle.opacity = (0.3 + Math.sin(particle.angle * 2) * 0.3) * intensity;
  }

  /**
   * 나선 패턴 업데이트
   */
  private updateSpiralParticle(
    particle: Particle,
    deltaTime: number,
    intensity: number,
    centerX: number,
    centerY: number
  ): void {
    particle.angle += particle.speed * deltaTime * 0.005 * intensity;
    const currentRadius = particle.originalRadius + Math.sin(particle.angle * 0.5) * 30 * intensity;
    
    particle.x = centerX + Math.cos(particle.angle) * currentRadius;
    particle.y = centerY + Math.sin(particle.angle) * currentRadius;
    particle.opacity = (0.4 + Math.sin(particle.angle * 1.5) * 0.4) * intensity;
  }

  /**
   * 폭발 패턴 업데이트
   */
  private updateBurstParticle(particle: Particle, deltaTime: number, intensity: number): void {
    particle.x += particle.vx * deltaTime * 0.1 * intensity;
    particle.y += particle.vy * deltaTime * 0.1 * intensity;
    
    // 감속 효과
    particle.vx *= 0.98;
    particle.vy *= 0.98;
    
    // 경계 처리
    if (particle.x < 0 || particle.x > this.canvasWidth || 
        particle.y < 0 || particle.y > this.canvasHeight) {
      const newParticle = this.createBurstParticle(particle.id, this.canvasWidth / 2, this.canvasHeight / 2);
      Object.assign(particle, newParticle);
    }
  }

  /**
   * 궤도 패턴 업데이트
   */
  private updateOrbitParticle(
    particle: Particle,
    deltaTime: number,
    intensity: number,
    centerX: number,
    centerY: number
  ): void {
    particle.angle += particle.speed * deltaTime * 0.008 * intensity;
    
    particle.x = centerX + Math.cos(particle.angle) * particle.originalRadius;
    particle.y = centerY + Math.sin(particle.angle) * particle.originalRadius;
    particle.opacity = (0.5 + Math.sin(particle.angle * 4) * 0.3) * intensity;
  }

  /**
   * 파티클 수명 업데이트
   */
  private updateParticleLife(particle: Particle, deltaTime: number): void {
    // 일반적으로 파티클은 영구적이지만, 특정 패턴에서는 수명 관리
    if (this.pattern === 'burst') {
      particle.life -= deltaTime * 0.001;
      if (particle.life <= 0) {
        const newParticle = this.createBurstParticle(particle.id, this.canvasWidth / 2, this.canvasHeight / 2);
        Object.assign(particle, newParticle);
      }
    }
  }

  /**
   * 파티클 시스템 시작
   */
  start(): void {
    this.isActive = true;
  }

  /**
   * 파티클 시스템 정지
   */
  stop(): void {
    this.isActive = false;
  }

  /**
   * 패턴 변경
   */
  setPattern(pattern: EffectPattern): void {
    this.pattern = pattern;
    this.initializeParticles();
  }

  /**
   * 파티클 수 조정
   */
  setParticleCount(count: number): void {
    this.maxParticles = Math.max(1, Math.min(count, 200)); // 1-200 제한
    this.initializeParticles();
  }

  /**
   * 캔버스 크기 조정
   */
  resize(width: number, height: number): void {
    this.canvasWidth = width;
    this.canvasHeight = height;
    this.initializeParticles();
  }

  /**
   * 현재 파티클 배열 반환
   */
  getParticles(): Particle[] {
    return this.particles;
  }

  /**
   * 시스템 상태 반환
   */
  isRunning(): boolean {
    return this.isActive;
  }

  /**
   * 시스템 정리
   */
  dispose(): void {
    this.stop();
    this.particles = [];
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
  }
}