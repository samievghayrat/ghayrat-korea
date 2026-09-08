'use client';

import { useApp } from '@/contexts/AppContext';
import { ERROR_COPY } from '@/lib/page-copy';

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const { lang } = useApp();
  const copy = ERROR_COPY[lang];
  return (
    <div className="max-w-7xl mx-auto px-4 py-20 text-center">
      <h1 className="text-2xl font-bold text-gray-900 mb-4">
        {copy.title}
      </h1>
      <p className="text-gray-500 mb-8">
        {copy.text}
      </p>
      <button onClick={reset} className="btn-primary">
        {copy.retry}
      </button>
    </div>
  );
}
