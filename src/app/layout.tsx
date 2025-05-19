import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { appWithTranslation } from 'next-i18next'
import { useTranslation } from 'next-i18next'
import LanguageSwitcher from '@/components/language-switcher'
import './globals.css'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin']
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin']
})

export const metadata: Metadata = {
  title: 'Meeting Minutes Generator',
  description: 'Generate meeting minutes from Microsoft Teams recordings and transcripts'
}

function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  const { t } = useTranslation('common');

  return (
    <html lang="en" className="dark">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <div className="min-h-screen bg-background">
          <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-14 items-center">
              <div className="mr-4 flex">
                <a href="/" className="mr-6 flex items-center space-x-2">
                  <span className="font-bold">{t('app.title')}</span>
                </a>
              </div>
              <nav className="flex items-center space-x-4 lg:space-x-6">
                <a href="/" className="text-sm font-medium transition-colors hover:text-primary">
                  {t('nav.home')}
                </a>
                <a href="/templates" className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary">
                  {t('nav.templates')}
                </a>
                <a href="/history" className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary">
                  History
                </a>
              </nav>
              <div className="ml-auto flex items-center space-x-4">
                <LanguageSwitcher />
                <a href="/login" className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary">
                  Login
                </a>
              </div>
            </div>
          </header>
          <main className="flex-1">{children}</main>
          <footer className="border-t py-6 md:py-0">
            <div className="container flex flex-col items-center justify-between gap-4 md:h-14 md:flex-row">
              <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
                © {new Date().getFullYear()} {t('app.title')}. All rights reserved.
              </p>
            </div>
          </footer>
        </div>
      </body>
    </html>
  )
}

export default appWithTranslation(RootLayout);
