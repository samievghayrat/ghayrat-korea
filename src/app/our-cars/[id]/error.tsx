'use client';
import Link from 'next/link';
import { useApp } from '@/contexts/AppContext';

export default function OwnCarError({ reset }: { reset: () => void }) {
  const { t } = useApp();
  return <div className="mx-auto max-w-xl px-4 py-16 text-center" role="alert">
    <h1 className="text-xl font-semibold">{t('own.unavailable')}</h1>
    <button type="button" onClick={reset} className="btn-primary mt-5">{t('own.retry')}</button>
    <Link href="/our-cars" className="mt-5 block text-sm text-gray-500">{t('own.back')}</Link>
  </div>;
}
