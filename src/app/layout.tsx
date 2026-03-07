import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import FloatingContact from '@/components/shared/FloatingContact';

const inter = Inter({ subsets: ['latin', 'cyrillic'] });

export const metadata: Metadata = {
  title: {
    default: 'GHAYRAT KOREA — Автомобили из Кореи',
    template: '%s | GHAYRAT KOREA',
  },
  description: 'Автомобили из Южной Кореи с доставкой в Россию. Каталог авто с аукционов Кореи, расчет стоимости под ключ.',
  keywords: ['автомобили из кореи', 'авто из кореи', 'купить машину из кореи', 'encar', 'корейские авто'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru">
      <body className={`${inter.className} antialiased`}>
        <Header />
        <main className="min-h-screen">{children}</main>
        <Footer />
        <FloatingContact />
      </body>
    </html>
  );
}
