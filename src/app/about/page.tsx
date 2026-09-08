import type { Metadata } from 'next';
import AboutContent from '@/components/pages/AboutContent';

export const metadata: Metadata = {
  title: 'О компании',
  description: 'GHAYRAT KOREA — подбор, проверка и доставка автомобилей из Южной Кореи.',
};

export default function AboutPage() {
  return <AboutContent />;
}
