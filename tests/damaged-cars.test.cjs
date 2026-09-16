const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { Module, createRequire } = require('node:module');
const ts = require('typescript');
const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');
function loadTs(relative, overrides = {}, modules = new Map()) {
  const file = path.resolve(__dirname, '..', relative);
  if (modules.has(file)) return modules.get(file).exports;
  const loaded = new Module(file); modules.set(file, loaded);
  const original = createRequire(file);
  loaded.require = name => {
    if (Object.hasOwn(overrides, name)) return overrides[name];
    if (name.startsWith('@/') || name.startsWith('.')) {
      const base = name.startsWith('@/') ? path.resolve(__dirname, '../src', name.slice(2)) : path.resolve(path.dirname(file), name);
      if (base.endsWith('.mjs')) return original(base);
      const target = ['.ts', '.tsx'].map(ext => base + ext).find(file => fs.existsSync(file));
      return loadTs(path.relative(path.resolve(__dirname, '..'), target), overrides, modules);
    }
    return original(name);
  };
  loaded._compile(ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: {
    module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true,
  } }).outputText, file);
  return loaded.exports;
}
const helpers = loadTs('src/lib/damaged-cars.ts');
const { getTranslation } = loadTs('src/lib/i18n.ts');
const car = { id: '84202', brand: 'Hyundai', model: 'Palisade', title: 'Hyundai Palisade', year: 2019,
  manufacturedYear: 2020, registrationDate: '2019-12-24', lotNumber: '260915-184184', category: 'transfer', lossType: 'partial',
  closesAt: '2099-09-16T09:00:00+09:00', image: 'https://alkorea.kr/upload/data/84202_1_123.jpg',
  images: ['https://alkorea.kr/upload/data/84202_1_123.jpg', 'https://alkorea.kr/upload/data/84202_2_123.jpg'],
  mileage: null, fuel: 'diesel', transmission: 'automatic', displacement: 2199, mileageUnverified: true,
  damageAreas: ['front', 'left'], damageNotes: [], airbagsDeployed: true, priceKrw: null, storageFeeKrw: 500000,
  fetchedAt: '2026-09-16T02:00:00Z', engineCode: 'D4HB', vin: null };
const snapshot = require('../src/data/alkorea-snapshot.json');

test('snapshot contains unique vehicle IDs and full galleries, but no credentials or account fields', () => {
  assert.equal(snapshot.count, snapshot.cars.length);
  assert.equal(new Set(snapshot.cars.map(car => car.id)).size, snapshot.count);
  assert.ok(snapshot.count > 100);
  for (const car of snapshot.cars) {
    assert.ok(car.images.length > 0, car.id);
    assert.equal(car.priceKrw, null);
    assert.ok(!Object.keys(car).some(key => /cookie|password|account|session|manager|user/i.test(key)));
    assert.doesNotMatch(car.title, /[가-힣]|\(\s*\)/);
    for (const image of car.images) assert.equal(new URL(image).origin, 'https://alkorea.kr');
  }
});
test('summaries use a field allowlist and do not send every gallery or private source data to the list', () => {
  const summary = helpers.summarizeDamagedCar({ ...car, password: 'PRIVATE', account: 'PRIVATE' });
  assert.equal(summary.title, car.title);
  assert.equal(summary.images, undefined);
  assert.equal(summary.damageNotes, undefined);
  assert.doesNotMatch(JSON.stringify(summary), /PRIVATE/);
});
test('filters respect brand/model/year/category/loss and preserve separately numbered transfer/scrap lots', () => {
  const rows = [car, { ...car, id: '84203', category: 'scrap' }, { ...car, id: '84204', brand: 'Kia', model: 'K3', year: 2022 }];
  assert.equal(helpers.filterDamagedCars(rows, { brand: 'Hyundai' }).length, 2);
  assert.equal(helpers.filterDamagedCars(rows, { category: 'scrap' }).length, 1);
  assert.equal(helpers.filterDamagedCars(rows, { yearFrom: 2021 })[0].id, '84204');
  assert.equal(helpers.filterDamagedCars(rows, { query: '84202' })[0].id, '84202');
  assert.equal(helpers.filterDamagedCars(rows, { lossType: 'total' }).length, 0);
  assert.equal(helpers.filterDamagedCars(rows, { brand: 'Hyundai', model: 'K3' }).length, 0);
});
test('expired auctions cannot appear as active or outrank current lots', () => {
  const expired = { ...car, id: '99999', closesAt: '2020-01-01T09:00:00+09:00' };
  assert.equal(helpers.isDamagedAuctionClosed(expired), true);
  assert.equal(helpers.isDamagedAuctionClosed({ closesAt: null }), false);
  assert.equal(helpers.filterDamagedCars([expired, car], {})[0].id, car.id);
});
test('bid calculator follows current auction commission, VAT and processing brackets', () => {
  assert.deepEqual(helpers.calculateDamagedAuctionBid(1_000_000, 'transfer'), {
    bidKrw: 1_000_000, auctionFeeKrw: 55_000, vatKrw: 0, processingFeeKrw: 200_000, totalKrw: 1_255_000,
  });
  assert.deepEqual(helpers.calculateDamagedAuctionBid(10_000_000, 'scrap'), {
    bidKrw: 10_000_000, auctionFeeKrw: 550_000, vatKrw: 1_000_000, processingFeeKrw: 100_000, totalKrw: 11_650_000,
  });
  assert.equal(helpers.calculateDamagedAuctionBid(60_000_000, 'transfer').auctionFeeKrw, 3_000_000);
  assert.equal(helpers.calculateDamagedAuctionBid(30_000_000, 'transfer').processingFeeKrw, 400_000);
  assert.equal(helpers.calculateDamagedAuctionBid(Number.NaN, 'scrap').totalKrw, 0);
});
const link = { __esModule: true, default: ({ children, prefetch, ...props }) => React.createElement('a', props, children) };
const image = { __esModule: true, default: ({ fill, priority, ...props }) => React.createElement('img', { ...props, 'data-priority': priority }) };
function overrides(lang = 'ru', query = '') {
  return { 'next/navigation': { usePathname: () => '/damaged-cars', useRouter: () => ({ replace() {} }), useSearchParams: () => new URLSearchParams(query) },
    'next/link': link, 'next/image': image,
    '@/contexts/AppContext': { useApp: () => ({ lang, t: key => {
      const value = getTranslation(key, lang); assert.notEqual(value, key, `Missing translation: ${key}`); return value;
    }, formatMileage: value => `${value} km`, formatKrwPrice: value => `${value} KRW` }) },
    '@/components/detail/ImageGallery': { __esModule: true, default: ({ images }) => React.createElement('div', { 'data-gallery-count': images.length }) },
    './DamagedBidCalculator': { __esModule: true, default: ({ category }) => React.createElement('div', { 'data-bid-category': category }) },
  };
}
test('bid calculator renders a safe local estimate form in every language', () => {
  for (const lang of ['ru', 'en', 'tj', 'uz']) {
    const { default: Calculator } = loadTs('src/components/damaged/DamagedBidCalculator.tsx', overrides(lang));
    const html = renderToStaticMarkup(React.createElement(Calculator, { category: 'transfer-scrap' }));
    assert.ok(html.includes(getTranslation('damaged.bidCalculator', lang)));
    assert.ok(html.includes(getTranslation('damaged.bidEstimate', lang)));
    assert.match(html, /input[Mm]ode="numeric"/);
    assert.equal((html.match(/type="radio"/g) || []).length, 2);
    assert.ok(!/process_bid|submitBid|action=/.test(html));
  }
});
test('catalogue SSR displays paginated cars immediately, only three priority photos, and readable controls in every language', () => {
  for (const lang of ['ru', 'en', 'tj', 'uz']) {
    const { default: Catalog } = loadTs('src/components/damaged/DamagedCatalogClient.tsx', overrides(lang));
    const cars = Array.from({ length: 25 }, (_, index) => ({ ...car, id: String(84200 + index) }));
    const html = renderToStaticMarkup(React.createElement(Catalog, { initial: { cars, fetchedAt: car.fetchedAt, fallback: true } }));
    assert.equal((html.match(/target="_blank"/g) || []).length, 12);
    assert.equal((html.match(/data-priority="true"/g) || []).length, 3);
    assert.ok(html.includes(getTranslation('damaged.askPrice', lang)));
    assert.ok(html.includes('href="/damaged-cars/'));
    assert.ok(html.includes('rel="noopener noreferrer"'));
    assert.ok(html.includes('1 / 3'));
  }
});
test('detail gallery and damage information are open and contact actions carry the accident-car URL in every language', () => {
  for (const lang of ['ru', 'en', 'tj', 'uz']) {
    const mocks = overrides(lang);
    mocks['next/navigation'].usePathname = () => '/damaged-cars/84202';
    const { default: Detail } = loadTs('src/components/damaged/DamagedDetailClient.tsx', mocks);
    const html = renderToStaticMarkup(React.createElement(Detail, { initial: car }));
    assert.ok(html.includes('data-gallery-count="2"'));
    assert.ok(html.includes(getTranslation('damaged.airbags', lang)));
    assert.ok(html.includes(getTranslation('damaged.mileageUnverified', lang)));
    assert.ok(html.includes('data-bid-category="transfer"'));
    assert.ok(!html.includes('<details'));
    const links = [...html.matchAll(/href="(https:\/\/(?:wa.me|t.me)[^"]*)"/g)].map(match => new URL(match[1].replaceAll('&amp;', '&')));
    assert.equal(links.length, 2);
    for (const url of links) assert.ok(url.searchParams.get('text').endsWith('https://ghayrat.vercel.app/damaged-cars/84202'));
  }
});
function loadServer(pages, { failLogin = false } = {}) {
  const calls = [];
  class Client {
    async login() { if (failLogin) throw new Error('PRIVATE login details'); }
    async catalogue(page = 1) { calls.push(['page', page]); return String(page); }
    async detail(id) { calls.push(['detail', id]); return id; }
  }
  const server = loadTs('src/lib/damaged-cars-server.ts', {
    'server-only': {},
    react: { cache: fn => fn }, 'next/cache': { unstable_cache: fn => fn },
    'node:fs/promises': { readFile: async () => JSON.stringify({ cars: [car], fetchedAt: car.fetchedAt, count: 1 }) },
    '../../scripts/lib/alkorea-client.mjs': { ALKoreaClient: Client },
    './alkorea-parser.mjs': { parseALCatalogue: html => ({ cars: pages[Number(html)] || [], pageCount: 5 }), parseALDetail: (_, summary) => ({ ...car, ...summary }) },
  });
  return { server, calls };
}
test('live service imports all pages, deduplicates by listing ID and excludes source-private fields', async () => {
  const previous = { username: process.env.ALKOREA_USERNAME, password: process.env.ALKOREA_PASSWORD };
  process.env.ALKOREA_USERNAME = 'test'; process.env.ALKOREA_PASSWORD = 'test';
  try {
    const { server, calls } = loadServer({ 1: [{ ...car, privateAccount: 'PRIVATE' }], 2: [car],
      3: [{ ...car, id: '84203' }], 4: [{ ...car, id: '84204' }], 5: [{ ...car, id: '84205' }] });
    const data = await server.getDamagedCatalogue(true);
    assert.equal(data.fallback, false);
    assert.equal(data.cars.length, 4);
    assert.deepEqual(calls.map(call => call[1]), [1, 2, 3, 4, 5]);
    assert.doesNotMatch(JSON.stringify(data), /PRIVATE/);
    assert.equal(await server.getDamagedCar('12345', true), null);
    assert.ok(!calls.some(call => call[0] === 'detail'));
  } finally {
    if (previous.username === undefined) delete process.env.ALKOREA_USERNAME; else process.env.ALKOREA_USERNAME = previous.username;
    if (previous.password === undefined) delete process.env.ALKOREA_PASSWORD; else process.env.ALKOREA_PASSWORD = previous.password;
  }
});
test('source authentication failure preserves saved cars and never leaks private upstream errors', async () => {
  const { server } = loadServer({}, { failLogin: true });
  const data = await server.getDamagedCatalogue(true);
  assert.equal(data.fallback, true);
  assert.equal(data.cars[0].id, car.id);
  assert.doesNotMatch(JSON.stringify(data), /PRIVATE/);
  assert.equal((await server.getDamagedCar(car.id)).images.length, 2);
  assert.equal(await server.getDamagedCar('../member_info.php', true), null);
});
test('scrap warnings and unknown facts remain explicit; no normal-car turnkey total is invented', () => {
  const { default: Detail } = loadTs('src/components/damaged/DamagedDetailClient.tsx', overrides());
  const html = renderToStaticMarkup(React.createElement(Detail, { initial: { ...car, category: 'scrap', lossType: 'total', displacement: null } }));
  assert.ok(html.includes(getTranslation('damaged.scrapHint', 'ru')));
  assert.ok(html.includes(getTranslation('damaged.lossHint', 'ru')));
  assert.ok(html.includes(getTranslation('damaged.unknown', 'ru')));
  assert.ok(!/turnkey|под ключ|3200|3000/i.test(html));
});
