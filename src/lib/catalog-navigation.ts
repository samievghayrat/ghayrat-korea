export interface CatalogModelOption {
  name: string;
  nameKo: string;
  count: number;
}

export interface CatalogGenerationOption {
  name: string;
  count: number;
  yearFrom: number;
  yearTo: number;
}

export interface CatalogGenerationData {
  models: CatalogGenerationOption[];
  total: number;
}

export interface CatalogNavigation {
  brands: { name: string; nameKo: string; count: number }[];
  modelsByBrand: Record<string, CatalogModelOption[]>;
  generationsByBrandModel?: Record<string, Record<string, CatalogGenerationData>>;
  total: number;
  generatedAt: string;
}

// Client-safe lookup: no full vehicle snapshot or network request is needed.
export function getCatalogModels(navigation: CatalogNavigation, brand?: string): CatalogModelOption[] {
  if (!brand) return [];
  const canonicalName = navigation.brands.find(item => item.name === brand || item.nameKo === brand)?.name;
  return navigation.modelsByBrand[canonicalName || brand] || [];
}

// Generation options travel with the initial catalogue navigation payload, so
// selecting a model never needs to wait for another server request.
export function getCatalogGenerations(
  navigation: CatalogNavigation,
  brand?: string,
  model?: string,
): CatalogGenerationData | undefined {
  if (!brand || !model) return undefined;
  const canonicalBrand = navigation.brands.find(item => item.name === brand || item.nameKo === brand)?.name || brand;
  const modelOption = navigation.modelsByBrand[canonicalBrand]?.find(item => item.name === model || item.nameKo === model);
  const modelKey = modelOption?.nameKo || model;
  return navigation.generationsByBrandModel?.[canonicalBrand]?.[modelKey];
}
