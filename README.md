# 🍪 간식 주문 시스템

회사 간식 주문을 효율적으로 관리하는 웹 애플리케이션입니다.

## ✨ 주요 기능

- **간식 제안**: 직원들이 원하는 간식을 이름과 구매 링크로 제안
- **투표 시스템**: 제안된 간식에 투표하여 인기도 측정
- **실시간 대시보드**: 인기 간식 Top 5와 최근 제안 확인
- **트렌딩 간식**: 네이버 쇼핑 API로 현재 인기있는 간식 추천
- **주문 생성**: 투표 결과를 바탕으로 주문 목록 작성
- **주문 이력**: 과거 주문 내역 조회 및 재주문
- **카테고리 필터**: 간식을 카테고리별로 분류 및 필터링

## 🚀 시작하기

### 1. 프로젝트 설정

```bash
# 의존성 설치
npm install

# Prisma 마이그레이션
npx prisma migrate dev

# 개발 서버 실행
npm run dev
```

브라우저에서 http://localhost:3000 접속

### 2. 네이버 API 설정 (선택)

트렌딩 간식 기능을 사용하려면:

1. [네이버 개발자 센터](https://developers.naver.com/apps/#/register)에서 애플리케이션 등록
2. 검색 API 선택
3. `.env` 파일 수정:

```env
NAVER_CLIENT_ID="발급받은_클라이언트_ID"
NAVER_CLIENT_SECRET="발급받은_클라이언트_시크릿"
```

## 📚 기술 스택

- **Frontend**: Next.js 14, React, TypeScript
- **Styling**: Tailwind CSS
- **Database**: SQLite (Prisma ORM)
- **API**: Next.js API Routes
- **External API**: Naver Shopping API

## 📁 프로젝트 구조

```
snack-order-system/
├── app/
│   ├── api/                 # API 라우트
│   │   ├── snacks/         # 간식 관련 API
│   │   ├── orders/         # 주문 관련 API
│   │   └── trending/       # 트렌딩 API
│   ├── orders/             # 주문 페이지
│   ├── propose/            # 간식 제안 페이지
│   ├── snacks/             # 간식 목록 페이지
│   └── page.tsx            # 대시보드
├── components/
│   └── Navigation.tsx      # 네비게이션 바
├── lib/
│   └── prisma.ts          # Prisma 클라이언트
├── prisma/
│   └── schema.prisma      # 데이터베이스 스키마
└── public/                # 정적 파일
```

## 🗄️ 데이터베이스 스키마

### Snack (간식)
- 이름, URL, 이미지, 카테고리, 제안자

### Vote (투표)
- 간식 ID, 투표자 이름

### Order (주문)
- 주문 날짜, 총 비용, 메모

### OrderItem (주문 항목)
- 주문 ID, 간식 ID, 수량

### TrendingSnack (트렌딩)
- 이름, URL, 이미지, 출처, 순위

## 🎯 사용 가이드

### 간식 제안하기
1. 네비게이션에서 "간식 제안" 클릭
2. 간식 이름과 구매 링크 입력 (필수)
3. 카테고리, 이미지, 제안자 입력 (선택)
4. "간식 제안하기" 버튼 클릭

### 투표하기
1. "간식 목록" 페이지 방문
2. 원하는 간식의 👍 버튼 클릭
3. 실시간으로 투표 수 업데이트

### 주문 생성하기
1. "주문하기" 메뉴 클릭
2. 자동으로 투표 상위 간식이 추가됨
3. 수량 조절 및 간식 추가/제거
4. 메모 입력 (선택)
5. "주문 완료" 버튼 클릭

### 재주문하기
1. "주문 이력" 페이지에서 과거 주문 확인
2. "🔄 이 주문 다시하기" 버튼 클릭
3. 기존 주문 내역이 자동으로 불러와짐
4. 필요시 수정 후 주문 완료

## 🔧 추가 기능 아이디어

- [ ] 투표 기한 설정 (매주 일요일 자정까지)
- [ ] 예산 관리 기능
- [ ] 간식 피드백/별점 시스템
- [ ] 이메일/슬랙 알림
- [ ] 사용자 인증 (간단한 PIN 코드)
- [ ] 주문 상태 추적
- [ ] 간식 통계 대시보드
- [ ] 엑셀/CSV 내보내기

## 📝 배포

### Vercel 배포

```bash
# Vercel CLI 설치
npm i -g vercel

# 배포
vercel --prod
```

### 환경 변수 설정
Vercel 대시보드에서 다음 환경 변수 설정:
- `DATABASE_URL` (Vercel Postgres 사용 시 자동 설정)
- `NAVER_CLIENT_ID`
- `NAVER_CLIENT_SECRET`

## 🤝 기여하기

이슈 제보나 기능 제안은 언제든 환영합니다!

## 📄 라이선스

MIT License
