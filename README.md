# 🍪 YUM.GG - 회사 간식 주문 시스템

회사 간식 주문을 쉽고 재미있게 관리하는 웹 애플리케이션입니다.

## ✨ 주요 기능

### 🎯 사용자 기능 (모든 사용자)
- **간식 조르기**: 네이버 쇼핑 검색으로 간식을 쉽게 찾아 제안
- **내 간식 주머니**: 자신이 제안한 간식 목록 확인 (우측 하단 플로팅 버튼)
- **실시간 대시보드**: 인기 간식 Top 5와 최근 제안 확인
- **트렌딩 간식**: 네이버 쇼핑 API로 현재 인기있는 간식 추천 (5초 쿨다운)
- **주간 현황**: 이번 주 주문 현황을 상단 배너에서 실시간 확인

### 👨‍💼 관리자 기능 (관리자 전용)
- **투표 시스템**: 제안된 간식에 투표하여 인기도 측정
- **주문 생성**: 투표 결과를 바탕으로 주문 목록 작성
- **주문 이력**: 과거 주문 내역 조회 및 재주문
- **카테고리 필터**: 간식을 카테고리별로 분류 및 필터링
- **간식 목록 관리**: 제안된 모든 간식 확인

### 🎨 사용자 경험
- **실시간 활동 알림**: 간식 조르기 및 주문 생성 시 상단에 알림 표시
- **재미있는 에러 메시지**: 20가지 간식 테마 에러 메시지 (5초마다 변경)
- **로그인/로그아웃 알림**: 우측 상단 토스트 알림
- **로딩 오버레이**: 인증 처리 중 화면 차단
- **모바일 반응형**: 모든 디바이스에서 최적화된 UI
- **크로스 플랫폼 일관성**: 맥/윈도우에서 동일한 색상 표시

## 🚀 시작하기

### 1. 프로젝트 설정

```bash
# 저장소 클론
git clone https://github.com/UjiinEatingTangerines/snack-order-system.git
cd snack-order-system

# 의존성 설치
npm install

# 환경 변수 설정
cp .env.example .env
# .env 파일을 열어 필요한 값 입력

# Prisma 마이그레이션
npx prisma migrate dev

# 개발 서버 실행
npm run dev
```

브라우저에서 http://localhost:3000 접속

### 2. 환경 변수 설정

`.env` 파일에 다음 값들을 설정하세요:

```env
# 데이터베이스
DATABASE_URL="file:./dev.db"  # 로컬 개발용 SQLite
# DATABASE_URL="postgresql://..."  # 프로덕션용 PostgreSQL (Direct connection, pooler 제외)

# 네이버 쇼핑 API (필수)
NAVER_CLIENT_ID="발급받은_클라이언트_ID"
NAVER_CLIENT_SECRET="발급받은_클라이언트_시크릿"

# 관리자 인증
ADMIN_PASSWORD="your-admin-password"
SESSION_SECRET="your-secret-key-change-this-in-production"

# 앱 버전
NEXT_PUBLIC_APP_VERSION="0.8.0"
NEXT_PUBLIC_BUILD_DATE="2025-11-26"
```

#### Neon 데이터베이스 사용 시 (Vercel 배포)

⚠️ **중요**: Neon 사용 시 반드시 **Direct Connection URL**을 사용하세요.

Neon Dashboard에서 Connection Details를 확인하면:
- **Pooled connection**: `postgresql://...@ep-xxx-pooler.region.aws.neon.tech/...`
- **Direct connection**: `postgresql://...@ep-xxx.region.aws.neon.tech/...` ✅

Vercel 환경 변수 설정:
1. **Settings** → **Environment Variables**
2. `DATABASE_URL`에 **Direct connection URL** 입력 (pooler 제외)
3. 예: `postgresql://user:password@ep-xxx.region.aws.neon.tech/dbname?sslmode=require`

**주의**: `-pooler`가 포함된 URL은 마이그레이션 시 타임아웃 오류가 발생합니다.

### 3. 네이버 API 발급 방법

1. [네이버 개발자 센터](https://developers.naver.com/apps/#/register)에서 애플리케이션 등록
2. **검색** API 선택
3. 발급받은 Client ID와 Secret을 `.env` 파일에 입력

## 📚 기술 스택

- **Frontend**: Next.js 14 (App Router), React 18, TypeScript
- **Styling**: Tailwind CSS with Custom Color Palette
- **Database**: SQLite (개발), PostgreSQL (프로덕션)
- **ORM**: Prisma 5
- **API**: Next.js API Routes
- **External API**: Naver Shopping API
- **Deployment**: Vercel
- **Font**: Pretendard

## 📁 프로젝트 구조

```
snack-order-system/
├── app/
│   ├── api/                      # API 라우트
│   │   ├── auth/                # 인증 관련 API
│   │   │   ├── check/          # 세션 확인
│   │   │   ├── login/          # 로그인
│   │   │   └── logout/         # 로그아웃
│   │   ├── my-snacks/          # 내 간식 주머니
│   │   ├── orders/             # 주문 관련 API
│   │   ├── search-snacks/      # 네이버 쇼핑 검색
│   │   ├── snacks/             # 간식 관련 API
│   │   ├── trending/           # 트렌딩 간식
│   │   └── weekly-total/       # 주간 주문 현황
│   ├── facker/                 # 관리자 로그인 (숨김 URL)
│   ├── my-snacks/              # 내 간식 주머니 페이지
│   ├── orders/                 # 주문 페이지
│   ├── propose/                # 간식 제안 페이지
│   ├── snacks/                 # 간식 목록 페이지
│   └── page.tsx                # 간식 허브 (대시보드)
├── components/
│   ├── ErrorDisplay.tsx        # 재미있는 에러 페이지
│   ├── FloatingMySnacksButton.tsx  # 내 간식 주머니 플로팅 버튼
│   ├── Footer.tsx              # 푸터
│   ├── LoadingOverlay.tsx      # 로딩 오버레이
│   ├── Navigation.tsx          # 네비게이션 바
│   ├── Toast.tsx               # 토스트 알림
│   ├── TrendingSnacks.tsx      # 트렌딩 간식 위젯
│   └── WeeklyOrderBanner.tsx   # 주간 주문 배너
├── lib/
│   ├── auth.ts                 # 인증 유틸리티
│   └── prisma.ts               # Prisma 클라이언트
├── prisma/
│   ├── schema.prisma           # 데이터베이스 스키마
│   └── dev.db                  # SQLite 데이터베이스 (개발용)
├── middleware.ts               # Next.js 미들웨어 (인증 체크)
└── public/                     # 정적 파일
```

## 🗄️ 데이터베이스 스키마

### Snack (간식)
- `id`, `name`, `url`, `imageUrl`, `category`, `proposedBy`, `createdAt`
- 관계: `votes[]`, `orderItems[]`

### Vote (투표)
- `id`, `snackId`, `voterName`, `createdAt`
- 관계: `snack`

### Order (주문)
- `id`, `orderDate`, `totalCost`, `notes`
- 관계: `items[]`

### OrderItem (주문 항목)
- `id`, `orderId`, `snackId`, `quantity`
- 관계: `order`, `snack`

### TrendingSnack (트렌딩)
- `id`, `name`, `url`, `imageUrl`, `source`, `rank`, `fetchedAt`

## 🎯 사용 가이드

### 일반 사용자 (모든 사용자)

#### 1. 간식 조르기
1. 네비게이션에서 "간식 조르기" 클릭 (모든 사용자 접근 가능)
2. **네이버 쇼핑 검색** 사용:
   - 검색창에 원하는 간식 입력
   - 검색 결과에서 원하는 상품 클릭
   - 자동으로 이름, 링크, 이미지 입력됨
3. 또는 **직접 입력**으로 수동 입력
4. "간식 조르기" 버튼 클릭
5. 자동으로 제안자 이름 저장 (localStorage)

#### 2. 내 간식 주머니 확인하기
1. **우측 하단 🎒 플로팅 버튼** 클릭 (모든 페이지에서 접근 가능)
2. 자신이 제안한 간식 목록 확인
3. 각 간식의 투표 수와 제안 시간 확인
4. "이름 변경" 버튼으로 제안자 이름 수정 가능

### 관리자

#### 1. 관리자 로그인
1. 브라우저 주소창에 `/facker` 입력 (숨겨진 URL)
2. 관리자 비밀번호 입력
3. 비밀번호 표시/숨김 토글 가능
4. 로그인 성공 시 토스트 알림 및 자동 리다이렉트

#### 2. 투표하기
1. "간식 목록" 페이지 방문
2. 원하는 간식의 👍 버튼 클릭
3. 실시간으로 투표 수 업데이트

#### 3. 주문 생성하기
1. "주문하기" 메뉴 클릭
2. 자동으로 투표 상위 간식이 추가됨
3. 수량 조절 및 간식 추가/제거
4. 메모 입력 (선택)
5. "주문 완료" 버튼 클릭

#### 4. 재주문하기
1. "주문 이력" 페이지에서 과거 주문 확인
2. "🔄 이 주문 다시하기" 버튼 클릭
3. 기존 주문 내역이 자동으로 불러와짐
4. 필요시 수정 후 주문 완료

## 🔐 보안 기능

- **숨겨진 로그인 URL**: `/facker`로만 관리자 로그인 가능
- **쿠키 기반 세션**: HttpOnly 쿠키로 세션 관리
- **미들웨어 보호**: 관리자 페이지 자동 리다이렉트
- **로그인/로그아웃 알림**: 토스트 및 로딩 오버레이
- **비밀번호 표시/숨김**: 사용자 편의성 제공

## 🎨 디자인 특징

- **컬러 팔레트**: 따뜻한 오렌지/크림 톤 (primary, accent, cream)
- **Pretendard 폰트**: 한글 최적화 폰트
- **모바일 반응형**: 햄버거 메뉴, 플렉시블 레이아웃
- **재미있는 UX**:
  - 20가지 간식 테마 에러 메시지
  - 로그인 실패 시 랜덤 재미있는 메시지
  - 5초마다 변경되는 에러 페이지
  - 토스트 알림 및 로딩 오버레이

## 📝 배포

### Vercel 배포

1. GitHub 저장소와 Vercel 연결
2. Vercel 대시보드에서 환경 변수 설정:
   - `NAVER_CLIENT_ID`
   - `NAVER_CLIENT_SECRET`
   - `ADMIN_PASSWORD`
   - `SESSION_SECRET`
   - `NEXT_PUBLIC_APP_VERSION`
   - `NEXT_PUBLIC_BUILD_DATE`
   - `DATABASE_URL` (Vercel Postgres 연결)
3. 자동 배포 활성화
4. `git push` 시 자동 배포

### 수동 배포

```bash
# Vercel CLI 설치
npm i -g vercel

# 배포
vercel --prod
```

## 🔧 개발 명령어

```bash
# 개발 서버 실행
npm run dev

# 프로덕션 빌드
npm run build

# 프로덕션 서버 실행
npm run start

# Prisma 스튜디오 (DB GUI)
npx prisma studio

# Prisma 마이그레이션
npx prisma migrate dev

# 린트 검사
npm run lint
```

## 🆕 업데이트 내역

### v0.11.0 (2025-11-26)
- 🗳️ 투표 기능 오픈
  - 일반 사용자도 간식 목록 접근 가능
  - 간식당 1번만 투표 가능 (localStorage 기반)
  - 투표한 간식은 체크마크로 표시
  - 재투표 방지 및 알림
- 📊 카테고리 분포 기능 구현
  - 상위 5개 카테고리 표시
  - 컬러풀한 프로그레스 바로 시각화
  - 퍼센티지와 개수 동시 표시
- 📄 이번 주 조르기 목록 페이징
  - 페이지당 5개 항목 표시
  - 이전/다음 버튼으로 페이지 이동
- 🎨 간식 목록 UI 개선
  - 카테고리 배지 크기 고정
- 🔧 데이터베이스 관리 도구 추가
  - SQL 초기화 스크립트 추가
  - `npm run db:reset` 명령어 추가

### v0.8.0 (2025-11-26)
- 🔔 실시간 활동 알림 시스템 추가
  - 간식 조르기 알림: 누군가 간식을 조르면 상단에 알림 표시
  - 주문 생성 알림: 새로운 주문이 생성되면 알림 표시
  - 10초마다 자동으로 새로운 활동 확인
  - 5초간 표시 후 자동 사라짐
  - 최대 5개 알림 스택 관리
- 📊 주문 현황 블록 개선
  - 상단 배너는 금액만 간단히 표시
  - 홈 페이지에 상세한 주문 현황 블록 추가
  - 주문된 간식 목록을 그리드로 표시
- 🎨 크로스 플랫폼 UI 개선
  - 맥/윈도우에서 동일한 색상 표시
  - 다크모드 강제 비활성화
  - 입력 필드 텍스트 색상 통일
  - 배경색 고정값 사용
- 🔧 데이터베이스 연결 안정성 개선
  - Neon direct connection 사용 가이드 추가
  - 마이그레이션 타임아웃 문제 해결

### v0.7.0 (2025-11-26)
- 💰 간식 가격 기능 추가
  - 네이버 쇼핑 검색 시 가격 자동 입력
  - 수기로 가격 입력 가능
  - 주문 생성 시 개별 가격 수정 가능
  - 주문 총 금액 자동 계산 및 저장
- 🔒 일반 사용자에게 주문 관련 버튼 숨김
- 📊 주간 배너에 주문된 간식 목록 표시 (클릭하여 펼침/접기)

### v0.6.0 (2025-11-26)
- 🎈 플로팅 버튼 둥둥 떠다니는 애니메이션 추가
- 📍 플로팅 버튼이 footer와 겹치지 않도록 자동 위치 조정
- 🎨 플로팅 버튼 색상 변경 (오렌지-노랑 그라데이션)

### v0.5.0 (2025-11-26)
- 🎒 "내 제안" 메뉴를 "내 간식 주머니"로 변경
- 🎨 페이지 타이틀 및 아이콘 업데이트
- 🔓 간식 제안 기능을 일반 사용자에게도 개방
- 📝 "간식 제안"을 "간식 조르기"로 변경
- 🎈 내 간식 주머니 플로팅 버튼 추가 (우측 하단)
- 🔄 메뉴 순서 변경: 간식 허브 → 간식 조르기

### v0.4.0 (2025-11-26)
- ✨ 내가 제안한 간식 페이지 추가
- 🔍 네이버 쇼핑 검색 기능 추가
- 🔐 관리자 로그인 URL 변경 (`/facker`)
- 🎨 로그인/로그아웃 토스트 알림
- 🚀 로딩 오버레이 추가
- 🎭 비밀번호 표시/숨김 토글

### v0.3.0
- 📊 주간 주문 현황 배너
- 🎨 YUM.GG 브랜딩
- 📱 모바일 반응형 개선
- 🎭 재미있는 에러 메시지

## 🤝 기여하기

이슈 제보나 기능 제안은 언제든 환영합니다!

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 라이선스

MIT License

## 👨‍💻 개발자

Made with ❤️ by 김현우

---

**배포 URL**: https://yum.gg (예정)
**관리자 로그인**: `/facker`
