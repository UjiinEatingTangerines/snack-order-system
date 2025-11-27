import type { Metadata } from 'next'
import './globals.css'
import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'
import WeeklyOrderBanner from '@/components/WeeklyOrderBanner'
import FloatingMySnacksButton from '@/components/FloatingMySnacksButton'
import FloatingVoteButton from '@/components/FloatingVoteButton'
import ActivityNotification from '@/components/ActivityNotification'
import AnnouncementBanner from '@/components/AnnouncementBanner'

export const metadata: Metadata = {
  title: 'YUM.GG',
  description: '회사 간식 주문을 쉽고 재미있게',
  icons: {
    icon: [
      {
        url: 'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🍪</text></svg>',
      }
    ]
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <head>
        <link rel="preconnect" href="https://cdn.jsdelivr.net" />
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css"
        />
      </head>
      <body className="bg-cream-50 min-h-screen flex flex-col font-pretendard">
        <ActivityNotification />
        <WeeklyOrderBanner />
        <AnnouncementBanner />
        <Navigation />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1">
          {children}
        </main>
        <Footer />
        <FloatingVoteButton />
        <FloatingMySnacksButton />
      </body>
    </html>
  )
}
