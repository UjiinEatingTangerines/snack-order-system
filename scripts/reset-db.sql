-- 데이터베이스 초기화 스크립트
-- 모든 테이블의 데이터를 삭제합니다 (테이블 구조는 유지)

-- 순서 중요: 외래 키 제약 조건 때문에 자식 테이블부터 삭제

-- 1. OrderItem 삭제 (Order와 Snack의 자식)
DELETE FROM "OrderItem";

-- 2. Order 삭제
DELETE FROM "Order";

-- 3. Vote 삭제 (Snack의 자식)
DELETE FROM "Vote";

-- 4. TrendingSnack 삭제
DELETE FROM "TrendingSnack";

-- 5. Snack 삭제 (마지막)
DELETE FROM "Snack";

-- 완료 메시지 (PostgreSQL)
SELECT 'Database reset complete!' as status;
