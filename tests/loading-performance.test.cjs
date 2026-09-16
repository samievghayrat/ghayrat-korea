const assert = require('node:assert/strict');
const test = require('node:test');
const fs = require('node:fs');
const path = require('node:path');
const { Module, createRequire } = require('node:module');
const ts = require('typescript');
const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');

function loadTs(relative, overrides = {}, modules = new Map()) {
  const file = path.resolve(__dirname, '..', relative);
  if (modules.has(file)) return modules.get(file).exports;
  const loaded = new Module(file);
  modules.set(file, loaded);
  const originalRequire = createRequire(file);
  loaded.require = name => {
    if (Object.hasOwn(overrides, name)) return overrides[name];
    if (name.startsWith('@/') || name.startsWith('.')) {
      const base = name.startsWith('@/') ? path.resolve(__dirname, '../src', name.slice(2))
        : path.resolve(path.dirname(file), name);
      if (base.endsWith('.json')) return originalRequire(base);
      const target = ['.ts', '.tsx'].map(ext => `${base}${ext}`).find(candidate => fs.existsSync(candidate));
      return loadTs(path.relative(path.resolve(__dirname, '..'), target), overrides, modules);
    }
    return originalRequire(name);
  };
  loaded._compile(ts.transpileModule(fs.readFileSync(file, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022,
      jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true },
  }).outputText, file);
  return loaded.exports;
}

const car = { id: '42741661', brand: 'Kia', model: 'K3', badge: 'Signature', year: 2022,
  month: 1, mileage: 20000, fuel: 'Бензин', displacement: 1598, hp: 123,
  price_krw: 10000000, price_rub: 600000, price_usd: 8000, source: 'encar',
  usd_to_rub: 75, eur_to_rub: 90, imageUrl: 'https://ci.encar.com/car.jpg' };
const { getTranslation } = loadTs('src/lib/i18n.ts');
const app = { useApp: () => ({ t: key => getTranslation(key, 'ru'), lang: 'ru' }) };

function gridHtml(props) {
  const { default: Grid } = loadTs('src/components/catalog/CarGrid.tsx', {
    '@/contexts/AppContext': app,
    './CarCard': { __esModule: true, default: ({ car, priority }) =>
      React.createElement('a', { href: `/catalog/${car.id}`, 'data-priority': priority }, car.model) },
  });
  return renderToStaticMarkup(React.createElement(Grid, props));
}

test('pending filters preserve clickable cars and identify the grid as busy', () => {
  const html = gridHtml({ cars: [car], loading: true });
  assert.ok(html.includes('aria-busy="true"'));
  assert.ok(html.includes('href="/catalog/42741661"'));
  assert.doesNotMatch(html, /animate-pulse/);
  assert.ok(gridHtml({ cars: [car], loading: false }).includes('aria-busy="false"'));
});

test('skeletons remain available for an initial empty load, with honest empty and error states', () => {
  assert.ok(gridHtml({ cars: [], loading: true }).includes('animate-pulse'));
  assert.ok(gridHtml({ cars: [], error: true }).includes(getTranslation('search.unavailableTitle', 'ru')));
  assert.ok(gridHtml({ cars: [] }).includes(getTranslation('search.noCars', 'ru')));
});

test('only the first row of three catalogue photos receives high priority', () => {
  const html = gridHtml({ cars: Array.from({ length: 24 }, (_, i) => ({ ...car, id: String(i) })) });
  assert.equal((html.match(/data-priority="true"/g) || []).length, 3);
  assert.equal((html.match(/data-priority="false"/g) || []).length, 21);
});

test('catalogue cards match their year-based destination quote without changing own-car prices', () => {
  const noComponent = { __esModule: true, default: () => null };
  const { default: Card } = loadTs('src/components/catalog/CarCard.tsx', {
    'next/link': { __esModule: true, default: ({ children, ...props }) => React.createElement('a', props, children) },
    'next/image': noComponent,
    '@/components/shared/FavoriteButton': noComponent,
    '@/contexts/AppContext': { useApp: () => ({ t: key => key, lang: 'ru', formatMileage: String,
      formatListingPrice: (krw, rub, usd) => `${rub} RUB / ${usd} USD` }) },
  });
  const listing = { ...car, price_rub: 612000, price_usd: 8160 };
  for (const [year, expected] of [[2022, '651456 RUB / 8686 USD'], [2018, '638928 RUB / 8519 USD']]) {
    const html = renderToStaticMarkup(React.createElement(Card, { car: { ...listing, year } }));
    assert.ok(html.includes(expected), html);
    assert.ok(html.includes(`href="/catalog/${car.id}"`));
  }
  const own = renderToStaticMarkup(React.createElement(Card, { car: { ...listing, source: 'own' } }));
  assert.ok(own.includes('612000 RUB / 8160 USD'));

  const generated = renderToStaticMarkup(React.createElement(Card, {
    car: { ...listing, generation: '더 뉴 K3 2세대' },
  }));
  assert.ok(generated.includes('data-testid="car-generation"'));
  assert.ok(generated.includes('Новый K3 2-го поколения'));
});

test('catalogue exposes generation immediately while mileage stays inside more filters', () => {
  const { default: Search } = loadTs('src/components/catalog/EncarSearch.tsx', {
    '@/lib/constants': { YEAR_OPTIONS: [2026, 2025] },
    '@/lib/translations': { translateGenerationName: value => value, translateBadgeDetail: value => value },
    '@/contexts/AppContext': { useApp: () => ({ t: key => key, lang: 'ru' }) },
    '@/components/shared/BottomSheet': { __esModule: true, default: ({ children }) => React.createElement('div', null, children) },
    '@/lib/catalog-navigation': { getCatalogModels: () => [{ name: 'K3', nameKo: 'K3', count: 10 }] },
  });
  const html = renderToStaticMarkup(React.createElement(Search, {
    filters: { brand: 'Kia', model: 'K3', page: 1 },
    onChange: () => {}, brandCounts: [{ name: 'Kia', nameKo: '기아', count: 10 }],
    totalCars: 10, navigation: { brands: [], modelsByBrand: {}, total: 10, generatedAt: '' },
  }));
  assert.ok(html.includes('data-testid="generation-filter"'));
  assert.ok(html.includes('search.generationPlaceholder'));
  assert.ok(html.includes('search.moreFilters'));
  assert.ok(!html.includes('data-testid="mileage-from"'));
  assert.ok(!html.includes('data-testid="mileage-to"'));

  const source = fs.readFileSync(path.resolve(__dirname, '../src/components/catalog/EncarSearch.tsx'), 'utf8');
  assert.ok(
    source.indexOf('{/* Generation selector */}') < source.indexOf('{/* Primary year range */}'),
    'generation selector should appear directly after model and before year',
  );
  const advanced = source.slice(source.indexOf('{showMoreFilters && ('), source.indexOf('{/* Horsepower */}'));
  assert.ok(advanced.includes('data-testid={key === \'mileageFrom\' ? \'mileage-from\' : \'mileage-to\'}'));
  assert.ok(advanced.includes("title={t('filter.mileage')}"));
});

const { getGalleryThumbnailUrl, getNextGalleryImage } = loadTs('src/lib/gallery-images.ts');
const photo = 'https://ci.encar.com/carpicture04/pic4274/car_001.jpg?impolicy=heightRate&rh=768&cw=1280&ch=768&wtmk=https%3A%2F%2Fci.encar.com%2Fwt_mark%2Fw_mark_04.png';

test('gallery previews use small CDN variants without changing the photo or watermark', () => {
  const original = new URL(photo);
  const thumbnail = new URL(getGalleryThumbnailUrl(photo));
  assert.equal(thumbnail.origin, original.origin);
  assert.equal(thumbnail.pathname, original.pathname);
  assert.equal(thumbnail.searchParams.get('wtmk'), original.searchParams.get('wtmk'));
  for (const [key, value] of [['cw', '192'], ['ch', '120'], ['rh', '120']])
    assert.equal(thumbnail.searchParams.get(key), value);
  for (const src of ['/images/no-image.svg', 'data:image/jpeg;base64,abc',
    'https://example.com/photo.jpg', 'https://ci.encar.com.attacker.example/photo.jpg',
    'https://ghayrat.vercel.app/api/proxy-image?url=photo']) assert.equal(getGalleryThumbnailUrl(src), src);
});

test('the gallery prepares only the next distinct photo and wraps at the end', () => {
  assert.equal(getNextGalleryImage([], 0), undefined);
  assert.equal(getNextGalleryImage(['a'], 0), undefined);
  assert.equal(getNextGalleryImage(['a', 'a'], 0), undefined);
  assert.equal(getNextGalleryImage(['a', 'b', 'c'], 0), 'b');
  assert.equal(getNextGalleryImage(['a', 'b', 'c'], 2), 'a');
});

test('detail response receives a server-rendered local car without making live listing or reservation requests', async () => {
  const calls = [];
  const Client = () => null;
  const { default: Page } = loadTs('src/app/catalog/[id]/page.tsx', {
    '@/components/detail/CatalogCarDetailClient': { __esModule: true, default: Client },
    '@/lib/encar-api': { getSnapshotCarDetail: async id => { calls.push(id); return car; } },
  });
  const result = await Page({ params: Promise.resolve({ id: car.id }) });
  assert.equal(result.type, Client);
  assert.equal(result.props.initialCar, car);
  assert.equal(result.key, car.id, 'Switching cars resets all client detail state');
  assert.deepEqual(calls, [car.id]);
  const invalid = await Page({ params: Promise.resolve({ id: 'invalid-id' }) });
  assert.equal(invalid.props.initialCar, null);
  assert.deepEqual(calls, [car.id]);
});

test('the initial detail HTML contains the title, photograph, specs and calculation without waiting for browser fetches', () => {
  const noComponent = { __esModule: true, default: () => null };
  const { default: Detail } = loadTs('src/components/detail/CatalogCarDetailClient.tsx', {
    'next/navigation': { useParams: () => ({ id: car.id }), useSearchParams: () => new URLSearchParams('destination=russia') },
    'next/link': { __esModule: true, default: ({ children, ...props }) => React.createElement('a', props, children) },
    '@/contexts/AppContext': app,
    '@/components/detail/ImageGallery': { __esModule: true, default: ({ images }) => React.createElement('img', { src: images[0], alt: 'car' }) },
    '@/components/detail/CarSpecs': { __esModule: true, default: ({ car }) => React.createElement('span', null, `HP ${car.hp}`) },
    '@/components/detail/Equipment': noComponent,
    '@/components/detail/CarCondition': noComponent,
    '@/components/detail/SimilarCars': noComponent,
    '@/components/shared/FavoriteButton': noComponent,
    '@/components/shared/CarShareButton': noComponent,
    '@/components/shared/LoadingSpinner': { __esModule: true, default: () => React.createElement('span', null, 'WAITING') },
  });
  const html = renderToStaticMarkup(React.createElement(Detail, { initialCar: car }));
  assert.ok(html.includes('Kia K3 Signature'));
  assert.ok(html.includes(`src="${car.imageUrl}"`));
  assert.ok(html.includes('HP 123'));
  assert.ok(html.includes(getTranslation('price.totalShort', 'ru')));
  assert.doesNotMatch(html, /WAITING/);
});

function googleRateHtml(base, quote, value) {
  return `<c-wiz data-p="%.@.[null,null,[&quot;${base}&quot;,&quot;${quote}&quot;]],null,rest">`
    + `<span jsname="Pdsbrc"><span>${value}</span></span></c-wiz>`;
}

test('Google Finance parser selects the requested pair instead of unrelated quotes', () => {
  const { parseGoogleFinanceRate } = loadTs('src/lib/google-finance.ts');
  const html = googleRateHtml('USD', 'RUB', '84.1953')
    + googleRateHtml('EUR', 'RUB', '97.2153');
  assert.equal(parseGoogleFinanceRate(html, 'USD', 'RUB'), 84.1953);
  assert.equal(parseGoogleFinanceRate(html, 'EUR', 'RUB'), 97.2153);
  assert.equal(parseGoogleFinanceRate(html, 'KRW', 'RUB'), null);
});

test('concurrent currency conversions share one Google refresh and preserve the current markup and rounding', async () => {
  const originalFetch = global.fetch;
  const calls = [];
  const releases = [];
  global.fetch = (url, options) => {
    calls.push({ url, options });
    return new Promise(resolve => releases.push(() => {
      const pair = String(url).match(/quote\/([A-Z]{3})-([A-Z]{3})/)?.slice(1);
      const values = { 'KRW-RUB': '0.06', 'USD-RUB': '75', 'EUR-RUB': '85.71428571428571' };
      resolve({ ok: true, text: async () => googleRateHtml(pair[0], pair[1], values[pair.join('-')]) });
    }));
  };
  try {
    const rates = loadTs('src/lib/currency.ts');
    const jobs = Array.from({ length: 24 }, () => Promise.all([
      rates.convertKrwToRub(10000000), rates.convertKrwToUsd(10000000),
      rates.getUsdToRub(), rates.getEurToRub(),
    ]));
    assert.equal(calls.length, 3);
    assert.ok(calls.every(call => call.options.signal instanceof AbortSignal));
    assert.ok(calls.every(call => String(call.url).includes('google.com/finance/quote/')));
    assert.ok(calls.every(call => call.options.headers['User-Agent'].includes('Mozilla/5.0')));
    releases.forEach(release => release());
    const results = await Promise.all(jobs);
    for (const [rub, usd, usdRub, eurRub] of results) {
      assert.equal(rub, 612000);
      assert.equal(usd, 8160);
      assert.ok(Math.abs(usdRub - 75) < 1e-10);
      assert.ok(Math.abs(eurRub - 0.06 / 0.0007) < 1e-10);
    }
    assert.equal(await rates.convertKrwToRub(10000000), 612000);
    assert.equal(calls.length, 3);
  } finally { global.fetch = originalFetch; }
});

test('unavailable rate providers share bounded fallback requests, not an unbounded wait', async () => {
  const originalFetch = global.fetch;
  const calls = [];
  const keepAlive = setTimeout(() => {}, 10000);
  global.fetch = (url, options) => {
    calls.push({ url, options });
    return new Promise((resolve, reject) => options.signal.addEventListener('abort',
      () => reject(options.signal.reason), { once: true }));
  };
  try {
    const rates = loadTs('src/lib/currency.ts');
    const started = Date.now();
    const result = await Promise.all([rates.convertKrwToRub(10000000), rates.convertKrwToUsd(10000000)]);
    assert.deepEqual(result, [693600, 7446]);
    assert.equal(calls.length, 5);
    assert.ok(calls.every(call => call.options.signal.aborted));
    assert.ok(Date.now() - started < 7000);
  } finally { clearTimeout(keepAlive); global.fetch = originalFetch; }
});

function hookHarness(file, overrides = {}) {
  const states = [], refs = [], dependencies = [], effects = [], cleanups = [];
  let stateCursor = 0, refCursor = 0, effectCursor = 0;
  const { default: Component } = loadTs(file, {
    react: { ...React,
      useState: initial => {
        const index = stateCursor++;
        if (!(index in states)) states[index] = typeof initial === 'function' ? initial() : initial;
        return [states[index], update => { states[index] = typeof update === 'function' ? update(states[index]) : update; }];
      },
      useRef: initial => refs[refCursor++] ||= { current: initial },
      useMemo: fn => fn(), useCallback: fn => fn,
      useEffect: (fn, deps) => {
        const index = effectCursor++;
        if (!dependencies[index] || deps.some((value, i) => !Object.is(value, dependencies[index][i]))) {
          effects.push(() => { cleanups[index]?.(); cleanups[index] = fn(); });
          dependencies[index] = deps;
        }
      },
    }, ...overrides,
  });
  return {
    states,
    render: props => { stateCursor = refCursor = effectCursor = 0; return Component(props); },
    flush: () => { while (effects.length) effects.shift()(); },
    cleanup: () => { for (const fn of cleanups) fn?.(); },
  };
}

function findElement(node, predicate) {
  if (!node || typeof node !== 'object') return undefined;
  if (Array.isArray(node)) return node.map(child => findElement(child, predicate)).find(Boolean);
  return predicate(node) ? node : findElement(node.props?.children, predicate);
}

test('gallery preloading waits for the displayed photo, limits downloads, skips data-saving mode and cleans up timers', () => {
  const originalWindow = global.window, originalDocument = global.document;
  const originalNavigator = Object.getOwnPropertyDescriptor(global, 'navigator');
  const timers = new Map(), downloads = [];
  let nextTimer = 0;
  global.window = { setTimeout: fn => { timers.set(++nextTimer, fn); return nextTimer; },
    clearTimeout: id => timers.delete(id), Image: class { set src(src) { downloads.push({ src, priority: this.fetchPriority }); } } };
  global.document = { body: { style: {} } };
  Object.defineProperty(global, 'navigator', { configurable: true, value: { connection: { saveData: false } } });
  const harness = hookHarness('src/components/detail/ImageGallery.tsx', {
    '@/contexts/AppContext': app,
    'next/image': { __esModule: true, default: () => null },
  });
  const props = { images: [photo, photo.replace('_001', '_002'), photo.replace('_001', '_003')], alt: 'Car' };
  try {
    let tree = harness.render(props); harness.flush();
    assert.equal(timers.size, 0, 'No competing download before the visible photograph loads');
    findElement(tree, node => node.props?.onLoad).props.onLoad();
    tree = harness.render(props); harness.flush();
    assert.equal(timers.size, 1);
    for (const [id, fn] of timers) { timers.delete(id); fn(); }
    assert.deepEqual(downloads, [{ src: props.images[1], priority: 'low' }]);
    harness.render({ ...props, images: [...props.images] }); harness.flush();
    assert.equal(timers.size, 0, 'Already prepared photos are not downloaded again');

    findElement(tree, node => node.props?.['aria-label'] === getTranslation('gallery.next', 'ru')).props.onClick({ stopPropagation() {} });
    tree = harness.render(props); harness.flush();
    assert.equal(timers.size, 0);
    global.navigator.connection.saveData = true;
    findElement(tree, node => node.props?.onLoad).props.onLoad();
    harness.render(props); harness.flush();
    assert.equal(timers.size, 0, 'Data-saving mode never preloads photographs');
    global.navigator.connection.saveData = false;
    harness.render({ ...props, images: [...props.images] }); harness.flush();
    assert.equal(timers.size, 1);
    harness.cleanup();
    assert.equal(timers.size, 0, 'Unmounted galleries do not start delayed downloads');
  } finally {
    harness.cleanup(); global.window = originalWindow; global.document = originalDocument;
    if (originalNavigator) Object.defineProperty(global, 'navigator', originalNavigator);
    else delete global.navigator;
  }
});

test('a background listing refresh preserves specifications that the gallery returned first', async () => {
  const originalFetch = global.fetch, originalDocument = global.document;
  let releaseListing;
  const listingResponse = new Promise(resolve => { releaseListing = resolve; });
  global.document = { title: '' };
  global.fetch = url => url.includes('encar-gallery')
    ? Promise.resolve({ ok: true, json: async () => ({ images: [photo], details: { hp: 140, displacement: 1998 } }) })
    : url.endsWith('/pan-auto') ? Promise.resolve({ status: 204 }) : listingResponse;
  const noComponent = { __esModule: true, default: () => null };
  const harness = hookHarness('src/components/detail/CatalogCarDetailClient.tsx', {
    'next/navigation': { useParams: () => ({ id: car.id }), useSearchParams: () => new URLSearchParams() },
    'next/link': noComponent,
    '@/contexts/AppContext': app,
    ...Object.fromEntries(['ImageGallery', 'CarSpecs', 'RussiaCustomsSummary', 'Equipment', 'CarCondition', 'SimilarCars']
      .map(name => [`@/components/detail/${name}`, noComponent])),
    ...Object.fromEntries(['FavoriteButton', 'CarShareButton', 'LoadingSpinner', 'CountryFlag']
      .map(name => [`@/components/shared/${name}`, noComponent])),
  });
  const tick = () => new Promise(resolve => setImmediate(resolve));
  try {
    harness.render({ initialCar: car }); harness.flush(); await tick();
    harness.render({ initialCar: car }); harness.flush();
    assert.equal(harness.states[0].hp, 140);
    releaseListing({ ok: true, json: async () => ({ ...car }) }); await tick();
    harness.render({ initialCar: car }); harness.flush();
    assert.equal(harness.states[0].hp, 140);
    assert.equal(harness.states[0].displacement, 1998);
  } finally { harness.cleanup(); global.fetch = originalFetch; global.document = originalDocument; }
});
