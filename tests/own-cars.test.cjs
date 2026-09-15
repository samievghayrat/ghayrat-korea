const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { Module, createRequire } = require('node:module');
const ts = require('typescript');
const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');
const { NextRequest } = require('next/server');

function loadTs(relative, overrides = {}) {
  const file = path.resolve(__dirname, '..', relative);
  const loaded = new Module(file);
  const originalRequire = createRequire(file);
  loaded.require = name => Object.hasOwn(overrides, name) ? overrides[name] : originalRequire(name);
  loaded._compile(ts.transpileModule(fs.readFileSync(file, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true },
  }).outputText, file);
  return loaded.exports;
}

const auth = loadTs('src/lib/admin-auth.ts');
const input = loadTs('src/lib/own-car-input.ts');
const sharing = loadTs('src/lib/car-sharing.ts');
const { getTranslation } = loadTs('src/lib/i18n.ts');
const carNames = loadTs('src/lib/translations.ts');
const carId = 'abcdef123456789012345678';
const photoId = '123456789012345678abcdef';
const cars = new Map();
const photos = new Map();
let connections = 0;
const currency = {
  convertUsdToKrw: async price => price * 1400,
  convertKrwToRub: async price => Math.round(price * 0.06),
  convertKrwToUsd: async price => Math.round(price / 1400),
};
const carModel = {
  find: filter => ({ sort: () => ({ lean: async () => [...cars.values()].filter(car => filter.isActive === undefined || car.isActive === filter.isActive) }) }),
  findOne: filter => ({ lean: async () => { const car = cars.get(filter._id); return car && car.isActive === filter.isActive ? car : null; } }),
  findById: id => ({ lean: async () => cars.get(id) || null }),
  create: async value => { const car = { ...value, _id: carId, createdAt: new Date() }; cars.set(carId, car); return car; },
  findByIdAndUpdate: async (id, update, options) => {
    assert.equal(options.runValidators, true);
    const car = cars.get(id); if (!car) return null;
    cars.set(id, { ...car, ...update.$set }); return car;
  },
  findByIdAndDelete: async id => { const car = cars.get(id); cars.delete(id); return car; },
};
const photoModel = {
  create: async value => { const photo = { ...value, _id: photoId }; photos.set(photoId, photo); return photo; },
  findById: async id => photos.get(id) || null,
};
const db = { __esModule: true, default: async () => { connections++; } };
const own = loadTs('src/lib/own-cars.ts', {
  react: { ...React, cache: fn => fn }, './mongodb': db,
  '@/models/Car': { __esModule: true, default: carModel }, './currency': currency,
});
const overrides = {
  '@/lib/admin-auth': auth, '@/lib/own-car-input': input, '@/lib/own-cars': own,
  '@/lib/currency': currency, '@/lib/mongodb': db,
  '@/models/Car': { __esModule: true, default: carModel },
  '@/models/CarPhoto': { __esModule: true, default: photoModel },
};
const collection = loadTs('src/app/api/own-cars/route.ts', overrides);
const detail = loadTs('src/app/api/own-cars/[id]/route.ts', overrides);
const photoUpload = loadTs('src/app/api/own-car-photos/route.ts', overrides);
const photoRead = loadTs('src/app/api/own-car-photos/[id]/route.ts', overrides);
const login = loadTs('src/app/api/admin/auth/route.ts', overrides);
const fixture = { brand: 'Kia', model: 'K7', year: 2022, mileage: 12345, fuel: 'gasoline',
  price_usd: 15000, images: [`/api/own-car-photos/${photoId}`], equipment: [], isActive: true, location: 'Душанбе', hp: 150 };
const originalPassword = process.env.ADMIN_PASSWORD;
const testPassword = 'test-admin-password-for-unit-tests';
test.before(() => { process.env.ADMIN_PASSWORD = testPassword; });
test.after(() => { if (originalPassword === undefined) delete process.env.ADMIN_PASSWORD; else process.env.ADMIN_PASSWORD = originalPassword; });
test.beforeEach(() => { cars.clear(); photos.clear(); connections = 0; });

function request(route, method = 'GET', body, authenticated = false, origin) {
  const headers = {};
  if (authenticated) headers.cookie = `${auth.ADMIN_COOKIE}=${auth.createAdminSession()}`;
  if (origin) headers.origin = origin;
  if (body !== undefined && !(body instanceof FormData)) headers['content-type'] = 'application/json';
  return new NextRequest(`https://ghayrat.vercel.app${route}`, { method, headers,
    body: body === undefined ? undefined : body instanceof FormData ? body : JSON.stringify(body) });
}
const params = { params: Promise.resolve({ id: carId }) };

test('admin sessions are signed, expire, and cannot be forged or extended', () => {
  const now = Date.now();
  const token = auth.createAdminSession(now);
  assert.equal(auth.verifyAdminSession(token, now), true);
  assert.equal(auth.verifyAdminSession(token, now + auth.ADMIN_SESSION_SECONDS * 1000), false);
  for (const invalid of [undefined, 'true', 'admin', `${token}x`, token.replace(/^[^.]+/, String(now + 999999999)), token.replace(/.$/, token.endsWith('a') ? 'b' : 'a')]) {
    assert.equal(auth.verifyAdminSession(invalid, now), false);
  }
  process.env.ADMIN_PASSWORD = 'changed-test-password';
  assert.equal(auth.verifyAdminSession(token, now), false);
  process.env.ADMIN_PASSWORD = testPassword;
});

test('login uses the configured password and a signed HttpOnly session, not browser storage', async () => {
  assert.equal(auth.adminPasswordMatches(testPassword), true);
  assert.equal(auth.adminPasswordMatches('admin'), false);
  assert.equal(auth.adminPasswordMatches(undefined), false);
  assert.equal((await login.POST(request('/api/admin/auth', 'POST', { password: 'not-the-password' }))).status, 401);
  const response = await login.POST(request('/api/admin/auth', 'POST', { password: testPassword }));
  assert.equal(response.status, 200);
  const cookie = response.headers.get('set-cookie');
  assert.match(cookie, /HttpOnly/); assert.match(cookie, /SameSite=strict/);
  const session = cookie.match(/ghayrat_admin=([^;]+)/)[1];
  assert.equal(auth.verifyAdminSession(session), true);
  const verified = await login.GET(request('/api/admin/auth', 'GET', undefined, true));
  assert.deepEqual(await verified.json(), { authenticated: true });
  delete process.env.ADMIN_PASSWORD;
  assert.equal(auth.adminPasswordMatches('admin'), false);
  assert.equal((await login.POST(request('/api/admin/auth', 'POST', { password: 'admin' }))).status, 503);
  process.env.ADMIN_PASSWORD = testPassword;
});

test('all car writes, hidden listings and photo uploads require server-side authentication', async () => {
  for (const response of [await collection.POST(request('/api/own-cars', 'POST', fixture)),
    await detail.PUT(request(`/api/own-cars/${carId}`, 'PUT', fixture), params),
    await detail.DELETE(request(`/api/own-cars/${carId}`, 'DELETE'), params),
    await collection.GET(request('/api/own-cars?admin=1')),
    await detail.GET(request(`/api/own-cars/${carId}?admin=1`), params),
    await photoUpload.POST(request('/api/own-car-photos', 'POST', new FormData()))]) assert.equal(response.status, 401);
  assert.equal(connections, 0);
  assert.equal(cars.size, 0); assert.equal(photos.size, 0);
});

test('cross-origin writes are rejected even with a valid admin session', async () => {
  assert.equal((await collection.POST(request('/api/own-cars', 'POST', fixture, true, 'https://another.example'))).status, 403);
  assert.equal((await login.POST(request('/api/admin/auth', 'POST', { password: testPassword }, false, 'https://another.example'))).status, 403);
  assert.equal(connections, 0);
});

test('published cars appear publicly, hidden cars do not, and admins can edit either', async () => {
  assert.equal((await collection.POST(request('/api/own-cars', 'POST', fixture, true))).status, 201);
  let publicCars = await (await collection.GET(request('/api/own-cars'))).json();
  assert.equal(publicCars.cars.length, 1);
  assert.equal(publicCars.cars[0].source, 'own'); assert.equal(publicCars.cars[0].price_usd, 15000);
  assert.equal(publicCars.cars[0].price_krw, 21000000); assert.equal(publicCars.cars[0].price_rub, 1260000);
  assert.equal(publicCars.cars[0].location, 'Душанбе'); assert.equal(publicCars.cars[0].hp, 150);
  assert.equal((await detail.PUT(request(`/api/own-cars/${carId}`, 'PUT', { ...fixture, isActive: false, price_usd: 14000 }, true), params)).status, 200);
  publicCars = await (await collection.GET(request('/api/own-cars'))).json();
  assert.equal(publicCars.cars.length, 0);
  assert.equal((await detail.GET(request(`/api/own-cars/${carId}`), params)).status, 404);
  assert.equal(await own.getOwnCar(carId), null);
  const adminCars = await (await collection.GET(request('/api/own-cars?admin=1', 'GET', undefined, true))).json();
  assert.equal(adminCars.cars.length, 1); assert.equal(adminCars.cars[0].isActive, false);
  const adminCar = await (await detail.GET(request(`/api/own-cars/${carId}?admin=1`, 'GET', undefined, true), params)).json();
  assert.equal(adminCar.price_usd, 14000);
  assert.equal((await detail.DELETE(request(`/api/own-cars/${carId}`, 'DELETE', undefined, true), params)).status, 200);
  assert.equal(cars.size, 0);
});

test('car input is allowlisted and rejects missing prices, invalid numbers, unsafe photos and publication without photos', () => {
  const clean = input.validateOwnCarInput({ ...fixture, $set: { isActive: true }, admin: true, _id: 'fake', brand: ' Kia ' });
  assert.equal(clean.brand, 'Kia'); assert.equal(clean.admin, undefined); assert.equal(clean.$set, undefined); assert.equal(clean._id, undefined);
  for (const change of [{ year: -1 }, { mileage: -1 }, { hp: 1.5 }, { price_usd: 0 }, { brand: '' },
    { images: [] }, { images: ['javascript:alert(1)'] }, { images: ['data:image/svg+xml;base64,eA=='] },
    { images: Array(21).fill(fixture.images[0]) }, { isActive: 'true' }, { equipment: [{}] }]) {
    assert.throws(() => input.validateOwnCarInput({ ...fixture, ...change }), JSON.stringify(change));
  }
  assert.equal(input.validateOwnCarInput({ ...fixture, images: [], isActive: false }).isActive, false);
  assert.equal(input.isCarImageUrl('https://photos.example/car.jpg'), true);
  assert.equal(input.isCarImageUrl('https://user:password@photos.example/car.jpg'), false);
});

test('photo uploads persist in storage and return public image bytes with safe immutable caching', async () => {
  const bytes = new Uint8Array([255, 216, 255, 224, 0, 0, 0, 0, 0, 0, 255, 217]);
  const data = new FormData(); data.append('photo', new File([bytes], 'car.jpg', { type: 'image/jpeg' }));
  const uploaded = await photoUpload.POST(request('/api/own-car-photos', 'POST', data, true));
  assert.equal(uploaded.status, 201); assert.equal((await uploaded.json()).url, fixture.images[0]);
  const image = await photoRead.GET(request(fixture.images[0]), { params: Promise.resolve({ id: photoId }) });
  assert.equal(image.headers.get('content-type'), 'image/jpeg');
  assert.equal(image.headers.get('x-content-type-options'), 'nosniff');
  assert.match(image.headers.get('cache-control'), /immutable/);
  assert.deepEqual(new Uint8Array(await image.arrayBuffer()), bytes);
});

test('photos reject disguised SVG, unsupported formats, empty and oversized files', async () => {
  for (const file of [new File(['<svg></svg>'], 'fake.jpg', { type: 'image/jpeg' }),
    new File([], 'empty.jpg', { type: 'image/jpeg' }),
    new File([new Uint8Array(input.MAX_PHOTO_BYTES + 1)], 'large.jpg', { type: 'image/jpeg' })]) {
    const data = new FormData(); data.append('photo', file);
    assert.equal((await photoUpload.POST(request('/api/own-car-photos', 'POST', data, true))).status, 400);
  }
  assert.equal(connections, 0); assert.equal(photos.size, 0);
  assert.equal(input.detectCarPhotoType(new Uint8Array([137,80,78,71,13,10,26,10])), 'image/png');
  assert.equal(input.detectCarPhotoType(new TextEncoder().encode('RIFFxxxxWEBP')), 'image/webp');
});

test('own car detail uses the sale price and share link without Encar or import charges', () => {
  const { default: Detail } = loadTs('src/components/own/OwnCarDetail.tsx', {
    '@/contexts/AppContext': { useApp: () => ({ t: key => getTranslation(key, 'ru'), formatListingPrice: (krw, rub, usd) => `$${usd}` }) },
    '@/lib/translations': carNames, '@/lib/car-sharing': sharing,
    'next/link': { __esModule: true, default: ({ children, ...props }) => React.createElement('a', props, children) },
    '@/components/detail/ImageGallery': { __esModule: true, default: () => React.createElement('div', null, 'gallery') },
    '@/components/detail/CarSpecs': { __esModule: true, default: () => React.createElement('div', null, 'specifications') },
    '@/components/detail/Equipment': { __esModule: true, default: () => null },
    '@/components/shared/FavoriteButton': { __esModule: true, default: () => null },
    '@/components/shared/CarShareButton': { __esModule: true, default: ({ url }) => React.createElement('span', null, url) },
  });
  const html = renderToStaticMarkup(React.createElement(Detail, { car: { ...fixture, id: carId, source: 'own',
    model: 'K3', generation: 'K3 (BD)', trim: 'Signature' } }));
  assert.match(html, /<h1[^>]+>Kia K3 \(BD\) Signature<\/h1>/);
  assert.ok(html.includes('$15000')); assert.ok(html.includes('Душанбе'));
  assert.ok(html.includes(`https://ghayrat.vercel.app/our-cars/${carId}`));
  assert.ok(html.indexOf('gallery') < html.indexOf('$15000')); assert.ok(html.indexOf('$15000') < html.indexOf('specifications'));
  for (const text of ['Растаможка', 'Доставка', 'Цена в Корее']) assert.ok(!html.includes(text), text);
});

test('admin form uploads photos, chooses cover, then creates a published car through the protected API', async () => {
  let states = [], index = 0, pushed;
  const fakeReact = { ...React, useState: initial => {
    const current = index++;
    if (!(current in states)) states[current] = typeof initial === 'function' ? initial() : initial;
    return [states[current], value => { states[current] = typeof value === 'function' ? value(states[current]) : value; }];
  } };
  const { default: Form } = loadTs('src/components/admin/CarForm.tsx', {
    react: fakeReact, 'next/navigation': { useRouter: () => ({ push: path => { pushed = path; }, back: () => {} }) },
    'next/image': { __esModule: true, default: () => null },
    '@/lib/constants': loadTs('src/lib/constants.ts'), '@/lib/own-car-input': input,
    '@/lib/prepare-car-photo': { prepareCarPhoto: async file => file },
  });
  const originalFetch = global.fetch;
  global.fetch = async (url, options) => url === '/api/own-car-photos'
    ? photoUpload.POST(request(url, 'POST', options.body, true))
    : collection.POST(request(url, 'POST', JSON.parse(options.body), true));
  function render() { index = 0; return Form({ initialData: { ...fixture, images: [], isActive: false } }); }
  function walk(element, predicate) {
    if (!element || typeof element !== 'object') return null;
    if (predicate(element)) return element;
    const children = React.Children.toArray(element.props?.children);
    for (const child of children) { const found = walk(child, predicate); if (found) return found; }
    return null;
  }
  try {
    let tree = render();
    const fileField = { files: [new File([new Uint8Array([255,216,255,224])], 'car.jpg', { type: 'image/jpeg' })], value: 'car.jpg' };
    await walk(tree, el => el.type === 'input' && el.props.type === 'file').props.onChange({ currentTarget: fileField });
    tree = render();
    assert.equal(fileField.value, ''); assert.equal(photos.size, 1);
    walk(tree, el => el.type === 'input' && el.props.type === 'checkbox').props.onChange({ target: { checked: true } });
    tree = render(); await tree.props.onSubmit({ preventDefault() {} });
    assert.equal(pushed, '/admin/cars'); assert.equal(cars.size, 1);
    const publicCars = await own.getOwnCars();
    assert.equal(publicCars[0].images[0], fixture.images[0]); assert.equal(publicCars[0].isActive, true);
  } finally { global.fetch = originalFetch; }
});

test('phone photos are resized before uploading and reject unsupported files', async () => {
  const { prepareCarPhoto } = loadTs('src/lib/prepare-car-photo.ts', { './own-car-input': input });
  const previousBitmap = global.createImageBitmap, previousDocument = global.document;
  let closed = false, drawn;
  const canvas = { width: 0, height: 0,
    getContext: () => ({ fillRect() {}, drawImage: (...args) => { drawn = args; } }),
    toBlob: (callback, type) => callback(new Blob([new Uint8Array([255,216,255])], { type })) };
  global.createImageBitmap = async () => ({ width: 4032, height: 3024, close: () => { closed = true; } });
  global.document = { createElement: () => canvas };
  try {
    const photo = await prepareCarPhoto(new File(['photo'], 'phone.png', { type: 'image/png' }));
    assert.equal(canvas.width, 1600); assert.equal(canvas.height, 1200); assert.equal(drawn[3], 1600);
    assert.equal(photo.type, 'image/jpeg'); assert.ok(photo.size <= input.MAX_PHOTO_BYTES); assert.equal(closed, true);
    await assert.rejects(prepareCarPhoto(new File(['<svg/>'], 'car.svg', { type: 'image/svg+xml' })));
  } finally { global.createImageBitmap = previousBitmap; global.document = previousDocument; }
});

test('clearing optional engine specifications removes previous values when editing', async () => {
  await collection.POST(request('/api/own-cars', 'POST', { ...fixture, displacement: 1998 }, true));
  const response = await detail.PUT(request(`/api/own-cars/${carId}`, 'PUT', { ...fixture, hp: 0, displacement: 0 }, true), params);
  assert.equal(response.status, 200);
  const car = await own.getOwnCar(carId);
  assert.equal(car.hp, 0); assert.equal(car.displacement, 0);
});

test('all new visitor text has four translations and public links avoid admin routes', () => {
  for (const lang of ['ru', 'en', 'tj', 'uz']) for (const key of ['nav.ourCars', 'own.title', 'own.subtitle', 'own.empty', 'own.emptyHint', 'own.unavailable', 'own.retry', 'own.salePrice', 'own.location', 'own.description', 'own.back', 'card.viewCar']) {
    assert.notEqual(getTranslation(key, lang), key, `${lang}: ${key}`);
  }
  assert.equal(sharing.getCarShareUrl('our-cars', carId, 'russia'), `https://ghayrat.vercel.app/our-cars/${carId}`);
  const card = fs.readFileSync(path.resolve(__dirname, '../src/components/catalog/CarCard.tsx'), 'utf8');
  assert.match(card, /car\.source === 'own' \? `\/our-cars\//);
  assert.match(card, /car\.source === 'own' \? 'card.viewCar'/);
});
