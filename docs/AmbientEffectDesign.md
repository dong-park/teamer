# Ambient Effect Component Design Documentation

## Overview
The Ambient Effect component creates immersive, dynamic backgrounds for the main screen of the Teamer app. It leverages React Native Skia for high-performance graphics and React Native Reanimated for smooth animations.

## Design Goals
- **Immersive Experience**: Create engaging visual effects that enhance user experience
- **Performance**: Optimize for 60fps on modern devices, gracefully degrade on older hardware
- **Customizable**: Flexible configuration system with presets
- **Responsive**: Adapt to dark mode, device capabilities, and user interactions
- **Accessible**: Ensure effects don't interfere with content readability

## Architecture

### Core Components

#### 1. AmbientEffect (Main Component)
```typescript
interface AmbientEffectProps {
  config?: Partial<AmbientEffectConfig>;
  style?: ViewStyle;
  children?: React.ReactNode;
  onInteraction?: (event: TouchEvent) => void;
  darkMode?: boolean;
}
```

The main wrapper component that:
- Manages the Canvas layer for effects
- Handles touch interactions
- Provides performance optimization
- Ensures proper layering with content

#### 2. Effect Types

**Wave Effect**
- Smooth, flowing wave animations
- Multiple layers with different phases
- Ideal for calm, professional interfaces

**Particle Effect**
- Dynamic particle system with physics
- Interactive particles that respond to touch
- Great for energetic, playful interfaces

**Gradient Effect**
- Animated gradient meshes
- Smooth color transitions
- Perfect for modern, minimalist designs

**Mesh Effect**
- 3D-like mesh deformations
- Complex mathematical patterns
- Suitable for technical/advanced interfaces

**Aurora Effect**
- Northern lights simulation
- Organic, flowing movements
- Excellent for dark mode/night themes

### Configuration System

```typescript
interface AmbientEffectConfig {
  // Visual properties
  colors: string[];
  intensity: number;        // 0-1
  speed: number;           // 0.5-3
  pattern: 'waves' | 'particles' | 'gradients' | 'mesh' | 'aurora';
  
  // Behavior
  interactive: boolean;     // Respond to touch
  responsive: boolean;      // Adapt to device motion
  autoAnimate: boolean;     // Continuous animation
  
  // Performance
  quality: 'low' | 'medium' | 'high';
  fps: 30 | 60;
}
```

### Performance Optimization

#### Device Capability Detection
```typescript
const deviceCapability = {
  gpu: getGPUTier(),      // 1-3
  cpu: getCPUCores(),     // 2-8
  ram: getRAMSize(),      // GB
};
```

#### Adaptive Quality
- **High-end devices**: Full effects, 60fps, high particle count
- **Mid-range devices**: Reduced particles, simplified shaders
- **Low-end devices**: Basic effects, 30fps, minimal particles

#### Frame Rate Management
- Monitor actual FPS and adjust quality dynamically
- Implement frame skipping for complex calculations
- Use `runOnJS` sparingly for performance

## Implementation Guide

### Step 1: Basic Setup
```bash
# Create component structure
mkdir -p components/AmbientEffect/{effects,hooks,utils}
```

### Step 2: Install Dependencies
Already installed:
- `@shopify/react-native-skia`
- `react-native-reanimated`

### Step 3: Implement Core Component
1. Create `index.tsx` with basic structure
2. Add Canvas setup with proper layering
3. Implement effect switching logic

### Step 4: Add Effects
1. Start with WaveEffect (simplest)
2. Add ParticleEffect with basic physics
3. Implement remaining effects progressively

### Step 5: Add Interactivity
1. Touch response system
2. Device motion integration (optional)
3. State-based animations

### Step 6: Performance Testing
1. Profile on various devices
2. Implement quality auto-adjustment
3. Add performance monitoring

## Usage Examples

### Basic Usage
```typescript
<AmbientEffect>
  <YourContent />
</AmbientEffect>
```

### With Configuration
```typescript
<AmbientEffect
  config={{
    pattern: 'aurora',
    colors: ['#ff6b6b', '#4ecdc4'],
    intensity: 0.7,
    interactive: true,
  }}
  darkMode={isDarkMode}
>
  <YourContent />
</AmbientEffect>
```

### Using Presets
```typescript
import { presets } from './components/AmbientEffect/constants';

<AmbientEffect config={presets.calm}>
  <YourContent />
</AmbientEffect>
```

## Best Practices

### 1. Performance
- Always test on real devices
- Use Chrome DevTools Performance tab
- Monitor memory usage

### 2. Accessibility
- Provide option to disable effects
- Ensure sufficient contrast
- Test with screen readers

### 3. Battery Life
- Reduce animation when battery is low
- Pause animations when app is backgrounded
- Provide power-saving mode

### 4. Customization
- Allow users to choose effects
- Save preferences
- Provide sensible defaults

## Presets

### Calm
- Pattern: Waves
- Colors: Blue gradient
- Low intensity, slow speed
- Professional appearance

### Energetic
- Pattern: Particles
- Colors: Vibrant mix
- High intensity, fast speed
- Playful, dynamic

### Professional
- Pattern: Gradients
- Colors: Purple gradient
- Medium intensity
- Modern, sleek

### Night Mode
- Pattern: Aurora
- Colors: Dark blues
- Low intensity
- Relaxing, subtle

## Testing Checklist

- [ ] Effects render at 60fps on iPhone 12+
- [ ] Graceful degradation on older devices
- [ ] Touch interactions feel responsive
- [ ] Dark mode adaptation works correctly
- [ ] Memory usage stays under 50MB
- [ ] Battery impact is minimal
- [ ] Accessibility requirements met
- [ ] All presets work as expected

## Future Enhancements

1. **AI-Driven Effects**: Adapt based on user behavior
2. **Sound Reactive**: Respond to music/audio
3. **Seasonal Themes**: Auto-change based on time/season
4. **Custom Effect Editor**: Let users create their own
5. **Effect Marketplace**: Share/download community effects

## Conclusion

The Ambient Effect component provides a powerful, flexible system for creating immersive backgrounds while maintaining performance and accessibility. By following this design, you can create engaging visual experiences that enhance rather than distract from your app's core functionality.