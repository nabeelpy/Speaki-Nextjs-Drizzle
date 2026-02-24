import React from "react"
import type { Metadata } from 'next'
import { Lexend } from 'next/font/google'

import './globals.css'

const lexend = Lexend({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Speaking Practice - Master English with AI',
  description: 'AI-powered English speaking practice with real-time debates and conversations',
  viewport: 'width=device-width, initial-scale=1.0',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="light">
      <body className={`${lexend.className} bg-[#f6f7f8] dark:bg-[#101922] text-[#0d141b] dark:text-slate-100 min-h-screen antialiased`}>{children}</body>
    </html>
  )
}
