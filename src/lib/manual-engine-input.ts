// Keep incomplete input visible, but only use whole values within the fields'
// existing limits when calculating an import estimate.
export function parseManualEngineInput(value: string, field: 'hp' | 'displacement'): number | undefined {
  if (!/^\d+$/.test(value)) return undefined;
  const number = Number(value);
  const [min, max] = field === 'hp' ? [30, 1500] : [500, 10000];
  return Number.isSafeInteger(number) && number >= min && number <= max ? number : undefined;
}
