import type { DamagedCar, DamagedCarSummary } from './damaged-cars';
export function normalizeALName(raw: string): { brand: string; model: string; title: string };
export function resolveALImage(source: string): string | null;
export function parseALCatalogue(html: string, now?: number): { cars: DamagedCarSummary[]; pageCount: number };
export function parseALDetail(html: string, summary: DamagedCarSummary, now?: number): DamagedCar;
