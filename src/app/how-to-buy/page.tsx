import type { Metadata } from 'next';
import HowToBuyContent from '@/components/pages/HowToBuyContent';

export const metadata: Metadata = {
  title: 'Как купить авто из Кореи',
  description: 'Пошаговая инструкция по покупке автомобиля из Южной Кореи с доставкой.',
};

export default function HowToBuyPage() {
  return <HowToBuyContent />;
}
