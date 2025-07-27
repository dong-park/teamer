# Teamer 앱 프리셋 메뉴 기능 구현

**날짜**: 2025-07-27  
**작업자**: dongpark  
**상태**: ✅ 완료  
**우선순위**: 높음

## 📋 작업 개요

React Native Teamer 앱에 시작 버튼을 길게 누르면 활성화되는 원형 프리셋 메뉴 시스템을 구현했습니다. 사용자가 미리 설정된 할일 프리셋을 빠르게 선택하여 타이머를 시작할 수 있는 직관적인 UX를 제공합니다.

## 🎯 구현된 주요 기능

### 1. 길게 누르기 감지 시스템
- **StartButton** 컴포넌트에 800ms 길게 누르기 감지 기능 추가
- 햅틱 피드백으로 사용자에게 즉각적인 반응 제공
- 일반 터치와 길게 누르기 구분하여 각각 다른 동작 수행

### 2. 원형 프리셋 메뉴
- 중앙 "할일 선택" 버튼 주위로 최대 6개 프리셋이 원형 배치
- 12시 방향부터 시계방향으로 순차 배치
- 버튼 중심 좌표를 기준으로 정확한 위치 계산

### 3. 데이터 구조 및 상태 관리
```typescript
// 타입 정의
interface TodoItem {
  id: string;
  title: string;
  description?: string;
  color: string;
  icon?: string;
  duration?: number;
  lastUsed?: Date;
}

interface Preset {
  id: string;
  name: string;
  todos: TodoItem[];
  createdAt: Date;
  lastUsed: Date;
  usageCount: number;
}
```

### 4. AsyncStorage 연동
- 프리셋 데이터 영구 저장
- 사용 횟수 및 최근 사용 시간 추적
- 최근 사용한 6개 프리셋 자동 정렬

### 5. 부드러운 애니메이션
- **React Native Reanimated** 사용
- 순차적 등장 애니메이션 (80ms 간격)
- Spring 애니메이션으로 자연스러운 움직임
- BlurView 배경으로 몰입감 증대

### 6. 타이머 자동 연동
- 프리셋 선택 시 첫 번째 할일의 지속 시간을 목표 시간으로 설정
- 자동으로 타이머 시작
- 프리셋 사용량 통계 업데이트

## 🎨 기본 프리셋

1. **개발 작업** (파란색 #3B82F6)
   - 코딩 (25분)
   - 테스트 (15분)
   - 디버깅 (20분)

2. **운동** (주황색 #F97316)
   - 웜업 (10분)
   - 근력 운동 (30분)
   - 스트레칭 (10분)

3. **창작** (핑크색 #EC4899)
   - 아이디어 정리 (15분)
   - 글쓰기 (25분)
   - 검토 (10분)

4. **공부** (보라색 #8B5CF6)
   - 독서 (30분)
   - 정리 (15분)
   - 복습 (20분)

## 🔧 해결한 기술적 문제

### 1. React Hooks 규칙 위반
**문제**: `presets.slice(0, 6).map(() => ({ useSharedValue(...) }))`로 동적 Hook 생성
**해결**: 
- 고정된 6개 애니메이션 객체로 변경
- `PresetItem` 별도 컴포넌트로 분리하여 `useAnimatedStyle` 조건부 사용 방지

### 2. AsyncStorage 네이티브 모듈 링킹
**문제**: `NativeModule: AsyncStorage is null` 에러
**해결**:
- `npm install @react-native-async-storage/async-storage --legacy-peer-deps`
- `cd ios && bundle exec pod install`로 iOS 네이티브 모듈 링킹

### 3. NativeWind/Tailwind 설정
**문제**: Metro가 `tailwind.config.js`를 찾지 못함
**해결**:
```javascript
// metro.config.js
module.exports = withNativeWind(config, { 
  input: "./global.css",
  configPath: path.resolve(__dirname, "tailwind.config.js")
});
```

### 4. Reanimated 애니메이션 최적화
- 성능을 위해 실제 프리셋 개수만큼만 애니메이션 적용
- `for` 루프로 forEach 대신 사용하여 명확한 인덱스 관리

## 🎨 사용자 경험 (UX)

### 직관적인 인터랙션
- **길게 누르기**: 기존 시작/정지 기능과 구분되는 자연스러운 제스처
- **시각적 피드백**: 버튼 스케일 애니메이션과 햅틱 피드백
- **색상 구분**: 각 프리셋의 고유 색상으로 빠른 식별

### 접근성
- **다크/라이트 모드**: 완벽한 테마 지원
- **적응형 색상**: 모드별 최적화된 색상과 투명도
- **명확한 레이블**: 프리셋 이름과 할일 개수 표시

### 성능
- **지연 로딩**: 메뉴가 활성화될 때만 애니메이션 실행
- **메모리 최적화**: 고정된 애니메이션 객체로 메모리 사용량 최소화
- **부드러운 60fps**: Reanimated로 네이티브 성능 보장

## 📁 추가된 파일

```
├── types/
│   └── preset.ts                 # 프리셋 타입 정의
├── contexts/
│   └── PresetContext.tsx         # 프리셋 상태 관리
├── components/
│   └── PresetMenu.tsx            # 원형 메뉴 컴포넌트
└── components/screens/
    └── HomeScreen.tsx            # 메뉴 통합 및 이벤트 처리
```

## 🔄 수정된 파일

- **StartButton.tsx**: 길게 누르기 감지 및 콜백 추가
- **App.tsx**: PresetProvider로 전체 앱 래핑
- **package.json**: AsyncStorage, BlurView 의존성 추가
- **metro.config.js**: NativeWind 설정 수정

## 🧪 테스트 완료

✅ iOS 시뮬레이터에서 정상 작동 확인  
✅ 길게 누르기 감지 (800ms) 정확성 검증  
✅ 원형 메뉴 애니메이션 부드러움 확인  
✅ 프리셋 선택 시 타이머 자동 시작 검증  
✅ AsyncStorage 데이터 영속성 확인  
✅ 다크/라이트 모드 전환 테스트  
✅ React Hooks 에러 해결 검증  

## 🎉 최종 결과

사용자는 이제 시작 버튼을 길게 눌러서 원하는 할일 프리셋을 빠르게 선택하고 타이머를 시작할 수 있습니다. 직관적인 UI/UX와 부드러운 애니메이션으로 뛰어난 사용자 경험을 제공합니다.

**스크린샷**: 원형 메뉴가 중앙에서 펼쳐지며 4개 프리셋(개발작업, 운동, 창작, 공부)이 각각의 색상으로 배치된 모습 확인 완료

---

**태그**: #react-native #typescript #animation #ux #mobile-app #preset-menu #reanimated #asyncstorage