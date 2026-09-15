export const MAX_CAR_PHOTOS = 20;
export const MAX_PHOTO_BYTES = 2 * 1024 * 1024;

export function detectCarPhotoType(bytes: Uint8Array): string | undefined {
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return 'image/jpeg';
  if (bytes.length >= 8 && [137, 80, 78, 71, 13, 10, 26, 10].every((v, i) => bytes[i] === v)) return 'image/png';
  if (bytes.length >= 12 && String.fromCharCode(...bytes.slice(0, 4)) === 'RIFF' && String.fromCharCode(...bytes.slice(8, 12)) === 'WEBP') return 'image/webp';
  return undefined;
}

export function isCarImageUrl(value: unknown): value is string {
  if (typeof value !== 'string' || value.length > 2000) return false;
  if (/^\/api\/own-car-photos\/[a-f0-9]{24}$/.test(value)) return true;
  try { const url = new URL(value); return url.protocol === 'https:' && !url.username && !url.password; } catch { return false; }
}

export function validateOwnCarInput(body: unknown) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) throw new Error('Проверьте данные автомобиля.');
  const input = body as Record<string, unknown>;
  const text = (key: string, max: number, required = false) => {
    const value = typeof input[key] === 'string' ? input[key].trim() : '';
    if ((required && !value) || value.length > max) throw new Error(`Проверьте поле: ${key}.`);
    return value;
  };
  const number = (key: string, min: number, max: number, optional = false) => {
    const value = input[key];
    if (optional && (value === undefined || value === null || value === '' || value === 0)) return undefined;
    if (typeof value !== 'number' || !Number.isSafeInteger(value) || value < min || value > max) throw new Error(`Проверьте поле: ${key}.`);
    return value;
  };
  const images = input.images;
  if (!Array.isArray(images) || images.length > MAX_CAR_PHOTOS || !images.every(isCarImageUrl)) throw new Error('Добавьте не более 20 фотографий в поддерживаемом формате.');
  const equipment = input.equipment ?? [];
  if (!Array.isArray(equipment) || equipment.length > 100 || equipment.some(v => typeof v !== 'string' || v.length > 150)) throw new Error('Проверьте комплектацию.');
  const priceUsd = number('price_usd', 1, 10000000, true);
  const priceKrw = number('price_krw', 1, 20000000000, true);
  if (!priceUsd && !priceKrw) throw new Error('Укажите цену автомобиля.');
  if (input.isActive !== undefined && typeof input.isActive !== 'boolean') throw new Error('Проверьте статус объявления.');
  const isActive = input.isActive ?? false;
  if (isActive && images.length === 0) throw new Error('Перед публикацией добавьте хотя бы одну фотографию.');
  return {
    brand: text('brand', 80, true), model: text('model', 120, true),
    year: number('year', 1950, new Date().getFullYear() + 1)!, mileage: number('mileage', 0, 2000000)!,
    fuel: text('fuel', 80, true), engine: text('engine', 80), hp: number('hp', 1, 2000, true) ?? 0,
    displacement: number('displacement', 1, 20000, true) ?? 0, color: text('color', 80),
    bodyType: text('bodyType', 80), transmission: text('transmission', 80), drivetrain: text('drivetrain', 80),
    price_usd: priceUsd, price_krw: priceKrw, images: [...images], description: text('description', 10000),
    equipment: [...equipment] as string[], vin: text('vin', 40), location: text('location', 150), isActive,
  };
}
