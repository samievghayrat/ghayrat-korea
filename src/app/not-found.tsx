'use client';

import Link from 'next/link';
import { useApp } from '@/contexts/AppContext';
import { NOT_FOUND_COPY } from '@/lib/page-copy';

export default function NotFound() {
  const { lang } = useApp();
  const copy = NOT_FOUND_COPY[lang];
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-primary mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">{copy.title}</h2>
        <p className="text-gray-500 mb-8 max-w-md mx-auto">
          {copy.text}
        </p>
        <div className="flex gap-4 justify-center">
          <Link href="/" className="btn-primary">{copy.home}</Link>
        </div>
      </div>
    </div>
  );
}
