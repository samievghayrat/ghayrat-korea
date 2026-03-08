'use client';

import Link from 'next/link';
import { useApp } from '@/contexts/AppContext';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  links: { href: string; label: string }[];
  favCount: number;
}

export default function MobileMenu({ isOpen, onClose, links, favCount }: MobileMenuProps) {
  const { t } = useApp();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 md:hidden">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className="fixed right-0 top-0 h-full w-72 bg-white shadow-xl">
        <div className="flex items-center justify-between p-4 border-b">
          <span className="text-lg font-bold text-primary">{t('nav.menu')}</span>
          <button onClick={onClose} className="text-gray-500" aria-label={t('nav.closeMenu')}>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <nav className="flex flex-col p-4 space-y-1">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={onClose}
              className="px-4 py-3 rounded-lg text-gray-700 hover:bg-primary-50 hover:text-primary font-medium transition-colors"
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/favorites"
            onClick={onClose}
            className="px-4 py-3 rounded-lg text-gray-700 hover:bg-primary-50 hover:text-primary font-medium transition-colors flex items-center justify-between"
          >
            <span>{t('nav.favorites')}</span>
            {favCount > 0 && (
              <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">{favCount}</span>
            )}
          </Link>
        </nav>
      </div>
    </div>
  );
}
