# Vercel 배포 가이드

## 1단계: Vercel에 배포

1. https://vercel.com 접속 후 GitHub 로그인
2. "Add New Project" 클릭
3. `snack-order-system` 레포지토리 선택
4. **아직 Deploy 버튼을 누르지 마세요!**

## 2단계: Vercel Postgres 데이터베이스 생성

1. Vercel 프로젝트 설정 페이지에서 **Storage** 탭 클릭
2. **Create Database** 클릭
3. **Postgres** 선택
4. 데이터베이스 이름 입력 (예: `snack-order-db`)
5. **Create** 클릭

## 3단계: 환경 변수 자동 설정

Vercel Postgres를 생성하면 자동으로 다음 환경 변수가 설정됩니다:
- `POSTGRES_URL`
- `POSTGRES_PRISMA_URL` ← **이것을 사용합니다**
- `POSTGRES_URL_NON_POOLING`

### 추가 환경 변수 설정 (선택)

네이버 쇼핑 API를 사용하려면:

1. **Settings** → **Environment Variables** 탭
2. 다음 변수 추가:
   ```
   NAVER_CLIENT_ID=발급받은_클라이언트_ID
   NAVER_CLIENT_SECRET=발급받은_클라이언트_시크릿
   ```

## 4단계: DATABASE_URL 환경 변수 설정

1. **Settings** → **Environment Variables** 탭
2. **Add** 클릭
3. 다음 입력:
   - **Key**: `DATABASE_URL`
   - **Value**: `${POSTGRES_PRISMA_URL}` (그대로 입력)
   - **Environment**: Production, Preview, Development 모두 선택

## 5단계: 배포

1. **Deployments** 탭으로 이동
2. **Redeploy** 버튼 클릭 (또는 처음이라면 **Deploy**)
3. 배포 완료 대기 (약 2-3분)

## 6단계: 데이터베이스 마이그레이션

배포가 완료된 후, 로컬에서 Vercel Postgres에 마이그레이션 실행:

```bash
# Vercel CLI 설치 (아직 안 했다면)
npm i -g vercel

# Vercel 환경 변수 가져오기
vercel env pull

# 마이그레이션 실행
npx prisma migrate deploy
```

또는 Vercel 대시보드에서:
1. **Storage** → 생성한 Postgres 클릭
2. **Query** 탭에서 SQL 직접 실행 가능

## 7단계: 배포 확인

배포된 URL 접속 (예: `https://snack-order-system.vercel.app`)

## 로컬 개발 환경

로컬에서는 계속 SQLite를 사용하려면:

```bash
# .env.local 파일 생성
DATABASE_URL="file:./dev.db"
```

`.env.local`은 로컬 환경에서만 사용되고, Vercel에서는 환경 변수를 사용합니다.

## 문제 해결

### Prisma Client 오류
```
Error: Prisma has detected that this project was built on Vercel...
```

→ `vercel.json`에 `buildCommand`가 설정되어 있는지 확인

### 데이터베이스 연결 오류
```
Error: Can't reach database server
```

→ `DATABASE_URL` 환경 변수가 `${POSTGRES_PRISMA_URL}`로 설정되어 있는지 확인

### 마이그레이션 오류

→ Vercel 대시보드 → Storage → Query 탭에서 직접 테이블 생성 가능
