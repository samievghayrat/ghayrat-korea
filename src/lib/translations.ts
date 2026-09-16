import type { Lang } from './i18n';

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
  '도요타': 'Toyota',
  '마쯔다': 'Mazda',
  '스즈키': 'Suzuki',
  '다이하쯔': 'Daihatsu',
  '닷지': 'Dodge',
  'GMC': 'GMC',
  '사브': 'Saab',
  '로터스': 'Lotus',
  '미쯔비시': 'Mitsubishi',
  '어큐라': 'Acura',
  '사이언': 'Scion',
  '미쯔오까': 'Mitsuoka',
  '스마트': 'Smart',
  '오펠': 'Opel',
  '마이바흐': 'Maybach',
  '폴스타': 'Polestar',
  '시트로엥/DS': 'Citroën/DS',
  'MG로버': 'MG Rover',
  '이네오스': 'INEOS',
  '험머': 'Hummer',
  '머큐리': 'Mercury',
  '뷰익': 'Buick',
  '새턴': 'Saturn',
  '폰티악': 'Pontiac',
  'BYD': 'BYD',
  '지리': 'Geely',
  '동풍소콘': 'Dongfeng Sokon',
  '북기은상': 'BAIC',
  '신위안': 'Sinyuan',
  '포톤': 'Foton',
  '부가티': 'Bugatti',
  '코닉세그': 'Koenigsegg',
  '파가니': 'Pagani',
  '이스즈': 'Isuzu',
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
  // Foreign brand model translations (Korean → English)
  // BMW
  '시리즈': 'Series',
  '액티브 투어러': 'Active Tourer',
  '그란 투리스모': 'Gran Turismo',
  '그란쿠페': 'Gran Coupe',
  // Mercedes-Benz
  '클래스': 'Class',
  // Common foreign model terms
  '쿠페': 'Coupe',
  '카브리올레': 'Cabriolet',
  '컨버터블': 'Convertible',
  '로드스터': 'Roadster',
  '투어링': 'Touring',
  '세단': 'Sedan',
  '왜건': 'Wagon',
  '어벤져': 'Avenger',
  '랭글러': 'Wrangler',
  '그랜드 체로키': 'Grand Cherokee',
  '체로키': 'Cherokee',
  '컴패스': 'Compass',
  '레니게이드': 'Renegade',
  '글래디에이터': 'Gladiator',
  '카이엔': 'Cayenne',
  '카이만': 'Cayman',
  '마칸': 'Macan',
  '파나메라': 'Panamera',
  '타이칸': 'Taycan',
  '티구안': 'Tiguan',
  '투아렉': 'Touareg',
  '아테온': 'Arteon',
  '골프': 'Golf',
  '제타': 'Jetta',
  '파사트': 'Passat',
  '폴로': 'Polo',
  '티록': 'T-Roc',
  '아이디': 'ID.',
  '캠리': 'Camry',
  '코롤라': 'Corolla',
  '라브4': 'RAV4',
  '하이랜더': 'Highlander',
  '프리우스': 'Prius',
  '시빅': 'Civic',
  '어코드': 'Accord',
  '아웃백': 'Outback',
  '포레스터': 'Forester',
  '임프레자': 'Impreza',
  '레거시': 'Legacy',
  '무스탕': 'Mustang',
  '익스플로러': 'Explorer',
  '브롱코': 'Bronco',
  '에스컬레이드': 'Escalade',
  '네비게이터': 'Navigator',
  '에비에이터': 'Aviator',
  '디스커버리': 'Discovery',
  '디펜더': 'Defender',
  '레인지로버': 'Range Rover',
  '이보크': 'Evoque',
  '제네시스': 'Genesis',
  '스타렉스': 'Starex',
  '스파크': 'Spark',
  '아베오': 'Aveo',
  '올란도': 'Orlando',
  '에쿠스': 'Equus',
  '쿠퍼': 'Cooper',
  '컨트리맨': 'Countryman',
  '클럽맨': 'Clubman',
  '모델': 'Model',
  '마스터': 'Master',
  '고스트': 'Ghost',
  '컨티넨탈': 'Continental',
  '콰트로포르테': 'Quattroporte',
  // Common trim/feature terms
  '프리미엄': 'Premium',
  '프리미어': 'Premier',
  '프라임': 'Prime',
  '세이프티': 'Safety',
  '레더 패키지': 'Leather Package',
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
  // Common foreign brand trim terms
  '인스크립션': 'Inscription',
  '모멘텀': 'Momentum',
  '얼티메이트': 'Ultimate',
  '울트라': 'Ultra',
  '브라이트': 'Bright',
  '블랙': 'Black',
  '에디션': 'Edition',
  '디자인': 'Design',
  '어드밴티지': 'Advantage',
  '라인': 'Line',
  '스포츠라인': 'Sportline',
  '스포트라인': 'Sportline',
};

// Junk prefixes to strip from model names
const junkPrefixes = ['더 뉴 ', '올 뉴 ', '뉴 ', '더뉴 ', '올뉴 '];
const junkSuffixes = [' (신형)', ' (구형)', '(신형)', '(구형)'];

// Korean generation prefix → Russian translation
const generationPrefixes: Array<[string, 'new' | 'allNew']> = [
  ['디 올 뉴 ', 'allNew'],
  ['더 뉴 ', 'new'],
  ['올 뉴 ', 'allNew'],
  ['더뉴 ', 'new'],
  ['올뉴 ', 'allNew'],
  ['뉴 ', 'new'],
];

const generationCopy: Record<Lang, { new: string; allNew: string; generation: string }> = {
  ru: { new: 'Новый ', allNew: 'Совершенно новый ', generation: '$1-го поколения' },
  en: { new: 'New ', allNew: 'All-new ', generation: '$1 generation' },
  tj: { new: 'Нав ', allNew: 'Комилан нав ', generation: 'насли $1' },
  uz: { new: 'Yangi ', allNew: 'Butunlay yangi ', generation: '$1-avlod' },
};

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

function normalizeModelSpacing(value: string): string {
  return value
    .replace(/(\d)Series\b/g, '$1 Series')
    .replace(/\s+/g, ' ')
    .trim();
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

  return normalizeModelSpacing(result);
}

/** A short, customer-facing model name for catalog cards. */
export function getCompactModelName(model: string): string {
  if (!model) return model;

  return translateModel(model)
    .replace(/^(?:Совершенно новый|Новый|All[- ]new|New|Комилан нав|Нав|Butunlay yangi|Yangi)\s+/i, '')
    .replace(/\s+\d+\s*(?:пок\.|-го поколения|generation)\s*$/i, '')
    .replace(/\s+насли\s+\d+\s*$/i, '')
    .replace(/\s+\d+-avlod\s*$/i, '')
    .replace(/\s*\d+세대\s*$/i, '')
    .replace(/\s+Hybrid\s*$/i, '')
    .replace(/\s*\([A-Z0-9-]{2,}\)\s*$/i, '')
    .replace(/\s+/g, ' ')
    .trim();
}

// Korean badge/trim word translations
const badgeWordMap: Record<string, string> = {
  '(세부등급 없음)': '',
  '아방가르드': 'Avantgarde',
  '아방가르트': 'Avantgarde',
  '콰트로': 'quattro',
  '다이나믹': 'Dynamic',
  '엑스드라이브': 'xDrive',
  '4모션': '4Motion',
  '리미티드': 'Limited',
  '밸류 플러스': 'Value Plus',
  '기본형': 'Standard',
  '최고급형': 'Top Premium',
  '고급형': 'Premium',
  '롱 레인지': 'Long Range',
  '싱글모터': 'Single Motor',
  '듀얼모터': 'Dual Motor',
  '하이리무진': 'Hi Limousine',
  '리무진': 'Limousine',
  '렌터카용': 'Rental',
  '렌터카': 'Rental',
  '특장업체': 'Special Conversion',
  '어린이보호차': 'School Bus',
  '카고': 'Cargo',
  '도어': 'door',
  '르블랑': 'Le Blanc',
  '그랜드': 'Grand',
  '카니발': 'Carnival',
  '세단': 'Sedan',
  '해치백': 'Hatchback',
  '웨건': 'Wagon',
  '레드라인': 'Redline',
  '베스트 셀렉션': 'Best Selection',
  '투어러': 'Tourer',
  '라운지': 'Lounge',
  '캠핑카': 'Camper',
  '컬렉션': 'Collection',
  '플럭스': 'Flux',
  '프레지던트': 'President',
  '스타일': 'Style',
  '어스': 'Earth',
  '플래티넘': 'Platinum',
  '마스터': 'Master',
  '엘리트': 'Elite',
  '클럽': 'Club',
  '패션': 'Fashion',
  '슈프림': 'Supreme',
  '어드벤처': 'Adventure',
  '패키지': 'Package',
  '패밀리': 'Family',
  '코어': 'Core',
  '더 블랙': 'The Black',
  '블랙': 'Black',
  '유라시아': 'Eurasia',
  '스타': 'Star',
  '쿨멘': 'Culmen',
  '링크': 'link',
  '팝': 'Pop',
  '익스페디션': 'Expedition',
  '헤리티지': 'Heritage',
  '인텔리전트': 'Intelligent',
  '와일드': 'Wild',
  '파이니스트': 'Finest',
  '트랜디': 'Trendy',
  '프로페셔널': 'Professional',
  '마제스티': 'Majesty',
  '테크': 'Tech',
  '아트': 'Art',
  '모빌리티': 'Mobility',
  '인스크립션': 'Inscription',
  '모멘텀': 'Momentum',
  '얼티메이트': 'Ultimate',
  '울트라': 'Ultra',
  '브라이트': 'Bright',
  '디자인': 'Design',
  '어드밴티지': 'Advantage',
  '스포츠라인': 'Sportline',
  '스포트라인': 'Sportline',
  '라인': 'Line',
  '에어': 'Air',
  '팩': 'Pack',
  '시그니처': 'Signature',
  '프리미엄': 'Premium',
  '프리미어': 'Premier',
  '프라임': 'Prime',
  '세이프티': 'Safety',
  '레더 패키지': 'Leather Package',
  '프레스티지': 'Prestige',
  '노블레스': 'Noblesse',
  '인스퍼레이션': 'Inspiration',
  '캘리그래피': 'Calligraphy',
  '익스클루시브': 'Exclusive',
  '모던': 'Modern',
  '트렌디': 'Trendy',
  '스마트': 'Smart',
  '럭셔리': 'Luxury',
  '그래비티': 'Gravity',
  '마스터즈': 'Masters',
  '스페셜': 'Special',
  '클래식': 'Classic',
  '스포츠': 'Sports',
  '어반': 'Urban',
  '컴포트': 'Comfort',
  '에디션': 'Edition',
  '롱레인지': 'Long Range',
  '스탠다드': 'Standard',
  '익스트림': 'Extreme',
  '어드밴스드': 'Advanced',
  '터보': 'Turbo',
  '인승': 'seat',
  '디럭스': 'Deluxe',
  '하이테크': 'Hi-Tech',
  '레저': 'Leisure',
  '비즈니스': 'Business',
  '어시스트': 'Assist',
  '이그제큐티브': 'Executive',
  '셀렉션': 'Selection',
  '밴': 'Van',
  '왜건': 'Wagon',
  '쿠페': 'Coupe',
  '카브리올레': 'Cabriolet',
  '컨버터블': 'Convertible',
  '초이스': 'Choice',
  '플러스': 'Plus',
  '라이트': 'Light',
  '센시블': 'Sensible',
  '가솔린': 'Бензин',
  '디젤': 'Дизель',
  '하이브리드': 'Гибрид',
  '가솔린+전기': 'Гибрид',
  '디젤+전기': 'Гибрид',
  '전기': 'Электро',
};

export function translateBadgeDetail(korean: string, lang: Lang = 'ru'): string {
  if (!korean) return korean;
  let result = korean;
  // Replace longest keys first
  const sortedKeys = Object.keys(badgeWordMap).sort((a, b) => b.length - a.length);
  for (const key of sortedKeys) {
    result = result.replaceAll(key, badgeWordMap[key]);
  }
  const fuelWords: Record<Lang, Record<string, string>> = {
    ru: {},
    en: { 'Бензин': 'Gasoline', 'Дизель': 'Diesel', 'Гибрид': 'Hybrid', 'Электро': 'Electric' },
    tj: { 'Бензин': 'Бензин', 'Дизель': 'Дизел', 'Гибрид': 'Гибрид', 'Электро': 'Электрикӣ' },
    uz: { 'Бензин': 'Benzin', 'Дизель': 'Dizel', 'Гибрид': 'Gibrid', 'Электро': 'Elektr' },
  };
  for (const [source, translated] of Object.entries(fuelWords[lang])) {
    result = result.replaceAll(source, translated);
  }
  return result.trim();
}

export function translateFuel(korean: string): string {
  if (!korean) return korean;
  if (fuelMap[korean]) return fuelMap[korean];
  const sortedKeys = Object.keys(fuelMap).sort((a, b) => b.length - a.length);
  const matchedKey = sortedKeys.find((key) => korean.includes(key));
  return matchedKey ? fuelMap[matchedKey] : korean;
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
export function translateGenerationName(koreanName: string, lang: Lang = 'ru'): string {
  if (!koreanName) return koreanName;
  let result = koreanName;
  let prefix = '';

  result = result
    .replace(/^Совершенно новый\s+/i, generationCopy[lang].allNew)
    .replace(/^Новый\s+/i, generationCopy[lang].new)
    .replace(/(\d+)\s*(?:пок\.|-го поколения)/gi, generationCopy[lang].generation);

  // Translate generation prefixes
  for (const [ko, kind] of generationPrefixes) {
    if (result.startsWith(ko)) {
      prefix = generationCopy[lang][kind];
      result = result.slice(ko.length);
      break;
    }
  }

  // Translate "N세대" to "N-го поколения"
  result = result.replace(/(\d+)세대/g, generationCopy[lang].generation);

  // Strip junk suffixes
  for (const suffix of junkSuffixes) {
    if (result.endsWith(suffix)) result = result.slice(0, -suffix.length);
  }

  // Replace known Korean words (longest first)
  const sortedKeys = Object.keys(modelMap).sort((a, b) => b.length - a.length);
  for (const key of sortedKeys) {
    result = result.replaceAll(key, modelMap[key]);
  }

  return normalizeModelSpacing(prefix + result);
}

/** Preserve unfamiliar trim names phonetically rather than discard their text. */
function romanizeUntranslatedName(value: string): string {
  const initials = ['g', 'kk', 'n', 'd', 'tt', 'r', 'm', 'b', 'pp', 's', 'ss', '', 'j', 'jj', 'ch', 'k', 't', 'p', 'h'];
  const vowels = ['a', 'ae', 'ya', 'yae', 'eo', 'e', 'yeo', 'ye', 'o', 'wa', 'wae', 'oe', 'yo', 'u', 'wo', 'we', 'wi', 'yu', 'eu', 'ui', 'i'];
  const finals = ['', 'k', 'k', 'ks', 'n', 'nj', 'nh', 't', 'l', 'lk', 'lm', 'lb', 'ls', 'lt', 'lp', 'lh', 'm', 'p', 'ps', 't', 't', 'ng', 't', 't', 'k', 't', 'p', 't'];
  return value.replace(/[가-힣]+/g, word => {
    const latin = [...word].map(character => {
      const code = character.charCodeAt(0) - 0xac00;
      return initials[Math.floor(code / 588)] + vowels[Math.floor(code / 28) % 21] + finals[code % 28];
    }).join('');
    return latin[0].toUpperCase() + latin.slice(1);
  });
}

/** Build the complete customer-facing name used on detail pages and catalog cards. */
export function getFullCarName(car: {
  brand: string;
  model: string;
  generation?: string;
  badge?: string;
  trim?: string;
}, lang: Lang = 'ru'): string {
  const translateName = (value: string) => romanizeUntranslatedName(
    translateBadgeDetail(translateGenerationName(translateModel(value), lang), lang),
  ).replace(/\s+/g, ' ').trim();
  const model = translateName(car.model || '');
  const generation = translateName(car.generation || '');
  const tokenKey = (word: string) => word.normalize('NFKC').toLowerCase().replace(/[^\p{L}\p{N}.]/gu, '');
  const phraseKey = (value: string) => value.split(/\s+/).map(tokenKey).filter(Boolean).join(' ');
  const containsPhrase = (value: string, phrase: string) =>
    (` ${phraseKey(value)} `).includes(` ${phraseKey(phrase)} `);
  const names = [translateName(translateBrand(car.brand || '')),
    generation && containsPhrase(generation, model) ? generation : model,
    generation && !containsPhrase(generation, model) ? generation : '',
    translateName(car.badge || ''), translateName(car.trim || '')];
  let words: string[] = [];
  for (const name of names.filter(Boolean)) {
    if (containsPhrase(words.join(' '), name)) continue;
    const next = name.split(/\s+/);
    let overlap = Math.min(words.length, next.length);
    while (overlap > 0 && !words.slice(-overlap).every((word, i) => tokenKey(word) === tokenKey(next[i]))) overlap--;
    words = [...words, ...next.slice(overlap)];
  }
  return words.join(' ');
}
