'use client';

import { createContext, useContext, useState, useEffect, useRef, type ReactNode } from 'react';
import { type Lang, type Currency, type TranslationKey, getTranslation, formatCurrencyPrice, formatLocaleMileage } from '@/lib/i18n';
import { EXCHANGE_RATES } from '@/lib/constants';

interface ExchangeRates {
  USD: number;
  EUR: number;
  KRW: number;
}

interface AppContextType {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: (key: TranslationKey) => string;
  currency: Currency;
  setCurrency: (currency: Currency) => void;
  convertPrice: (rubAmount: number) => number;
  formatPrice: (rubAmount: number) => string;
  formatKrwPrice: (krwAmount: number) => string;
  formatMileage: (km: number) => string;
}

const AppContext = createContext<AppContextType | null>(null);

function rubToTarget(rubAmount: number, currency: Currency, rates: ExchangeRates): number {
  switch (currency) {
    case 'RUB': return rubAmount;
    case 'USD': return Math.round(rubAmount / rates.USD);
    case 'EUR': return Math.round(rubAmount / rates.EUR);
    case 'KRW': return Math.round(rubAmount / rates.KRW);
  }
}

function krwToTarget(krwAmount: number, currency: Currency, rates: ExchangeRates): number {
  switch (currency) {
    case 'KRW': return krwAmount;
    case 'RUB': return Math.round(krwAmount * rates.KRW);
    case 'USD': return Math.round(krwAmount * rates.KRW / rates.USD);
    case 'EUR': return Math.round(krwAmount * rates.KRW / rates.EUR);
  }
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>('ru');
  const [currency, setCurrencyState] = useState<Currency>('RUB');
  const [rates, setRates] = useState<ExchangeRates>({
    USD: EXCHANGE_RATES.USD,
    EUR: EXCHANGE_RATES.EUR,
    KRW: EXCHANGE_RATES.KRW,
  });
  const ratesFetched = useRef(false);

  useEffect(() => {
    const savedLang = localStorage.getItem('lang') as Lang | null;
    if (savedLang && ['ru', 'en', 'tj', 'uz'].includes(savedLang)) {
      setLangState(savedLang);
    }
    const savedCurrency = localStorage.getItem('currency') as Currency | null;
    if (savedCurrency && ['RUB', 'USD', 'EUR', 'KRW'].includes(savedCurrency)) {
      setCurrencyState(savedCurrency);
    }

    // Fetch live exchange rates
    if (!ratesFetched.current) {
      ratesFetched.current = true;
      fetch('/api/exchange-rates')
        .then(res => res.ok ? res.json() : null)
        .then(data => {
          if (data && data.USD && data.EUR && data.KRW) {
            setRates({ USD: data.USD, EUR: data.EUR, KRW: data.KRW });
          }
        })
        .catch(() => {});
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

  const convertPrice = (rubAmount: number) => rubToTarget(rubAmount, currency, rates);
  const formatPriceFn = (rubAmount: number) => formatCurrencyPrice(rubAmount, 'RUB');
  const formatKrwPrice = (krwAmount: number) => formatCurrencyPrice(krwToTarget(krwAmount, currency, rates), currency);
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
