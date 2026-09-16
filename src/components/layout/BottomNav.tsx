'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import MobileMenu from './MobileMenu';
import { useApp } from '@/contexts/AppContext';

export default function BottomNav() {
  const pathname = usePathname();
  const { t } = useApp();
  const [favCount, setFavCount] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const updateCount = () => {
      try {
        const favs = JSON.parse(localStorage.getItem('favorites') || '[]');
        setFavCount(favs.length);
      } catch {
        setFavCount(0);
      }
    };
    updateCount();
    window.addEventListener('storage', updateCount);
    window.addEventListener('favoritesUpdated', updateCount);
    return () => {
      window.removeEventListener('storage', updateCount);
      window.removeEventListener('favoritesUpdated', updateCount);
    };
  }, []);

  if (pathname.startsWith('/admin') || /^\/(?:catalog|auction|our-cars|damaged-cars)\/[^/]+/.test(pathname)) return null;

  const isHome = pathname === '/' || pathname === '/catalog';
  const isAuction = pathname.startsWith('/auction');
  const isDamaged = pathname.startsWith('/damaged-cars');
  const isOwn = pathname.startsWith('/our-cars');

  const navLinks = [
    { href: '/', label: t('nav.catalog') },
    { href: '/auction', label: t('nav.auction') },
    { href: '/damaged-cars', label: t('damaged.title') },
    { href: '/our-cars', label: t('nav.ourCars') },
    { href: '/how-to-buy', label: t('nav.howToBuy') },
    { href: '/about', label: t('nav.about') },
    { href: '/contacts', label: t('nav.contacts') },
  ];

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 pb-[env(safe-area-inset-bottom)] lg:hidden">
        <div className="grid h-14 max-w-lg grid-cols-5 items-center mx-auto">
          <Link
            href="/"
            className={`flex flex-col items-center gap-0.5 px-2 py-1 ${isHome ? 'text-primary' : 'text-gray-400'}`}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
            <span className="text-[10px] font-medium">{t('nav.catalog')}</span>
          </Link>

          <Link
            href="/auction"
            className={`flex flex-col items-center gap-0.5 px-2 py-1 ${isAuction ? 'text-primary' : 'text-gray-400'}`}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 13h18M5 13l2-5h10l2 5M7 13v5m10-5v5M6 18h12M8 8V6h8v2" />
            </svg>
            <span className="text-[10px] font-medium">{t('nav.auction')}</span>
          </Link>

          <Link
            href="/our-cars"
            aria-current={isOwn ? 'page' : undefined}
            className={`flex min-h-11 flex-col items-center justify-center gap-0.5 px-1 py-1 ${isOwn ? 'text-primary' : 'text-gray-400'}`}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 13l2-6h14l2 6v6h-3v-3H6v3H3v-6zm0 0h18M7 10h10M6 13v1m12-1v1" />
            </svg>
            <span className="text-[10px] font-medium">{t('nav.ourCars')}</span>
          </Link>

          <Link
            href="/damaged-cars"
            aria-current={isDamaged ? 'page' : undefined}
            className={`flex min-h-11 flex-col items-center justify-center gap-0.5 px-1 py-1 ${isDamaged ? 'text-primary' : 'text-gray-400'}`}
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 13l2-6h14l2 6v6h-3v-3H6v3H3v-6zm0 0h18M7 10h4m4 0h2m-5-5-1.5 3H13l-1 3 2 2" />
            </svg>
            <span className="max-w-full truncate text-[10px] font-medium">{t('damaged.title')}</span>
          </Link>

          <button
            onClick={() => setMenuOpen(true)}
            className="flex flex-col items-center gap-0.5 px-2 py-1 text-gray-400"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
            <span className="text-[10px] font-medium">{t('nav.menu')}</span>
          </button>
        </div>
      </div>

      <MobileMenu isOpen={menuOpen} onClose={() => setMenuOpen(false)} links={navLinks} favCount={favCount} />
    </>
  );
}
