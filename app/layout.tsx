import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"

const _geist = Geist({
  subsets: ["latin"],
  display: "swap",
  preload: true,
})
const _geistMono = Geist_Mono({
  subsets: ["latin"],
  display: "swap",
  preload: true,
})

export const metadata: Metadata = {
  title: "AI Revolution",
  description: "Join the revolution",
  generator: "v0.app",
  openGraph: {
    title: "AI Revolution",
    description: "Join the revolution",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Revolution",
    description: "Join the revolution",
  },
  icons: {
    icon: [
      {
        url: "/icon-light-32x32.png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/icon-dark-32x32.png",
        media: "(prefers-color-scheme: dark)",
      },
      {
        url: "/icon.svg",
        type: "image/svg+xml",
      },
    ],
    apple: "/apple-icon.png",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://gkbipciso4g0l0uv.public.blob.vercel-storage.com" />
        <link rel="preconnect" href="https://github.com" />
        <link rel="dns-prefetch" href="https://gkbipciso4g0l0uv.public.blob.vercel-storage.com" />
        <link rel="dns-prefetch" href="https://github.com" />
      </head>
      <body className={`font-sans antialiased`}>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
