export interface CatalogModelOption {
  name: string;
  nameKo: string;
  count: number;
}

export interface CatalogNavigation {
  brands: { name: string; nameKo: string; count: number }[];
  modelsByBrand: Record<string, CatalogModelOption[]>;
  total: number;
  generatedAt: string;
}

// Client-safe lookup: no full vehicle snapshot or network request is needed.
export function getCatalogModels(navigation: CatalogNavigation, brand?: string): CatalogModelOption[] {
  if (!brand) return [];
  const canonicalName = navigation.brands.find(item => item.name === brand || item.nameKo === brand)?.name;
  return navigation.modelsByBrand[canonicalName || brand] || [];
}
