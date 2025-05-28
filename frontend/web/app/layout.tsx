import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'EverKind - AI Therapeutic Voice Assistant',
  description: 'Accessible, evidence-based CBT therapy through low-latency voice AI',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="min-h-screen bg-therapeutic-background">
          {children}
        </div>
      </body>
    </html>
  )
} 