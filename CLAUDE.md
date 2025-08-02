# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview
**Teamer** - A React Native productivity application featuring an ambient light start button with sophisticated visual effects, timer functionality, and preset management system.

## Development Commands

### Initial Setup (First Time Only)
```bash
# Install Ruby dependencies for iOS
bundle install

# Install iOS dependencies
bundle exec pod install
```

### Daily Development
```bash
# Start Metro bundler
npm start

# Run on iOS (opens simulator)
npm run ios

# Run on Android (requires emulator or device)
npm run android

# After updating native dependencies
bundle exec pod install
```

### Code Quality
```bash
# Run ESLint
npm run lint

# Run Jest tests
npm test

# Run specific test file (example)
npm test -- __tests__/AmbientEffect.test.ts
npm test -- __tests__/hooks/useAdaptiveConfig.test.ts
```

## Architecture Overview

### Tech Stack
- **React Native 0.80.1** with TypeScript
- **NativeWind 4.1.23** - Tailwind CSS for React Native
- **State Management**: React Context API + AsyncStorage
- **Animation Libraries**: 
  - react-native-reanimated (performance animations)
  - react-native-skia (advanced graphics)
  - lottie-react-native (complex animations)
- **Visual Effects**: 
  - react-native-linear-gradient
  - react-native-svg
  - react-native-blur
- **Data Persistence**: AsyncStorage for presets and user data

### Project Structure
```
App.tsx                               # Main app with multi-screen navigation
components/
├── screens/
│   ├── HomeScreen.tsx               # Main screen with timer and start button
│   ├── FocusTimeScreen.tsx          # Focus session screen
│   ├── GroupTrackerScreen.tsx       # Group tracking functionality
│   └── PresetManagementScreen.tsx   # Preset creation and management
├── StartButton.tsx                  # Main button with ambient effects
├── PresetMenu.tsx                   # Circular preset selection menu
├── BottomMenu.tsx                   # Bottom navigation
├── SuccessCounter.tsx               # Success tracking display
└── AmbientEffect/                   # Modular ambient light system
    ├── effects/
    │   └── ParticleRenderer.tsx     # Skia-based particle rendering
    ├── hooks/
    │   └── useAdaptiveConfig.ts     # Performance-adaptive configuration
    ├── utils/
    │   ├── deviceDetection.ts       # Device capability detection
    │   └── particleSystem.ts        # Particle animation engine
    ├── types.ts                     # Type definitions
    └── constants.ts                 # Configuration constants
hooks/
└── useTimer.ts                      # Timer logic and context
contexts/
└── PresetContext.tsx                # Preset management context
types/
└── preset.ts                        # Core type definitions
__tests__/                          # Comprehensive test suite
global.css                          # Tailwind CSS global configuration
```

### Key Implementation Details

#### NativeWind (Tailwind) Configuration
- Dark mode enabled using `class` strategy
- Global styles in `global.css`
- Tailwind config scans: `./App.tsx` and `./components/**/*.{js,jsx,ts,tsx}`
- Prettier configured to sort Tailwind classes

#### Core Features Implemented
1. **Ambient Light System**: Multi-layer glow effects with particle system
   - Skia-based high-performance rendering
   - Device-adaptive quality settings
   - 4 particle patterns: waves, spiral, burst, orbit
   - Real-time performance monitoring and adjustment

2. **Timer & Preset System**: 
   - Context-based timer management with AsyncStorage persistence
   - Preset creation, editing, and deletion with color customization
   - Circular preset menu with long-press activation
   - Success counter tracking completed focus sessions

3. **Multi-Screen Navigation**:
   - Home screen with start button and preset management
   - Focus time screen for active sessions
   - Group tracker for collaborative features
   - Bottom navigation with minimalist design

4. **Performance Optimization**:
   - Automatic device capability detection (high/medium/low)
   - Adaptive configuration based on device performance
   - Frame rate monitoring with automatic quality adjustment
   - Memory-efficient particle object pooling

### Performance Considerations & Best Practices
- **Animation Performance**: Use `react-native-reanimated` for 60fps animations on UI thread
- **Skia Integration**: Complex visual effects use `@shopify/react-native-skia` for performance
- **Device Testing**: Test on physical devices, especially Android mid-range phones
- **Adaptive Quality**: System automatically adjusts quality based on device capabilities
- **Memory Management**: Particle systems use object pooling to prevent memory leaks
- **Performance Monitoring**: Built-in frame rate monitoring triggers quality adjustments

### Platform-Specific Notes
- **iOS**: Shadows and blur effects use native iOS implementations
- **Android**: Limited shadow support compensated with Skia-based effects
- **Both**: Ambient effects tested and optimized for both platforms
- **Device Detection**: Automatic platform-specific optimizations applied

### State Management Architecture
- **TimerContext**: Global timer state using React Context + AsyncStorage
- **PresetContext**: Preset management with CRUD operations and persistence
- **Local State**: Component-specific state for UI interactions
- **Data Flow**: Unidirectional data flow with context providers at app root

## Task Master AI Instructions
**Import Task Master's development workflow commands and guidelines, treat as if import is in the main CLAUDE.md file.**
@./.taskmaster/CLAUDE.md

## Testing Approach
- **Unit Tests**: Jest tests for ambient effect system, hooks, and utilities
  - `__tests__/AmbientEffect.test.ts` - Particle system, device detection, performance monitoring
  - `__tests__/hooks/useAdaptiveConfig.test.ts` - Adaptive configuration logic
- **Integration Tests**: Context providers and state management
- **Performance Testing**: Built-in performance monitoring with frame rate tracking
- **Visual Testing**: Manual testing on devices for ambient effects and UI
- **Cross-Platform**: iOS and Android validation for all features

## Key Development Patterns
- **Context Providers**: Wrap app components for global state (Timer, Preset)
- **Adaptive Hooks**: Use device capability detection for optimal performance
- **Skia Effects**: Leverage `@shopify/react-native-skia` for complex visual effects
- **Type Safety**: Comprehensive TypeScript interfaces in `types/` directory
- **Performance First**: Always consider mobile device limitations and optimize accordingly

## Common Development Tasks
- **Adding New Presets**: Update `contexts/PresetContext.tsx` and `types/preset.ts`
- **Modifying Ambient Effects**: Work in `components/AmbientEffect/` modular system
- **Timer Logic Changes**: Modify `hooks/useTimer.ts` for timer functionality
- **Screen Navigation**: Add screens in `components/screens/` with bottom menu integration
- **Performance Tuning**: Adjust constants in `components/AmbientEffect/constants.ts`