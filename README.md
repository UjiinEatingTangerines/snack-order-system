# 🍪 YUM.GG - 회사 간식 주문 시스템

회사 간식 주문을 쉽고 재미있게 관리하는 웹 애플리케이션입니다.

## ✨ 주요 기능

### 🎯 사용자 기능

- **간식 조르기**: 네이버 쇼핑 검색으로 간식을 쉽게 찾아 제안
- **내 간식 주머니**: 자신이 제안한 간식 목록 확인 (우측 하단 플로팅 버튼)
- **투표 시스템**: 제안된 간식에 투표하여 인기도 측정
- **실시간 대시보드**: 이번 주 인기 간식 Top 5와 최근 제안 확인
- **오늘의 추천 간식**: 무한 스크롤 애니메이션으로 추천 간식 표시
- **트렌딩 간식**: 네이버 쇼핑 인기 간식 실시간 조회 (다양한 카테고리)
- **상소문 게시판**: 자유롭게 의견을 남길 수 있는 커뮤니티 (댓글/대댓글 지원)
- **배경음악**: YouTube 배경음악 재생 (자동 재생, 볼륨 조절 가능)

### 👨‍💼 관리자 기능

- **주문 생성**: 투표 결과를 바탕으로 주문 목록 작성
- **주문 관리**: 과거 주문 내역 조회 및 재주문
- **주문 완료**: PENDING 주문을 COMPLETED로 상태 변경
- **현재 주문 현황**: 상세한 통계와 간식 목록 표시
  - 총 주문 건수, 간식 종류, 총 개수, 총 금액
  - 주문별 상세 내역 (날짜, 종류, 개수, 금액)
  - 간식별 썸네일, 제안자, 구매 링크
- **카테고리 관리**: 간식을 카테고리별로 분류 및 필터링
- **간식 목록 관리**: 제안된 모든 간식 확인 및 삭제
- **상소문 관리**: 게시글 및 댓글 삭제
- **공지사항 관리**: 전체 사용자에게 공지 띄우기

### 🎨 사용자 경험

- **실시간 활동 알림**: 간식 조르기 및 주문 생성 시 상단 알림
- **공지사항 배너**: 전체 페이지 상단에 공지사항 표시
- **재미있는 에러 메시지**: 20가지 간식 테마 에러 메시지
- **모달 팝업**: 사용자 친화적인 확인/알림 메시지
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
DATABASE_URL="postgresql://..."  # PostgreSQL 연결 문자열

# 네이버 쇼핑 API (필수)
NAVER_CLIENT_ID="발급받은_클라이언트_ID"
NAVER_CLIENT_SECRET="발급받은_클라이언트_시크릿"

# 관리자 인증
ADMIN_PASSWORD="your-admin-password"
SESSION_SECRET="your-secret-key-change-this-in-production"

# 앱 버전
NEXT_PUBLIC_APP_VERSION="1.0.1"
NEXT_PUBLIC_BUILD_DATE="2025-12-08"
```

#### 데이터베이스 설정

**Neon PostgreSQL 사용 시**:
- Neon Dashboard에서 **Direct Connection URL** 사용 (`-pooler` 제외)
- 예: `postgresql://user:password@ep-xxx.region.aws.neon.tech/dbname?sslmode=require`

### 3. 네이버 API 발급 방법

1. [네이버 개발자 센터](https://developers.naver.com/apps/#/register)에서 애플리케이션 등록
2. **검색** API 선택
3. 발급받은 Client ID와 Secret을 `.env` 파일에 입력

## 📚 기술 스택

- **Frontend**: Next.js 14 (App Router), React 18, TypeScript
- **Styling**: Tailwind CSS
- **Database**: PostgreSQL
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
│   │   ├── announcements/       # 공지사항 API
│   │   ├── auth/                # 인증 관련 API
│   │   ├── comments/            # 댓글 관련 API
│   │   ├── dashboard/           # 대시보드 데이터
│   │   ├── my-snacks/           # 내 간식 주머니
│   │   ├── orders/              # 주문 관련 API
│   │   ├── recommendations/     # 오늘의 추천 간식
│   │   ├── reset-weekly/        # 주간 리셋 API
│   │   ├── search-snacks/       # 네이버 쇼핑 검색
│   │   ├── snacks/              # 간식 관련 API
│   │   ├── suggestions/         # 상소문 관련 API
│   │   ├── trending/            # 트렌딩 간식
│   │   └── weekly-total/        # 주간 주문 현황
│   ├── admin/
│   │   └── announce/            # 공지사항 관리 페이지
│   ├── facker/                  # 관리자 로그인 (숨김 URL)
│   ├── my-snacks/               # 내 간식 주머니 페이지
│   ├── orders/                  # 주문 페이지
│   ├── propose/                 # 간식 제안 페이지
│   ├── snacks/                  # 간식 목록 페이지
│   ├── suggestions/             # 상소문 게시판
│   └── page.tsx                 # 간식 허브 (대시보드)
├── components/
│   ├── ActivityNotification.tsx  # 실시간 활동 알림
│   ├── AnnouncementBanner.tsx   # 공지사항 배너
│   ├── ErrorDisplay.tsx         # 재미있는 에러 페이지
│   ├── FloatingMySnacksButton.tsx  # 내 간식 주머니 플로팅 버튼
│   ├── Footer.tsx               # 푸터 (버전 정보)
│   ├── Modal.tsx                # 모달 팝업 컴포넌트
│   ├── Navigation.tsx           # 네비게이션 바
│   ├── OrderStatusBlock.tsx     # 주문 현황 블록
│   ├── RecommendedSnacks.tsx    # 오늘의 추천 간식
│   ├── Toast.tsx                # 토스트 알림
│   ├── TrendingSnacks.tsx       # 트렌딩 간식 위젯
│   └── WeeklyOrderBanner.tsx    # 주간 주문 배너
├── lib/
│   ├── api-errors.ts            # API 에러 유틸리티
│   ├── auth.ts                  # 인증 유틸리티
│   └── prisma.ts                # Prisma 클라이언트
├── prisma/
│   └── schema.prisma            # 데이터베이스 스키마
├── middleware.ts                # Next.js 미들웨어 (인증)
└── public/                      # 정적 파일
```

## 🗄️ 데이터베이스 스키마

### Snack (간식)
- `id`, `name`, `url`, `imageUrl`, `category`, `price`, `proposedBy`, `createdAt`, `deletedAt`
- 관계: `votes[]`, `orderItems[]`

### Vote (투표)
- `id`, `snackId`, `voterName`, `createdAt`
- 관계: `snack`

### Order (주문)
- `id`, `orderDate`, `totalCost`, `notes`, `status` (PENDING/COMPLETED)
- 관계: `items[]`

### OrderItem (주문 항목)
- `id`, `orderId`, `snackId`, `quantity`
- 관계: `order`, `snack`

### TrendingSnack (트렌딩)
- `id`, `name`, `url`, `imageUrl`, `source`, `rank`, `fetchedAt`

### Suggestion (상소문)
- `id`, `title`, `content`, `authorName`, `createdAt`, `updatedAt`
- 관계: `comments[]`

### Comment (댓글)
- `id`, `content`, `authorName`, `suggestionId`, `parentCommentId`, `createdAt`
- 관계: `suggestion`, `parentComment`, `replies[]`

### Announcement (공지사항)
- `id`, `message`, `createdBy`, `isActive`, `createdAt`, `updatedAt`

## 🎯 사용 가이드

### 일반 사용자

#### 1. 간식 조르기
1. "간식 조르기" 메뉴 클릭
2. **네이버 쇼핑 검색**으로 간식 검색
3. 검색 결과 클릭하면 자동으로 정보 입력
4. "간식 조르기" 버튼 클릭
5. 제안자 이름 자동 저장 (localStorage)

#### 2. 내 간식 주머니
1. 우측 하단 🎒 플로팅 버튼 클릭
2. 자신이 제안한 간식 목록 확인
3. 투표 수와 제안 시간 확인
4. 이름 변경 가능

#### 3. 투표하기
1. "간식 목록" 페이지 방문
2. 원하는 간식의 👍 버튼 클릭
3. 실시간으로 투표 수 업데이트

### 관리자

#### 1. 로그인
1. `/facker` URL 접속 (숨겨진 URL)
2. 관리자 비밀번호 입력
3. 로그인 성공 시 자동 리다이렉트

#### 2. 주문 생성
1. "주문하기" 메뉴 클릭
2. 간식 추가/수정 및 수량 조절
3. 가격 입력 (선택)
4. 메모 입력 (선택)
5. "주문 완료" 버튼 클릭

#### 3. 주문 완료
1. 홈 페이지의 "현재 주문 현황" 확인
2. "✅ 주문 완료" 버튼 클릭
3. PENDING 주문이 COMPLETED로 상태 변경
4. 완료된 주문은 현재 현황에서 숨겨짐
5. 주문 이력 페이지에서 확인 가능

#### 4. 재주문
1. "주문 이력" 페이지에서 과거 주문 확인
2. "🔄 이 주문 다시하기" 버튼 클릭
3. 기존 주문 내역 자동 불러오기
4. 필요시 수정 후 주문 완료

## 🔐 보안 기능

- **숨겨진 로그인 URL**: `/facker`로만 관리자 접근
- **쿠키 기반 세션**: HttpOnly 쿠키로 세션 관리
- **미들웨어 보호**: 관리자 페이지 자동 리다이렉트
- **로그인/로그아웃 알림**: 토스트 및 로딩 오버레이

## 🎨 디자인 특징

- **컬러 팔레트**: 따뜻한 오렌지/크림 톤
- **Pretendard 폰트**: 한글 최적화 폰트
- **모바일 반응형**: 햄버거 메뉴, 플렉시블 레이아웃
- **재미있는 UX**:
  - 20가지 간식 테마 에러 메시지
  - 모달 팝업으로 사용자 피드백
  - 토스트 알림 및 로딩 오버레이
  - 플로팅 버튼 애니메이션

## 📝 배포

### Vercel 배포

1. GitHub 저장소와 Vercel 연결
2. 환경 변수 설정:
   - `DATABASE_URL` (PostgreSQL Pooler Connection - 런타임용)
   - `DIRECT_DATABASE_URL` (PostgreSQL Direct Connection - 마이그레이션용, **필수**)
   - `NAVER_CLIENT_ID`
   - `NAVER_CLIENT_SECRET`
   - `ADMIN_PASSWORD`
   - `SESSION_SECRET`
   - `NEXT_PUBLIC_APP_VERSION`
   - `NEXT_PUBLIC_BUILD_DATE`
3. 자동 배포 활성화
4. `git push` 시 자동 배포

**중요**: Neon PostgreSQL 사용 시
- `DATABASE_URL`: Pooler 연결 (`-pooler` 포함) - 런타임에서 사용
- `DIRECT_DATABASE_URL`: Direct 연결 (`-pooler` 제외) - Prisma migrate에서 사용
- Direct connection은 advisory lock을 지원하므로 마이그레이션에 필수입니다

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

# 버전 업데이트
npm run version:patch  # 1.0.0 → 1.0.1
npm run version:minor  # 1.0.0 → 1.1.0
npm run version:major  # 1.0.0 → 2.0.0
```

## 🆕 최근 업데이트

### v1.0.1 (2025-12-08)

#### 🎨 UI/UX 개선
- **주문 항목 오버플로우 수정**: 주문 생성 페이지에서 긴 간식 이름이 컨테이너를 벗어나는 문제 해결
- **댓글 줄바꿈 표시**: 상소문 댓글에서 개행 문자가 정상적으로 표시되도록 개선
- **주문 이력 전체 표시**: 모든 주문(PENDING, COMPLETED)을 주문 이력 페이지에서 확인 가능
- **주문 상태 배지**: 각 주문의 상태를 시각적으로 구분 (✅ 완료, ⏳ 대기중)

#### 📊 현재 주문 현황 대폭 개선
- **통계 요약 카드 추가**:
  - 총 주문 건수 (파란색)
  - 간식 종류 (보라색)
  - 총 주문 개수 (주황색)
  - 총 금액 (녹색)
- **주문 상세 내역**: 각 주문별 날짜, 종류, 개수, 금액, 메모 표시
- **간식 목록 개선**: 수량 기준 정렬, 여러 주문 포함 여부 표시

#### 🍪 간식 카드 개선
- **썸네일 이미지 표시**: 간식의 실제 이미지 표시
- **제안자 정보**: 누가 조르기한 간식인지 표시
- **구매 링크**: 클릭 시 구매 페이지로 바로 이동
- **호버 효과**: 마우스 오버 시 시각적 피드백

#### 🔧 주문 상태 관리
- Order 모델에 `status` 필드 추가 (PENDING, COMPLETED)
- 주문 완료 시 PENDING → COMPLETED 상태 변경
- 간식 및 투표 데이터 보존 (삭제하지 않음)

### v1.0.0 (2025-12-01)
- 📜 상소문 게시판 추가 (댓글/대댓글 지원)
- ✅ 주문 완료 기능 추가
- 🗑️ Soft Delete 시스템 구현
- 📊 간식 목록 정렬 기능
- 📢 공지사항 시스템 개선

### v0.12.0 (2025-11-27)
- 🎵 배경음악 플레이어 추가
- 🎁 오늘의 추천 간식 기능
- 📊 인기 간식 Top 5 주간 집계
- 🔥 트렌딩 간식 검색 개선

### v0.11.0 (2025-11-26)
- 🗳️ 투표 기능 오픈
- 📊 카테고리 분포 기능
- 📄 이번 주 조르기 목록 페이징
- 🔧 데이터베이스 관리 도구 추가

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

**관리자 로그인**: `/facker`
