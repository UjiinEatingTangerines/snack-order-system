export default function Footer() {
  const version = process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0'
  const buildDate = process.env.NEXT_PUBLIC_BUILD_DATE || new Date().toISOString().split('T')[0]

  return (
    <footer className="mt-12 border-t border-gray-200 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-center md:text-left">
            <p className="text-sm text-gray-600">
              Made with ❤️ by{' '}
              <span className="font-semibold text-orange-600">김현우</span>
            </p>
            <p className="text-xs text-gray-500 mt-1">
              회사 간식 주문을 더 쉽고 재미있게
            </p>
          </div>

          <div className="text-center md:text-right">
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded font-mono">
                v{version}
              </span>
              <span>•</span>
              <span>{buildDate}</span>
            </div>
            <div className="flex items-center gap-3 mt-2">
              <a
                href="https://github.com/UjiinEatingTangerines/snack-order-system"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-gray-600 hover:text-orange-600 transition-colors"
              >
                GitHub
              </a>
              <span className="text-gray-300">•</span>
              <span className="text-xs text-gray-500">
                Built with Next.js + TypeScript
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
