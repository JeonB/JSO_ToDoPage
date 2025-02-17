import type { Metadata } from 'next'
import { Geist } from 'next/font/google'
import './globals.css'
import { Noto_Sans_KR } from 'next/font/google'

const notoSansKr = Noto_Sans_KR({ subsets: ['latin'] })
const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: '칸반 보드',
  description: '칸반 보드 과제',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ko">
      <body
        className={`${geistSans.variable} ${notoSansKr.className} bg-white antialiased dark:bg-black`}>
        {children}
      </body>
    </html>
  )
}
