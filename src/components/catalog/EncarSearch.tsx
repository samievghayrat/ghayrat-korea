'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { YEAR_OPTIONS } from '@/lib/constants';
import { translateGenerationName, translateBadgeDetail } from '@/lib/translations';
import type { CarFilters } from '@/types';
import { useApp } from '@/contexts/AppContext';
import BottomSheet from '@/components/shared/BottomSheet';

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

interface ModelOption {
  name: string;
  nameKo?: string;
  count: number;
}

interface BadgeOption {
  name: string;
  count: number;
  badgeDetails?: { name: string; count: number }[];
}

interface BadgeTreeGroup {
  fuel: string;
  drivetrain: string;
  count: number;
  badges: {
    name: string;
    count: number;
    badgeDetails: { name: string; count: number }[];
  }[];
}

const clientCache = new Map<string, unknown>();

async function fetchCachedJson<T>(key: string, url: string): Promise<T> {
  const cached = clientCache.get(key);
  if (cached) return cached as T;
  const res = await fetch(url);
  const data = await res.json();
  clientCache.set(key, data);
  return data as T;
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

// Hook to detect mobile viewport
function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 1024);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);
  return isMobile;
}

// Dropdown select box component (like Encar's brand/model/generation selectors)
// On mobile: opens a BottomSheet. On desktop: shows inline dropdown.
function SelectBox({ label, value, count, placeholder, open, onToggle, onClear, sheetTitle, showResultsLabel, children }: {
  label: string;
  value?: string;
  count?: number;
  placeholder: string;
  open: boolean;
  onToggle: () => void;
  onClear?: () => void;
  sheetTitle?: string;
  showResultsLabel?: string;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();

  return (
    <div className="px-4 py-3" ref={ref}>
      {label && <label className="text-sm font-semibold text-gray-700 mb-1.5 block">{label}</label>}
      <div className="relative">
        <button
          onClick={onToggle}
          className={`w-full border rounded-xl px-3 py-3 flex items-center justify-between gap-3 transition-all text-left shadow-sm ${
            value
              ? 'border-primary/40 bg-primary/5 hover:border-primary/70'
              : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow'
          }`}
        >
          {value ? (
            <>
              <span className="flex min-w-0 items-center gap-2">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m21 21-4.35-4.35M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15Z" />
                  </svg>
                </span>
                <span className="font-semibold text-primary text-sm truncate">{value}</span>
              </span>
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
              <span className="flex min-w-0 items-center gap-2">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gray-950 text-white">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m21 21-4.35-4.35M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15Z" />
                  </svg>
                </span>
                <span className="truncate text-sm font-semibold text-gray-700">{placeholder}</span>
              </span>
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gray-100">
                <ChevronIcon open={open} />
              </span>
            </>
          )}
        </button>

        {/* Desktop: inline dropdown */}
        {open && !isMobile && (
          <div className="absolute z-20 left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-[280px] overflow-y-auto">
            {children}
          </div>
        )}

        {/* Mobile: bottom sheet */}
        {isMobile && (
          <BottomSheet
            open={open}
            onClose={onToggle}
            title={sheetTitle || placeholder}
            footer={showResultsLabel ? (
              <button
                onClick={onToggle}
                className="w-full bg-gray-900 text-white py-3.5 rounded-xl font-semibold text-sm transition-colors hover:bg-gray-800"
              >
                {showResultsLabel}
              </button>
            ) : undefined}
          >
            <div className="py-2">
              {children}
            </div>
          </BottomSheet>
        )}
      </div>
    </div>
  );
}

export default function EncarSearch({ filters, onChange, brandCounts, totalCars, compact }: EncarSearchProps) {
  const { t } = useApp();
  const [generationVariants, setGenerationVariants] = useState<ModelVariant[]>([]);
  const [generationTotal, setGenerationTotal] = useState(0);
  const [generationLoading, setGenerationLoading] = useState(false);
  const [brandOpen, setBrandOpen] = useState(false);
  const [modelOpen, setModelOpen] = useState(false);
  const [genOpen, setGenOpen] = useState(false);
  const [showMoreFilters, setShowMoreFilters] = useState(false);

  const FUEL_TYPES = [
    { value: 'gasoline', label: t('fuel.gasoline') },
    { value: 'diesel', label: t('fuel.diesel') },
    { value: 'hybrid', label: t('fuel.hybrid') },
    { value: 'electric', label: t('fuel.electric') },
    { value: 'lpg', label: t('fuel.lpg') },
  ];

  const TRANSMISSION_TYPES = [
    { value: 'auto', label: t('trans.auto') },
    { value: 'manual', label: t('trans.manual') },
    { value: 'dct', label: t('trans.dct') },
    { value: 'cvt', label: t('trans.cvt') },
  ];

  const DRIVETRAIN_TYPES = [
    { value: 'fwd', label: t('drive.fwd') },
    { value: 'rwd', label: t('drive.rwd') },
    { value: 'awd', label: t('drive.awd') },
  ];

  const COLOR_OPTIONS = [
    { value: 'white', label: t('color.white') },
    { value: 'black', label: t('color.black') },
    { value: 'gray', label: t('color.gray') },
    { value: 'silver', label: t('color.silver') },
    { value: 'blue', label: t('color.blue') },
    { value: 'red', label: t('color.red') },
    { value: 'brown', label: t('color.brown') },
    { value: 'green', label: t('color.green') },
    { value: 'other', label: t('color.other') },
  ];

  const CAR_OPTIONS = [
    { code: '010', label: t('opt.010') },
    { code: '014', label: t('opt.014') },
    { code: '005', label: t('opt.005') },
    { code: '058', label: t('opt.058') },
    { code: '087', label: t('opt.087') },
    { code: '075', label: t('opt.075') },
    { code: '007', label: t('opt.007') },
    { code: '009', label: t('opt.009') },
    { code: '082', label: t('opt.082') },
    { code: '023', label: t('opt.023') },
    { code: '068', label: t('opt.068') },
    { code: '079', label: t('opt.079') },
    { code: '057', label: t('opt.057') },
    { code: '059', label: t('opt.059') },
    { code: '088', label: t('opt.088') },
    { code: '086', label: t('opt.086') },
    { code: '095', label: t('opt.095') },
    { code: '091', label: t('opt.091') },
  ];

  const [modelList, setModelList] = useState<ModelOption[]>([]);
  const [modelLoading, setModelLoading] = useState(false);
  const [badgeList, setBadgeList] = useState<BadgeOption[]>([]);
  const [badgeTree, setBadgeTree] = useState<BadgeTreeGroup[]>([]);
  const [badgeLoading, setBadgeLoading] = useState(false);
  const [showAllBadges, setShowAllBadges] = useState(false);
  const [expandedGroup, setExpandedGroup] = useState<string | null>(null);
  const [expandedBadge, setExpandedBadge] = useState<string | null>(null);

  // Fetch models dynamically from Encar API when brand changes
  useEffect(() => {
    if (!filters.brand) {
      setModelList([]);
      return;
    }
    const cacheKey = `models:${filters.brand}`;
    const cached = clientCache.get(cacheKey) as { models?: ModelOption[] } | undefined;
    if (cached) {
      setModelList(cached.models || []);
      setModelLoading(false);
      return;
    }

    let cancelled = false;
    setModelLoading(true);
    fetchCachedJson<{ models?: ModelOption[] }>(
      cacheKey,
      `/api/car-models?brand=${encodeURIComponent(filters.brand)}`
    )
      .then(data => { if (!cancelled) setModelList(data.models || []); })
      .catch(() => { if (!cancelled) setModelList([]); })
      .finally(() => { if (!cancelled) setModelLoading(false); });

    return () => { cancelled = true; };
  }, [filters.brand]);

  const fetchGenerations = useCallback(async (brand: string, model: string) => {
    const cacheKey = `generations:${brand}:${model}`;
    const cached = clientCache.get(cacheKey) as { models?: ModelVariant[]; total?: number } | undefined;
    if (cached) {
      setGenerationVariants(cached.models || []);
      setGenerationTotal(cached.total || 0);
      setGenerationLoading(false);
      return;
    }

    setGenerationLoading(true);
    try {
      const data = await fetchCachedJson<{ models?: ModelVariant[]; total?: number }>(
        cacheKey,
        `/api/car-models?brand=${encodeURIComponent(brand)}&model=${encodeURIComponent(model)}`
      );
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

  // Fetch badges/trims when a generation variant is selected
  useEffect(() => {
    if (filters.brand && filters.model && filters.modelVariant) {
      const cacheKey = `badges:${filters.brand}:${filters.model}:${filters.modelVariant}`;
      const cached = clientCache.get(cacheKey) as { badges?: BadgeOption[]; badgeTree?: BadgeTreeGroup[] } | undefined;
      if (cached) {
        setBadgeList(cached.badges || []);
        setBadgeTree(cached.badgeTree || []);
        setBadgeLoading(false);
        return;
      }

      let cancelled = false;
      setBadgeLoading(true);
      setShowAllBadges(false);
      setExpandedGroup(null);
      setExpandedBadge(null);
      fetchCachedJson<{ badges?: BadgeOption[]; badgeTree?: BadgeTreeGroup[] }>(
        cacheKey,
        `/api/car-models?brand=${encodeURIComponent(filters.brand)}&model=${encodeURIComponent(filters.model)}&variant=${encodeURIComponent(filters.modelVariant)}`
      )
        .then(data => {
          if (cancelled) return;
          setBadgeList(data.badges || []);
          setBadgeTree(data.badgeTree || []);
        })
        .catch(() => { if (!cancelled) { setBadgeList([]); setBadgeTree([]); } })
        .finally(() => { if (!cancelled) setBadgeLoading(false); });

      return () => { cancelled = true; };
    } else {
      setBadgeList([]);
      setBadgeTree([]);
    }
  }, [filters.brand, filters.model, filters.modelVariant]);

  const selectedBrandCount = brandCounts?.find(b => b.name === filters.brand)?.count;
  const totalGenCount = generationTotal || generationVariants.reduce((sum, v) => sum + v.count, 0);

  const selectedGenName = filters.modelVariant
    ? translateGenerationName(filters.modelVariant)
    : undefined;

  const handleBrandSelect = (brand: string) => {
    onChange({ ...filters, brand, model: undefined, modelVariant: undefined, badge: undefined, badgeDetail: undefined, page: 1 });
    setBrandOpen(false);
    setModelOpen(true);
    setGenOpen(false);

    const cacheKey = `models:${brand}`;
    if (!clientCache.has(cacheKey)) {
      fetchCachedJson<{ models?: ModelOption[] }>(
        cacheKey,
        `/api/car-models?brand=${encodeURIComponent(brand)}`
      ).catch(() => undefined);
    }
  };

  const handleModelSelect = (model: string) => {
    onChange({ ...filters, model, modelVariant: undefined, badge: undefined, badgeDetail: undefined, page: 1 });
    setModelOpen(false);
    setGenOpen(false);

    if (filters.brand) {
      const cacheKey = `generations:${filters.brand}:${model}`;
      if (!clientCache.has(cacheKey)) {
        fetchCachedJson<{ models?: ModelVariant[]; total?: number }>(
          cacheKey,
          `/api/car-models?brand=${encodeURIComponent(filters.brand)}&model=${encodeURIComponent(model)}`
        ).catch(() => undefined);
      }
    }
  };

  const handleGenSelect = (variant?: string) => {
    onChange({ ...filters, modelVariant: variant, badge: undefined, badgeDetail: undefined, page: 1 });
    setGenOpen(false);
  };

  const clearBrand = () => {
    onChange({ ...filters, brand: undefined, model: undefined, modelVariant: undefined, badge: undefined, badgeDetail: undefined, page: 1 });
    setBrandOpen(false);
    setModelOpen(false);
    setGenOpen(false);
  };

  const clearModel = () => {
    onChange({ ...filters, model: undefined, modelVariant: undefined, badge: undefined, badgeDetail: undefined, page: 1 });
    setModelOpen(false);
    setGenOpen(false);
  };

  const update = (key: keyof CarFilters, value: string | number | undefined) => {
    onChange({ ...filters, [key]: value || undefined, page: 1 });
  };

  const toggleYearShortcut = (yearFrom: number) => {
    const enabled = filters.yearFrom === yearFrom && !filters.yearTo && !filters.monthFrom && !filters.monthTo;
    onChange({
      ...filters,
      yearFrom: enabled ? undefined : yearFrom,
      yearTo: undefined,
      monthFrom: undefined,
      monthTo: undefined,
      page: 1,
    });
  };

  const activeFilterCount = [
    filters.fuel, filters.yearFrom, filters.yearTo,
    filters.monthFrom, filters.monthTo,
    filters.hpFrom, filters.hpTo,
    filters.priceFrom, filters.priceTo,
    filters.mileageTo, filters.mileageFrom, filters.transmission,
    filters.drivetrain, filters.color,
  ].filter(Boolean).length + (filters.options?.length || 0);


  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
      {/* Brand selector */}
      <SelectBox
        label=""
        value={filters.brand}
        count={selectedBrandCount}
        placeholder={t('search.brandPlaceholder')}
        open={brandOpen}
        onToggle={() => { setBrandOpen(!brandOpen); setModelOpen(false); setGenOpen(false); }}
        onClear={filters.brand ? clearBrand : undefined}
        sheetTitle={t('search.chooseBrand')}
        showResultsLabel={totalCars ? `${t('search.showResults')} ${totalCars.toLocaleString('ru-RU')} ${t('search.cars')}` : undefined}
      >
        {brandCounts && brandCounts.length > 0 ? (
          <div className="py-1">
            {brandCounts.map((b) => (
              <button
                key={b.name}
                onClick={() => handleBrandSelect(b.name)}
                className={`w-full flex items-center justify-between px-4 py-3.5 lg:px-3 lg:py-2.5 transition-all text-left hover:bg-gray-50 ${
                  filters.brand === b.name ? 'bg-primary/5 text-primary font-medium' : 'text-gray-700'
                }`}
              >
                <span className="text-base lg:text-sm">{b.name}</span>
                <span className="text-base lg:text-sm text-gray-400 tabular-nums">{b.count.toLocaleString('ru-RU')}</span>
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
      {filters.brand ? (
        <SelectBox
          label=""
          value={modelList.find(m => m.name === filters.model || m.nameKo === filters.model)?.name || filters.model}
          count={totalGenCount || undefined}
          placeholder={t('search.allModels')}
          open={modelOpen}
          onToggle={() => { setModelOpen(!modelOpen); setBrandOpen(false); setGenOpen(false); }}
          onClear={filters.model ? clearModel : undefined}
          sheetTitle={t('search.chooseModel')}
        >
          {modelLoading ? (
            <div className="flex items-center gap-2 px-3 py-4 justify-center">
              <svg className="animate-spin h-4 w-4 text-primary" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span className="text-sm text-gray-400">{t('search.loading')}</span>
            </div>
          ) : (
            <div className="py-1">
              {modelList.map((m) => {
                const modelValue = m.nameKo || m.name;
                return (
                  <button
                    key={m.name}
                    onClick={() => handleModelSelect(modelValue)}
                    className={`w-full flex items-center justify-between px-4 py-3.5 lg:px-3 lg:py-2.5 transition-all text-left hover:bg-gray-50 ${
                      filters.model === modelValue ? 'bg-primary/5 text-primary font-medium' : 'text-gray-700'
                    }`}
                  >
                    <span className="text-base lg:text-sm">{m.name}</span>
                    <span className="text-base lg:text-sm text-gray-400 tabular-nums">{m.count.toLocaleString('ru-RU')}</span>
                  </button>
                );
              })}
              {modelList.length === 0 && (
                <p className="px-4 py-2 text-base lg:text-sm text-gray-400">{t('search.noModels')}</p>
              )}
            </div>
          )}
        </SelectBox>
      ) : null}

      <div className="border-t border-gray-100 px-4 py-3">
        <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
          {t('search.yearShortcut')}
        </div>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => toggleYearShortcut(2014)}
            className={`flex items-center gap-2 rounded-xl px-2 py-2.5 text-left text-sm font-semibold transition-all ${
              filters.yearFrom === 2014 && !filters.yearTo
                ? 'bg-gray-950 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <span className={`h-6 w-10 rounded-full p-0.5 transition-colors ${
              filters.yearFrom === 2014 && !filters.yearTo ? 'bg-white/25' : 'bg-gray-300'
            }`}>
              <span className={`block h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${
                filters.yearFrom === 2014 && !filters.yearTo ? 'translate-x-4' : ''
              }`} />
            </span>
            {t('search.tajikistanYearFilter')}
          </button>
          <button
            onClick={() => toggleYearShortcut(2021)}
            className={`flex items-center gap-2 rounded-xl px-2 py-2.5 text-left text-sm font-semibold transition-all ${
              filters.yearFrom === 2021 && !filters.yearTo
                ? 'bg-gray-950 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <span className={`h-6 w-10 rounded-full p-0.5 transition-colors ${
              filters.yearFrom === 2021 && !filters.yearTo ? 'bg-white/25' : 'bg-gray-300'
            }`}>
              <span className={`block h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${
                filters.yearFrom === 2021 && !filters.yearTo ? 'translate-x-4' : ''
              }`} />
            </span>
            {t('search.russiaYearFilter')}
          </button>
        </div>
      </div>

      {/* Generation selector */}
      {showMoreFilters && filters.model && (
        <SelectBox
          label=""
          value={selectedGenName || t('search.all')}
          count={filters.modelVariant
            ? generationVariants.find(v => v.name === filters.modelVariant)?.count
            : totalGenCount || undefined}
          placeholder={t('search.all')}
          open={genOpen}
          onToggle={() => { setGenOpen(!genOpen); setBrandOpen(false); setModelOpen(false); }}
          onClear={filters.modelVariant ? () => handleGenSelect(undefined) : undefined}
          sheetTitle={t('search.chooseGeneration')}
        >
          {generationLoading ? (
            <div className="flex items-center gap-2 px-3 py-4 justify-center">
              <svg className="animate-spin h-4 w-4 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span className="text-sm text-gray-400">{t('search.loading')}</span>
            </div>
          ) : (
            <div className="py-1">
              {/* "All" option */}
              <button
                onClick={() => handleGenSelect(undefined)}
                className={`w-full flex items-center justify-between px-4 py-3.5 lg:px-3 lg:py-2.5 transition-all text-left hover:bg-gray-50 ${
                  !filters.modelVariant ? 'bg-primary/5 text-primary font-medium' : 'text-gray-700'
                }`}
              >
                <span className="text-base lg:text-sm">{t('search.all')}</span>
                <span className="text-base lg:text-sm text-gray-400 tabular-nums">{totalGenCount.toLocaleString('ru-RU')}</span>
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
                    className={`w-full flex items-center justify-between px-4 py-3.5 lg:px-3 lg:py-2.5 transition-all text-left hover:bg-gray-50 ${
                      filters.modelVariant === v.name ? 'bg-primary/5 text-primary font-medium' : 'text-gray-700'
                    }`}
                  >
                    <span className="text-base lg:text-sm">
                      {translated}
                      {yearRange && <span className="text-gray-400 ml-1">{yearRange}</span>}
                    </span>
                    <span className="text-base lg:text-sm text-gray-400 tabular-nums ml-2 flex-shrink-0">
                      {v.count.toLocaleString('ru-RU')}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </SelectBox>
      )}

      {/* Hierarchical Badge Tree: Fuel+Drivetrain → Engine Badge → Trim */}
      {showMoreFilters && filters.modelVariant && (badgeTree.length > 0 || badgeLoading) && (
        <div className="px-4 py-3 border-t border-gray-100">
          <label className="text-sm font-semibold text-gray-700 mb-2 block">{t('filter.type')}</label>
          {badgeLoading ? (
            <div className="flex items-center gap-2 py-2 justify-center">
              <svg className="animate-spin h-4 w-4 text-primary" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
          ) : badgeTree.length > 1 ? (
            /* Multi-group tree: show Fuel+Drivetrain → Badge → BadgeDetail */
            <div className="space-y-0.5">
              {badgeTree.map((group) => {
                const groupKey = `${group.fuel}|${group.drivetrain}`;
                const groupLabel = [translateBadgeDetail(group.fuel), group.drivetrain].filter(Boolean).join(' ');
                const isGroupExpanded = expandedGroup === groupKey;
                const isGroupSelected = filters.badge && group.badges.some(b => b.name === filters.badge);

                return (
                  <div key={groupKey}>
                    {/* Level 1: Fuel + Drivetrain group */}
                    <button
                      onClick={() => {
                        setExpandedGroup(isGroupExpanded ? null : groupKey);
                        if (!isGroupExpanded) setExpandedBadge(null);
                      }}
                      className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-sm transition-all text-left ${
                        isGroupSelected
                          ? 'bg-primary/5 text-primary font-medium'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <span className="flex items-center gap-1.5">
                        <svg className={`w-3.5 h-3.5 text-gray-400 transition-transform flex-shrink-0 ${isGroupExpanded ? 'rotate-90' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                        <span className="truncate">{groupLabel || t('filter.type')}</span>
                      </span>
                      <span className="text-xs text-gray-400 tabular-nums ml-2 flex-shrink-0">{group.count}</span>
                    </button>

                    {/* Level 2: Engine badges within group */}
                    {isGroupExpanded && (
                      <div className="ml-4 mt-0.5 space-y-0.5 border-l-2 border-gray-100 pl-2">
                        {group.badges.map((b) => {
                          const isBadgeSelected = filters.badge === b.name;
                          const isBadgeExpanded = expandedBadge === b.name;

                          return (
                            <div key={b.name}>
                              <button
                                onClick={() => {
                                  if (isBadgeSelected) {
                                    onChange({ ...filters, badge: undefined, badgeDetail: undefined, page: 1 });
                                    setExpandedBadge(null);
                                  } else {
                                    onChange({ ...filters, badge: b.name, badgeDetail: undefined, page: 1 });
                                    setExpandedBadge(b.badgeDetails.length > 0 ? b.name : null);
                                  }
                                }}
                                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-sm transition-all text-left ${
                                  isBadgeSelected
                                    ? 'bg-primary/10 text-primary font-medium'
                                    : 'text-gray-600 hover:bg-gray-50'
                                }`}
                              >
                                <span className="flex items-center gap-1.5 truncate">
                                  {b.badgeDetails.length > 0 && (
                                    <svg className={`w-3 h-3 text-gray-400 transition-transform flex-shrink-0 ${isBadgeExpanded ? 'rotate-90' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                  )}
                                  <span className="truncate">{translateBadgeDetail(b.name)}</span>
                                </span>
                                <span className="text-xs text-gray-400 tabular-nums ml-2 flex-shrink-0">{b.count}</span>
                              </button>

                              {/* Level 3: Trim tiers */}
                              {isBadgeSelected && isBadgeExpanded && b.badgeDetails.length > 0 && (
                                <div className="ml-4 mt-0.5 space-y-0.5 border-l-2 border-gray-100 pl-2">
                                  {b.badgeDetails.map((d) => (
                                    <button
                                      key={d.name}
                                      onClick={() => onChange({ ...filters, badgeDetail: filters.badgeDetail === d.name ? undefined : d.name, page: 1 })}
                                      className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-all text-left ${
                                        filters.badgeDetail === d.name
                                          ? 'bg-primary/10 text-primary font-medium'
                                          : 'text-gray-500 hover:bg-gray-50'
                                      }`}
                                    >
                                      <span className="truncate">{translateBadgeDetail(d.name)}</span>
                                      <span className="text-xs text-gray-400 tabular-nums ml-2 flex-shrink-0">{d.count}</span>
                                    </button>
                                  ))}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            /* Single group or no fuel data: show flat badge list (fallback) */
            <div className="space-y-0.5">
              {(showAllBadges ? badgeList : badgeList.slice(0, 8)).map((b) => {
                const isBadgeSelected = filters.badge === b.name;
                const details = b.badgeDetails || [];
                return (
                  <div key={b.name}>
                    <button
                      onClick={() => {
                        if (isBadgeSelected) {
                          onChange({ ...filters, badge: undefined, badgeDetail: undefined, page: 1 });
                          setExpandedBadge(null);
                        } else {
                          onChange({ ...filters, badge: b.name, badgeDetail: undefined, page: 1 });
                          setExpandedBadge(details.length > 0 ? b.name : null);
                        }
                      }}
                      className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-sm transition-all text-left ${
                        isBadgeSelected
                          ? 'bg-primary/10 text-primary font-medium'
                          : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      <span className="truncate">{translateBadgeDetail(b.name)}</span>
                      <span className="text-xs text-gray-400 tabular-nums ml-2 flex-shrink-0">{b.count}</span>
                    </button>
                    {/* Trim tiers for flat list */}
                    {isBadgeSelected && expandedBadge === b.name && details.length > 0 && (
                      <div className="ml-4 mt-0.5 space-y-0.5 border-l-2 border-gray-100 pl-2">
                        {details.map((d) => (
                          <button
                            key={d.name}
                            onClick={() => onChange({ ...filters, badgeDetail: filters.badgeDetail === d.name ? undefined : d.name, page: 1 })}
                            className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-all text-left ${
                              filters.badgeDetail === d.name
                                ? 'bg-primary/10 text-primary font-medium'
                                : 'text-gray-500 hover:bg-gray-50'
                            }`}
                          >
                            <span className="truncate">{translateBadgeDetail(d.name)}</span>
                            <span className="text-xs text-gray-400 tabular-nums ml-2 flex-shrink-0">{d.count}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
              {badgeList.length > 8 && !showAllBadges && (
                <button
                  onClick={() => setShowAllBadges(true)}
                  className="text-xs text-primary hover:underline px-2.5 py-1"
                >
                  {t('filter.showMore')} {badgeList.length - 8}
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Advanced filters */}
      <button
        onClick={() => setShowMoreFilters(!showMoreFilters)}
        className="flex w-full items-center justify-between border-t border-gray-100 px-4 py-3.5 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50"
      >
        <span className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100 text-gray-700">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
            </svg>
          </span>
          {showMoreFilters ? t('search.hideFilters') : t('search.moreFilters')}
          {!showMoreFilters && activeFilterCount > 0 && (
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white">{activeFilterCount}</span>
          )}
        </span>
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100">
          <ChevronIcon open={showMoreFilters} />
        </span>
      </button>

      {showMoreFilters && (
      <div className="border-t border-gray-100 max-h-[500px] overflow-y-auto">
        {/* Year + Month */}
        <FilterSection title={t('filter.year')} defaultOpen={false} count={(filters.yearFrom || filters.yearTo) ? 1 : 0}>
          <div className="space-y-2">
            <div className="flex gap-2">
              <select
                value={filters.yearFrom || ''}
                onChange={(e) => update('yearFrom', e.target.value ? parseInt(e.target.value) : undefined)}
                className="input-field"
              >
                <option value="">{t('filter.yearFrom')}</option>
                {YEAR_OPTIONS.map((y) => <option key={y} value={y}>{y}</option>)}
              </select>
              {!compact && (
                <select
                  value={filters.monthFrom || ''}
                  onChange={(e) => update('monthFrom', e.target.value ? parseInt(e.target.value) : undefined)}
                  className="input-field"
                >
                  <option value="">{t('filter.month')}</option>
                  {MONTHS.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
                </select>
              )}
            </div>
            <div className="flex gap-2">
              <select
                value={filters.yearTo || ''}
                onChange={(e) => update('yearTo', e.target.value ? parseInt(e.target.value) : undefined)}
                className="input-field"
              >
                <option value="">{t('filter.yearTo')}</option>
                {YEAR_OPTIONS.map((y) => <option key={y} value={y}>{y}</option>)}
              </select>
              {!compact && (
                <select
                  value={filters.monthTo || ''}
                  onChange={(e) => update('monthTo', e.target.value ? parseInt(e.target.value) : undefined)}
                  className="input-field"
                >
                  <option value="">{t('filter.month')}</option>
                  {MONTHS.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
                </select>
              )}
            </div>
          </div>
        </FilterSection>

        {/* Horsepower */}
        <FilterSection title={t('filter.hp')} defaultOpen={false} count={(filters.hpFrom || filters.hpTo) ? 1 : 0}>
          <div className="flex gap-2">
            <input
              type="number"
              value={filters.hpFrom || ''}
              onChange={(e) => update('hpFrom', e.target.value ? parseInt(e.target.value) : undefined)}
              placeholder={t('filter.hpFrom')}
              className="input-field"
            />
            <input
              type="number"
              value={filters.hpTo || ''}
              onChange={(e) => update('hpTo', e.target.value ? parseInt(e.target.value) : undefined)}
              placeholder={t('filter.hpTo')}
              className="input-field"
            />
          </div>
        </FilterSection>

        {/* Price */}
        <FilterSection title={t('filter.price')} defaultOpen={false} count={(filters.priceFrom || filters.priceTo) ? 1 : 0}>
          <div className="flex gap-2">
            <input
              type="number"
              value={filters.priceFrom || ''}
              onChange={(e) => update('priceFrom', e.target.value ? parseInt(e.target.value) : undefined)}
              placeholder={t('filter.from')}
              className="input-field"
            />
            <input
              type="number"
              value={filters.priceTo || ''}
              onChange={(e) => update('priceTo', e.target.value ? parseInt(e.target.value) : undefined)}
              placeholder={t('filter.to')}
              className="input-field"
            />
          </div>
        </FilterSection>

        {/* Mileage */}
        <FilterSection title={t('filter.mileage')} defaultOpen={false} count={(filters.mileageFrom || filters.mileageTo) ? 1 : 0}>
          <div className="flex gap-2">
            <input
              type="number"
              value={filters.mileageFrom || ''}
              onChange={(e) => update('mileageFrom', e.target.value ? parseInt(e.target.value) : undefined)}
              placeholder={t('filter.fromKm')}
              className="input-field"
            />
            <input
              type="number"
              value={filters.mileageTo || ''}
              onChange={(e) => update('mileageTo', e.target.value ? parseInt(e.target.value) : undefined)}
              placeholder={t('filter.toKm')}
              className="input-field"
            />
          </div>
        </FilterSection>

        {/* Extra filters — hidden in compact mode until "More" is tapped */}
        {(!compact || showMoreFilters) && (
          <>
            {/* Color */}
            <FilterSection title={t('filter.color')} defaultOpen={false} count={filters.color ? 1 : 0}>
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
            <FilterSection title={t('filter.fuelType')} defaultOpen={false} count={filters.fuel ? 1 : 0}>
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
            <FilterSection title={t('filter.transmission')} defaultOpen={false} count={filters.transmission ? 1 : 0}>
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
            <FilterSection title={t('filter.drivetrain')} defaultOpen={false} count={filters.drivetrain ? 1 : 0}>
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
            <FilterSection title={t('filter.options')} defaultOpen={false} count={filters.options?.length || 0}>
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

      )}
    </div>
  );
}
