// Korean → English brand translations
export const brandMap: Record<string, string> = {
  '현대': 'Hyundai',
  '기아': 'Kia',
  '제네시스': 'Genesis',
  '쉐보레(GM대우)': 'Chevrolet',
  '쉐보레': 'Chevrolet',
  '대우': 'Daewoo',
  'GM대우': 'GM Daewoo',
  '삼성': 'Renault Korea',
  '르노삼성': 'Renault Korea',
  '르노코리아(삼성)': 'Renault Korea',
  '르노코리아': 'Renault Korea',
  '쌍용': 'KG Mobility',
  'KGM': 'KG Mobility',
  'KG모빌리티': 'KG Mobility',
  'KG모빌리티(쌍용)': 'KG Mobility',
  'BMW': 'BMW',
  '벤츠': 'Mercedes-Benz',
  '메르세데스벤츠': 'Mercedes-Benz',
  '아우디': 'Audi',
  '폭스바겐': 'Volkswagen',
  '포르쉐': 'Porsche',
  '볼보': 'Volvo',
  '토요타': 'Toyota',
  '렉서스': 'Lexus',
  '혼다': 'Honda',
  '닛산': 'Nissan',
  '마쓰다': 'Mazda',
  '미쓰비시': 'Mitsubishi',
  '스바루': 'Subaru',
  '포드': 'Ford',
  '링컨': 'Lincoln',
  '캐딜락': 'Cadillac',
  '지프': 'Jeep',
  '크라이슬러': 'Chrysler',
  '테슬라': 'Tesla',
  '랜드로버': 'Land Rover',
  '재규어': 'Jaguar',
  '미니': 'Mini',
  '푸조': 'Peugeot',
  '시트로엥': 'Citroen',
  '르노': 'Renault',
  '피아트': 'Fiat',
  '알파로메오': 'Alfa Romeo',
  '마세라티': 'Maserati',
  '페라리': 'Ferrari',
  '람보르기니': 'Lamborghini',
  '벤틀리': 'Bentley',
  '롤스로이스': 'Rolls-Royce',
  '애스턴마틴': 'Aston Martin',
  '맥라렌': 'McLaren',
  '인피니티': 'Infiniti',
};

// Korean → English model translations
export const modelMap: Record<string, string> = {
  '아반떼': 'Avante',
  '쏘나타': 'Sonata',
  '그랜저': 'Grandeur',
  '투싼': 'Tucson',
  '싼타페': 'Santa Fe',
  '팰리세이드': 'Palisade',
  '코나': 'Kona',
  '베뉴': 'Venue',
  '넥쏘': 'Nexo',
  '아이오닉': 'Ioniq',
  '스타리아': 'Staria',
  '캐스퍼': 'Casper',
  '포터': 'Porter',
  '카니발': 'Carnival',
  '쏘렌토': 'Sorento',
  '스포티지': 'Sportage',
  '셀토스': 'Seltos',
  '니로': 'Niro',
  '모하비': 'Mohave',
  '모닝': 'Morning',
  '레이': 'Ray',
  '스팅어': 'Stinger',
  'K3': 'K3',
  'K5': 'K5',
  'K8': 'K8',
  'K9': 'K9',
  'EV6': 'EV6',
  'EV9': 'EV9',
  'GV60': 'GV60',
  'GV70': 'GV70',
  'GV80': 'GV80',
  'G70': 'G70',
  'G80': 'G80',
  'G90': 'G90',
  '말리부': 'Malibu',
  '트레일블레이저': 'Trailblazer',
  '이쿼녹스': 'Equinox',
  '트래버스': 'Traverse',
  '트랙스': 'Trax',
  '코란도': 'Korando',
  '티볼리': 'Tivoli',
  '렉스턴': 'Rexton',
  '토레스': 'Torres',
  '액티언': 'Actyon',
  '체어맨': 'Chairman',
  'SM6': 'SM6',
  'SM7': 'SM7',
  'QM6': 'QM6',
  'XM3': 'XM3',
  // Common trim/feature terms
  '프리미엄': 'Premium',
  '시그니처': 'Signature',
  '럭셔리': 'Luxury',
  '익스클루시브': 'Exclusive',
  '인스퍼레이션': 'Inspiration',
  '프레스티지': 'Prestige',
  '노블레스': 'Noblesse',
  '캘리그래피': 'Calligraphy',
  '터보': 'Turbo',
  '스포츠': 'Sport',
  '하이브리드': 'Hybrid',
  '플러그인하이브리드': 'PHEV',
};

// Junk prefixes to strip from model names
const junkPrefixes = ['더 뉴 ', '올 뉴 ', '뉴 ', '더뉴 ', '올뉴 '];
const junkSuffixes = [' (신형)', ' (구형)', '(신형)', '(구형)'];

// Korean generation prefix → Russian translation
const generationPrefixes: [string, string][] = [
  ['디 올 뉴 ', 'Совершенно новый '],
  ['더 뉴 ', 'Новый '],
  ['올 뉴 ', 'Совершенно новый '],
  ['더뉴 ', 'Новый '],
  ['올뉴 ', 'Совершенно новый '],
  ['뉴 ', 'Новый '],
];

// Korean → Russian fuel translations
export const fuelMap: Record<string, string> = {
  '가솔린': 'Бензин',
  '디젤': 'Дизель',
  '하이브리드': 'Гибрид',
  '전기': 'Электро',
  '가솔린+전기': 'Гибрид',
  '디젤+전기': 'Гибрид',
  'LPG': 'Газ (LPG)',
  'LPG+전기': 'Газ/Гибрид',
  'Gasoline': 'Бензин',
  'Diesel': 'Дизель',
  'Hybrid': 'Гибрид',
  'Electric': 'Электро',
};

// Korean → Russian color translations
export const colorMap: Record<string, string> = {
  '흰색': 'Белый',
  '검정색': 'Черный',
  '은색': 'Серебристый',
  '회색': 'Серый',
  '빨간색': 'Красный',
  '파란색': 'Синий',
  '갈색': 'Коричневый',
  '녹색': 'Зеленый',
  '노란색': 'Желтый',
  '주황색': 'Оранжевый',
  '보라색': 'Фиолетовый',
  '기타': 'Другой',
  '흰': 'Белый',
  '검정': 'Черный',
  '은': 'Серебристый',
  '회': 'Серый',
  '빨강': 'Красный',
  '파랑': 'Синий',
  '쥐색': 'Серый',
  '하늘색': 'Голубой',
  '진주색': 'Перламутровый',
  '분홍색': 'Розовый',
  '금색': 'Золотой',
  '청색': 'Синий',
  '연금색': 'Светло-золотой',
  '담녹색': 'Светло-зеленый',
  '연회색': 'Светло-серый',
};

// Reverse maps: English → Korean (using the canonical Encar API manufacturer names)
export const reverseBrandMap: Record<string, string> = {};
for (const [korean, english] of Object.entries(brandMap)) {
  if (!reverseBrandMap[english]) {
    reverseBrandMap[english] = korean;
  }
}
// Override with canonical Encar manufacturer names
reverseBrandMap['Chevrolet'] = '쉐보레(GM대우)';
reverseBrandMap['Renault Korea'] = '르노코리아(삼성)';
reverseBrandMap['KG Mobility'] = 'KG모빌리티(쌍용)';
reverseBrandMap['SsangYong'] = 'KG모빌리티(쌍용)';

export const reverseModelMap: Record<string, string> = {};
for (const [korean, english] of Object.entries(modelMap)) {
  if (!reverseModelMap[english]) {
    reverseModelMap[english] = korean;
  }
}

export function reverseTranslateBrand(english: string): string | undefined {
  return reverseBrandMap[english];
}

export function reverseTranslateModel(english: string): string | undefined {
  return reverseModelMap[english];
}

export function translateBrand(korean: string): string {
  if (!korean) return korean;
  // Direct match
  if (brandMap[korean]) return brandMap[korean];
  // Partial match
  for (const [k, v] of Object.entries(brandMap)) {
    if (korean.includes(k)) return v;
  }
  return korean;
}

export function translateModel(korean: string): string {
  if (!korean) return korean;
  let result = korean;

  // Strip junk prefixes and suffixes
  for (const prefix of junkPrefixes) {
    if (result.startsWith(prefix)) result = result.slice(prefix.length);
  }
  for (const suffix of junkSuffixes) {
    if (result.endsWith(suffix)) result = result.slice(0, -suffix.length);
  }

  // Translate "N세대" to "N поколение"
  result = result.replace(/(\d+)세대/, '$1 пок.');

  // Replace known Korean words (longest first to avoid partial overwrites)
  const sortedKeys = Object.keys(modelMap).sort((a, b) => b.length - a.length);
  for (const key of sortedKeys) {
    result = result.replaceAll(key, modelMap[key]);
  }

  return result.replace(/\s+/g, ' ').trim();
}

export function translateFuel(korean: string): string {
  if (!korean) return korean;
  return fuelMap[korean] || korean;
}

export function translateColor(korean: string): string {
  if (!korean) return korean;
  if (colorMap[korean]) return colorMap[korean];
  for (const [k, v] of Object.entries(colorMap)) {
    if (korean.includes(k)) return v;
  }
  return korean;
}

// Translate a Korean generation/variant name to Russian
// e.g. "더 뉴 아반떼 (CN7)" → "Новый Avante (CN7)"
// e.g. "스포티지 5세대 하이브리드" → "Sportage 5-го поколения Hybrid"
export function translateGenerationName(koreanName: string): string {
  if (!koreanName) return koreanName;
  let result = koreanName;
  let prefix = '';

  // Translate generation prefixes
  for (const [ko, ru] of generationPrefixes) {
    if (result.startsWith(ko)) {
      prefix = ru;
      result = result.slice(ko.length);
      break;
    }
  }

  // Translate "N세대" to "N-го поколения"
  result = result.replace(/(\d+)세대/, '$1-го поколения');

  // Strip junk suffixes
  for (const suffix of junkSuffixes) {
    if (result.endsWith(suffix)) result = result.slice(0, -suffix.length);
  }

  // Replace known Korean words (longest first)
  const sortedKeys = Object.keys(modelMap).sort((a, b) => b.length - a.length);
  for (const key of sortedKeys) {
    result = result.replaceAll(key, modelMap[key]);
  }

  return (prefix + result).replace(/\s+/g, ' ').trim();
}
