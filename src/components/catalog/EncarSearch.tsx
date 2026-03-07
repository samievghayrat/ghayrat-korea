'use client';

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { BRAND_MODELS, FUEL_TYPES, YEAR_OPTIONS, TRANSMISSION_TYPES, DRIVETRAIN_TYPES, COLOR_OPTIONS, CAR_OPTIONS } from '@/lib/constants';
import { translateGenerationName } from '@/lib/translations';
import type { CarFilters } from '@/types';

interface BrandCount {
  name: string;
  nameKo: string;
  count: number;
}

interface EncarSearchProps {
  filters: CarFilters;
  onChange: (filters: CarFilters) => void;
  onReset?: () => void;
  totalResults?: number;
  brandCounts?: BrandCount[];
  totalCars?: number;
  compact?: boolean;
}

interface ModelVariant {
  name: string;
  count: number;
  yearFrom: number;
  yearTo: number;
}

const MONTHS = [
  { value: 1, label: '01' }, { value: 2, label: '02' }, { value: 3, label: '03' },
  { value: 4, label: '04' }, { value: 5, label: '05' }, { value: 6, label: '06' },
  { value: 7, label: '07' }, { value: 8, label: '08' }, { value: 9, label: '09' },
  { value: 10, label: '10' }, { value: 11, label: '11' }, { value: 12, label: '12' },
];

const ChevronIcon = ({ open }: { open: boolean }) => (
  <svg className={`w-4 h-4 text-gray-400 transition-transform flex-shrink-0 ${open ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
  </svg>
);

const ClearIcon = ({ onClick }: { onClick: (e: React.MouseEvent) => void }) => (
  <span role="button" tabIndex={-1} onClick={onClick} className="text-gray-400 hover:text-gray-600 p-0.5 -m-0.5 cursor-pointer">
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  </span>
);

function FilterSection({ title, defaultOpen = true, children, count }: {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
  count?: number;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-gray-100 last:border-b-0">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-gray-50 transition-colors"
      >
        <span className="text-sm font-semibold text-gray-700 flex items-center gap-2">
          {title}
          {count !== undefined && count > 0 && (
            <span className="bg-primary text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">{count}</span>
          )}
        </span>
        <ChevronIcon open={open} />
      </button>
      {open && <div className="px-4 pb-3">{children}</div>}
    </div>
  );
}

// Dropdown select box component (like Encar's brand/model/generation selectors)
function SelectBox({ label, value, count, placeholder, open, onToggle, onClear, children }: {
  label: string;
  value?: string;
  count?: number;
  placeholder: string;
  open: boolean;
  onToggle: () => void;
  onClear?: () => void;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);

  return (
    <div className="px-4 py-3" ref={ref}>
      <label className="text-sm font-semibold text-gray-700 mb-1.5 block">{label}</label>
      <div className="relative">
        <button
          onClick={onToggle}
          className="w-full border border-gray-200 rounded-lg px-3 py-2.5 flex items-center justify-between bg-white hover:border-gray-300 transition-colors text-left"
        >
          {value ? (
            <>
              <span className="font-medium text-gray-900 text-sm truncate">{value}</span>
              <span className="flex items-center gap-2 flex-shrink-0 ml-2">
                {count !== undefined && (
                  <span className="text-sm text-gray-400 tabular-nums">{count.toLocaleString('ru-RU')}</span>
                )}
                {onClear && (
                  <ClearIcon onClick={(e) => { e.stopPropagation(); onClear(); }} />
                )}
                <ChevronIcon open={open} />
              </span>
            </>
          ) : (
            <>
              <span className="text-gray-400 text-sm">{placeholder}</span>
              <ChevronIcon open={open} />
            </>
          )}
        </button>
        {open && (
          <div className="absolute z-20 left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-[280px] overflow-y-auto">
            {children}
          </div>
        )}
      </div>
    </div>
  );
}

export default function EncarSearch({ filters, onChange, onReset, brandCounts, compact }: EncarSearchProps) {
  const [generationVariants, setGenerationVariants] = useState<ModelVariant[]>([]);
  const [generationTotal, setGenerationTotal] = useState(0);
  const [generationLoading, setGenerationLoading] = useState(false);
  const [brandOpen, setBrandOpen] = useState(false);
  const [modelOpen, setModelOpen] = useState(false);
  const [genOpen, setGenOpen] = useState(false);
  const [showMoreFilters, setShowMoreFilters] = useState(false);

  const modelList = useMemo(() => {
    if (!filters.brand) return [];
    return (BRAND_MODELS[filters.brand] || []).sort((a, b) => a.localeCompare(b));
  }, [filters.brand]);

  const fetchGenerations = useCallback(async (brand: string, model: string) => {
    setGenerationLoading(true);
    try {
      const res = await fetch(`/api/car-models?brand=${encodeURIComponent(brand)}&model=${encodeURIComponent(model)}`);
      const data = await res.json();
      setGenerationVariants(data.models || []);
      setGenerationTotal(data.total || 0);
    } catch {
      setGenerationVariants([]);
      setGenerationTotal(0);
    } finally {
      setGenerationLoading(false);
    }
  }, []);

  useEffect(() => {
    if (filters.brand && filters.model) {
      fetchGenerations(filters.brand, filters.model);
    } else {
      setGenerationVariants([]);
      setGenerationTotal(0);
    }
  }, [filters.brand, filters.model, fetchGenerations]);

  const selectedBrandCount = brandCounts?.find(b => b.name === filters.brand)?.count;
  const totalGenCount = generationTotal || generationVariants.reduce((sum, v) => sum + v.count, 0);

  const selectedGenName = filters.modelVariant
    ? translateGenerationName(filters.modelVariant)
    : undefined;

  const handleBrandSelect = (brand: string) => {
    onChange({ ...filters, brand, model: undefined, modelVariant: undefined, page: 1 });
    setBrandOpen(false);
    setModelOpen(false);
    setGenOpen(false);
  };

  const handleModelSelect = (model: string) => {
    onChange({ ...filters, model, modelVariant: undefined, page: 1 });
    setModelOpen(false);
    setGenOpen(false);
  };

  const handleGenSelect = (variant?: string) => {
    onChange({ ...filters, modelVariant: variant, page: 1 });
    setGenOpen(false);
  };

  const clearBrand = () => {
    onChange({ ...filters, brand: undefined, model: undefined, modelVariant: undefined, page: 1 });
    setBrandOpen(false);
    setModelOpen(false);
    setGenOpen(false);
  };

  const clearModel = () => {
    onChange({ ...filters, model: undefined, modelVariant: undefined, page: 1 });
    setModelOpen(false);
    setGenOpen(false);
  };

  const update = (key: keyof CarFilters, value: string | number | undefined) => {
    onChange({ ...filters, [key]: value || undefined, page: 1 });
  };

  const activeFilterCount = [
    filters.fuel, filters.yearFrom, filters.yearTo,
    filters.monthFrom, filters.monthTo,
    filters.priceFrom, filters.priceTo,
    filters.mileageTo, filters.mileageFrom, filters.transmission,
    filters.drivetrain, filters.color,
  ].filter(Boolean).length + (filters.options?.length || 0);

  const handleResetAll = () => {
    setBrandOpen(false);
    setModelOpen(false);
    setGenOpen(false);
    if (onReset) {
      onReset();
    } else {
      onChange({ page: 1 });
    }
  };

  const hasAnyFilter = !!(filters.brand || activeFilterCount > 0);

  return (
    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
      {/* Header — only show reset button when filters are active */}
      {hasAnyFilter && (
        <div className="px-4 py-2 border-b border-gray-100 bg-gray-50/50 flex justify-end">
          <button onClick={handleResetAll} className="text-xs text-red-500 hover:text-red-600 font-medium flex items-center gap-1">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            Сбросить
          </button>
        </div>
      )}

      {/* Brand selector */}
      <SelectBox
        label="Марка"
        value={filters.brand}
        count={selectedBrandCount}
        placeholder="Все марки"
        open={brandOpen}
        onToggle={() => { setBrandOpen(!brandOpen); setModelOpen(false); setGenOpen(false); }}
        onClear={filters.brand ? clearBrand : undefined}
      >
        {brandCounts && brandCounts.length > 0 ? (
          <div className="py-1">
            {brandCounts.map((b) => (
              <button
                key={b.name}
                onClick={() => handleBrandSelect(b.name)}
                className={`w-full flex items-center justify-between px-3 py-2.5 transition-all text-left hover:bg-gray-50 ${
                  filters.brand === b.name ? 'bg-primary/5 text-primary font-medium' : 'text-gray-700'
                }`}
              >
                <span className="text-sm">{b.name}</span>
                <span className="text-sm text-gray-400 tabular-nums">{b.count.toLocaleString('ru-RU')}</span>
              </button>
            ))}
          </div>
        ) : (
          <div className="p-3 space-y-2">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="h-8 bg-gray-100 rounded animate-pulse" />
            ))}
          </div>
        )}
      </SelectBox>

      {/* Model selector */}
      {filters.brand && (
        <SelectBox
          label="Модель"
          value={filters.model}
          count={totalGenCount || undefined}
          placeholder="Все модели"
          open={modelOpen}
          onToggle={() => { setModelOpen(!modelOpen); setBrandOpen(false); setGenOpen(false); }}
          onClear={filters.model ? clearModel : undefined}
        >
          <div className="py-1">
            {modelList.map((m) => (
              <button
                key={m}
                onClick={() => handleModelSelect(m)}
                className={`w-full flex items-center justify-between px-3 py-2.5 transition-all text-left hover:bg-gray-50 ${
                  filters.model === m ? 'bg-primary/5 text-primary font-medium' : 'text-gray-700'
                }`}
              >
                <span className="text-sm">{m}</span>
              </button>
            ))}
            {modelList.length === 0 && (
              <p className="px-3 py-2 text-sm text-gray-400">Нет моделей</p>
            )}
          </div>
        </SelectBox>
      )}

      {/* Generation selector */}
      {filters.model && (
        <SelectBox
          label="Поколение"
          value={selectedGenName || 'Все'}
          count={filters.modelVariant
            ? generationVariants.find(v => v.name === filters.modelVariant)?.count
            : totalGenCount || undefined}
          placeholder="Все"
          open={genOpen}
          onToggle={() => { setGenOpen(!genOpen); setBrandOpen(false); setModelOpen(false); }}
          onClear={filters.modelVariant ? () => handleGenSelect(undefined) : undefined}
        >
          {generationLoading ? (
            <div className="flex items-center gap-2 px-3 py-4 justify-center">
              <svg className="animate-spin h-4 w-4 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span className="text-sm text-gray-400">Загрузка...</span>
            </div>
          ) : (
            <div className="py-1">
              {/* "All" option */}
              <button
                onClick={() => handleGenSelect(undefined)}
                className={`w-full flex items-center justify-between px-3 py-2.5 transition-all text-left hover:bg-gray-50 ${
                  !filters.modelVariant ? 'bg-primary/5 text-primary font-medium' : 'text-gray-700'
                }`}
              >
                <span className="text-sm">Все</span>
                <span className="text-sm text-gray-400 tabular-nums">{totalGenCount.toLocaleString('ru-RU')}</span>
              </button>
              {/* Generation variants */}
              {generationVariants.map(v => {
                const translated = translateGenerationName(v.name);
                const yearRange = v.yearFrom && v.yearTo && v.yearFrom <= v.yearTo
                  ? `(${v.yearFrom} — ${v.yearTo})`
                  : '';
                return (
                  <button
                    key={v.name}
                    onClick={() => handleGenSelect(v.name)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 transition-all text-left hover:bg-gray-50 ${
                      filters.modelVariant === v.name ? 'bg-primary/5 text-primary font-medium' : 'text-gray-700'
                    }`}
                  >
                    <span className="text-sm">
                      {translated}
                      {yearRange && <span className="text-gray-400 ml-1">{yearRange}</span>}
                    </span>
                    <span className="text-sm text-gray-400 tabular-nums ml-2 flex-shrink-0">
                      {v.count.toLocaleString('ru-RU')}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </SelectBox>
      )}

      {/* Filter sections */}
      <div className={`border-t border-gray-100 ${compact && !showMoreFilters ? '' : 'max-h-[500px] overflow-y-auto'}`}>
        {/* Year + Month */}
        <FilterSection title="Год" defaultOpen={false} count={(filters.yearFrom || filters.yearTo) ? 1 : 0}>
          <div className="space-y-2">
            <div className="flex gap-2">
              <select
                value={filters.yearFrom || ''}
                onChange={(e) => update('yearFrom', e.target.value ? parseInt(e.target.value) : undefined)}
                className="input-field"
              >
                <option value="">Год от</option>
                {YEAR_OPTIONS.map((y) => <option key={y} value={y}>{y}</option>)}
              </select>
              <select
                value={filters.yearTo || ''}
                onChange={(e) => update('yearTo', e.target.value ? parseInt(e.target.value) : undefined)}
                className="input-field"
              >
                <option value="">Год до</option>
                {YEAR_OPTIONS.map((y) => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
            {!compact && (
              <div className="flex gap-2">
                <select
                  value={filters.monthFrom || ''}
                  onChange={(e) => update('monthFrom', e.target.value ? parseInt(e.target.value) : undefined)}
                  className="input-field"
                >
                  <option value="">Мес. от</option>
                  {MONTHS.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
                </select>
                <select
                  value={filters.monthTo || ''}
                  onChange={(e) => update('monthTo', e.target.value ? parseInt(e.target.value) : undefined)}
                  className="input-field"
                >
                  <option value="">Мес. до</option>
                  {MONTHS.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
                </select>
              </div>
            )}
          </div>
        </FilterSection>

        {/* Price */}
        <FilterSection title="Цена (₽)" defaultOpen={false} count={(filters.priceFrom || filters.priceTo) ? 1 : 0}>
          <div className="flex gap-2">
            <input
              type="number"
              value={filters.priceFrom || ''}
              onChange={(e) => update('priceFrom', e.target.value ? parseInt(e.target.value) : undefined)}
              placeholder="От"
              className="input-field"
            />
            <input
              type="number"
              value={filters.priceTo || ''}
              onChange={(e) => update('priceTo', e.target.value ? parseInt(e.target.value) : undefined)}
              placeholder="До"
              className="input-field"
            />
          </div>
          <div className="flex flex-wrap gap-1.5 mt-2">
            {[100, 200, 300, 500].map(v => (
              <button
                key={v}
                onClick={() => update('priceTo', v)}
                className={`text-[11px] px-2 py-1 rounded border transition-all ${
                  filters.priceTo === v
                    ? 'bg-primary/10 border-primary/30 text-primary'
                    : 'border-gray-200 text-gray-500 hover:border-gray-300'
                }`}
              >
                до {v * 10000 >= 1000000 ? `${v * 10000 / 1000000} млн` : `${v * 10}к`}
              </button>
            ))}
          </div>
        </FilterSection>

        {/* Mileage */}
        <FilterSection title="Пробег" defaultOpen={false} count={(filters.mileageFrom || filters.mileageTo) ? 1 : 0}>
          <div className="flex gap-2">
            <input
              type="number"
              value={filters.mileageFrom || ''}
              onChange={(e) => update('mileageFrom', e.target.value ? parseInt(e.target.value) : undefined)}
              placeholder="От, км"
              className="input-field"
            />
            <input
              type="number"
              value={filters.mileageTo || ''}
              onChange={(e) => update('mileageTo', e.target.value ? parseInt(e.target.value) : undefined)}
              placeholder="До, км"
              className="input-field"
            />
          </div>
          <div className="flex flex-wrap gap-1.5 mt-2">
            {[10000, 30000, 50000, 100000].map(v => (
              <button
                key={v}
                onClick={() => update('mileageTo', v)}
                className={`text-[11px] px-2 py-1 rounded border transition-all ${
                  filters.mileageTo === v
                    ? 'bg-primary/10 border-primary/30 text-primary'
                    : 'border-gray-200 text-gray-500 hover:border-gray-300'
                }`}
              >
                до {v >= 1000 ? `${v / 1000}k` : v}
              </button>
            ))}
          </div>
        </FilterSection>

        {/* Extra filters — hidden in compact mode until "More" is tapped */}
        {(!compact || showMoreFilters) && (
          <>
            {/* Color */}
            <FilterSection title="Цвет" defaultOpen={false} count={filters.color ? 1 : 0}>
              <div className="grid grid-cols-3 gap-1.5">
                {COLOR_OPTIONS.map((c) => {
                  const colorDot: Record<string, string> = {
                    white: 'bg-white border border-gray-300', black: 'bg-gray-900', gray: 'bg-gray-400',
                    silver: 'bg-gray-300', blue: 'bg-blue-500', red: 'bg-red-500',
                    brown: 'bg-amber-800', green: 'bg-green-600', other: 'bg-gradient-to-r from-yellow-400 to-orange-500',
                  };
                  return (
                    <button
                      key={c.value}
                      onClick={() => update('color', filters.color === c.value ? undefined : c.value)}
                      className={`text-xs px-2 py-2 rounded-lg border flex items-center gap-1.5 transition-all ${
                        filters.color === c.value
                          ? 'bg-primary/10 border-primary/30 text-primary font-medium'
                          : 'border-gray-200 text-gray-600 hover:border-gray-300'
                      }`}
                    >
                      <span className={`w-3 h-3 rounded-full flex-shrink-0 ${colorDot[c.value] || 'bg-gray-400'}`} />
                      {c.label}
                    </button>
                  );
                })}
              </div>
            </FilterSection>

            {/* Fuel */}
            <FilterSection title="Тип топлива" defaultOpen={false} count={filters.fuel ? 1 : 0}>
              <div className="space-y-1">
                {FUEL_TYPES.map((f) => (
                  <button
                    key={f.value}
                    onClick={() => update('fuel', filters.fuel === f.value ? undefined : f.value)}
                    className={`w-full text-left text-sm px-3 py-2 rounded-lg transition-all flex items-center justify-between ${
                      filters.fuel === f.value
                        ? 'bg-primary/10 text-primary font-medium'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${
                        f.value === 'gasoline' ? 'bg-blue-500' :
                        f.value === 'diesel' ? 'bg-amber-500' :
                        f.value === 'hybrid' ? 'bg-teal-500' :
                        f.value === 'electric' ? 'bg-emerald-500' : 'bg-gray-400'
                      }`} />
                      {f.label}
                    </span>
                    {filters.fuel === f.value && (
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                      </svg>
                    )}
                  </button>
                ))}
              </div>
            </FilterSection>

            {/* Transmission */}
            <FilterSection title="КПП" defaultOpen={false} count={filters.transmission ? 1 : 0}>
              <div className="space-y-1">
                {TRANSMISSION_TYPES.map((t) => (
                  <button
                    key={t.value}
                    onClick={() => update('transmission', filters.transmission === t.value ? undefined : t.value)}
                    className={`w-full text-left text-sm px-3 py-2 rounded-lg transition-all ${
                      filters.transmission === t.value
                        ? 'bg-primary/10 text-primary font-medium'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </FilterSection>

            {/* Drivetrain */}
            <FilterSection title="Привод" defaultOpen={false} count={filters.drivetrain ? 1 : 0}>
              <div className="grid grid-cols-3 gap-1.5">
                {DRIVETRAIN_TYPES.map((d) => (
                  <button
                    key={d.value}
                    onClick={() => update('drivetrain', filters.drivetrain === d.value ? undefined : d.value)}
                    className={`text-xs px-2 py-2 rounded-lg border text-center transition-all ${
                      filters.drivetrain === d.value
                        ? 'bg-primary/10 border-primary/30 text-primary font-medium'
                        : 'border-gray-200 text-gray-600 hover:border-gray-300'
                    }`}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
            </FilterSection>

            {/* Options / Equipment */}
            <FilterSection title="Опции" defaultOpen={false} count={filters.options?.length || 0}>
              <div className="grid grid-cols-2 gap-1.5">
                {CAR_OPTIONS.map((opt) => {
                  const selected = filters.options?.includes(opt.code) || false;
                  return (
                    <button
                      key={opt.code}
                      onClick={() => {
                        const current = filters.options || [];
                        const next = selected
                          ? current.filter(c => c !== opt.code)
                          : [...current, opt.code];
                        onChange({ ...filters, options: next.length > 0 ? next : undefined, page: 1 });
                      }}
                      className={`text-left text-[11px] px-2.5 py-2 rounded-lg border transition-all flex items-center gap-1.5 ${
                        selected
                          ? 'bg-primary/10 border-primary/30 text-primary font-medium'
                          : 'border-gray-200 text-gray-600 hover:border-gray-300'
                      }`}
                    >
                      <span className={`w-3.5 h-3.5 rounded border flex-shrink-0 flex items-center justify-center ${
                        selected ? 'bg-primary border-primary' : 'border-gray-300'
                      }`}>
                        {selected && (
                          <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </span>
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            </FilterSection>
          </>
        )}
      </div>

      {/* "More filters" toggle — only in compact mode */}
      {compact && (
        <button
          onClick={() => setShowMoreFilters(!showMoreFilters)}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium text-gray-600 hover:bg-gray-50 border-t border-gray-100 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
          </svg>
          {showMoreFilters ? 'Скрыть фильтры' : 'Ещё фильтры'}
          {!showMoreFilters && activeFilterCount > 0 && (
            <span className="bg-primary text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">{activeFilterCount}</span>
          )}
          <ChevronIcon open={showMoreFilters} />
        </button>
      )}
    </div>
  );
}
