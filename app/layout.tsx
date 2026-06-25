import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
// 1. Import your new clean custom provider wrapper instead
import { GoogleMapsProvider } from '@/components/google-maps-provider'

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] })
const geistMono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'] })


export const metadata = {
  title: 'Vancity Sippy',
  description: 'Share your local drink spots',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      {/* Add font-sans right here next to the variables */}
      <body className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased`}>
        <GoogleMapsProvider>
          {children}
        </GoogleMapsProvider>
      </body>
    </html>
  )
}