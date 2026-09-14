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

  if (pathname.startsWith('/admin') || /^\/(?:catalog|auction)\/[^/]+/.test(pathname)) return null;

  const isHome = pathname === '/' || pathname === '/catalog';
  const isFav = pathname === '/favorites';
  const isAuction = pathname.startsWith('/auction');

  const navLinks = [
    { href: '/', label: t('nav.catalog') },
    { href: '/auction', label: t('nav.auction') },
    { href: '/how-to-buy', label: t('nav.howToBuy') },
    { href: '/about', label: t('nav.about') },
    { href: '/contacts', label: t('nav.contacts') },
  ];

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 lg:hidden">
        <div className="flex h-14 max-w-lg items-center justify-around mx-auto">
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
            href="/favorites"
            className={`relative flex flex-col items-center gap-0.5 px-2 py-1 ${isFav ? 'text-primary' : 'text-gray-400'}`}
          >
            <div className="relative">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              {favCount > 0 && (
                <span className="absolute -top-1.5 -right-2.5 bg-red-500 text-white text-[9px] font-bold min-w-[16px] h-4 rounded-full flex items-center justify-center px-1">
                  {favCount}
                </span>
              )}
            </div>
            <span className="text-[10px] font-medium">{t('nav.favorites')}</span>
          </Link>

          <a
            href="https://wa.me/821099221601"
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center gap-0.5 px-2 py-1 text-emerald-600"
          >
            <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M.057 24l1.687-6.163A11.87 11.87 0 0 1 .157 11.89C.16 5.335 5.495 0 12.05 0a11.82 11.82 0 0 1 8.413 3.488A11.82 11.82 0 0 1 23.943 11.9c-.003 6.557-5.338 11.892-11.893 11.892a11.9 11.9 0 0 1-5.688-1.448L.057 24zm6.597-3.807a9.86 9.86 0 0 0 5.392 1.592c5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981z" />
            </svg>
            <span className="text-[10px] font-medium">WhatsApp</span>
          </a>

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
