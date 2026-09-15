import type { Metadata } from 'next';
import { Roboto } from 'next/font/google';
import { Analytics } from '@vercel/analytics/next';
import './globals.css';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import BottomNav from '@/components/layout/BottomNav';
import FloatingContact from '@/components/shared/FloatingContact';
import { AppProvider } from '@/contexts/AppContext';

const roboto = Roboto({
  subsets: ['latin', 'cyrillic'],
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://ghayrat.vercel.app'),
  title: {
    default: 'GHAYRAT — Авто из Кореи',
    template: '%s | GHAYRAT',
  },
  description: 'Автомобили из Кореи с проверкой, расчётом и доставкой в Россию и Таджикистан.',
  keywords: ['авто из Кореи', 'купить авто из Кореи', 'Encar', 'KCar', 'доставка авто'],
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    locale: 'ru_RU',
    url: '/',
    siteName: 'GHAYRAT KOREA',
    title: 'GHAYRAT — Авто из Кореи',
    description: 'Выберите автомобиль, получите расчёт и закажите доставку в свой город.',
  },
  twitter: {
    card: 'summary',
    title: 'GHAYRAT — Авто из Кореи',
    description: 'Каталог Encar и KCar с расчётом доставки.',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru">
      <head>
        <link rel="preconnect" href="https://ci.encar.com" />
        <link rel="dns-prefetch" href="https://ci.encar.com" />
      </head>
      <body className={`${roboto.className} antialiased`}>
        <AppProvider>
          <Header />
          <main className="min-h-screen pb-16 lg:pb-0">{children}</main>
          <Footer />
          <BottomNav />
          <FloatingContact />
          <Analytics />
        </AppProvider>
      </body>
    </html>
  );
}
