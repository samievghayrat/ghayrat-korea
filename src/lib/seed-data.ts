import type { CarListing } from '@/types';

// Expanded real car data with Encar CDN image URLs — 80 cars
export const SEED_CARS: CarListing[] = [
  // === HYUNDAI ===
  {
    id: 'own-1', source: 'own', brand: 'Hyundai', model: 'Sonata', generation: 'DN8', trim: 'Premium',
    year: 2023, month: 3, mileage: 15200, fuel: 'Бензин', engine: '2.0L', displacement: 1999, hp: 160,
    color: 'Белый', bodyType: 'Седан', transmission: 'Автомат', drivetrain: 'Передний',
    price_krw: 27500000, price_rub: 1870000, price_usd: 20800,
    imageUrl: 'https://ci.encar.com/carpicture02/pic_thb/20250224/24965461001001.jpg',
    images: ['https://ci.encar.com/carpicture02/pic_thb/20250224/24965461001001.jpg', 'https://ci.encar.com/carpicture02/pic_thb/20250224/24965461002002.jpg', 'https://ci.encar.com/carpicture02/pic_thb/20250224/24965461003003.jpg'],
    photoCount: 12, equipment: ['Камера заднего вида', 'Навигация', 'Кожаный салон', 'Подогрев сидений', 'Apple CarPlay'], accidentHistory: [], isActive: true,
  },
  {
    id: 'seed-2', source: 'encar', brand: 'Hyundai', model: 'Sonata', generation: 'DN8', trim: 'Sensuous',
    year: 2022, month: 7, mileage: 32000, fuel: 'Бензин', engine: '2.0L', displacement: 1999, hp: 160,
    color: 'Серый', bodyType: 'Седан', transmission: 'Автомат', drivetrain: 'Передний',
    price_krw: 23000000, price_rub: 1564000, price_usd: 17400,
    imageUrl: 'https://ci.encar.com/carpicture02/pic_thb/20250220/24952802001001.jpg',
    images: [], photoCount: 8, equipment: ['LED фары', 'Круиз-контроль', 'Парктроник', 'Подогрев руля'], accidentHistory: [],
  },
  {
    id: 'seed-3', source: 'encar', brand: 'Hyundai', model: 'Tucson', generation: 'NX4', trim: 'Signature',
    year: 2022, month: 11, mileage: 35000, fuel: 'Бензин', engine: '1.6T', displacement: 1598, hp: 180,
    color: 'Черный', bodyType: 'Кроссовер', transmission: 'Автомат (DCT)', drivetrain: 'Полный (AWD)',
    price_krw: 28900000, price_rub: 1966000, price_usd: 21850,
    imageUrl: 'https://ci.encar.com/carpicture02/pic_thb/20250225/24970284001001.jpg',
    images: [], photoCount: 15, equipment: ['Панорамная крыша', 'Кожаный салон', 'Вентиляция сидений', 'BOSE аудио'], accidentHistory: [],
  },
  {
    id: 'seed-4', source: 'encar', brand: 'Hyundai', model: 'Tucson', generation: 'NX4', trim: 'Premium',
    year: 2023, month: 5, mileage: 18000, fuel: 'Гибрид', engine: '1.6T HEV', displacement: 1598, hp: 230,
    color: 'Белый перламутр', bodyType: 'Кроссовер', transmission: 'Автомат', drivetrain: 'Полный (AWD)',
    price_krw: 33000000, price_rub: 2244000, price_usd: 24900,
    imageUrl: 'https://ci.encar.com/carpicture02/pic_thb/20250218/24944520001001.jpg',
    images: [], photoCount: 10, equipment: ['LED фары', 'Кожа', 'Навигация', 'Apple CarPlay'], accidentHistory: [],
  },
  {
    id: 'seed-5', source: 'encar', brand: 'Hyundai', model: 'Grandeur', generation: 'GN7', trim: 'Calligraphy',
    year: 2023, month: 1, mileage: 12000, fuel: 'Бензин', engine: '2.5L', displacement: 2497, hp: 198,
    color: 'Черный', bodyType: 'Седан', transmission: 'Автомат', drivetrain: 'Передний',
    price_krw: 39000000, price_rub: 2652000, price_usd: 29500,
    imageUrl: 'https://ci.encar.com/carpicture02/pic_thb/20250226/24972136001001.jpg',
    images: [], photoCount: 20, equipment: ['Кожа Nappa', 'Массаж сидений', 'JBL аудио 12 динамиков', 'Проекция HUD', 'Электропривод багажника'], accidentHistory: [],
  },
  {
    id: 'seed-6', source: 'encar', brand: 'Hyundai', model: 'Grandeur', generation: 'IG', trim: 'Exclusive',
    year: 2021, month: 6, mileage: 52000, fuel: 'Бензин', engine: '2.5L', displacement: 2497, hp: 198,
    color: 'Серебристый', bodyType: 'Седан', transmission: 'Автомат', drivetrain: 'Передний',
    price_krw: 26000000, price_rub: 1768000, price_usd: 19700,
    imageUrl: 'https://ci.encar.com/carpicture02/pic_thb/20250221/24959105001001.jpg',
    images: [], photoCount: 11, equipment: ['Кожаный салон', 'Навигация', 'Камера заднего вида'], accidentHistory: [],
  },
  {
    id: 'seed-7', source: 'encar', brand: 'Hyundai', model: 'Palisade', generation: 'LX2', trim: 'Calligraphy',
    year: 2022, month: 9, mileage: 38000, fuel: 'Бензин', engine: '3.8L', displacement: 3778, hp: 295,
    color: 'Белый перламутр', bodyType: 'Кроссовер', transmission: 'Автомат', drivetrain: 'Полный (AWD)',
    price_krw: 45000000, price_rub: 3060000, price_usd: 34000,
    imageUrl: 'https://ci.encar.com/carpicture02/pic_thb/20250219/24948733001001.jpg',
    images: [], photoCount: 18, equipment: ['7 мест', 'Кожа Nappa', 'Вентиляция 1+2 ряд', 'Камера 360°', 'Электропривод 3 ряда'], accidentHistory: [],
  },
  {
    id: 'seed-8', source: 'encar', brand: 'Hyundai', model: 'Palisade', generation: 'LX2', trim: 'Exclusive',
    year: 2021, month: 4, mileage: 61000, fuel: 'Дизель', engine: '2.2D', displacement: 2199, hp: 202,
    color: 'Темно-серый', bodyType: 'Кроссовер', transmission: 'Автомат', drivetrain: 'Полный (AWD)',
    price_krw: 37000000, price_rub: 2516000, price_usd: 28000,
    imageUrl: 'https://ci.encar.com/carpicture02/pic_thb/20250222/24961547001001.jpg',
    images: [], photoCount: 14, equipment: ['7 мест', 'Кожа', 'Навигация', 'Подогрев 2 ряда'], accidentHistory: [],
  },
  {
    id: 'seed-9', source: 'encar', brand: 'Hyundai', model: 'Santa Fe', generation: 'MX5', trim: 'Calligraphy',
    year: 2024, month: 2, mileage: 5000, fuel: 'Гибрид', engine: '1.6T HEV', displacement: 1598, hp: 232,
    color: 'Зеленый', bodyType: 'Кроссовер', transmission: 'Автомат', drivetrain: 'Полный (AWD)',
    price_krw: 48000000, price_rub: 3264000, price_usd: 36300,
    imageUrl: 'https://ci.encar.com/carpicture02/pic_thb/20250223/24963891001001.jpg',
    images: [], photoCount: 22, equipment: ['Кожа Nappa', 'HUD', 'JBL аудио', '360° камера', 'Электропривод багажника', 'Массаж'], accidentHistory: [],
  },
  {
    id: 'seed-10', source: 'encar', brand: 'Hyundai', model: 'Santa Fe', generation: 'TM', trim: 'Inspiration',
    year: 2021, month: 8, mileage: 55000, fuel: 'Дизель', engine: '2.2D', displacement: 2199, hp: 202,
    color: 'Коричневый', bodyType: 'Кроссовер', transmission: 'Автомат', drivetrain: 'Полный (AWD)',
    price_krw: 28000000, price_rub: 1904000, price_usd: 21200,
    imageUrl: 'https://ci.encar.com/carpicture02/pic_thb/20250217/24940112001001.jpg',
    images: [], photoCount: 9, equipment: ['Панорамная крыша', 'Кожа', '7 мест', 'Подогрев руля'], accidentHistory: [],
  },
  {
    id: 'seed-11', source: 'encar', brand: 'Hyundai', model: 'Avante', generation: 'CN7', trim: 'Exclusive',
    year: 2022, month: 5, mileage: 45000, fuel: 'Бензин', engine: '1.6L', displacement: 1598, hp: 123,
    color: 'Синий', bodyType: 'Седан', transmission: 'Автомат', drivetrain: 'Передний',
    price_krw: 18500000, price_rub: 1258000, price_usd: 14000,
    imageUrl: 'https://ci.encar.com/carpicture02/pic_thb/20250224/24967239001001.jpg',
    images: [], photoCount: 7, equipment: ['Камера заднего вида', 'Подогрев сидений', 'Apple CarPlay'], accidentHistory: [],
  },
  {
    id: 'seed-12', source: 'encar', brand: 'Hyundai', model: 'Avante', generation: 'CN7', trim: 'N-Line',
    year: 2023, month: 2, mileage: 21000, fuel: 'Бензин', engine: '1.6T', displacement: 1598, hp: 204,
    color: 'Красный', bodyType: 'Седан', transmission: 'Автомат (DCT)', drivetrain: 'Передний',
    price_krw: 24500000, price_rub: 1666000, price_usd: 18500,
    imageUrl: 'https://ci.encar.com/carpicture02/pic_thb/20250225/24969551001001.jpg',
    images: [], photoCount: 13, equipment: ['Спорт-пакет N-Line', 'Подвеска N', 'BOSE аудио', 'HUD'], accidentHistory: [],
  },
  {
    id: 'seed-13', source: 'encar', brand: 'Hyundai', model: 'Ioniq 5', generation: 'NE1', trim: 'Long Range',
    year: 2023, month: 6, mileage: 16000, fuel: 'Электро', engine: 'EV', displacement: 0, hp: 325,
    color: 'Серый матовый', bodyType: 'Кроссовер', transmission: 'Автомат', drivetrain: 'Полный (AWD)',
    price_krw: 52000000, price_rub: 3536000, price_usd: 39300,
    imageUrl: 'https://ci.encar.com/carpicture02/pic_thb/20250220/24954210001001.jpg',
    images: [], photoCount: 16, equipment: ['Батарея 77.4 кВт·ч', 'Запас хода 430 км', 'V2L', 'BOSE аудио', 'HUD'], accidentHistory: [],
  },
  {
    id: 'seed-14', source: 'encar', brand: 'Hyundai', model: 'Ioniq 6', generation: 'CE', trim: 'Prestige',
    year: 2023, month: 10, mileage: 9000, fuel: 'Электро', engine: 'EV', displacement: 0, hp: 325,
    color: 'Серебристый', bodyType: 'Седан', transmission: 'Автомат', drivetrain: 'Полный (AWD)',
    price_krw: 55000000, price_rub: 3740000, price_usd: 41600,
    imageUrl: 'https://ci.encar.com/carpicture02/pic_thb/20250221/24957683001001.jpg',
    images: [], photoCount: 19, equipment: ['Батарея 77.4 кВт·ч', 'Запас хода 524 км', 'Meridian аудио', 'Релаксация', '360° камера'], accidentHistory: [],
  },
  {
    id: 'seed-15', source: 'encar', brand: 'Hyundai', model: 'Kona', generation: 'SX2', trim: 'Inspiration',
    year: 2024, month: 1, mileage: 7000, fuel: 'Бензин', engine: '1.6T', displacement: 1598, hp: 198,
    color: 'Оливковый', bodyType: 'Кроссовер', transmission: 'Автомат (DCT)', drivetrain: 'Передний',
    price_krw: 27000000, price_rub: 1836000, price_usd: 20400,
    imageUrl: 'https://ci.encar.com/carpicture02/pic_thb/20250226/24973448001001.jpg',
    images: [], photoCount: 11, equipment: ['BOSE аудио', 'HUD', 'Кожа', 'Электропривод багажника'], accidentHistory: [],
  },
  {
    id: 'seed-16', source: 'encar', brand: 'Hyundai', model: 'Casper', generation: 'AX1', trim: 'Inspiration',
    year: 2023, month: 4, mileage: 5000, fuel: 'Бензин', engine: '1.0T', displacement: 998, hp: 100,
    color: 'Желтый', bodyType: 'Хэтчбек', transmission: 'Автомат', drivetrain: 'Передний',
    price_krw: 16500000, price_rub: 1122000, price_usd: 12500,
    imageUrl: 'https://ci.encar.com/carpicture02/pic_thb/20250226/24974102001001.jpg',
    images: [], photoCount: 8, equipment: ['LED фары', 'Камера заднего вида', 'Подогрев сидений'], accidentHistory: [],
  },
  {
    id: 'seed-17', source: 'encar', brand: 'Hyundai', model: 'Staria', generation: 'US4', trim: 'Lounge',
    year: 2022, month: 10, mileage: 40000, fuel: 'Дизель', engine: '2.2D', displacement: 2199, hp: 177,
    color: 'Серебристый', bodyType: 'Минивэн', transmission: 'Автомат', drivetrain: 'Передний',
    price_krw: 38000000, price_rub: 2584000, price_usd: 28700,
    imageUrl: 'https://ci.encar.com/carpicture02/pic_thb/20250223/24962118001001.jpg',
    images: [], photoCount: 14, equipment: ['9 мест', 'Кожаные кресла', 'Электрические двери', 'Второй ряд — капитан'], accidentHistory: [],
  },
  {
    id: 'seed-18', source: 'encar', brand: 'Hyundai', model: 'Venue', generation: 'QX', trim: 'Prestige',
    year: 2023, month: 7, mileage: 19000, fuel: 'Бензин', engine: '1.6L', displacement: 1598, hp: 123,
    color: 'Красный', bodyType: 'Кроссовер', transmission: 'Автомат', drivetrain: 'Передний',
    price_krw: 19000000, price_rub: 1292000, price_usd: 14400,
    imageUrl: 'https://ci.encar.com/carpicture02/pic_thb/20250219/24950891001001.jpg',
    images: [], photoCount: 9, equipment: ['Камера заднего вида', 'LED ДХО', 'Подогрев руля'], accidentHistory: [],
  },
  // === KIA ===
  {
    id: 'seed-19', source: 'encar', brand: 'Kia', model: 'K5', generation: 'DL3', trim: 'Prestige',
    year: 2023, month: 2, mileage: 22000, fuel: 'Бензин', engine: '2.0L', displacement: 1999, hp: 160,
    color: 'Серый', bodyType: 'Седан', transmission: 'Автомат', drivetrain: 'Передний',
    price_krw: 25800000, price_rub: 1755000, price_usd: 19500,
    imageUrl: 'https://ci.encar.com/carpicture02/pic_thb/20250220/24952802001001.jpg',
    images: [], photoCount: 12, equipment: ['LED фары', 'Круиз-контроль', 'Парктроник', 'Подогрев руля'], accidentHistory: [],
  },
  {
    id: 'seed-20', source: 'encar', brand: 'Kia', model: 'K5', generation: 'DL3', trim: 'Signature',
    year: 2023, month: 8, mileage: 14000, fuel: 'Бензин', engine: '1.6T', displacement: 1598, hp: 180,
    color: 'Черный', bodyType: 'Седан', transmission: 'Автомат (DCT)', drivetrain: 'Передний',
    price_krw: 29500000, price_rub: 2006000, price_usd: 22300,
    imageUrl: 'https://ci.encar.com/carpicture02/pic_thb/20250218/24946321001001.jpg',
    images: [], photoCount: 15, equipment: ['Панорамная крыша', 'Кожа', 'JBL аудио', 'HUD', 'Вентиляция'], accidentHistory: [],
  },
  {
    id: 'seed-21', source: 'encar', brand: 'Kia', model: 'Sportage', generation: 'NQ5', trim: 'Prestige',
    year: 2023, month: 3, mileage: 18000, fuel: 'Бензин', engine: '1.6T', displacement: 1598, hp: 180,
    color: 'Белый', bodyType: 'Кроссовер', transmission: 'Автомат (DCT)', drivetrain: 'Полный (AWD)',
    price_krw: 31500000, price_rub: 2142000, price_usd: 23800,
    imageUrl: 'https://ci.encar.com/carpicture02/pic_thb/20250221/24959105001001.jpg',
    images: [], photoCount: 16, equipment: ['Панорамная крыша', 'Harman/Kardon', 'HUD', '360° камера'], accidentHistory: [],
  },
  {
    id: 'seed-22', source: 'encar', brand: 'Kia', model: 'Sportage', generation: 'NQ5', trim: 'Gravity',
    year: 2024, month: 1, mileage: 6000, fuel: 'Гибрид', engine: '1.6T HEV', displacement: 1598, hp: 230,
    color: 'Серый матовый', bodyType: 'Кроссовер', transmission: 'Автомат', drivetrain: 'Полный (AWD)',
    price_krw: 37000000, price_rub: 2516000, price_usd: 28000,
    imageUrl: 'https://ci.encar.com/carpicture02/pic_thb/20250224/24966578001001.jpg',
    images: [], photoCount: 20, equipment: ['Кожа Nappa', 'Harman/Kardon', 'HUD', '360°', 'Массаж', 'Релаксация'], accidentHistory: [],
  },
  {
    id: 'seed-23', source: 'encar', brand: 'Kia', model: 'Sorento', generation: 'MQ4', trim: 'Signature',
    year: 2022, month: 6, mileage: 48000, fuel: 'Дизель', engine: '2.2D', displacement: 2199, hp: 202,
    color: 'Темно-синий', bodyType: 'Кроссовер', transmission: 'Автомат', drivetrain: 'Полный (AWD)',
    price_krw: 36000000, price_rub: 2448000, price_usd: 27200,
    imageUrl: 'https://ci.encar.com/carpicture02/pic_thb/20250220/24953679001001.jpg',
    images: [], photoCount: 13, equipment: ['7 мест', 'Панорамная крыша', 'Кожа', 'JBL аудио', 'Электро багажник'], accidentHistory: [],
  },
  {
    id: 'seed-24', source: 'encar', brand: 'Kia', model: 'Sorento', generation: 'MQ4', trim: 'Prestige',
    year: 2023, month: 11, mileage: 15000, fuel: 'Гибрид', engine: '1.6T HEV', displacement: 1598, hp: 230,
    color: 'Белый', bodyType: 'Кроссовер', transmission: 'Автомат', drivetrain: 'Полный (AWD)',
    price_krw: 40000000, price_rub: 2720000, price_usd: 30200,
    imageUrl: 'https://ci.encar.com/carpicture02/pic_thb/20250217/24942855001001.jpg',
    images: [], photoCount: 17, equipment: ['7 мест', 'Кожа', 'HUD', '360°', 'Электро багажник'], accidentHistory: [],
  },
  {
    id: 'seed-25', source: 'encar', brand: 'Kia', model: 'Carnival', generation: 'KA4', trim: 'Prestige',
    year: 2023, month: 5, mileage: 25000, fuel: 'Дизель', engine: '2.2D', displacement: 2199, hp: 202,
    color: 'Серебристый', bodyType: 'Минивэн', transmission: 'Автомат', drivetrain: 'Передний',
    price_krw: 42000000, price_rub: 2856000, price_usd: 31700,
    imageUrl: 'https://ci.encar.com/carpicture02/pic_thb/20250222/24961547001001.jpg',
    images: [], photoCount: 14, equipment: ['9 мест', 'Электрические двери', 'Кожаный салон', 'Подогрев руля'], accidentHistory: [],
  },
  {
    id: 'seed-26', source: 'encar', brand: 'Kia', model: 'Carnival', generation: 'KA4', trim: 'Signature',
    year: 2022, month: 8, mileage: 35000, fuel: 'Дизель', engine: '2.2D', displacement: 2199, hp: 202,
    color: 'Черный', bodyType: 'Минивэн', transmission: 'Автомат', drivetrain: 'Передний',
    price_krw: 45000000, price_rub: 3060000, price_usd: 34000,
    imageUrl: 'https://ci.encar.com/carpicture02/pic_thb/20250219/24948733001001.jpg',
    images: [], photoCount: 18, equipment: ['VIP 4 места', 'Кожа Nappa', 'Электрические двери', 'Второй ряд — капитан', 'Подогрев/вентиляция'], accidentHistory: [],
  },
  {
    id: 'seed-27', source: 'encar', brand: 'Kia', model: 'Seltos', generation: 'SP2', trim: 'Prestige',
    year: 2023, month: 9, mileage: 11000, fuel: 'Бензин', engine: '1.6T', displacement: 1598, hp: 180,
    color: 'Красный', bodyType: 'Кроссовер', transmission: 'Автомат (DCT)', drivetrain: 'Передний',
    price_krw: 26000000, price_rub: 1768000, price_usd: 19700,
    imageUrl: 'https://ci.encar.com/carpicture02/pic_thb/20250225/24969551001001.jpg',
    images: [], photoCount: 10, equipment: ['BOSE аудио', 'Вентиляция сидений', 'LED фары'], accidentHistory: [],
  },
  {
    id: 'seed-28', source: 'encar', brand: 'Kia', model: 'EV6', generation: 'CV', trim: 'GT-Line',
    year: 2023, month: 4, mileage: 14000, fuel: 'Электро', engine: 'EV', displacement: 0, hp: 325,
    color: 'Белый', bodyType: 'Кроссовер', transmission: 'Автомат', drivetrain: 'Полный (AWD)',
    price_krw: 55000000, price_rub: 3740000, price_usd: 41600,
    imageUrl: 'https://ci.encar.com/carpicture02/pic_thb/20250221/24957683001001.jpg',
    images: [], photoCount: 16, equipment: ['Батарея 77.4 кВт·ч', 'Запас хода 400 км', 'Meridian аудио', 'Релаксация сидений'], accidentHistory: [],
  },
  {
    id: 'seed-29', source: 'encar', brand: 'Kia', model: 'Niro', generation: 'SG2', trim: 'Prestige',
    year: 2023, month: 6, mileage: 17000, fuel: 'Гибрид', engine: '1.6 HEV', displacement: 1580, hp: 141,
    color: 'Серый', bodyType: 'Кроссовер', transmission: 'Автомат (DCT)', drivetrain: 'Передний',
    price_krw: 30000000, price_rub: 2040000, price_usd: 22700,
    imageUrl: 'https://ci.encar.com/carpicture02/pic_thb/20250224/24966578001001.jpg',
    images: [], photoCount: 9, equipment: ['Расход 4.3 л/100 км', 'Камера 360°', 'LED фары'], accidentHistory: [],
  },
  {
    id: 'seed-30', source: 'encar', brand: 'Kia', model: 'K8', generation: 'GL3', trim: 'Signature',
    year: 2023, month: 3, mileage: 20000, fuel: 'Бензин', engine: '2.5L', displacement: 2497, hp: 198,
    color: 'Черный', bodyType: 'Седан', transmission: 'Автомат', drivetrain: 'Передний',
    price_krw: 38000000, price_rub: 2584000, price_usd: 28700,
    imageUrl: 'https://ci.encar.com/carpicture02/pic_thb/20250218/24944520001001.jpg',
    images: [], photoCount: 17, equipment: ['Кожа Nappa', 'Meridian аудио', 'HUD', 'Массаж', 'Пневмоподвеска'], accidentHistory: [],
  },
  {
    id: 'seed-31', source: 'encar', brand: 'Kia', model: 'Morning', generation: 'JA', trim: 'Prestige',
    year: 2023, month: 7, mileage: 8000, fuel: 'Бензин', engine: '1.0L', displacement: 998, hp: 76,
    color: 'Оранжевый', bodyType: 'Хэтчбек', transmission: 'Автомат', drivetrain: 'Передний',
    price_krw: 12000000, price_rub: 816000, price_usd: 9100,
    imageUrl: 'https://ci.encar.com/carpicture02/pic_thb/20250226/24973448001001.jpg',
    images: [], photoCount: 6, equipment: ['LED ДХО', 'Сенсорный экран 8"', 'Задний парктроник'], accidentHistory: [],
  },
  {
    id: 'seed-32', source: 'encar', brand: 'Kia', model: 'Stinger', generation: 'CK', trim: 'GT',
    year: 2021, month: 11, mileage: 42000, fuel: 'Бензин', engine: '3.3T', displacement: 3342, hp: 370,
    color: 'Красный', bodyType: 'Седан', transmission: 'Автомат', drivetrain: 'Полный (AWD)',
    price_krw: 34000000, price_rub: 2312000, price_usd: 25700,
    imageUrl: 'https://ci.encar.com/carpicture02/pic_thb/20250220/24954210001001.jpg',
    images: [], photoCount: 14, equipment: ['Brembo тормоза', 'Спортивная подвеска', 'Harman/Kardon', 'Кожа Nappa'], accidentHistory: [],
  },
  {
    id: 'seed-33', source: 'encar', brand: 'Kia', model: 'Ray', generation: 'TAM', trim: 'Prestige',
    year: 2023, month: 5, mileage: 9000, fuel: 'Бензин', engine: '1.0L', displacement: 998, hp: 76,
    color: 'Мятный', bodyType: 'Минивэн', transmission: 'Автомат', drivetrain: 'Передний',
    price_krw: 14500000, price_rub: 986000, price_usd: 11000,
    imageUrl: 'https://ci.encar.com/carpicture02/pic_thb/20250226/24974102001001.jpg',
    images: [], photoCount: 7, equipment: ['Камера заднего вида', 'Подогрев сидений', 'Сдвижная дверь'], accidentHistory: [],
  },
  // === GENESIS ===
  {
    id: 'seed-34', source: 'encar', brand: 'Genesis', model: 'G70', generation: 'IK', trim: 'Sport',
    year: 2021, month: 12, mileage: 42000, fuel: 'Бензин', engine: '3.3T', displacement: 3342, hp: 370,
    color: 'Синий', bodyType: 'Седан', transmission: 'Автомат', drivetrain: 'Полный (AWD)',
    price_krw: 32000000, price_rub: 2176000, price_usd: 24200,
    imageUrl: 'https://ci.encar.com/carpicture02/pic_thb/20250218/24944520001001.jpg',
    images: [], photoCount: 15, equipment: ['Brembo тормоза', 'Спортивная подвеска', 'HUD', 'Lexicon аудио'], accidentHistory: [],
  },
  {
    id: 'seed-35', source: 'encar', brand: 'Genesis', model: 'G70', generation: 'IK FL', trim: 'Prestige',
    year: 2023, month: 4, mileage: 18000, fuel: 'Бензин', engine: '2.0T', displacement: 1998, hp: 252,
    color: 'Белый', bodyType: 'Седан', transmission: 'Автомат', drivetrain: 'Задний',
    price_krw: 35000000, price_rub: 2380000, price_usd: 26400,
    imageUrl: 'https://ci.encar.com/carpicture02/pic_thb/20250221/24959105001001.jpg',
    images: [], photoCount: 14, equipment: ['Кожа Nappa', 'Lexicon аудио', 'HUD', 'Адаптивный круиз'], accidentHistory: [],
  },
  {
    id: 'seed-36', source: 'encar', brand: 'Genesis', model: 'GV70', generation: 'JK1', trim: 'Sport Prestige',
    year: 2023, month: 1, mileage: 19000, fuel: 'Бензин', engine: '2.5T', displacement: 2497, hp: 300,
    color: 'Зеленый', bodyType: 'Кроссовер', transmission: 'Автомат', drivetrain: 'Полный (AWD)',
    price_krw: 48000000, price_rub: 3264000, price_usd: 36300,
    imageUrl: 'https://ci.encar.com/carpicture02/pic_thb/20250223/24963891001001.jpg',
    images: [], photoCount: 18, equipment: ['Lexicon аудио', 'HUD', 'Адаптивный круиз', 'Электропривод багажника'], accidentHistory: [],
  },
  {
    id: 'seed-37', source: 'encar', brand: 'Genesis', model: 'G80', generation: 'RG3', trim: 'Luxury',
    year: 2022, month: 6, mileage: 28000, fuel: 'Бензин', engine: '2.5T', displacement: 2497, hp: 300,
    color: 'Черный', bodyType: 'Седан', transmission: 'Автомат', drivetrain: 'Полный (AWD)',
    price_krw: 46000000, price_rub: 3128000, price_usd: 34800,
    imageUrl: 'https://ci.encar.com/carpicture02/pic_thb/20250218/24946321001001.jpg',
    images: [], photoCount: 19, equipment: ['Кожа Nappa', 'Lexicon аудио 21 дин.', 'Пневмоподвеска', 'Массаж'], accidentHistory: [],
  },
  {
    id: 'seed-38', source: 'encar', brand: 'Genesis', model: 'G80', generation: 'RG3', trim: 'Electrified',
    year: 2023, month: 9, mileage: 12000, fuel: 'Электро', engine: 'EV', displacement: 0, hp: 365,
    color: 'Серебристый', bodyType: 'Седан', transmission: 'Автомат', drivetrain: 'Полный (AWD)',
    price_krw: 62000000, price_rub: 4216000, price_usd: 46800,
    imageUrl: 'https://ci.encar.com/carpicture02/pic_thb/20250220/24952802001001.jpg',
    images: [], photoCount: 21, equipment: ['Батарея 87.2 кВт·ч', 'Запас хода 427 км', 'Кожа Nappa', 'Пневмо', 'Массаж', 'HUD'], accidentHistory: [],
  },
  {
    id: 'seed-39', source: 'encar', brand: 'Genesis', model: 'GV80', generation: 'JX1', trim: 'AWD',
    year: 2023, month: 2, mileage: 21000, fuel: 'Бензин', engine: '2.5T', displacement: 2497, hp: 300,
    color: 'Черный', bodyType: 'Кроссовер', transmission: 'Автомат', drivetrain: 'Полный (AWD)',
    price_krw: 58000000, price_rub: 3944000, price_usd: 43800,
    imageUrl: 'https://ci.encar.com/carpicture02/pic_thb/20250217/24942855001001.jpg',
    images: [], photoCount: 22, equipment: ['Кожа Nappa', 'Массаж', 'Lexicon 21 дин.', 'Пневмо', 'HUD', '360°'], accidentHistory: [],
  },
  {
    id: 'seed-40', source: 'encar', brand: 'Genesis', model: 'GV60', generation: 'JW', trim: 'Performance',
    year: 2023, month: 7, mileage: 10000, fuel: 'Электро', engine: 'EV', displacement: 0, hp: 490,
    color: 'Голубой', bodyType: 'Кроссовер', transmission: 'Автомат', drivetrain: 'Полный (AWD)',
    price_krw: 60000000, price_rub: 4080000, price_usd: 45300,
    imageUrl: 'https://ci.encar.com/carpicture02/pic_thb/20250225/24970284001001.jpg',
    images: [], photoCount: 17, equipment: ['Батарея 77.4 кВт·ч', 'Boost 490 л.с.', 'Bang & Olufsen', 'HUD', 'Drift Mode'], accidentHistory: [],
  },
  // === CHEVROLET ===
  {
    id: 'seed-41', source: 'encar', brand: 'Chevrolet', model: 'Trailblazer', generation: '', trim: 'Redline',
    year: 2022, month: 10, mileage: 32000, fuel: 'Бензин', engine: '1.35T', displacement: 1349, hp: 155,
    color: 'Белый', bodyType: 'Кроссовер', transmission: 'Автомат', drivetrain: 'Передний',
    price_krw: 22000000, price_rub: 1496000, price_usd: 16600,
    imageUrl: 'https://ci.encar.com/carpicture02/pic_thb/20250219/24950891001001.jpg',
    images: [], photoCount: 10, equipment: ['Спорт-пакет', 'Камера 360°', 'Люк'], accidentHistory: [],
  },
  {
    id: 'seed-42', source: 'encar', brand: 'Chevrolet', model: 'Trailblazer', generation: '', trim: 'LT',
    year: 2023, month: 3, mileage: 15000, fuel: 'Бензин', engine: '1.35T', displacement: 1349, hp: 155,
    color: 'Серый', bodyType: 'Кроссовер', transmission: 'Автомат', drivetrain: 'Передний',
    price_krw: 24000000, price_rub: 1632000, price_usd: 18100,
    imageUrl: 'https://ci.encar.com/carpicture02/pic_thb/20250221/24958364001001.jpg',
    images: [], photoCount: 8, equipment: ['Камера заднего вида', 'LED фары', 'Подогрев руля'], accidentHistory: [],
  },
  {
    id: 'seed-43', source: 'encar', brand: 'Chevrolet', model: 'Malibu', generation: '', trim: 'Premier',
    year: 2022, month: 4, mileage: 38000, fuel: 'Бензин', engine: '1.5T', displacement: 1498, hp: 165,
    color: 'Черный', bodyType: 'Седан', transmission: 'Автомат', drivetrain: 'Передний',
    price_krw: 20000000, price_rub: 1360000, price_usd: 15100,
    imageUrl: 'https://ci.encar.com/carpicture02/pic_thb/20250224/24967239001001.jpg',
    images: [], photoCount: 11, equipment: ['Кожаный салон', 'BOSE аудио', 'Беспроводная зарядка'], accidentHistory: [],
  },
  // === SSANGYONG ===
  {
    id: 'seed-44', source: 'encar', brand: 'SsangYong', model: 'Torres', generation: '', trim: 'Adventure',
    year: 2023, month: 6, mileage: 20000, fuel: 'Бензин', engine: '1.5T', displacement: 1497, hp: 170,
    color: 'Хаки', bodyType: 'Кроссовер', transmission: 'Автомат', drivetrain: 'Полный (AWD)',
    price_krw: 27000000, price_rub: 1836000, price_usd: 20400,
    imageUrl: 'https://ci.encar.com/carpicture02/pic_thb/20250222/24960233001001.jpg',
    images: [], photoCount: 12, equipment: ['Кожаный салон', 'Подогрев руля', 'Электро багажник'], accidentHistory: [],
  },
  {
    id: 'seed-45', source: 'encar', brand: 'SsangYong', model: 'Rexton', generation: '', trim: 'Prestige',
    year: 2022, month: 7, mileage: 45000, fuel: 'Дизель', engine: '2.2D', displacement: 2157, hp: 202,
    color: 'Белый', bodyType: 'Кроссовер', transmission: 'Автомат', drivetrain: 'Полный (AWD)',
    price_krw: 32000000, price_rub: 2176000, price_usd: 24200,
    imageUrl: 'https://ci.encar.com/carpicture02/pic_thb/20250223/24962118001001.jpg',
    images: [], photoCount: 13, equipment: ['7 мест', 'Кожа', 'Навигация', '360° камера', 'Подогрев 2 ряда'], accidentHistory: [],
  },
  // === BMW ===
  {
    id: 'seed-46', source: 'encar', brand: 'BMW', model: '5 Series', generation: 'G30', trim: '530i M Sport',
    year: 2021, month: 5, mileage: 48000, fuel: 'Бензин', engine: '2.0T', displacement: 1998, hp: 252,
    color: 'Черный', bodyType: 'Седан', transmission: 'Автомат', drivetrain: 'Задний',
    price_krw: 38000000, price_rub: 2584000, price_usd: 28700,
    imageUrl: 'https://ci.encar.com/carpicture02/pic_thb/20250220/24954210001001.jpg',
    images: [], photoCount: 16, equipment: ['M Sport пакет', 'Кожа Dakota', 'Harman/Kardon', 'Ambient Light'], accidentHistory: [],
  },
  {
    id: 'seed-47', source: 'encar', brand: 'BMW', model: '3 Series', generation: 'G20', trim: '320i Luxury',
    year: 2022, month: 8, mileage: 33000, fuel: 'Бензин', engine: '2.0T', displacement: 1998, hp: 184,
    color: 'Белый', bodyType: 'Седан', transmission: 'Автомат', drivetrain: 'Задний',
    price_krw: 32000000, price_rub: 2176000, price_usd: 24200,
    imageUrl: 'https://ci.encar.com/carpicture02/pic_thb/20250218/24946321001001.jpg',
    images: [], photoCount: 14, equipment: ['Кожа Vernasca', 'Навигация Professional', 'Парктроник', 'LED фары'], accidentHistory: [],
  },
  {
    id: 'seed-48', source: 'encar', brand: 'BMW', model: 'X3', generation: 'G01', trim: 'xDrive30i M Sport',
    year: 2022, month: 11, mileage: 28000, fuel: 'Бензин', engine: '2.0T', displacement: 1998, hp: 252,
    color: 'Серый', bodyType: 'Кроссовер', transmission: 'Автомат', drivetrain: 'Полный (AWD)',
    price_krw: 42000000, price_rub: 2856000, price_usd: 31700,
    imageUrl: 'https://ci.encar.com/carpicture02/pic_thb/20250219/24950891001001.jpg',
    images: [], photoCount: 18, equipment: ['M Sport', 'Кожа Vernasca', 'Панорамная крыша', 'Harman/Kardon', 'HUD'], accidentHistory: [],
  },
  {
    id: 'seed-49', source: 'encar', brand: 'BMW', model: 'X5', generation: 'G05', trim: 'xDrive40i M Sport',
    year: 2021, month: 9, mileage: 55000, fuel: 'Бензин', engine: '3.0T', displacement: 2998, hp: 340,
    color: 'Черный', bodyType: 'Кроссовер', transmission: 'Автомат', drivetrain: 'Полный (AWD)',
    price_krw: 52000000, price_rub: 3536000, price_usd: 39300,
    imageUrl: 'https://ci.encar.com/carpicture02/pic_thb/20250222/24961547001001.jpg',
    images: [], photoCount: 20, equipment: ['M Sport', 'Кожа Vernasca', 'Панорама', 'Bowers & Wilkins', 'HUD', 'Массаж'], accidentHistory: [],
  },
  // === MERCEDES-BENZ ===
  {
    id: 'seed-50', source: 'encar', brand: 'Mercedes-Benz', model: 'E-Class', generation: 'W213', trim: 'E300 AMG Line',
    year: 2021, month: 7, mileage: 45000, fuel: 'Бензин', engine: '2.0T', displacement: 1991, hp: 258,
    color: 'Белый', bodyType: 'Седан', transmission: 'Автомат', drivetrain: 'Задний',
    price_krw: 42000000, price_rub: 2856000, price_usd: 31700,
    imageUrl: 'https://ci.encar.com/carpicture02/pic_thb/20250224/24965461001001.jpg',
    images: [], photoCount: 17, equipment: ['AMG пакет', 'Кожа Artico', 'Burmester', 'Ambient Light', 'HUD'], accidentHistory: [],
  },
  {
    id: 'seed-51', source: 'encar', brand: 'Mercedes-Benz', model: 'C-Class', generation: 'W206', trim: 'C200 AMG Line',
    year: 2022, month: 12, mileage: 22000, fuel: 'Бензин', engine: '1.5T+EQ', displacement: 1496, hp: 204,
    color: 'Серый', bodyType: 'Седан', transmission: 'Автомат', drivetrain: 'Задний',
    price_krw: 38000000, price_rub: 2584000, price_usd: 28700,
    imageUrl: 'https://ci.encar.com/carpicture02/pic_thb/20250217/24940112001001.jpg',
    images: [], photoCount: 15, equipment: ['AMG пакет', 'Кожа', 'Burmester', 'Digital Light', 'MBUX'], accidentHistory: [],
  },
  {
    id: 'seed-52', source: 'encar', brand: 'Mercedes-Benz', model: 'GLC', generation: 'X254', trim: 'GLC300 AMG',
    year: 2023, month: 6, mileage: 15000, fuel: 'Бензин', engine: '2.0T', displacement: 1999, hp: 258,
    color: 'Черный', bodyType: 'Кроссовер', transmission: 'Автомат', drivetrain: 'Полный (AWD)',
    price_krw: 52000000, price_rub: 3536000, price_usd: 39300,
    imageUrl: 'https://ci.encar.com/carpicture02/pic_thb/20250226/24972136001001.jpg',
    images: [], photoCount: 19, equipment: ['AMG Line', 'Кожа Artico', 'Burmester 3D', 'HUD', 'Air Body Control'], accidentHistory: [],
  },
  {
    id: 'seed-53', source: 'encar', brand: 'Mercedes-Benz', model: 'GLE', generation: 'V167', trim: 'GLE450 AMG',
    year: 2022, month: 3, mileage: 35000, fuel: 'Бензин', engine: '3.0T', displacement: 2999, hp: 367,
    color: 'Темно-синий', bodyType: 'Кроссовер', transmission: 'Автомат', drivetrain: 'Полный (AWD)',
    price_krw: 62000000, price_rub: 4216000, price_usd: 46800,
    imageUrl: 'https://ci.encar.com/carpicture02/pic_thb/20250225/24969551001001.jpg',
    images: [], photoCount: 21, equipment: ['AMG Line', 'Кожа Nappa', 'Burmester 3D', 'HUD', 'Air Body Control', 'Массаж'], accidentHistory: [],
  },
  // === TOYOTA ===
  {
    id: 'seed-54', source: 'encar', brand: 'Toyota', model: 'Camry', generation: 'XV70', trim: 'LE',
    year: 2022, month: 5, mileage: 38000, fuel: 'Бензин', engine: '2.5L', displacement: 2487, hp: 203,
    color: 'Белый', bodyType: 'Седан', transmission: 'Автомат', drivetrain: 'Передний',
    price_krw: 25000000, price_rub: 1700000, price_usd: 18900,
    imageUrl: 'https://ci.encar.com/carpicture02/pic_thb/20250220/24953679001001.jpg',
    images: [], photoCount: 10, equipment: ['Safety Sense', 'Кожа', 'Навигация', 'JBL аудио'], accidentHistory: [],
  },
  {
    id: 'seed-55', source: 'encar', brand: 'Toyota', model: 'Camry', generation: 'XV70', trim: 'XSE Hybrid',
    year: 2023, month: 2, mileage: 20000, fuel: 'Гибрид', engine: '2.5L HEV', displacement: 2487, hp: 211,
    color: 'Серый', bodyType: 'Седан', transmission: 'Вариатор (CVT)', drivetrain: 'Передний',
    price_krw: 32000000, price_rub: 2176000, price_usd: 24200,
    imageUrl: 'https://ci.encar.com/carpicture02/pic_thb/20250223/24963891001001.jpg',
    images: [], photoCount: 13, equipment: ['Safety Sense 2.5', 'Кожа', 'JBL аудио', 'Панорамная крыша', 'HUD'], accidentHistory: [],
  },
  {
    id: 'seed-56', source: 'encar', brand: 'Toyota', model: 'RAV4', generation: 'XA50', trim: 'Adventure',
    year: 2022, month: 9, mileage: 30000, fuel: 'Бензин', engine: '2.5L', displacement: 2487, hp: 203,
    color: 'Зеленый', bodyType: 'Кроссовер', transmission: 'Автомат', drivetrain: 'Полный (AWD)',
    price_krw: 30000000, price_rub: 2040000, price_usd: 22700,
    imageUrl: 'https://ci.encar.com/carpicture02/pic_thb/20250221/24957683001001.jpg',
    images: [], photoCount: 12, equipment: ['Safety Sense', 'Кожа', 'JBL аудио', '360° камера'], accidentHistory: [],
  },
  // === LEXUS ===
  {
    id: 'seed-57', source: 'encar', brand: 'Lexus', model: 'ES', generation: '', trim: 'ES300h F Sport',
    year: 2022, month: 4, mileage: 25000, fuel: 'Гибрид', engine: '2.5L HEV', displacement: 2487, hp: 218,
    color: 'Белый', bodyType: 'Седан', transmission: 'Вариатор (CVT)', drivetrain: 'Передний',
    price_krw: 42000000, price_rub: 2856000, price_usd: 31700,
    imageUrl: 'https://ci.encar.com/carpicture02/pic_thb/20250218/24944520001001.jpg',
    images: [], photoCount: 16, equipment: ['F Sport', 'Кожа', 'Mark Levinson', 'HUD', 'Адаптивная подвеска'], accidentHistory: [],
  },
  {
    id: 'seed-58', source: 'encar', brand: 'Lexus', model: 'RX', generation: '', trim: 'RX350h F Sport',
    year: 2023, month: 8, mileage: 15000, fuel: 'Гибрид', engine: '2.5L HEV', displacement: 2487, hp: 246,
    color: 'Черный', bodyType: 'Кроссовер', transmission: 'Вариатор (CVT)', drivetrain: 'Полный (AWD)',
    price_krw: 58000000, price_rub: 3944000, price_usd: 43800,
    imageUrl: 'https://ci.encar.com/carpicture02/pic_thb/20250222/24960233001001.jpg',
    images: [], photoCount: 20, equipment: ['F Sport', 'Кожа Semi-Aniline', 'Mark Levinson', 'HUD', 'Панорамная крыша'], accidentHistory: [],
  },
  {
    id: 'seed-59', source: 'encar', brand: 'Lexus', model: 'NX', generation: '', trim: 'NX350h Luxury',
    year: 2023, month: 3, mileage: 18000, fuel: 'Гибрид', engine: '2.5L HEV', displacement: 2487, hp: 244,
    color: 'Серый', bodyType: 'Кроссовер', transmission: 'Вариатор (CVT)', drivetrain: 'Полный (AWD)',
    price_krw: 48000000, price_rub: 3264000, price_usd: 36300,
    imageUrl: 'https://ci.encar.com/carpicture02/pic_thb/20250219/24948733001001.jpg',
    images: [], photoCount: 17, equipment: ['Кожа', 'Mark Levinson', 'HUD', '360° камера', 'Панорамная крыша'], accidentHistory: [],
  },
  // === VOLKSWAGEN / AUDI ===
  {
    id: 'seed-60', source: 'encar', brand: 'Volkswagen', model: 'Tiguan', generation: '', trim: 'R-Line',
    year: 2022, month: 6, mileage: 35000, fuel: 'Бензин', engine: '2.0T', displacement: 1984, hp: 220,
    color: 'Белый', bodyType: 'Кроссовер', transmission: 'Автомат (DCT)', drivetrain: 'Полный (AWD)',
    price_krw: 30000000, price_rub: 2040000, price_usd: 22700,
    imageUrl: 'https://ci.encar.com/carpicture02/pic_thb/20250224/24966578001001.jpg',
    images: [], photoCount: 14, equipment: ['R-Line', 'Кожа', 'Harman/Kardon', 'Панорамная крыша', 'Digital Cockpit'], accidentHistory: [],
  },
  {
    id: 'seed-61', source: 'encar', brand: 'Audi', model: 'A6', generation: 'C8', trim: '45 TFSI Premium',
    year: 2021, month: 10, mileage: 42000, fuel: 'Бензин', engine: '2.0T', displacement: 1984, hp: 245,
    color: 'Черный', bodyType: 'Седан', transmission: 'Автомат', drivetrain: 'Передний',
    price_krw: 38000000, price_rub: 2584000, price_usd: 28700,
    imageUrl: 'https://ci.encar.com/carpicture02/pic_thb/20250217/24942855001001.jpg',
    images: [], photoCount: 15, equipment: ['S-Line', 'Кожа', 'Bang & Olufsen', 'Virtual Cockpit', 'Matrix LED'], accidentHistory: [],
  },
  {
    id: 'seed-62', source: 'encar', brand: 'Audi', model: 'Q5', generation: '', trim: '45 TFSI S-Line',
    year: 2022, month: 12, mileage: 26000, fuel: 'Бензин', engine: '2.0T', displacement: 1984, hp: 265,
    color: 'Серый', bodyType: 'Кроссовер', transmission: 'Автомат', drivetrain: 'Полный (AWD)',
    price_krw: 42000000, price_rub: 2856000, price_usd: 31700,
    imageUrl: 'https://ci.encar.com/carpicture02/pic_thb/20250226/24974102001001.jpg',
    images: [], photoCount: 16, equipment: ['S-Line', 'Кожа', 'Bang & Olufsen', 'Virtual Cockpit', 'Панорамная крыша'], accidentHistory: [],
  },
  // === VOLVO ===
  {
    id: 'seed-63', source: 'encar', brand: 'Volvo', model: 'XC60', generation: '', trim: 'T5 Inscription',
    year: 2022, month: 3, mileage: 32000, fuel: 'Бензин', engine: '2.0T', displacement: 1969, hp: 254,
    color: 'Белый', bodyType: 'Кроссовер', transmission: 'Автомат', drivetrain: 'Полный (AWD)',
    price_krw: 35000000, price_rub: 2380000, price_usd: 26400,
    imageUrl: 'https://ci.encar.com/carpicture02/pic_thb/20250220/24952802001001.jpg',
    images: [], photoCount: 14, equipment: ['Кожа Nappa', 'Bowers & Wilkins', 'Pilot Assist', 'Панорамная крыша'], accidentHistory: [],
  },
  {
    id: 'seed-64', source: 'encar', brand: 'Volvo', model: 'XC90', generation: '', trim: 'T8 Inscription',
    year: 2021, month: 11, mileage: 45000, fuel: 'Гибрид', engine: '2.0T PHEV', displacement: 1969, hp: 400,
    color: 'Черный', bodyType: 'Кроссовер', transmission: 'Автомат', drivetrain: 'Полный (AWD)',
    price_krw: 48000000, price_rub: 3264000, price_usd: 36300,
    imageUrl: 'https://ci.encar.com/carpicture02/pic_thb/20250221/24959105001001.jpg',
    images: [], photoCount: 18, equipment: ['7 мест', 'Кожа Nappa', 'Bowers & Wilkins', 'Pilot Assist', 'Массаж', '360° камера'], accidentHistory: [],
  },
  // === PORSCHE ===
  {
    id: 'seed-65', source: 'encar', brand: 'Porsche', model: 'Cayenne', generation: '', trim: 'Cayenne S',
    year: 2022, month: 5, mileage: 25000, fuel: 'Бензин', engine: '2.9T V6', displacement: 2894, hp: 440,
    color: 'Белый', bodyType: 'Кроссовер', transmission: 'Автомат', drivetrain: 'Полный (AWD)',
    price_krw: 85000000, price_rub: 5780000, price_usd: 64200,
    imageUrl: 'https://ci.encar.com/carpicture02/pic_thb/20250223/24962118001001.jpg',
    images: [], photoCount: 22, equipment: ['Sport Chrono', 'Кожа', 'BOSE', 'Панорамная крыша', 'Пневмоподвеска', 'PASM'], accidentHistory: [],
  },
  {
    id: 'seed-66', source: 'encar', brand: 'Porsche', model: 'Macan', generation: '', trim: 'Macan S',
    year: 2023, month: 1, mileage: 12000, fuel: 'Бензин', engine: '2.9T V6', displacement: 2894, hp: 380,
    color: 'Серый', bodyType: 'Кроссовер', transmission: 'Автомат (DCT)', drivetrain: 'Полный (AWD)',
    price_krw: 72000000, price_rub: 4896000, price_usd: 54400,
    imageUrl: 'https://ci.encar.com/carpicture02/pic_thb/20250225/24970284001001.jpg',
    images: [], photoCount: 19, equipment: ['Sport Chrono', 'Кожа', 'BOSE', 'PASM', 'LED Matrix', 'Адаптивный круиз'], accidentHistory: [],
  },
  // === ADDITIONAL VARIETY CARS ===
  {
    id: 'seed-67', source: 'encar', brand: 'Hyundai', model: 'Sonata', generation: 'DN8', trim: 'N-Line',
    year: 2023, month: 9, mileage: 10000, fuel: 'Бензин', engine: '2.5T', displacement: 2497, hp: 290,
    color: 'Красный', bodyType: 'Седан', transmission: 'Автомат (DCT)', drivetrain: 'Передний',
    price_krw: 34000000, price_rub: 2312000, price_usd: 25700,
    imageUrl: 'https://ci.encar.com/carpicture02/pic_thb/20250217/24940112001001.jpg',
    images: [], photoCount: 16, equipment: ['N-Line пакет', 'Спортивная подвеска', 'BOSE аудио', 'HUD', 'Вентиляция'], accidentHistory: [],
  },
  {
    id: 'seed-68', source: 'encar', brand: 'Kia', model: 'Forte', generation: 'BD', trim: 'GT',
    year: 2022, month: 6, mileage: 28000, fuel: 'Бензин', engine: '1.6T', displacement: 1598, hp: 204,
    color: 'Белый', bodyType: 'Седан', transmission: 'Автомат (DCT)', drivetrain: 'Передний',
    price_krw: 22000000, price_rub: 1496000, price_usd: 16600,
    imageUrl: 'https://ci.encar.com/carpicture02/pic_thb/20250218/24946321001001.jpg',
    images: [], photoCount: 10, equipment: ['Спорт-пакет GT', 'Спортивная подвеска', 'LED фары'], accidentHistory: [],
  },
  {
    id: 'seed-69', source: 'encar', brand: 'Hyundai', model: 'Tucson', generation: 'NX4', trim: 'N-Line',
    year: 2023, month: 10, mileage: 12000, fuel: 'Бензин', engine: '2.5T', displacement: 2497, hp: 281,
    color: 'Черный', bodyType: 'Кроссовер', transmission: 'Автомат (DCT)', drivetrain: 'Полный (AWD)',
    price_krw: 36000000, price_rub: 2448000, price_usd: 27200,
    imageUrl: 'https://ci.encar.com/carpicture02/pic_thb/20250222/24960233001001.jpg',
    images: [], photoCount: 15, equipment: ['N-Line', 'Спортивная подвеска', 'BOSE', 'HUD', '360°', 'Кожа'], accidentHistory: [],
  },
  {
    id: 'seed-70', source: 'encar', brand: 'Genesis', model: 'G90', generation: 'RS4', trim: 'Prestige',
    year: 2023, month: 3, mileage: 8000, fuel: 'Бензин', engine: '3.5T', displacement: 3470, hp: 375,
    color: 'Черный', bodyType: 'Седан', transmission: 'Автомат', drivetrain: 'Полный (AWD)',
    price_krw: 95000000, price_rub: 6460000, price_usd: 71800,
    imageUrl: 'https://ci.encar.com/carpicture02/pic_thb/20250224/24967239001001.jpg',
    images: [], photoCount: 25, equipment: ['Кожа Nappa', 'Bang & Olufsen 23 дин.', 'Пневмо', 'Массаж', 'HUD', 'Электрозадвижные шторки', 'Rear Seat Entertainment'], accidentHistory: [],
  },
  {
    id: 'own-71', source: 'own', brand: 'Kia', model: 'Sportage', generation: 'NQ5', trim: 'Signature',
    year: 2024, month: 2, mileage: 3000, fuel: 'Бензин', engine: '2.0L', displacement: 1999, hp: 156,
    color: 'Белый перламутр', bodyType: 'Кроссовер', transmission: 'Автомат', drivetrain: 'Полный (AWD)',
    price_krw: 32000000, price_rub: 2176000, price_usd: 24200,
    imageUrl: 'https://ci.encar.com/carpicture02/pic_thb/20250226/24973448001001.jpg',
    images: ['https://ci.encar.com/carpicture02/pic_thb/20250226/24973448001001.jpg'], photoCount: 18,
    equipment: ['Кожа', 'Панорамная крыша', 'Harman/Kardon', 'HUD', '360° камера', 'Электро багажник'], accidentHistory: [], isActive: true,
  },
  {
    id: 'own-72', source: 'own', brand: 'Hyundai', model: 'Tucson', generation: 'NX4', trim: 'Calligraphy',
    year: 2024, month: 1, mileage: 2000, fuel: 'Гибрид', engine: '1.6T HEV', displacement: 1598, hp: 232,
    color: 'Темно-серый', bodyType: 'Кроссовер', transmission: 'Автомат', drivetrain: 'Полный (AWD)',
    price_krw: 38000000, price_rub: 2584000, price_usd: 28700,
    imageUrl: 'https://ci.encar.com/carpicture02/pic_thb/20250219/24950891001001.jpg',
    images: ['https://ci.encar.com/carpicture02/pic_thb/20250219/24950891001001.jpg'], photoCount: 22,
    equipment: ['Кожа Nappa', 'BOSE аудио', 'HUD', '360°', 'Массаж', 'Вентиляция', 'Электропривод багажника'], accidentHistory: [], isActive: true,
  },
  {
    id: 'own-73', source: 'own', brand: 'Genesis', model: 'GV70', generation: 'JK1', trim: 'Luxury',
    year: 2023, month: 11, mileage: 8000, fuel: 'Бензин', engine: '2.5T', displacement: 2497, hp: 300,
    color: 'Белый', bodyType: 'Кроссовер', transmission: 'Автомат', drivetrain: 'Полный (AWD)',
    price_krw: 52000000, price_rub: 3536000, price_usd: 39300,
    imageUrl: 'https://ci.encar.com/carpicture02/pic_thb/20250221/24958364001001.jpg',
    images: ['https://ci.encar.com/carpicture02/pic_thb/20250221/24958364001001.jpg'], photoCount: 20,
    equipment: ['Кожа Nappa', 'Lexicon аудио', 'HUD', '360°', 'Электро багажник', 'Адаптивный круиз'], accidentHistory: [], isActive: true,
  },
  {
    id: 'seed-74', source: 'encar', brand: 'Kia', model: 'K9', generation: 'RJ', trim: 'Prestige',
    year: 2022, month: 4, mileage: 30000, fuel: 'Бензин', engine: '3.8L', displacement: 3778, hp: 311,
    color: 'Черный', bodyType: 'Седан', transmission: 'Автомат', drivetrain: 'Задний',
    price_krw: 50000000, price_rub: 3400000, price_usd: 37800,
    imageUrl: 'https://ci.encar.com/carpicture02/pic_thb/20250220/24954210001001.jpg',
    images: [], photoCount: 18, equipment: ['Кожа Nappa', 'Meridian аудио', 'HUD', 'Пневмо', 'Массаж', 'Электрозадвижные шторки'], accidentHistory: [],
  },
  {
    id: 'seed-75', source: 'encar', brand: 'BMW', model: '7 Series', generation: 'G70', trim: '740i M Sport',
    year: 2023, month: 5, mileage: 15000, fuel: 'Бензин', engine: '3.0T', displacement: 2998, hp: 380,
    color: 'Черный', bodyType: 'Седан', transmission: 'Автомат', drivetrain: 'Задний',
    price_krw: 95000000, price_rub: 6460000, price_usd: 71800,
    imageUrl: 'https://ci.encar.com/carpicture02/pic_thb/20250223/24963891001001.jpg',
    images: [], photoCount: 24, equipment: ['M Sport', 'Кожа Merino', 'Bowers & Wilkins', 'Theatre Screen', 'HUD', 'Массаж', 'Sky Lounge'], accidentHistory: [],
  },
  {
    id: 'seed-76', source: 'encar', brand: 'Mercedes-Benz', model: 'S-Class', generation: 'W223', trim: 'S500 AMG',
    year: 2022, month: 7, mileage: 20000, fuel: 'Бензин', engine: '3.0T', displacement: 2999, hp: 435,
    color: 'Черный', bodyType: 'Седан', transmission: 'Автомат', drivetrain: 'Полный (AWD)',
    price_krw: 105000000, price_rub: 7140000, price_usd: 79300,
    imageUrl: 'https://ci.encar.com/carpicture02/pic_thb/20250226/24972136001001.jpg',
    images: [], photoCount: 25, equipment: ['AMG Line', 'Кожа Nappa', 'Burmester 4D', 'HUD AR', 'Массаж', 'MBUX Hyperscreen', 'Пневмо'], accidentHistory: [],
  },
  {
    id: 'seed-77', source: 'encar', brand: 'Hyundai', model: 'Sonata', generation: 'DN8', trim: 'Exclusive',
    year: 2021, month: 3, mileage: 65000, fuel: 'Бензин', engine: '2.0L', displacement: 1999, hp: 160,
    color: 'Серебристый', bodyType: 'Седан', transmission: 'Автомат', drivetrain: 'Передний',
    price_krw: 18000000, price_rub: 1224000, price_usd: 13600,
    imageUrl: 'https://ci.encar.com/carpicture02/pic_thb/20250218/24944520001001.jpg',
    images: [], photoCount: 7, equipment: ['Камера заднего вида', 'Apple CarPlay', 'Подогрев руля'], accidentHistory: [],
  },
  {
    id: 'seed-78', source: 'encar', brand: 'Kia', model: 'Mohave', generation: 'HM', trim: 'Gravity',
    year: 2022, month: 8, mileage: 40000, fuel: 'Дизель', engine: '3.0D V6', displacement: 2959, hp: 260,
    color: 'Черный', bodyType: 'Кроссовер', transmission: 'Автомат', drivetrain: 'Полный (AWD)',
    price_krw: 42000000, price_rub: 2856000, price_usd: 31700,
    imageUrl: 'https://ci.encar.com/carpicture02/pic_thb/20250219/24948733001001.jpg',
    images: [], photoCount: 15, equipment: ['7 мест', 'Кожа Nappa', 'Рамный кузов', 'Понижающая передача', 'Блокировка дифференциала'], accidentHistory: [],
  },
  {
    id: 'seed-79', source: 'encar', brand: 'Tesla', model: 'Model Y', generation: '', trim: 'Long Range',
    year: 2023, month: 6, mileage: 15000, fuel: 'Электро', engine: 'EV', displacement: 0, hp: 384,
    color: 'Белый', bodyType: 'Кроссовер', transmission: 'Автомат', drivetrain: 'Полный (AWD)',
    price_krw: 55000000, price_rub: 3740000, price_usd: 41600,
    imageUrl: 'https://ci.encar.com/carpicture02/pic_thb/20250224/24965461001001.jpg',
    images: [], photoCount: 12, equipment: ['Батарея 75 кВт·ч', 'Запас хода 533 км', 'Автопилот', 'Панорамная крыша', 'Premium Audio'], accidentHistory: [],
  },
  {
    id: 'seed-80', source: 'encar', brand: 'Hyundai', model: 'Santa Fe', generation: 'TM', trim: 'Premium',
    year: 2022, month: 1, mileage: 42000, fuel: 'Бензин', engine: '2.5L', displacement: 2497, hp: 194,
    color: 'Белый', bodyType: 'Кроссовер', transmission: 'Автомат', drivetrain: 'Передний',
    price_krw: 26000000, price_rub: 1768000, price_usd: 19700,
    imageUrl: 'https://ci.encar.com/carpicture02/pic_thb/20250222/24961547001001.jpg',
    images: [], photoCount: 10, equipment: ['5 мест', 'Кожа', 'Навигация', 'Подогрев руля', 'Камера заднего вида'], accidentHistory: [],
  },
];

export function getSeedCars(filters?: {
  brand?: string;
  model?: string;
  fuel?: string;
  bodyType?: string;
  yearFrom?: number;
  yearTo?: number;
  priceFrom?: number;
  priceTo?: number;
  mileageFrom?: number;
  mileageTo?: number;
  transmission?: string;
  drivetrain?: string;
  color?: string;
  search?: string;
  sort?: string;
  page?: number;
  limit?: number;
}): { cars: CarListing[]; total: number; page: number; totalPages: number; brands: Record<string, number>; fuels: Record<string, number>; bodyTypes: Record<string, number> } {
  let filtered = [...SEED_CARS];

  if (filters?.brand) {
    filtered = filtered.filter(c => c.brand.toLowerCase() === filters.brand!.toLowerCase());
  }
  if (filters?.model) {
    filtered = filtered.filter(c => c.model.toLowerCase().includes(filters.model!.toLowerCase()));
  }
  if (filters?.fuel) {
    const fuelMap: Record<string, string> = {
      gasoline: 'бензин', diesel: 'дизель', hybrid: 'гибрид', electric: 'электро', lpg: 'газ',
    };
    const fuelRu = fuelMap[filters.fuel] || filters.fuel;
    filtered = filtered.filter(c => c.fuel.toLowerCase().includes(fuelRu.toLowerCase()));
  }
  if (filters?.bodyType) {
    const bodyMap: Record<string, string> = {
      sedan: 'седан', suv: 'кроссовер', hatchback: 'хэтчбек', wagon: 'универсал',
      coupe: 'купе', convertible: 'кабриолет', minivan: 'минивэн', pickup: 'пикап',
    };
    const bodyRu = bodyMap[filters.bodyType] || filters.bodyType;
    filtered = filtered.filter(c => c.bodyType?.toLowerCase().includes(bodyRu.toLowerCase()));
  }
  if (filters?.transmission) {
    const transMap: Record<string, string> = {
      auto: 'автомат', manual: 'механик', dct: 'dct', cvt: 'вариатор',
    };
    const transRu = transMap[filters.transmission] || filters.transmission;
    filtered = filtered.filter(c => c.transmission?.toLowerCase().includes(transRu.toLowerCase()));
  }
  if (filters?.drivetrain) {
    const driveMap: Record<string, string> = {
      fwd: 'передний', rwd: 'задний', awd: 'awd',
    };
    const driveRu = driveMap[filters.drivetrain] || filters.drivetrain;
    filtered = filtered.filter(c => c.drivetrain?.toLowerCase().includes(driveRu.toLowerCase()));
  }
  if (filters?.color) {
    const colorMap: Record<string, string[]> = {
      white: ['белый', 'перламутр'], black: ['черный'], gray: ['серый', 'серый матовый', 'темно-серый'],
      silver: ['серебристый'], blue: ['синий', 'темно-синий', 'голубой'], red: ['красный'],
      brown: ['коричневый'], green: ['зеленый', 'оливковый', 'хаки'], other: ['желтый', 'оранжевый', 'мятный'],
    };
    const colorTerms = colorMap[filters.color] || [filters.color];
    filtered = filtered.filter(c => colorTerms.some(term => c.color?.toLowerCase().includes(term)));
  }
  if (filters?.yearFrom) {
    filtered = filtered.filter(c => c.year >= filters.yearFrom!);
  }
  if (filters?.yearTo) {
    filtered = filtered.filter(c => c.year <= filters.yearTo!);
  }
  if (filters?.priceFrom) {
    filtered = filtered.filter(c => c.price_rub >= filters.priceFrom! * 10000);
  }
  if (filters?.priceTo) {
    filtered = filtered.filter(c => c.price_rub <= filters.priceTo! * 10000);
  }
  if (filters?.mileageFrom) {
    filtered = filtered.filter(c => c.mileage >= filters.mileageFrom!);
  }
  if (filters?.mileageTo) {
    filtered = filtered.filter(c => c.mileage <= filters.mileageTo!);
  }
  if (filters?.search) {
    const s = filters.search.toLowerCase();
    filtered = filtered.filter(c =>
      `${c.brand} ${c.model} ${c.generation || ''} ${c.trim || ''}`.toLowerCase().includes(s)
    );
  }

  // Compute facet counts before pagination
  const brands: Record<string, number> = {};
  const fuels: Record<string, number> = {};
  const bodyTypes: Record<string, number> = {};
  filtered.forEach(c => {
    brands[c.brand] = (brands[c.brand] || 0) + 1;
    fuels[c.fuel] = (fuels[c.fuel] || 0) + 1;
    if (c.bodyType) bodyTypes[c.bodyType] = (bodyTypes[c.bodyType] || 0) + 1;
  });

  // Sort
  switch (filters?.sort) {
    case 'price_asc': filtered.sort((a, b) => a.price_rub - b.price_rub); break;
    case 'price_desc': filtered.sort((a, b) => b.price_rub - a.price_rub); break;
    case 'year_asc': filtered.sort((a, b) => a.year - b.year); break;
    case 'mileage_asc': filtered.sort((a, b) => a.mileage - b.mileage); break;
    case 'mileage_desc': filtered.sort((a, b) => b.mileage - a.mileage); break;
    default: filtered.sort((a, b) => b.year - a.year || a.mileage - b.mileage); // year_desc
  }

  const page = filters?.page || 1;
  const limit = filters?.limit || 24;
  const total = filtered.length;
  const totalPages = Math.ceil(total / limit);
  const start = (page - 1) * limit;
  const cars = filtered.slice(start, start + limit);

  return { cars, total, page, totalPages, brands, fuels, bodyTypes };
}

export function getSeedCarById(id: string): CarListing | null {
  return SEED_CARS.find(c => c.id === id) || null;
}

export function getAvailableBrands(): { brand: string; count: number }[] {
  const counts: Record<string, number> = {};
  SEED_CARS.forEach(c => {
    counts[c.brand] = (counts[c.brand] || 0) + 1;
  });
  return Object.entries(counts)
    .map(([brand, count]) => ({ brand, count }))
    .sort((a, b) => b.count - a.count);
}

export function getModelsForBrand(brand: string): string[] {
  const models = new Set<string>();
  SEED_CARS.filter(c => c.brand.toLowerCase() === brand.toLowerCase())
    .forEach(c => models.add(c.model));
  return Array.from(models).sort();
}
