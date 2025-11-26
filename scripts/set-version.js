const fs = require('fs')
const path = require('path')

// package.json에서 버전 읽기
const packageJson = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../package.json'), 'utf8')
)

// 현재 날짜
const buildDate = new Date().toISOString().split('T')[0]

// .env.production 파일 생성
const envContent = `NEXT_PUBLIC_APP_VERSION=${packageJson.version}
NEXT_PUBLIC_BUILD_DATE=${buildDate}
`

fs.writeFileSync(
  path.join(__dirname, '../.env.production'),
  envContent
)

console.log(`✅ Version set to ${packageJson.version} (${buildDate})`)
