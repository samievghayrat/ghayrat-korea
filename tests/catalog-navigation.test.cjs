const assert = require('node:assert/strict');
const test = require('node:test');
const fs = require('node:fs');
const path = require('node:path');
const { Module, createRequire } = require('node:module');
const ts = require('typescript');

function loadTs(file, overrides = {}, modules = new Map()) {
  if (modules.has(file)) return modules.get(file).exports;
  const loaded = new Module(file);
  modules.set(file, loaded);
  const originalRequire = createRequire(file);
  loaded.require = name => Object.hasOwn(overrides, name) ? overrides[name]
    : name.endsWith('.json') ? originalRequire(name.startsWith('@/') ? path.resolve(__dirname, '../src', name.slice(2)) : name)
      : name.startsWith('.') ? loadTs(path.resolve(path.dirname(file), `${name}.ts`), overrides, modules)
        : originalRequire(name);
  const compiled = ts.transpileModule(fs.readFileSync(file, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true },
  });
  loaded._compile(compiled.outputText, file);
  return loaded.exports;
}

const { getSnapshotNavigation, getSnapshotModelData, getSnapshotBrandCounts } = loadTs(path.resolve(__dirname, '../src/lib/encar-snapshot.ts'));
const { ENCAR_BRANDS } = loadTs(path.resolve(__dirname, '../src/lib/encar-brands.ts'));
const { getCatalogModels } = loadTs(path.resolve(__dirname, '../src/lib/catalog-navigation.ts'));
const navigation = getSnapshotNavigation();

test('preloaded brands and counts match the existing catalog navigation', () => {
  const previous = getSnapshotBrandCounts(ENCAR_BRANDS);
  assert.deepEqual(navigation.brands, previous.brands);
  assert.equal(navigation.total, previous.total);
  assert.equal(getSnapshotNavigation(), navigation);
});

test('every available brand has its complete existing model list ready in memory', () => {
  for (const brand of navigation.brands) {
    assert.deepEqual(getCatalogModels(navigation, brand.name), getSnapshotModelData(brand.name).models, brand.name);
  }
});

test('model lookup accepts Korean brand links and clears immediately for no or unknown brand', () => {
  assert.equal(getCatalogModels(navigation, 'BMW'), navigation.modelsByBrand.BMW);
  assert.equal(getCatalogModels(navigation, '기아'), navigation.modelsByBrand.Kia);
  assert.deepEqual(getCatalogModels(navigation), []);
  assert.deepEqual(getCatalogModels(navigation, 'Unknown'), []);
  assert.ok(getCatalogModels(navigation, 'BMW').some(model => model.name === '5 Series'));
  assert.ok(getCatalogModels(navigation, 'Kia').some(model => model.name === 'K3'));
  assert.ok(getCatalogModels(navigation, 'Alfa Romeo').length > 0, 'canonical spaced manufacturer names must be recognized');
});

test('the selector payload is compact and does not send vehicle records to the browser', () => {
  const json = JSON.stringify(navigation);
  assert.ok(Buffer.byteLength(json) < 150000, `${Buffer.byteLength(json)} bytes`);
  assert.doesNotMatch(json, /"(?:cars|Photo|VIN|Mileage)":/);
});

function filterHarness(initialQuery = '') {
  let state = null;
  let params = new URLSearchParams(initialQuery);
  const requests = [];
  const listeners = new Map();
  const previousWindow = global.window;
  global.window = { addEventListener: (name, fn) => listeners.set(name, fn), removeEventListener: name => listeners.delete(name) };
  const effects = [];
  const effectDeps = [];
  let effectCursor = 0;
  const { useFilters } = loadTs(path.resolve(__dirname, '../src/hooks/useFilters.ts'), {
    react: {
      useMemo: fn => fn(), useCallback: fn => fn,
      useState: () => [state, update => { state = typeof update === 'function' ? update(state) : update; }],
      useEffect: (fn, deps) => {
        const index = effectCursor++;
        if (!effectDeps[index] || deps.some((value, i) => !Object.is(value, effectDeps[index][i]))) effects.push(fn);
        effectDeps[index] = deps;
      },
    },
    'next/navigation': { useSearchParams: () => params, usePathname: () => '/',
      useRouter: () => ({ replace: url => requests.push(url), push: url => requests.push(url) }) },
  });
  return {
    requests,
    render: () => { effectCursor = 0; const result = useFilters(); while (effects.length) effects.shift()(); return result; },
    commit: query => { params = new URLSearchParams(query); },
    back: query => { params = new URLSearchParams(query); listeners.get('popstate')?.(); },
    dispose: () => { global.window = previousWindow; },
  };
}

test('brand and model controls update before the server finishes the car search', () => {
  const harness = filterHarness('yearFrom=2021&page=1');
  try {
    let view = harness.render();
    view.setFilters({ ...view.filters, brand: 'Kia', page: 1 });
    view = harness.render();
    assert.equal(view.filters.brand, 'Kia');
    assert.equal(view.isUpdating, true);
    assert.ok(getCatalogModels(navigation, view.filters.brand).length > 0);
    view.setFilters({ ...view.filters, model: 'K3', page: 1 });
    view = harness.render();
    assert.equal(view.filters.model, 'K3');
    assert.equal(view.filters.yearFrom, 2021);
    harness.commit('brand=Kia&yearFrom=2021&page=1');
    view = harness.render();
    assert.equal(view.filters.model, 'K3', 'an older result must not discard the latest selection');
    const latestQuery = harness.requests.at(-1).split('?')[1];
    harness.commit(latestQuery);
    assert.equal(harness.render().isUpdating, false);
    assert.equal(harness.render().filters.model, 'K3');
  } finally { harness.dispose(); }
});

test('rapid brand changes keep the latest brand while older searches resolve', () => {
  const harness = filterHarness('brand=BMW&page=1');
  try {
    let view = harness.render();
    view.setFilters({ brand: 'Hyundai', page: 1 });
    view = harness.render();
    view.setFilters({ brand: 'Audi', page: 1 });
    harness.commit('brand=Hyundai&page=1');
    view = harness.render();
    assert.equal(view.filters.brand, 'Audi');
    assert.equal(getCatalogModels(navigation, view.filters.brand), navigation.modelsByBrand.Audi);
    harness.commit('brand=Audi&page=1');
    assert.equal(harness.render().isUpdating, false);
  } finally { harness.dispose(); }
});

test('clearing filters is immediate and browser history restores the linked filters', () => {
  const harness = filterHarness('brand=BMW&model=5Series&page=2');
  try {
    let view = harness.render();
    view.resetFilters();
    view = harness.render();
    assert.equal(view.filters.brand, undefined);
    assert.deepEqual(getCatalogModels(navigation, view.filters.brand), []);
    harness.back('brand=Kia&model=K3&page=1');
    view = harness.render();
    assert.equal(view.filters.brand, 'Kia');
    assert.equal(view.filters.model, 'K3');
    assert.equal(view.isUpdating, false);
  } finally { harness.dispose(); }
});

function optionCache(fetchImpl) {
  const source = fs.readFileSync(path.resolve(__dirname, '../src/components/catalog/EncarSearch.tsx'), 'utf8');
  const snippet = source.slice(source.indexOf('const clientCache ='), source.indexOf('const ChevronIcon'));
  const js = ts.transpileModule(snippet, { compilerOptions: { target: ts.ScriptTarget.ES2022 } }).outputText;
  return new Function('fetch', `${js}; return { fetchCachedJson, clientCache, pendingRequests };`)(fetchImpl);
}

test('failed option requests are not cached and can be retried successfully', async () => {
  let calls = 0;
  const cache = optionCache(async () => ++calls === 1
    ? Response.json({ error: 'Temporary failure' }, { status: 503 })
    : Response.json({ models: [{ name: 'K3' }] }));
  await assert.rejects(cache.fetchCachedJson('generations:Kia:K3', '/options'));
  assert.equal(cache.clientCache.size, 0);
  assert.equal(cache.pendingRequests.size, 0);
  assert.equal((await cache.fetchCachedJson('generations:Kia:K3', '/options')).models[0].name, 'K3');
  assert.equal(calls, 2);
});

test('desktop, mobile and prefetch share a single in-flight option request', async () => {
  let calls = 0;
  let resolve;
  const cache = optionCache(() => { calls++; return new Promise(done => { resolve = done; }); });
  const first = cache.fetchCachedJson('generations:BMW:5', '/options');
  const second = cache.fetchCachedJson('generations:BMW:5', '/options');
  assert.equal(calls, 1);
  resolve(Response.json({ models: [{ name: '5 Series' }] }));
  assert.deepEqual(await first, await second);
  assert.equal(cache.pendingRequests.size, 0);
});
