'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  { href: '/admin', label: 'Дашборд', icon: '📊' },
  { href: '/admin/cars', label: 'Автомобили', icon: '🚗' },
  { href: '/admin/messages', label: 'Сообщения', icon: '📩' },
  { href: '/admin/settings', label: 'Настройки', icon: '⚙️' },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-white shadow-sm flex-shrink-0 hidden lg:block">
      <div className="p-6 border-b">
        <h2 className="text-xl font-bold text-primary">GHAYRAT KOREA</h2>
        <p className="text-sm text-gray-500">Панель управления</p>
      </div>
      <nav className="p-4 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href ||
            (item.href !== '/admin' && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-primary-50 text-primary'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <span>{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="absolute bottom-4 left-4 right-4">
        <Link href="/" className="text-sm text-gray-500 hover:text-primary flex items-center gap-2">
          ← На сайт
        </Link>
      </div>
    </aside>
  );
}
