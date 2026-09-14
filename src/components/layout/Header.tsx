'use client';

import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { useApp } from '@/contexts/AppContext';
import type { Lang, Currency } from '@/lib/i18n';

const LANGUAGES: { code: Lang; label: string; flag: string }[] = [
  { code: 'ru', label: 'Русский', flag: '🇷🇺' },
  { code: 'en', label: 'English', flag: '🇺🇸' },
  { code: 'tj', label: 'Тоҷикӣ', flag: '🇹🇯' },
  { code: 'uz', label: "O'zbek", flag: '🇺🇿' },
];

const CURRENCIES: { code: Currency; label: string; symbol: string }[] = [
  { code: 'USD', label: 'USD', symbol: '$' },
  { code: 'RUB', label: 'RUB', symbol: '₽' },
  { code: 'TJS', label: 'TJS', symbol: 'с.' },
  { code: 'KRW', label: 'KRW', symbol: '₩' },
];

export default function Header() {
  const { lang, setLang, currency, setCurrency, t } = useApp();
  const [favCount, setFavCount] = useState(0);
  const [langOpen, setLangOpen] = useState(false);
  const [currOpen, setCurrOpen] = useState(false);
  const langRef = useRef<HTMLDivElement>(null);
  const currRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

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

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (langRef.current && !langRef.current.contains(e.target as Node)) {
        setLangOpen(false);
      }
      if (currRef.current && !currRef.current.contains(e.target as Node)) {
        setCurrOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const currentLang = LANGUAGES.find(l => l.code === lang) || LANGUAGES[0];
  const currentCurr = CURRENCIES.find(c => c.code === currency) || CURRENCIES[0];

  const navLinks = [
    { href: '/', label: t('nav.catalog') },
    { href: '/auction', label: t('nav.auction') },
    { href: '/how-to-buy', label: t('nav.howToBuy') },
    { href: '/about', label: t('nav.about') },
    { href: '/contacts', label: t('nav.contacts') },
  ];

  if (pathname.startsWith('/admin')) return null;

  return (
    <header className="sticky top-0 z-50 border-b border-emerald-100 bg-white/95 shadow-[0_6px_24px_-20px_rgba(5,150,105,0.8)] backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-12 lg:h-14">
          <Link href="/" className="group flex flex-col leading-tight flex-shrink-0">
            <span className="bg-gradient-to-r from-emerald-800 to-teal-600 bg-clip-text text-lg font-extrabold tracking-wide text-transparent">GHAYRAT</span>
            <span className="flex items-center gap-1.5 text-[11px] font-medium text-gray-500">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-400 transition-transform group-hover:scale-125" />
              {t('brand.subtitle')} 🇰🇷
            </span>
          </Link>

          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href))
                    ? link.href === '/auction'
                      ? 'bg-red-50 text-red-700'
                      : 'bg-primary/10 text-primary'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-1">
            {/* Currency switcher */}
            <div className="relative" ref={currRef}>
              <button
                onClick={() => { setCurrOpen(!currOpen); setLangOpen(false); }}
                className="flex items-center gap-1 rounded-lg p-2 text-sm text-gray-600 transition-colors hover:bg-emerald-50 hover:text-emerald-800"
              >
                <span className="text-xs font-bold">{currentCurr.symbol}</span>
                <span className="hidden lg:inline text-xs font-medium">{currentCurr.label}</span>
                <svg className={`w-3 h-3 transition-transform ${currOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {currOpen && (
                <div className="absolute right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-50 min-w-[120px]">
                  {CURRENCIES.map((c) => (
                    <button
                      key={c.code}
                      onClick={() => { setCurrency(c.code); setCurrOpen(false); }}
                      className={`w-full flex items-center gap-2 px-3 py-2 text-sm transition-colors text-left ${
                        currency === c.code ? 'bg-primary/5 text-primary font-medium' : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <span className="font-bold w-4 text-center">{c.symbol}</span>
                      {c.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Language switcher */}
            <div className="relative" ref={langRef}>
              <button
                onClick={() => { setLangOpen(!langOpen); setCurrOpen(false); }}
                className="flex items-center gap-1 rounded-lg p-2 text-sm text-gray-600 transition-colors hover:bg-sky-50 hover:text-sky-800"
              >
                <span className="text-base leading-none">{currentLang.flag}</span>
                <svg className={`w-3 h-3 transition-transform ${langOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {langOpen && (
                <div className="absolute right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-50 min-w-[140px]">
                  {LANGUAGES.map((l) => (
                    <button
                      key={l.code}
                      onClick={() => { setLang(l.code); setLangOpen(false); }}
                      className={`w-full flex items-center gap-2 px-3 py-2 text-sm transition-colors text-left ${
                        lang === l.code ? 'bg-primary/5 text-primary font-medium' : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <span className="text-base leading-none">{l.flag}</span>
                      {l.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Favorites */}
            <Link
              href="/favorites"
              className="relative rounded-lg p-2 text-gray-600 transition-colors hover:bg-rose-50 hover:text-rose-600"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              {favCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-primary text-white text-[10px] font-bold min-w-[16px] h-[16px] rounded-full flex items-center justify-center px-1">
                  {favCount}
                </span>
              )}
            </Link>

            {/* Telegram CTA -- desktop only */}
            <a
              href="https://t.me/ghayrat_korea"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden lg:inline-flex btn-primary text-sm py-2.5 px-6"
            >
              {t('nav.writeManager')}
            </a>
          </div>
        </div>
      </div>
    </header>
  );
}
