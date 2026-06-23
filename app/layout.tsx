import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
// 1. Import your new clean custom provider wrapper instead
import { GoogleMapsProvider } from '@/components/google-maps-provider'

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] })
const geistMono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'] })

export const metadata = {
  title: 'Vancity Sips',
  description: 'Track your local Vancouver drink spots',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {/* 2. Wrap your children safely within the client boundary wrapper */}
        <GoogleMapsProvider>
          {children}
        </GoogleMapsProvider>
      </body>
    </html>
  )
}