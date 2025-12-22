# 🗳️ 투표 시스템 문서

## 목차
1. [개요](#개요)
2. [중복 투표 방지 메커니즘](#중복-투표-방지-메커니즘)
3. [투표자 추적 시스템](#투표자-추적-시스템)
4. [관리자 기능](#관리자-기능)
5. [API 참조](#api-참조)
6. [데이터베이스 스키마](#데이터베이스-스키마)

---

## 개요

YUM.GG 간식 주문 시스템의 투표 기능은 사용자들이 제안된 간식에 투표하여 인기도를 측정할 수 있는 기능입니다. 시스템은 중복 투표를 방지하고, 관리자가 투표 내역을 확인할 수 있도록 설계되었습니다.

### 주요 특징
- ✅ 중복 투표 방지 (쿠키 기반)
- ✅ 익명 투표 지원
- ✅ 실시간 투표 수 업데이트
- ✅ 관리자 투표자 추적
- ✅ 투표 이력 데이터베이스 저장

---

## 중복 투표 방지 메커니즘

### 1. 클라이언트 측 검증

사용자가 투표 버튼을 클릭하면 **먼저 클라이언트에서** 중복 투표 여부를 확인합니다.

**위치**: `app/snacks/SnackList.tsx:75-80`

```typescript
const handleVote = async (snackId: string) => {
  // 이미 투표한 간식인지 확인 (클라이언트 측 빠른 체크)
  if (votedSnacks.has(snackId)) {
    alert('이미 투표한 간식입니다.')
    return
  }
  // ... 투표 진행
}
```

**쿠키 로드**: 페이지 로드 시 쿠키에서 투표 이력을 자동으로 불러옵니다.

```typescript
useEffect(() => {
  const getCookie = (name: string) => {
    const value = `; ${document.cookie}`
    const parts = value.split(`; ${name}=`)
    if (parts.length === 2) {
      return parts.pop()?.split(';').shift()
    }
    return null
  }

  const votedSnacksCookie = getCookie('voted_snacks')
  if (votedSnacksCookie) {
    try {
      const voted = JSON.parse(decodeURIComponent(votedSnacksCookie))
      setVotedSnacks(new Set(voted))
    } catch (error) {
      console.error('쿠키 파싱 오류:', error)
    }
  }
}, [])
```

### 2. 서버 측 검증

클라이언트 검증을 통과하더라도 **서버에서 한 번 더** 검증합니다.

**위치**: `app/api/snacks/[id]/vote/route.ts:19-29`

```typescript
// 쿠키에서 이미 투표한 간식 목록 가져오기
const cookieStore = await cookies()
const votedSnacksCookie = cookieStore.get(VOTED_SNACKS_COOKIE)
const votedSnacks: string[] = votedSnacksCookie
  ? JSON.parse(votedSnacksCookie.value)
  : []

// 중복 투표 체크
if (votedSnacks.includes(id)) {
  return apiError(403, '이미 투표한 간식입니다')
}
```

### 3. 쿠키 업데이트

투표가 성공하면 쿠키에 간식 ID를 추가합니다.

```typescript
// 투표한 간식 목록에 추가
votedSnacks.push(id)

// 쿠키 업데이트 (1년 유효)
cookieStore.set(VOTED_SNACKS_COOKIE, JSON.stringify(votedSnacks), {
  httpOnly: false,  // 클라이언트에서도 읽을 수 있도록
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  maxAge: 60 * 60 * 24 * 365,  // 1년
  path: '/',
})
```

### 쿠키 정보

| 속성 | 값 | 설명 |
|------|-----|------|
| 이름 | `voted_snacks` | 쿠키 이름 |
| 형식 | JSON 배열 | `["snackId1", "snackId2", ...]` |
| 유효기간 | 1년 | 365일 동안 유지 |
| HttpOnly | `false` | 클라이언트에서 읽기 가능 |
| Secure | Production만 | HTTPS에서만 전송 (운영 환경) |
| SameSite | `lax` | CSRF 공격 방지 |

---

## 투표자 추적 시스템

### 데이터베이스 저장

모든 투표는 **데이터베이스에 개별 레코드로 저장**됩니다.

**Vote 테이블 구조**:
```prisma
model Vote {
  id        String   @id @default(cuid())
  snackId   String
  snack     Snack    @relation(fields: [snackId], references: [id], onDelete: Cascade)
  voterName String?  // 익명 가능 (현재는 null)
  createdAt DateTime @default(now())

  @@index([snackId])
}
```

### 투표 생성 코드

```typescript
// 투표 생성
const vote = await prisma.vote.create({
  data: {
    snackId: id,
    voterName: voterName || null,  // 현재는 익명(null)
  }
})
```

### 투표 수 집계

```typescript
// 특정 간식의 투표 수 조회
const voteCount = await prisma.vote.count({
  where: { snackId: id }
})
```

---

## 관리자 기능

### 1. 투표자 확인 방법

관리자는 데이터베이스에서 누가 어떤 간식에 투표했는지 확인할 수 있습니다.

#### 방법 A: Prisma Studio 사용

```bash
npx prisma studio
```

1. 브라우저에서 `http://localhost:5555` 접속
2. **Vote** 테이블 선택
3. 모든 투표 레코드 확인 가능

**확인 가능한 정보**:
- `id`: 투표 고유 ID
- `snackId`: 투표한 간식 ID
- `voterName`: 투표자 이름 (현재는 null)
- `createdAt`: 투표 시각

#### 방법 B: 데이터베이스 직접 쿼리

**특정 간식의 모든 투표 조회**:
```sql
SELECT * FROM "Vote"
WHERE "snackId" = '간식ID'
ORDER BY "createdAt" DESC;
```

**투표 수가 많은 간식 순서**:
```sql
SELECT s.name, COUNT(v.id) as vote_count
FROM "Snack" s
LEFT JOIN "Vote" v ON s.id = v."snackId"
GROUP BY s.id, s.name
ORDER BY vote_count DESC;
```

**최근 투표 활동 조회**:
```sql
SELECT v.*, s.name as snack_name
FROM "Vote" v
JOIN "Snack" s ON v."snackId" = s.id
ORDER BY v."createdAt" DESC
LIMIT 20;
```

### 2. 관리자 API 개발 가이드

현재는 관리자용 투표 조회 API가 없지만, 필요시 다음과 같이 구현할 수 있습니다.

**예시: 투표 내역 조회 API**

```typescript
// app/api/admin/votes/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { isAdmin } from '@/lib/auth'

export async function GET(request: Request) {
  // 관리자 권한 확인
  const admin = await isAdmin()
  if (!admin) {
    return NextResponse.json({ error: '권한이 없습니다' }, { status: 403 })
  }

  const { searchParams } = new URL(request.url)
  const snackId = searchParams.get('snackId')

  // 특정 간식의 투표 또는 전체 투표 조회
  const votes = await prisma.vote.findMany({
    where: snackId ? { snackId } : {},
    include: {
      snack: {
        select: {
          name: true,
          imageUrl: true
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    },
    take: 100  // 최대 100개
  })

  return NextResponse.json({ votes })
}
```

### 3. 관리자 대시보드에서 투표 통계 확인

**현재 주문 현황 페이지**에서 각 간식의 투표 수를 확인할 수 있습니다.

- 위치: 홈 페이지 (`/`)
- 컴포넌트: `OrderStatusBlock.tsx`
- 표시 정보: 👍 배지로 투표 수 표시

**간식 목록 페이지**에서도 투표 수를 확인할 수 있습니다.

- 위치: 간식 목록 페이지 (`/snacks`)
- 컴포넌트: `SnackList.tsx`
- 표시 정보: 각 간식 카드에 투표 수 표시

---

## API 참조

### POST `/api/snacks/[id]/vote`

간식에 투표합니다.

**요청**:
```typescript
POST /api/snacks/cm123456/vote
Content-Type: application/json

{
  "voterName": null  // 현재는 익명 투표만 지원
}
```

**응답** (성공):
```json
{
  "vote": {
    "id": "cm789012",
    "snackId": "cm123456",
    "voterName": null,
    "createdAt": "2025-12-22T10:30:00.000Z"
  },
  "voteCount": 5
}
```

**응답** (중복 투표):
```json
{
  "error": "이미 투표한 간식입니다"
}
```
Status: `403 Forbidden`

### DELETE `/api/snacks/[id]/vote`

투표를 취소합니다.

**작동 방식**:
1. 쿠키에서 투표한 간식 목록 확인
2. 해당 간식에 투표하지 않았으면 403 에러 반환
3. 가장 최근 투표 기록 삭제
4. 쿠키에서 해당 간식 ID 제거
5. 업데이트된 투표 수 반환

**요청**:
```typescript
DELETE /api/snacks/cm123456/vote
```

**응답** (성공):
```json
{
  "voteCount": 4
}
```

**응답** (투표하지 않은 경우):
```json
{
  "error": "투표하지 않은 간식입니다"
}
```
Status: `403 Forbidden`

**UI 동작**:
- 투표한 간식의 경우, 투표 버튼이 "✓ [투표수] 취소" 버튼으로 변경됩니다
- 취소 버튼 클릭 시 확인 다이얼로그 표시
- 취소 후 투표 버튼으로 다시 변경되며, 즉시 재투표 가능

---

## 데이터베이스 스키마

### Vote 테이블

| 컬럼 | 타입 | 제약 | 설명 |
|------|------|------|------|
| `id` | String | Primary Key | 투표 고유 ID (cuid) |
| `snackId` | String | Foreign Key | 간식 ID (Snack 테이블 참조) |
| `voterName` | String? | Nullable | 투표자 이름 (현재는 null) |
| `createdAt` | DateTime | Not Null | 투표 생성 시각 |

**인덱스**:
- `snackId`: 간식별 투표 조회 성능 향상

**관계**:
- `snack`: Snack 모델과 1:N 관계
- `onDelete: Cascade`: 간식 삭제 시 관련 투표도 자동 삭제

---

## 보안 고려사항

### 현재 보안 수준

✅ **구현된 보안**:
- 쿠키 기반 중복 투표 방지
- 클라이언트 + 서버 이중 검증
- CSRF 방지 (SameSite: lax)
- HTTPS 강제 (운영 환경)

⚠️ **제한사항**:
- 쿠키 삭제 시 재투표 가능
- 익명 투표만 지원 (사용자 인증 없음)
- IP 기반 제한 없음

### 추가 보안 강화 방법

필요시 다음 방법들을 고려할 수 있습니다:

1. **사용자 인증 추가**
   - 로그인 사용자만 투표 가능
   - `voterName` 대신 `userId` 사용

2. **IP 기반 제한**
   ```typescript
   const ip = request.headers.get('x-forwarded-for') || 'unknown'
   // IP당 투표 횟수 제한
   ```

3. **시간 제한**
   ```typescript
   // 같은 간식에 24시간 내 재투표 방지
   const recentVote = await prisma.vote.findFirst({
     where: {
       snackId: id,
       createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
     }
   })
   ```

---

## 문제 해결

### Q: 투표가 안 돼요!

**A**: 다음 사항을 확인하세요:
1. 이미 투표한 간식인지 확인 (쿠키 확인)
2. 브라우저 쿠키가 활성화되어 있는지 확인
3. 개발자 도구 > 콘솔에서 에러 메시지 확인

### Q: 쿠키를 삭제하면 다시 투표할 수 있나요?

**A**: 네, 현재는 쿠키 기반으로만 중복 투표를 방지하기 때문에 쿠키를 삭제하면 재투표가 가능합니다. 더 강력한 제한이 필요하면 사용자 인증 또는 IP 기반 제한을 추가해야 합니다.

### Q: 관리자가 투표를 삭제할 수 있나요?

**A**: 현재는 UI에서 직접 삭제할 수 없지만, Prisma Studio나 데이터베이스 쿼리를 통해 삭제 가능합니다.

```bash
# Prisma Studio 실행
npx prisma studio

# Vote 테이블에서 직접 삭제
```

---

## 개발 로드맵

### 구현 완료 ✅

- [x] 관리자용 투표 내역 조회 UI (`/admin/votes`)
- [x] 투표자 이름 입력 기능 (선택적)
- [x] 투표 통계 대시보드 (`/votes`)
- [x] 투표 취소 기능 활성화

### 향후 개선 사항

- [ ] 실시간 투표 수 업데이트 (WebSocket)
- [ ] 투표 기간 제한 기능

---

**작성일**: 2025-12-22
**버전**: 2.0.0
**최종 업데이트**: 2025-12-22
**관련 파일**:
- `app/api/snacks/[id]/vote/route.ts`
- `app/snacks/SnackList.tsx`
- `components/OrderStatusBlock.tsx`
- `prisma/schema.prisma`
