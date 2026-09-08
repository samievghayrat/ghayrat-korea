'use client';

import { createContext, useContext, useState, useEffect, useRef, type ReactNode } from 'react';
import { type Lang, type Currency, type TranslationKey, getTranslation, formatCurrencyPrice, formatLocaleMileage } from '@/lib/i18n';
import { EXCHANGE_RATES } from '@/lib/constants';

interface ExchangeRates {
  USD: number;
  EUR: number;
  KRW: number;
  TJS: number;
}

const SITE_TITLES: Record<Lang, string> = {
  ru: 'GHAYRAT — Авто из Кореи',
  en: 'GHAYRAT — Cars from Korea',
  tj: 'GHAYRAT — Мошинҳо аз Корея',
  uz: 'GHAYRAT — Koreyadan avtomobillar',
};

interface AppContextType {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: (key: TranslationKey) => string;
  currency: Currency;
  setCurrency: (currency: Currency) => void;
  convertPrice: (rubAmount: number) => number;
  convertKrwPrice: (krwAmount: number) => number;
  convertCurrentToKrw: (amount: number) => number;
  convertUsdToKrw: (amount: number) => number;
  formatPrice: (rubAmount: number) => string;
  formatKrwPrice: (krwAmount: number) => string;
  formatListingPrice: (priceKrw: number, priceRub: number, priceUsd?: number) => string;
  formatMileage: (km: number) => string;
}

const AppContext = createContext<AppContextType | null>(null);

function rubToTarget(rubAmount: number, currency: Currency, rates: ExchangeRates): number {
  switch (currency) {
    case 'RUB': return rubAmount;
    case 'USD': return Math.round(rubAmount / rates.USD);
    case 'EUR': return Math.round(rubAmount / rates.EUR);
    case 'KRW': return Math.round(rubAmount / rates.KRW);
    case 'TJS': return Math.round(rubAmount / rates.TJS);
  }
}

function krwToTarget(krwAmount: number, currency: Currency, rates: ExchangeRates): number {
  switch (currency) {
    case 'KRW': return krwAmount;
    case 'RUB': return Math.round(krwAmount * rates.KRW);
    case 'USD': return Math.round(krwAmount * rates.KRW / rates.USD);
    case 'EUR': return Math.round(krwAmount * rates.KRW / rates.EUR);
    case 'TJS': return Math.round(krwAmount * rates.KRW / rates.TJS);
  }
}

function targetToKrw(amount: number, currency: Currency, rates: ExchangeRates): number {
  switch (currency) {
    case 'KRW': return Math.round(amount);
    case 'RUB': return Math.round(amount / rates.KRW);
    case 'USD': return Math.round(amount * rates.USD / rates.KRW);
    case 'EUR': return Math.round(amount * rates.EUR / rates.KRW);
    case 'TJS': return Math.round(amount * rates.TJS / rates.KRW);
  }
}

function usdToKrw(amount: number, rates: ExchangeRates): number {
  return Math.round(amount * rates.USD / rates.KRW);
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>('ru');
  const [currency, setCurrencyState] = useState<Currency>('RUB');
  const [rates, setRates] = useState<ExchangeRates>({
    USD: EXCHANGE_RATES.USD,
    EUR: EXCHANGE_RATES.EUR,
    KRW: EXCHANGE_RATES.KRW,
    TJS: EXCHANGE_RATES.TJS,
  });
  const ratesFetched = useRef(false);

  useEffect(() => {
    const savedLang = localStorage.getItem('lang') as Lang | null;
    if (savedLang && ['ru', 'en', 'tj', 'uz'].includes(savedLang)) {
      setLangState(savedLang);
    }
    const savedCurrency = localStorage.getItem('currency') as Currency | null;
    if (savedCurrency && ['RUB', 'USD', 'EUR', 'KRW', 'TJS'].includes(savedCurrency)) {
      setCurrencyState(savedCurrency);
    }

    // Fetch live exchange rates
    if (!ratesFetched.current) {
      ratesFetched.current = true;
      fetch('/api/exchange-rates?currencies=v2')
        .then(res => res.ok ? res.json() : null)
        .then(data => {
          if (data && data.USD && data.EUR && data.KRW && data.TJS) {
            setRates({ USD: data.USD, EUR: data.EUR, KRW: data.KRW, TJS: data.TJS });
          }
        })
        .catch(() => {});
    }
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
    const isVehicleDetail = /^\/(?:catalog|auction)\/[^/]+/.test(window.location.pathname);
    if (!isVehicleDetail) document.title = SITE_TITLES[lang];
  }, [lang]);

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
  const convertKrwPrice = (krwAmount: number) => krwToTarget(krwAmount, currency, rates);
  const convertCurrentToKrw = (amount: number) => targetToKrw(amount, currency, rates);
  const convertUsdToKrw = (amount: number) => usdToKrw(amount, rates);
  const formatPriceFn = (rubAmount: number) => formatCurrencyPrice(rubToTarget(rubAmount, currency, rates), currency);
  const formatKrwPrice = (krwAmount: number) => formatCurrencyPrice(krwToTarget(krwAmount, currency, rates), currency);
  // Listing APIs return KRW, RUB and USD together from one exchange-rate snapshot.
  // Prefer those paired values so a vehicle price never changes between its card,
  // headline and calculation breakdown while the page is open.
  const formatListingPrice = (priceKrw: number, priceRub: number, priceUsd?: number) => {
    if (currency === 'KRW') return formatCurrencyPrice(priceKrw, 'KRW');
    if (currency === 'USD' && priceUsd && priceUsd > 0) return formatCurrencyPrice(priceUsd, 'USD');
    const targetPrice = priceRub > 0
      ? rubToTarget(priceRub, currency, rates)
      : krwToTarget(priceKrw, currency, rates);
    return formatCurrencyPrice(targetPrice, currency);
  };
  const formatMileage = (km: number) => formatLocaleMileage(km, lang);

  return (
    <AppContext.Provider value={{
      lang, setLang, t,
      currency, setCurrency,
      convertPrice, convertKrwPrice, convertCurrentToKrw, convertUsdToKrw, formatPrice: formatPriceFn, formatKrwPrice, formatListingPrice, formatMileage,
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
