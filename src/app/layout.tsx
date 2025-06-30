import type { Metadata } from 'next'
import { Crimson_Text } from 'next/font/google'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { AuthProvider } from '@/contexts/AuthContext'
import { CartProvider } from '@/contexts/CartContext'
import './globals.css'

const crimson = Crimson_Text({
  subsets: ['latin'],
  variable: '--font-crimson',
  weight: ['400', '600', '700'],
  style: ['normal', 'italic'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Palé Hall Art | Curated Fine Art Collection',
  description: 'An exclusive collection of contemporary artworks curated by Joanna at the distinguished Palé Hall. Discover exceptional pottery, sculpture, and fine art from renowned and emerging artists.',
  keywords: 'luxury art gallery, Palé Hall, curated art collection, contemporary art, Welsh artists, fine pottery, sculpture, art acquisition',
  openGraph: {
    title: 'Palé Hall Art | Curated Fine Art Collection',
    description: 'An exclusive collection of contemporary artworks curated by Joanna at the distinguished Palé Hall.',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${crimson.variable}`}>
      <head>
        <link
          rel="preload"
          href="/fonts/Francie Serif/Francie Serif.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
      </head>
      <body className="relative">
        <AuthProvider>
          <CartProvider>
            <Header />
            <main className="pt-20 lg:pt-24">
              {children}
            </main>
            <Footer />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  )
}