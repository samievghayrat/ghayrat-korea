'use client';

import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { type Lang, type Currency, type TranslationKey, getTranslation, formatCurrencyPrice, formatLocaleMileage } from '@/lib/i18n';
import { EXCHANGE_RATES } from '@/lib/constants';

interface AppContextType {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: (key: TranslationKey) => string;
  currency: Currency;
  setCurrency: (currency: Currency) => void;
  // Convert a RUB amount to selected currency
  convertPrice: (rubAmount: number) => number;
  // Format a RUB amount in the selected currency
  formatPrice: (rubAmount: number) => string;
  // Format KRW amount directly in selected currency
  formatKrwPrice: (krwAmount: number) => string;
  // Format mileage with localized unit
  formatMileage: (km: number) => string;
}

const AppContext = createContext<AppContextType | null>(null);

// Conversion rates from RUB to other currencies
function rubToTarget(rubAmount: number, currency: Currency): number {
  switch (currency) {
    case 'RUB': return rubAmount;
    case 'USD': return Math.round(rubAmount / EXCHANGE_RATES.USD);
    case 'EUR': return Math.round(rubAmount / EXCHANGE_RATES.EUR);
    case 'KRW': return Math.round(rubAmount / EXCHANGE_RATES.KRW);
  }
}

function krwToTarget(krwAmount: number, currency: Currency): number {
  switch (currency) {
    case 'KRW': return krwAmount;
    case 'RUB': return Math.round(krwAmount * EXCHANGE_RATES.KRW);
    case 'USD': return Math.round(krwAmount * EXCHANGE_RATES.KRW / EXCHANGE_RATES.USD);
    case 'EUR': return Math.round(krwAmount * EXCHANGE_RATES.KRW / EXCHANGE_RATES.EUR);
  }
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>('ru');
  const [currency, setCurrencyState] = useState<Currency>('RUB');

  useEffect(() => {
    const savedLang = localStorage.getItem('lang') as Lang | null;
    if (savedLang && ['ru', 'en', 'tj', 'uz'].includes(savedLang)) {
      setLangState(savedLang);
    }
    const savedCurrency = localStorage.getItem('currency') as Currency | null;
    if (savedCurrency && ['RUB', 'USD', 'EUR', 'KRW'].includes(savedCurrency)) {
      setCurrencyState(savedCurrency);
    }
  }, []);

  const setLang = (l: Lang) => {
    setLangState(l);
    localStorage.setItem('lang', l);
  };

  const setCurrency = (c: Currency) => {
    setCurrencyState(c);
    localStorage.setItem('currency', c);
  };

  const t = (key: TranslationKey) => getTranslation(key, lang);

  const convertPrice = (rubAmount: number) => rubToTarget(rubAmount, currency);
  const formatPriceFn = (rubAmount: number) => formatCurrencyPrice(rubToTarget(rubAmount, currency), currency);
  const formatKrwPrice = (krwAmount: number) => formatCurrencyPrice(krwToTarget(krwAmount, currency), currency);
  const formatMileage = (km: number) => formatLocaleMileage(km, lang);

  return (
    <AppContext.Provider value={{
      lang, setLang, t,
      currency, setCurrency,
      convertPrice, formatPrice: formatPriceFn, formatKrwPrice, formatMileage,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp(): AppContextType {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
