# 앰비언트 효과 아키텍처

## 파일 구조
```
components/
├── StartButton.tsx           # 메인 버튼 컴포넌트
└── AmbientEffect/           # 모듈화된 앰비언트 라이트 구현
    ├── types.ts             # 타입 정의
    ├── constants.ts         # 설정 상수
    ├── utils/               # 유틸리티 함수들
    ├── hooks/               # 커스텀 훅들
    └── effects/             # 이펙트 구현체들
```

## 핵심 구성요소
- **StartButton**: react-native-skia Canvas를 사용한 메인 버튼
- **AmbientEffectConfig**: 시각적 속성, 동작, 성능 설정을 담은 설정 인터페이스
- **다중 레이어 글로우**: Outer/Inner/Core 3단계 방사형 그라디언트
- **다크/라이트 모드**: 각각 다른 색상 프리셋 적용