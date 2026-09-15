const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { Module, createRequire } = require('node:module');
const ts = require('typescript');
const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');

function loadTs(relative, overrides = {}) {
  const file = path.resolve(__dirname, '..', relative);
  const loaded = new Module(file);
  const originalRequire = createRequire(file);
  loaded.require = name => Object.hasOwn(overrides, name) ? overrides[name] : originalRequire(name);
  loaded._compile(ts.transpileModule(fs.readFileSync(file, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022,
      jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true },
  }).outputText, file);
  return loaded.exports;
}

const sharing = loadTs('src/lib/car-sharing.ts');
const { getTranslation } = loadTs('src/lib/i18n.ts');

test('manager contact links target the manager directly and safely encode the car title and URL', () => {
  const url = sharing.getCarShareUrl('catalog', '42738544', 'russia');
  const message = `Интересует автомобиль Mercedes-Benz S-Class W223 2021\n${url}`;
  const links = sharing.getManagerContactLinks(message);
  assert.equal(new URL(links.whatsapp).origin + new URL(links.whatsapp).pathname, 'https://wa.me/821099221601');
  assert.equal(new URL(links.telegram).origin + new URL(links.telegram).pathname, 'https://t.me/ghayrat_korea');
  for (const link of Object.values(links)) assert.equal(new URL(link).searchParams.get('text'), message);
  const special = sharing.getManagerContactLinks('Kia & BMW? + # /\nhttps://ghayrat.vercel.app/auction/1001');
  for (const link of Object.values(special)) assert.equal(new URL(link).searchParams.get('text'), 'Kia & BMW? + # /\nhttps://ghayrat.vercel.app/auction/1001');
});

test('page-level contact carries the correct catalog, auction or own-car URL without unrelated query data', () => {
  for (const route of ['/catalog/42738544', '/auction/1001', '/our-cars/abcdef123456789012345678']) {
    const links = sharing.getPageManagerContactLinks(route, 'Интересует автомобиль');
    for (const link of Object.values(links)) assert.equal(new URL(link).searchParams.get('text'),
      `Интересует автомобиль ${route.split('/').at(-1)}\nhttps://ghayrat.vercel.app${route}`);
  }
  assert.deepEqual(sharing.getPageManagerContactLinks('/catalog/42738544/', 'Car'), sharing.getPageManagerContactLinks('/catalog/42738544', 'Car'));
});

test('generic contact has no stale car draft on non-car pages or malformed paths', () => {
  const generic = { whatsapp: 'https://wa.me/821099221601', telegram: 'https://t.me/ghayrat_korea' };
  for (const route of ['/', '/auction', '/our-cars', '/about', '/admin/cars/new', '/catalog', '/catalog/123/extra', '/catalog/%']) {
    assert.deepEqual(sharing.getPageManagerContactLinks(route, 'Car'), generic, route);
  }
  assert.deepEqual(sharing.getManagerContactLinks('  '), generic);
});

test('shared catalog URL is public and preserves the selected delivery country', () => {
  for (const destination of ['russia', 'tajikistan']) {
    assert.equal(sharing.getCarShareUrl('catalog', '42733716', destination),
      `https://ghayrat.vercel.app/catalog/42733716?destination=${destination}`);
  }
  assert.equal(sharing.getCarShareUrl('catalog', '42733716'), 'https://ghayrat.vercel.app/catalog/42733716');
});

test('auction URLs do not carry an irrelevant delivery country and IDs are encoded', () => {
  assert.equal(sharing.getCarShareUrl('auction', '2026/1001', 'russia'),
    'https://ghayrat.vercel.app/auction/2026%2F1001');
});

test('WhatsApp and Telegram receive the full Unicode title and exact car link', () => {
  const title = 'Audi A7 — 2018 & доставка';
  const url = sharing.getCarShareUrl('catalog', '42733716', 'russia');
  const links = sharing.getCarShareLinks(title, url);
  assert.equal(new URL(links.whatsapp).hostname, 'wa.me');
  assert.equal(new URL(links.whatsapp).searchParams.get('text'), `${title}\n${url}`);
  assert.equal(new URL(links.telegram).searchParams.get('url'), url);
  assert.equal(new URL(links.telegram).searchParams.get('text'), title);
});

test('native sharing falls back to the menu when unavailable or denied', async () => {
  const data = { title: 'Kia K9 2023', url: sharing.getCarShareUrl('catalog', '42733716') };
  assert.equal(await sharing.tryNativeCarShare(data), 'menu');
  assert.equal(await sharing.tryNativeCarShare(data, async () => { throw new Error('Denied'); }), 'menu');
});

test('cancelling the native share sheet does not trigger another sharing action', async () => {
  const error = new Error('Cancelled');
  error.name = 'AbortError';
  assert.equal(await sharing.tryNativeCarShare({ title: 'Kia', url: 'https://ghayrat.vercel.app' },
    async () => { throw error; }), 'cancelled');
});

test('native share receives only the public URL and car title', async () => {
  const data = { title: 'Kia K9 2023', url: sharing.getCarShareUrl('catalog', '42733716') };
  let received;
  assert.equal(await sharing.tryNativeCarShare(data, async value => { received = value; }), 'shared');
  assert.deepEqual(received, data);
});

test('Encar preview resolves actual first gallery photo from snapshot prefixes', () => {
  const image = new URL(sharing.getEncarShareImageUrl('/carpicture03/pic4273/42733716_'));
  assert.equal(image.hostname, 'ci.encar.com');
  assert.equal(image.pathname, '/carpicture/carpicture03/pic4273/42733716_001.jpg');
  assert.equal(image.searchParams.get('cw'), '1200');
  assert.equal(sharing.getEncarShareImageUrl(), undefined);
});

test('social preview has car-specific canonical, image, title and Twitter metadata', () => {
  const url = sharing.getCarShareUrl('catalog', '42733716');
  const metadata = sharing.getCarPreviewMetadata('Audi A7 2018', 'Фотографии и расчёт доставки.', url, '/api/proxy-image?url=photo');
  assert.equal(metadata.alternates.canonical, url);
  assert.equal(metadata.openGraph.url, url);
  assert.equal(metadata.openGraph.title, 'Audi A7 2018 | GHAYRAT');
  assert.equal(metadata.twitter.card, 'summary_large_image');
  assert.equal(metadata.openGraph.images[0].url, 'https://ghayrat.vercel.app/api/proxy-image?url=photo');
  const empty = sharing.getCarPreviewMetadata('Автомобиль', 'Каталог', url, '/images/no-image.svg');
  assert.deepEqual(empty.openGraph.images, []);
  assert.equal(empty.twitter.card, 'summary');
});

test('catalog, auction and similar car cards all open a safe new tab', () => {
  for (const file of ['src/components/catalog/CarCard.tsx', 'src/components/auction/AuctionCarCard.tsx',
    'src/components/detail/SimilarCars.tsx']) {
    const code = fs.readFileSync(path.resolve(__dirname, '..', file), 'utf8');
    assert.match(code, /href=\{[^}]*\}[^>]*target="_blank"[^>]*rel="noopener noreferrer"/s, file);
  }
});

test('compact share control has accessible translated labels in every supported language', () => {
  for (const lang of ['ru', 'en', 'tj', 'uz']) {
    const { default: Button } = loadTs('src/components/shared/CarShareButton.tsx', {
      '@/contexts/AppContext': { useApp: () => ({ t: key => getTranslation(key, lang) }) },
      '@/lib/car-sharing': sharing,
    });
    const html = renderToStaticMarkup(React.createElement(Button, { title: 'Kia K9', url: sharing.getCarShareUrl('catalog', '42733716') }));
    assert.ok(html.includes(`aria-label="${getTranslation('share.button', lang)}"`));
    assert.ok(html.includes('aria-expanded="false"'));
    for (const key of ['share.copyLink', 'share.copied', 'share.manualCopy']) {
      assert.notEqual(getTranslation(key, lang), key);
    }
  }
});
