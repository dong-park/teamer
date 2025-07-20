# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview
**Teamer** - A React Native application featuring an ambient light start button with sophisticated visual effects.

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

# Run specific test file
npm test -- path/to/test.spec.ts
```

## Architecture Overview

### Tech Stack
- **React Native 0.80.1** with TypeScript
- **NativeWind 4.1.23** - Tailwind CSS for React Native
- **Animation Libraries**: 
  - react-native-reanimated (performance animations)
  - react-native-skia (advanced graphics)
  - lottie-react-native (complex animations)
- **Visual Effects**: 
  - react-native-linear-gradient
  - react-native-svg

### Project Structure
```
App.tsx                     # Main app with dark mode toggle
components/
├── StartButton.tsx         # Main button component with ambient effect
└── AmbientEffect/          # Modular ambient light implementations
global.css                  # Tailwind CSS global configuration
```

### Key Implementation Details

#### NativeWind (Tailwind) Configuration
- Dark mode enabled using `class` strategy
- Global styles in `global.css`
- Tailwind config scans: `./App.tsx` and `./components/**/*.{js,jsx,ts,tsx}`
- Prettier configured to sort Tailwind classes

#### Ambient Light Button Requirements
The start button must implement:
1. **Multi-layer glow effect** with smooth gradients
2. **Continuous pulsing animation** at 60fps
3. **Interactive states**: hover intensification, click ripple
4. **Customizable parameters**: intensity, speed, radius, colors
5. **Performance optimization** for mobile devices

#### Current Implementation Status
- ✅ Basic button structure in `StartButton.tsx`
- ✅ Dark mode support
- ✅ Customizable ring color prop
- 🔄 Ambient light effect modules in development

### Performance Considerations
- Use `react-native-reanimated` for animations (runs on UI thread)
- Implement with `useNativeDriver: true` where possible
- For complex effects, consider `react-native-skia` over standard views
- Test on physical devices, especially Android mid-range phones

### Platform-Specific Notes
- **iOS**: Shadows render differently than web - use `shadowOffset`, `shadowOpacity`, `shadowRadius`
- **Android**: Limited shadow support - use `elevation` or gradient backgrounds
- **Both**: Test ambient effects on both platforms as rendering differs significantly

## Task Master AI Instructions
**Import Task Master's development workflow commands and guidelines, treat as if import is in the main CLAUDE.md file.**
@./.taskmaster/CLAUDE.md

## Testing Approach
- Unit tests for animation logic and state management
- Visual regression testing for ambient effects (manual on devices)
- Performance profiling using React DevTools and Flipper
- Cross-platform validation on iOS and Android devices