'use client';

import { useState, useCallback } from 'react';

type Currency = 'RUB' | 'USD';

export function useCurrency() {
  const [currency, setCurrency] = useState<Currency>('RUB');

  const toggleCurrency = useCallback(() => {
    setCurrency(prev => prev === 'RUB' ? 'USD' : 'RUB');
  }, []);

  return { currency, setCurrency, toggleCurrency };
}
