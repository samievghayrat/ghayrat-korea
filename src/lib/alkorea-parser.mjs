import { load } from 'cheerio/slim';

const BASE = 'https://alkorea.kr/page/exhibition.php';
const clean = value => String(value || '').replace(/\s+/g, ' ').trim();
const number = value => {
  const normalized = clean(value).replace(/(?:won|krw|km|원|㎞|cc|cm³|㎤)/gi, '').replace(/[ ,]/g, '');
  if (!/^\d+(?:\.\d+)?$/.test(normalized)) return null;
  const result = Number(normalized);
  return Number.isFinite(result) ? result : null;
};

const models = [
  ['Hyundai', /아반떼|\bavante\b/i, 'Avante'], ['Hyundai', /그랜[저져]|grandeur/i, 'Grandeur'],
  ['Hyundai', /[쏘소]나타|sonata/i, 'Sonata'], ['Hyundai', /팰리세이드|palisade/i, 'Palisade'],
  ['Hyundai', /싼타페|santa\s*fe/i, 'Santa Fe'], ['Hyundai', /투싼|tucson/i, 'Tucson'],
  ['Hyundai', /스타렉스|starex/i, 'Starex'], ['Hyundai', /스타리아|staria/i, 'Staria'],
  ['Hyundai', /포터|porter/i, 'Porter'], ['Hyundai', /코나|\bkona\b/i, 'Kona'],
  ['Hyundai', /엑센트|accent/i, 'Accent'], ['Hyundai', /에쿠스|equus/i, 'Equus'],
  ['Hyundai', /베라크루즈|veracruz/i, 'Veracruz'], ['Hyundai', /맥스크루즈|maxcruz/i, 'Maxcruz'],
  ['Hyundai', /베뉴|venue/i, 'Venue'], ['Hyundai', /아이오닉|ioniq/i, 'Ioniq'],
  ['Hyundai', /캐스퍼|casper/i, 'Casper'], ['Hyundai', /베르나|verna/i, 'Verna'],
  ['Hyundai', /벨로스터|veloster/i, 'Veloster'], ['Hyundai', /\bi[34]0\b/i, null],
  ['Hyundai', /제네시스\s*쿠페|genesis\s*coupe/i, 'Genesis Coupe'],
  ['Kia', /스포티지|sportage/i, 'Sportage'], ['Kia', /쏘렌토|sorento/i, 'Sorento'],
  ['Kia', /카니발|carnival/i, 'Carnival'], ['Kia', /셀토스|seltos/i, 'Seltos'],
  ['Kia', /모닝|morning/i, 'Morning'], ['Kia', /모하비|mohave/i, 'Mohave'],
  ['Kia', /봉고|bongo/i, 'Bongo'], ['Kia', /\bk[35789]\b/i, null],
  ['Kia', /니로|\bniro\b/i, 'Niro'], ['Kia', /스팅어|stinger/i, 'Stinger'],
  ['Kia', /\bev[34569]\b/i, null], ['Kia', /레이|\bray\b/i, 'Ray'],
  ['Kia', /프라이드|pride/i, 'Pride'], ['Kia', /포르테|forte/i, 'Forte'],
  ['Kia', /카렌스|carens/i, 'Carens'], ['Kia', /로체|lotze/i, 'Lotze'], ['Kia', /쏘울|soul/i, 'Soul'],
  ['Kia', /오피러스|opirus/i, 'Opirus'],
  ['Renault Samsung', /\b[QSX]M[3567]\b/i, null], ['Renault', /twizy/i, 'Twizy'],
  ['Chevrolet', /스파크|spark/i, 'Spark'], ['Chevrolet', /말리부|malibu/i, 'Malibu'],
  ['Chevrolet', /윈스톰|winstorm/i, 'Winstorm'], ['Chevrolet', /올란도|orlando/i, 'Orlando'],
  ['Chevrolet', /크루즈|cruze/i, 'Cruze'], ['Chevrolet', /트랙스|trax/i, 'Trax'],
  ['Chevrolet', /캡티바|captiva/i, 'Captiva'], ['Chevrolet', /마티즈|matiz/i, 'Matiz'],
  ['Chevrolet', /트레일블레이저|trailblazer/i, 'Trailblazer'], ['Chevrolet', /토스카|tosca/i, 'Tosca'],
  ['Chevrolet', /아베오|aveo/i, 'Aveo'], ['GM Korea', /알페온|alpheon/i, 'Alpheon'],
  ['GM Korea', /라보|labo/i, 'Labo'],
  ['KGM', /티볼리|tivoli/i, 'Tivoli'], ['KGM', /렉스턴|rexton/i, 'Rexton'],
  ['KGM', /코란도|korando/i, 'Korando'], ['KGM', /토레스|torres/i, 'Torres'], ['KGM', /액티언|actyon/i, 'Actyon'],
  ['Genesis', /제네시스|\bG(?:70|80|90)\b|\bGV(?:60|70|80)\b/i, null],
  ['Audi', /아우디|\b[ASQ][1-8](?:L)?\b|\bTT\b/i, null],
  ['BMW', /\bBMW\b|\b[1-8](?:series|시리즈)|\b[1-8]\d{2}[di]\b/i, null],
  ['Mercedes-Benz', /벤츠|benz|mercedes|\b[ABCEGS]\s*\d{3}\b|\bGL[ABCEKS](?:\d{3})?\b/i, null],
  ['Volkswagen', /폭스바겐|volkswagen|티구안|tiguan|골프|golf|파사트|passat|제타|jetta|arteon|\bCC\s+2\.0/i, null],
  ['MINI', /\bmini\b|미니|cooper/i, null], ['Volvo', /볼보|volvo|\bXC[469]0\b/i, null],
  ['BYD', /\bbyd\b/i, null], ['Tesla', /테슬라|tesla|model\s*[3YSX]/i, null],
  ['Toyota', /토요타|도요타|toyota|camry|캠리|prius|프리우스/i, null],
  ['Lexus', /렉서스|lexus/i, null], ['Jeep', /\bjeep\b|지프|wrangler|랭글러/i, null],
  ['Land Rover', /랜드로버|land\s*rover|discovery|디스커버리|range\s*rover/i, null],
  ['Ford', /토러스|taurus|explorer|익스플로러|\bford\b/i, null],
  ['Honda', /accord|어코드|혼다|honda/i, null],
  ['Jaguar', /재규어|jaguar|\bXJ\b/i, null],
  ['Citroen', /citroen|시트로엥/i, null],
  ['Peugeot', /peugeot|푸조/i, null], ['Porsche', /포르쉐|porsche|\b911\b/i, null],
  ['Nissan', /닛산|nissan|altima|알티마/i, null], ['Infiniti', /인피니티|infiniti/i, null],
  ['Daechang Motors', /포트로|potro/i, 'Potro Pickup S'],
];

export function normalizeALName(raw) {
  const name = clean(raw);
  const match = models.find(([, expression]) => expression.test(name));
  let model = match?.[2] || name;
  if (match?.[2]) {
    if (/하이브리드|hybrid/i.test(name)) model += ' Hybrid';
    if (match[2] === 'Ioniq') model += name.match(/[56]/)?.[0] ? ` ${name.match(/[56]/)[0]}` : '';
    if (match[2] === 'Porter' && /II|2|Ⅱ/i.test(name)) model += ' II';
  } else {
    model = name.replace(/토러스/g, 'Taurus').replace(/제네시스/g, 'Genesis')
      .replace(/카레라/g, 'Carrera').replace(/카브리올레/g, 'Cabriolet')
      .replace(/\(([^)]*[A-Za-z][^)]*)\)/g, ' $1 ')
      .replace(/[가-힣]+/g, ' ').replace(/\b(?:BMW|Audi|Mercedes[- ]?Benz|Genesis|Hyundai|Kia|Volkswagen|Tesla|BYD)\b/gi, ' ');
    model = clean(model.replace(/\(\s*\)/g, '')).replace(/\s+([.,])/g, '$1');
    if (match?.[0] && model.toLowerCase().startsWith(match[0].toLowerCase())) model = clean(model.slice(match[0].length));
  }
  if (!model || !/[A-Za-z0-9]/.test(model)) model = '—';
  return { brand: match?.[0] || '', model, title: clean(`${match?.[0] || ''} ${model === '—' && match ? '' : model}`) };
}

export function resolveALImage(source) {
  try {
    const url = new URL(source, BASE);
    if (url.origin !== 'https://alkorea.kr' || !/^\/upload\/data\/[A-Za-z0-9_.-]+\.(?:jpg|jpeg|png|webp)$/i.test(url.pathname)) return null;
    if (url.username || url.password || url.search || url.hash) return null;
    return url.href;
  } catch { return null; }
}

function kind(value) {
  if (/transfer.*scrap|scrap.*transfer/i.test(value)) return 'transfer-scrap';
  if (/scrap|말소/i.test(value)) return 'scrap';
  if (/transfer|이전/i.test(value)) return 'transfer';
  return 'unknown';
}
function loss(value) {
  if (/partial|분손/i.test(value)) return 'partial';
  if (/total|전손/i.test(value)) return 'total';
  return 'unknown';
}
function fuel(value) {
  if (/하이브리드|hybrid|휘발유.*전기|경유.*전기/i.test(value)) return 'hybrid';
  if (/electric|전기/i.test(value)) return 'electric';
  if (/lpg|엘피지/i.test(value)) return 'lpg';
  if (/diesel|경유/i.test(value)) return 'diesel';
  if (/gasoline|petrol|휘발유|가솔린/i.test(value)) return 'gasoline';
  return 'unknown';
}
function gear(value) {
  if (/auto|자동/i.test(value)) return 'automatic';
  if (/manual|수동/i.test(value)) return 'manual';
  return 'unknown';
}

function deadline(value, html, now) {
  const short = clean(value).match(/(\d{2})[./](\d{2})\s+(\d{2}):(\d{2})/);
  if (!short) return null;
  // The filter contains actual full auction dates, not registration years.
  const dates = [...html.matchAll(/value=["'](\d{4}-\d{2}-\d{2})["']/g)].map(match => match[1]);
  let full = dates.find(date => date.endsWith(`-${short[1]}-${short[2]}`));
  if (!full) {
    const explicit = [...html.matchAll(/\b(20\d{2})[-/](\d{2})[-/](\d{2})[ T](\d{2}):(\d{2})/g)]
      .find(match => match[2] === short[1] && match[3] === short[2] && match[4] === short[3] && match[5] === short[4]);
    if (explicit) full = `${explicit[1]}-${short[1]}-${short[2]}`;
  }
  if (!full) {
    const korea = new Date(now + 9 * 60 * 60 * 1000);
    let year = korea.getUTCFullYear();
    if (korea.getUTCMonth() === 11 && short[1] === '01') year++;
    if (korea.getUTCMonth() === 0 && short[1] === '12') year--;
    full = `${year}-${short[1]}-${short[2]}`;
  }
  const iso = `${full}T${short[3]}:${short[4]}:00+09:00`;
  return Number.isFinite(Date.parse(iso)) ? iso : null;
}

export function parseALCatalogue(html, now = Date.now()) {
  const $ = load(html);
  if ($('form[name="loginForm"]').length) throw new Error('AL Korea session expired');
  const cards = $('.list_card').map((_, element) => {
    const card = $(element);
    const href = card.find('a[href]').first().attr('href');
    const id = new URL(href || '', BASE).searchParams.get('id');
    if (!id || !/^\d{1,12}$/.test(id)) throw new Error('Invalid AL Korea listing');
    const info = {};
    card.find('.list_info').each((_, item) => {
      const row = $(item), label = clean(row.find('span').text()).replace(/\s*:\s*$/, '');
      info[label] = clean(row.clone().children('span').remove().end().text());
    });
    const boxes = card.find('.boxes .box').map((_, box) => clean($(box).text())).get();
    const registrationDate = /^\d{4}\.\d{2}\.\d{2}$/.test(info['First Reg']) ? info['First Reg'].replaceAll('.', '-') : null;
    return {
      id, ...normalizeALName(card.find('.name').text()), lotNumber: clean(card.find('.idx').text()),
      registrationDate, year: registrationDate ? Number(registrationDate.slice(0, 4)) : null,
      fuel: fuel(info.Fuel), transmission: gear(info.Gear),
      category: kind(boxes[0] || ''), lossType: loss(boxes[1] || ''),
      closesAt: deadline(card.find('.deadline').text(), html, now),
      image: resolveALImage(card.find('img.list_img').attr('src')), mileage: null,
    };
  }).get();
  const pages = $('.pagination a[href]').map((_, element) => Number(new URL($(element).attr('href'), BASE).searchParams.get('page') || 1)).get();
  const pageCount = Math.max(1, ...pages);
  if (pageCount > 500) throw new Error('Invalid AL Korea pagination');
  // Empty source response must never silently erase a working catalogue.
  if (!cards.length && !$('.content_box').length) throw new Error('AL Korea catalogue layout changed');
  return { cars: cards, pageCount };
}

export function parseALDetail(html, summary, now = Date.now()) {
  const $ = load(html);
  if (!$('.car_name').length || !$('.car_detail_info .detail_col').length) throw new Error('AL Korea vehicle details unavailable');
  const info = {};
  $('.car_detail_info .detail_col').each((_, item) => {
    const row = $(item);
    info[clean(row.find('.detail_category').text())] = clean(row.find('.detail_text').text());
  });
  const images = [...new Set($('#car_img_list img').map((_, img) => resolveALImage($(img).attr('src'))).get().filter(Boolean))];
  images.sort((a, b) => Number(a.match(/\/\d+_(\d+)_/)?.[1] || 0) - Number(b.match(/\/\d+_(\d+)_/)?.[1] || 0));
  if (!images.length && summary.image) images.push(summary.image);
  // Only factual, vehicle-specific damage notes; discard the standard contract text.
  const notes = $('.detail_damage p').map((_, item) => clean($(item).text())).get().filter(Boolean);
  const boilerplate = notes.findIndex(note => /^[★☆※]/.test(note));
  const damageNotes = notes.slice(0, boilerplate < 0 ? notes.length : boilerplate).slice(0, 40);
  const damageText = `${info['Damage Condition'] || ''} ${damageNotes.join(' ')}`;
  const areaExpressions = { front: /front|전면|전방/i, rear: /rear|후면|후방/i, left: /left|좌측|왼쪽/i,
    right: /right|우측|오른쪽/i, roof: /roof|루프|지붕/i, underbody: /underbody|하체|하부/i };
  const damageAreas = Object.entries(areaExpressions).filter(([, expression]) => expression.test(damageText)).map(([area]) => area);
  const mileageUnverified = /주행거리.*(?:확인\s*(?:불가|불능)|임의)|mileage.*(?:unverified|unavailable)/i.test(damageText);
  const manufacturedYear = number(info['Year of Manufacture']);
  const vin = info['Vehicle Identification Number'];
  return {
    ...summary, ...normalizeALName(info['Vehicle Model'] || $('.car_name').text()),
    manufacturedYear: manufacturedYear && manufacturedYear >= 1950 && manufacturedYear <= 2100 ? manufacturedYear : null,
    images, image: images[0] || null, displacement: number(info['Engine Displacement']),
    mileage: mileageUnverified || !(number(info['Instrument Cluster']) > 0) ? null : number(info['Instrument Cluster']), mileageUnverified,
    registeredMileage: number(info['Registered mileage']) > 0 ? number(info['Registered mileage']) : null,
    fuel: info['Fuel Type'] ? fuel(info['Fuel Type']) : summary.fuel,
    transmission: gear(info['Gear Type']), engineCode: info['Engine Model'] || null,
    vin: /^[A-HJ-NPR-Z0-9]{17}$/i.test(vin || '') ? vin : null,
    storageFeeKrw: number(info['Storage Fee']), damageAreas, damageNotes,
    airbagsDeployed: /에어백\s*(?:전개|터짐)|airbags?.*deploy/i.test(damageText) ? true : null,
    // A blank bid input, auction fees and "Pre-Tax Delivery Price" are NOT car prices.
    priceKrw: null, fetchedAt: new Date(now).toISOString(),
  };
}
