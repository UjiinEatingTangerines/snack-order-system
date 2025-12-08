#!/bin/bash

# Set version
node scripts/set-version.js

# Prisma migrate는 direct connection 필요 (pooler는 advisory lock 미지원)
# DIRECT_DATABASE_URL 환경 변수가 있으면 사용, 없으면 DATABASE_URL 사용
if [ -n "$DIRECT_DATABASE_URL" ]; then
  echo "🔗 Using direct database connection for migrations..."
  DATABASE_URL=$DIRECT_DATABASE_URL npx prisma migrate deploy
else
  echo "⚠️  DIRECT_DATABASE_URL not set, using DATABASE_URL"
  npx prisma migrate deploy
fi

# Generate Prisma Client (pooler URL 사용 가능)
npx prisma generate

# Build Next.js
next build
