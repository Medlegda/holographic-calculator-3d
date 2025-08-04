import type React from "react"
import type { Metadata, Viewport } from "next"
import { Inter } from "next/font/google"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Holographic Calculator - The Future of Math",
  description:
    "Experience the world's first 3D holographic calculator with stunning visual effects and magical interactions.",
  keywords: ["calculator", "3D", "holographic", "interactive", "math", "futuristic"],
  authors: [{ name: "Ahsan Khizar", url: "https://github.com/ahsankhizar5" }],
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  )
}
