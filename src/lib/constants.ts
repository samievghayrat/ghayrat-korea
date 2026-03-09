export const BRANDS = [
  'Hyundai', 'Kia', 'Genesis', 'Chevrolet', 'KG Mobility', 'Renault Korea',
  'Toyota', 'Lexus', 'Honda', 'Nissan', 'Infiniti', 'Mazda', 'Subaru', 'Suzuki', 'Daihatsu',
  'BMW', 'Mercedes-Benz', 'Audi', 'Volkswagen', 'Porsche', 'Mini',
  'Volvo', 'Land Rover', 'Jaguar', 'Peugeot', 'Fiat', 'Saab',
  'Tesla', 'Ford', 'Jeep', 'Lincoln', 'Cadillac', 'GMC', 'Dodge', 'Chrysler',
  'Bentley', 'Rolls-Royce', 'Maserati', 'Ferrari', 'Lamborghini', 'Aston Martin', 'McLaren', 'Lotus',
] as const;

// Model options per brand for cascade filter
export const BRAND_MODELS: Record<string, string[]> = {
  'Hyundai': ['Sonata', 'Tucson', 'Santa Fe', 'Palisade', 'Grandeur', 'Avante', 'Kona', 'Casper', 'Ioniq 5', 'Ioniq 6', 'Staria', 'Venue', 'Creta', 'i30', 'i20'],
  'Kia': ['K3', 'K5', 'Sportage', 'Sorento', 'Carnival', 'Seltos', 'Morning', 'EV6', 'Niro', 'K8', 'K9', 'Stinger', 'Ray', 'Mohave', 'Soul', 'EV9'],
  'Genesis': ['G70', 'G80', 'G90', 'GV70', 'GV80', 'GV60', 'Electrified G80'],
  'Chevrolet': ['Trailblazer', 'Spark', 'Malibu', 'Equinox', 'Traverse', 'Tahoe', 'Suburban', 'Trax'],
  'SsangYong': ['Torres', 'Rexton', 'Tivoli', 'Korando', 'Musso'],
  'BMW': ['3 Series', '5 Series', '7 Series', 'X3', 'X5', 'X7', 'iX', 'i4', 'Z4'],
  'Mercedes-Benz': ['C-Class', 'E-Class', 'S-Class', 'GLC', 'GLE', 'GLS', 'EQS', 'A-Class', 'CLA'],
  'Toyota': ['Camry', 'RAV4', 'Highlander', 'Land Cruiser', 'Corolla', 'GR86', 'Supra', 'Crown'],
  'Lexus': ['ES', 'IS', 'LS', 'NX', 'RX', 'UX', 'LX', 'LC'],
  'Volkswagen': ['Tiguan', 'Passat', 'Golf', 'Polo', 'Touareg', 'ID.4', 'Arteon'],
  'Audi': ['A4', 'A6', 'A8', 'Q3', 'Q5', 'Q7', 'Q8', 'e-tron', 'RS6'],
  'Porsche': ['Cayenne', 'Macan', 'Panamera', '911', 'Taycan'],
  'Volvo': ['XC40', 'XC60', 'XC90', 'S60', 'S90', 'V60'],
  'Honda': ['CR-V', 'Civic', 'Accord', 'HR-V', 'Pilot'],
};

export const FUEL_TYPES = [
  { value: 'gasoline', label: 'Бензин' },
  { value: 'diesel', label: 'Дизель' },
  { value: 'hybrid', label: 'Гибрид' },
  { value: 'electric', label: 'Электро' },
  { value: 'lpg', label: 'Газ (LPG)' },
] as const;

export const BODY_TYPES = [
  { value: 'sedan', label: 'Седан' },
  { value: 'suv', label: 'Кроссовер/Внедорожник' },
  { value: 'hatchback', label: 'Хэтчбек' },
  { value: 'wagon', label: 'Универсал' },
  { value: 'coupe', label: 'Купе' },
  { value: 'convertible', label: 'Кабриолет' },
  { value: 'minivan', label: 'Минивэн' },
  { value: 'pickup', label: 'Пикап' },
] as const;

export const TRANSMISSION_TYPES = [
  { value: 'auto', label: 'Автомат' },
  { value: 'manual', label: 'Механика' },
  { value: 'dct', label: 'Робот (DCT)' },
  { value: 'cvt', label: 'Вариатор (CVT)' },
] as const;

export const DRIVETRAIN_TYPES = [
  { value: 'fwd', label: 'Передний' },
  { value: 'rwd', label: 'Задний' },
  { value: 'awd', label: 'Полный (AWD)' },
] as const;

export const COLOR_OPTIONS = [
  { value: 'white', label: 'Белый' },
  { value: 'black', label: 'Черный' },
  { value: 'gray', label: 'Серый' },
  { value: 'silver', label: 'Серебристый' },
  { value: 'blue', label: 'Синий' },
  { value: 'red', label: 'Красный' },
  { value: 'brown', label: 'Коричневый' },
  { value: 'green', label: 'Зеленый' },
  { value: 'other', label: 'Другой' },
] as const;

export const MILEAGE_OPTIONS = [
  { value: '10000', label: 'до 10 000 км' },
  { value: '30000', label: 'до 30 000 км' },
  { value: '50000', label: 'до 50 000 км' },
  { value: '70000', label: 'до 70 000 км' },
  { value: '100000', label: 'до 100 000 км' },
  { value: '150000', label: 'до 150 000 км' },
] as const;

export const SORT_OPTIONS = [
  { value: 'price_asc', label: 'Цена: по возрастанию' },
  { value: 'price_desc', label: 'Цена: по убыванию' },
  { value: 'year_desc', label: 'Год: сначала новые' },
  { value: 'year_asc', label: 'Год: сначала старые' },
  { value: 'mileage_asc', label: 'Пробег: по возрастанию' },
  { value: 'mileage_desc', label: 'Пробег: по убыванию' },
] as const;

export const CAR_OPTIONS = [
  { code: '010', label: 'Люк (санруф)' },
  { code: '014', label: 'Кожаный салон' },
  { code: '005', label: 'Навигация' },
  { code: '058', label: 'Камера заднего вида' },
  { code: '087', label: 'Камера 360°' },
  { code: '075', label: 'Фары LED' },
  { code: '007', label: 'Подогрев сидений' },
  { code: '009', label: 'Вентиляция сидений' },
  { code: '082', label: 'Подогрев руля' },
  { code: '023', label: 'Климат-контроль' },
  { code: '068', label: 'Круиз-контроль' },
  { code: '079', label: 'Адаптивный круиз' },
  { code: '057', label: 'Бесключевой запуск' },
  { code: '059', label: 'Электро-багажник' },
  { code: '088', label: 'Контроль полосы' },
  { code: '086', label: 'Контроль слепых зон' },
  { code: '095', label: 'HUD (проекция)' },
  { code: '091', label: 'Массаж сидений' },
] as const;

export const POPULAR_BRANDS = [
  'Hyundai', 'Kia', 'Genesis', 'BMW', 'Mercedes-Benz',
  'Toyota', 'Lexus', 'Chevrolet',
] as const;

export const YEAR_OPTIONS = Array.from(
  { length: new Date().getFullYear() - 2000 + 1 },
  (_, i) => new Date().getFullYear() - i
);

export const PRICE_RANGE_OPTIONS = [
  { value: '50', label: 'до 500 000 ₽' },
  { value: '100', label: 'до 1 000 000 ₽' },
  { value: '150', label: 'до 1 500 000 ₽' },
  { value: '200', label: 'до 2 000 000 ₽' },
  { value: '300', label: 'до 3 000 000 ₽' },
  { value: '500', label: 'до 5 000 000 ₽' },
] as const;

export const DEFAULT_SETTINGS = {
  serviceFeeUsd: 1600,
  brokerFee: 100000,
  contactPhone: '+82-10-9922-1601',
  contactTelegram: 'ghayrat_korea',
  contactWhatsApp: '+821099221601',
  aboutText: '',
  exchangeRateMarkup: 1.03,
};

// Exchange rates (would be fetched from API in production)
export const EXCHANGE_RATES = {
  USD: 87.50,
  EUR: 95.20,
  KRW: 0.062,
  updated: '2026-03-06',
};
