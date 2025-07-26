# 개발 관련 명령어

## 초기 설정 (최초 1회만)
```bash
bundle install              # Ruby 의존성 설치 (iOS)
bundle exec pod install     # iOS 의존성 설치
```

## 일일 개발
```bash
npm start                   # Metro 번들러 시작
npm run ios                 # iOS 실행 (시뮬레이터)
npm run android             # Android 실행 (에뮬레이터 필요)
```

## 네이티브 의존성 업데이트 후
```bash
bundle exec pod install     # iOS 의존성 재설치
```

## 코드 품질
```bash
npm run lint               # ESLint 실행
npm test                   # Jest 테스트 실행
npm test -- path/to/test   # 특정 테스트 파일 실행
```

## 플랫폼별 노트
- iOS: 그림자는 shadowOffset, shadowOpacity, shadowRadius 사용
- Android: elevation 또는 gradient 배경 사용 (그림자 지원 제한적)