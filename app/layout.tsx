import React from "react"
import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { Toaster } from 'sonner'
import './globals.css'

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: 'Password Manager',
  description: 'Secure, minimal password manager for all your accounts',
  icons: {
    icon: [
      {
        url: '/fav.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: 'fav.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/fav.png',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`font-sans antialiased`} suppressHydrationWarning>
        {children}
        <Toaster
          position="bottom-center"
          toastOptions={{
            className: "!bg-neutral-900 !border-neutral-700 !text-neutral-200 !rounded-lg !shadow-lg",
            duration: 3000,
          }}
        />
        <Analytics />
      </body>
    </html>
  )
}
