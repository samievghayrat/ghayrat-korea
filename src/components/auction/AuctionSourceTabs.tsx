'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useApp } from '@/contexts/AppContext';

export default function AuctionSourceTabs() {
  const pathname = usePathname();
  const { t } = useApp();
  return (
    <nav aria-label={t('nav.auction')} className="mb-4 flex gap-1 rounded-xl border border-gray-200 bg-white p-1">
      {[{ href: '/auction', label: t('nav.auction') }, { href: '/damaged-cars', label: t('damaged.title') }].map(tab => (
        <Link key={tab.href} href={tab.href} prefetch={false} aria-current={pathname.startsWith(tab.href) ? 'page' : undefined}
          className={`flex min-h-11 flex-1 items-center justify-center rounded-lg px-3 py-2 text-sm font-semibold transition ${pathname.startsWith(tab.href) ? 'bg-primary/10 text-primary' : 'text-gray-500 hover:bg-gray-50'}`}>
          {tab.label}
        </Link>
      ))}
    </nav>
  );
}
