import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import BottomNav from '@/components/layout/BottomNav';
import FloatingContact from '@/components/shared/FloatingContact';
import { AppProvider } from '@/contexts/AppContext';

const inter = Inter({ subsets: ['latin', 'cyrillic'] });

export const metadata: Metadata = {
  title: {
    default: 'GHAYRAT KOREA — Cars from Korea',
    template: '%s | GHAYRAT KOREA',
  },
  description: 'Cars from South Korea with delivery. Catalog of cars from Korean auctions, turnkey cost calculation.',
  keywords: ['cars from korea', 'buy car from korea', 'encar', 'korean cars'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru">
      <body className={`${inter.className} antialiased`}>
        <AppProvider>
          <Header />
          <main className="min-h-screen pb-16 lg:pb-0">{children}</main>
          <Footer />
          <BottomNav />
          <FloatingContact />
        </AppProvider>
      </body>
    </html>
  );
}
