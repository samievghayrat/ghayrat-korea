'use client';

import { useState } from 'react';

interface EquipmentProps {
  items: string[];
}

const INITIAL_VISIBLE = 4;

interface Category {
  title: string;
  icon: string;
  keywords: string[];
}

const categories: Category[] = [
  {
    title: 'Интерьер и экстерьер',
    icon: '🏠',
    keywords: ['кож', 'салон', 'люк', 'санруф', 'фар', 'LED', 'HID', 'зеркал', 'стекл', 'дверь', 'багажник', 'электропривод багажника', 'крыш', 'рейлинг', 'диск', 'свет', 'лобов', 'проекц', 'шторк'],
  },
  {
    title: 'Безопасность',
    icon: '🛡',
    keywords: ['подуш', 'ABS', 'антиблок', 'ESP', 'ESC', 'стабилиз', 'камер', 'парктроник', 'датчик', 'круиз', 'контроль', 'слеп', 'полос', 'тормоз', 'TPMS', 'давлен', 'LDWS'],
  },
  {
    title: 'Мультимедиа',
    icon: '📱',
    keywords: ['навигац', 'монитор', 'Bluetooth', 'USB', 'AUX', 'CD', 'Hi-Pass', 'транспондер', 'кнопк', 'руле'],
  },
  {
    title: 'Комфорт и сиденья',
    icon: '💺',
    keywords: ['сиден', 'подогрев', 'вентиляц', 'руля', 'климат', 'ключ', 'запуск', 'кондиц', 'память', 'массаж', 'электрорегулировк', 'лепест', 'складн', 'электрохром', 'доводчик', 'бесключ'],
  },
];

function categorizeItems(items: string[]): Record<string, string[]> {
  const result: Record<string, string[]> = {};
  const used = new Set<number>();

  for (const cat of categories) {
    const matched: string[] = [];
    items.forEach((item, idx) => {
      if (used.has(idx)) return;
      const lower = item.toLowerCase();
      if (cat.keywords.some((kw) => lower.includes(kw.toLowerCase()))) {
        matched.push(item);
        used.add(idx);
      }
    });
    if (matched.length > 0) {
      result[cat.title] = matched;
    }
  }

  // Remaining go to "Прочее"
  const other = items.filter((_, idx) => !used.has(idx));
  if (other.length > 0) {
    result['Прочее'] = other;
  }

  return result;
}

export default function Equipment({ items }: EquipmentProps) {
  const [expanded, setExpanded] = useState(false);

  if (!items || !Array.isArray(items) || items.length === 0) return null;

  const grouped = categorizeItems(items);
  const groupNames = Object.keys(grouped);

  // In collapsed mode, show only first INITIAL_VISIBLE items per category
  const totalHidden = groupNames.reduce((sum, name) => {
    const extra = grouped[name].length - INITIAL_VISIBLE;
    return sum + (extra > 0 ? extra : 0);
  }, 0);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-xl font-bold text-gray-900">Комплектация</h2>
        <span className="text-sm text-gray-400">{items.length} опций</span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {groupNames.map((name) => {
          const cat = categories.find(c => c.title === name);
          const all = grouped[name];
          const visible = expanded ? all : all.slice(0, INITIAL_VISIBLE);
          return (
            <div key={name}>
              <h3 className="text-sm font-bold text-gray-700 mb-2.5 flex items-center gap-1.5">
                {cat && <span className="text-base">{cat.icon}</span>}
                {name}
                <span className="text-gray-300 font-normal text-xs">({all.length})</span>
              </h3>
              <ul className="space-y-1.5">
                {visible.map((item, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-gray-600">
                    <svg className="w-3.5 h-3.5 text-primary flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
      {totalHidden > 0 && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="mt-4 w-full py-2.5 text-sm font-medium text-primary hover:text-primary-700 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors flex items-center justify-center gap-1.5"
        >
          {expanded ? 'Скрыть' : `Показать все (ещё ${totalHidden})`}
          <svg className={`w-4 h-4 transition-transform ${expanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      )}
    </div>
  );
}
