const assert = require('node:assert/strict');
const test = require('node:test');
const fs = require('node:fs');
const path = require('node:path');
const { Module, createRequire } = require('node:module');
const ts = require('typescript');
const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');

function loadTs(file, overrides = {}) {
  const loaded = new Module(file);
  const originalRequire = createRequire(file);
  loaded.require = name => Object.hasOwn(overrides, name) ? overrides[name]
    : name.startsWith('.') ? loadTs(path.resolve(path.dirname(file), `${name}.ts`), overrides)
      : originalRequire(name);
  const compiled = ts.transpileModule(fs.readFileSync(file, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022,
      jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true },
  });
  loaded._compile(compiled.outputText, file);
  return loaded.exports;
}

const { getTjContainerShippingUsd } = loadTs(path.resolve(__dirname, '../src/lib/tj-shipping.ts'));
const { getCarDeliveryDestination } = loadTs(path.resolve(__dirname, '../src/lib/car-destination.ts'));
const { parseManualEngineInput } = loadTs(path.resolve(__dirname, '../src/lib/manual-engine-input.ts'));
const { calculateImportCost } = loadTs(path.resolve(__dirname, '../src/lib/calculator.ts'), {
  './tj-customs': { lookupTjCustomsMinimum: brand => brand ? { minimumUsd: 10000 } : undefined },
});
const base = { priceKrw: 10000000, priceRub: 600000, priceUsd: 8000, encarFeeKrw: 440000,
  displacement: 1998, year: 2022, month: 1, fuel: 'Бензин', hp: 150,
  brand: 'Kia', model: 'Sportage', usdRate: 75, eurRate: 90 };
const { getTranslation } = loadTs(path.resolve(__dirname, '../src/lib/i18n.ts'));
const { parseEncarInsuranceHistory } = loadTs(path.resolve(__dirname, '../src/lib/encar-inspection.ts'));
const { default: RussiaCustomsSummary, getRussiaCustomsTotal } = loadTs(
  path.resolve(__dirname, '../src/components/detail/RussiaCustomsSummary.tsx'), {
    '@/contexts/AppContext': { useApp: () => ({ t: key => getTranslation(key, 'ru') }) },
  });
const russianExample = { currency: 'RUB', calculationComplete: true,
  brokerFee: 100000, customsDuty: 1025972, customsFee: 4924, utilizationFee: 3501600 };

test('missing horsepower stays pending for a partial first digit and accepts the complete number', () => {
  for (const value of ['', '1', '15']) {
    const hp = parseManualEngineInput(value, 'hp');
    assert.equal(hp, undefined, value);
    assert.equal(calculateImportCost({ ...base, hp, destination: 'russia' }).calculationComplete, false);
  }
  for (const value of ['150', '360']) {
    const hp = parseManualEngineInput(value, 'hp');
    assert.equal(hp, Number(value));
    assert.equal(calculateImportCost({ ...base, hp, destination: 'russia' }).calculationComplete, true);
  }
});

test('manual engine values enforce the existing integer limits and allow clearing and correcting input', () => {
  for (const [field, min, max] of [['hp', 30, 1500], ['displacement', 500, 10000]]) {
    for (const value of ['', ' ', '-1', 'NaN', 'Infinity', '1e3', '150.5', String(min - 1), String(max + 1)]) {
      assert.equal(parseManualEngineInput(value, field), undefined, `${field}: ${value}`);
    }
    for (const value of [String(min), String(max), `0${min}`]) {
      assert.equal(parseManualEngineInput(value, field), Number(value), `${field}: ${value}`);
    }
  }
  assert.equal(parseManualEngineInput('1', 'displacement'), undefined);
  assert.equal(parseManualEngineInput('19', 'displacement'), undefined);
  assert.equal(parseManualEngineInput('199', 'displacement'), undefined);
  assert.equal(parseManualEngineInput('1998', 'displacement'), 1998);
});

test('missing engine editors depend on source specifications, not calculation completion', () => {
  const page = fs.readFileSync(path.resolve(__dirname, '../src/app/catalog/[id]/page.tsx'), 'utf8');
  const editor = page.match(/\{apiLoaded && \(!car\.hp \|\| !car\.displacement\) && \(([\s\S]*?)\n                \)\}/);
  assert.ok(editor, 'The engine editor stays mounted after a valid estimate appears');
  assert.doesNotMatch(editor[1], /calculationReady/);
  for (const field of ['Hp', 'Displacement']) {
    assert.ok(editor[1].includes(`setManual${field}(event.target.value)`));
    assert.ok(editor[1].includes(`value={manual${field}}`));
  }
  assert.ok(page.includes("parseManualEngineInput(manualHp, 'hp')"));
  assert.ok(page.includes("parseManualEngineInput(manualDisplacement, 'displacement')"));
});

test('car breadcrumb shows the compact brand and model after the listing ID and wraps on mobile', () => {
  const page = fs.readFileSync(path.resolve(__dirname, '../src/app/catalog/[id]/page.tsx'), 'utf8');
  const breadcrumb = page.match(/\{\/\* Breadcrumb \*\/\}([\s\S]*?)<\/nav>/)[1];
  assert.match(breadcrumb, /flex-wrap/);
  assert.doesNotMatch(breadcrumb, /whitespace-nowrap|overflow-x-auto/);
  assert.ok(breadcrumb.indexOf("t('nav.catalog')") < breadcrumb.indexOf('{car.id}'));
  assert.ok(breadcrumb.indexOf('{car.id}') < breadcrumb.indexOf('{fullTitle}'));
  assert.match(breadcrumb, /aria-current="page">\{fullTitle\}/);
  assert.match(page, /return \[car\.brand, getCompactModelName\(car\.model\)\]/);
});

test('cars from 2021 onward default to Russia', () => {
  for (const year of [2021, 2022, 2025, 2026]) {
    assert.equal(getCarDeliveryDestination(year), 'russia', String(year));
  }
});

test('cars from 2014 through 2020 default to Tajikistan', () => {
  for (const year of [2014, 2015, 2018, 2020]) {
    assert.equal(getCarDeliveryDestination(year), 'tajikistan', String(year));
  }
});

test('older cars, missing years and invalid country parameters keep the existing fallback', () => {
  for (const year of [2013, 2000, undefined, NaN]) {
    assert.equal(getCarDeliveryDestination(year, 'invalid'), 'russia');
  }
  assert.equal(getCarDeliveryDestination(2018, 'invalid'), 'tajikistan');
});

test('an explicit country choice is not overwritten by the car year or later specification updates', () => {
  for (const destination of ['russia', 'tajikistan']) {
    for (const year of [undefined, 2014, 2020, 2021, 2026]) {
      assert.equal(getCarDeliveryDestination(year, destination), destination);
    }
  }
});

test('automatic destination uses the matching calculation currency', () => {
  for (const year of [2014, 2020, 2021, 2026]) {
    const destination = getCarDeliveryDestination(year);
    const result = calculateImportCost({ ...base, year, destination });
    assert.equal(result.currency, year >= 2021 ? 'RUB' : 'USD');
  }
});

test('Russian customs summary includes all four charges in the requested example', () => {
  assert.equal(getRussiaCustomsTotal(russianExample), 4632496);
});

test('grouping Russian customs does not change the grand total or count any charge twice', () => {
  for (const hp of [150, 260]) {
    const result = calculateImportCost({ ...base, hp, destination: 'russia' });
    assert.equal(result.calculationComplete, true);
    assert.equal(result.total, result.carPrice + result.encarFee + result.serviceFee + getRussiaCustomsTotal(result));
  }
});

test('Russian customs summary does not quote an incomplete or invalid total', () => {
  for (const result of [null, { ...russianExample, calculationComplete: false },
    { ...russianExample, currency: 'USD' }, { ...russianExample, customsDuty: NaN },
    { ...russianExample, customsFee: -1 }, { ...russianExample, utilizationFee: undefined }]) {
    assert.equal(getRussiaCustomsTotal(result), null);
  }
});

test('Russian customs starts collapsed, shows the sum, and contains the renamed breakdown', () => {
  const html = renderToStaticMarkup(React.createElement(RussiaCustomsSummary, { breakdown: russianExample }));
  assert.doesNotMatch(html, /<details[^>]*\sopen/);
  assert.match(html, /<summary[\s\S]*Растаможка в России[\s\S]*4\s632\s496 ₽[\s\S]*<\/summary>/);
  for (const label of ['Оформление и брокерские услуги', 'Таможенная пошлина', 'Таможенный сбор', 'Утилизационный сбор']) {
    assert.ok(html.includes(label), label);
  }
  assert.equal((html.match(/<dt /g) || []).length, 4);
  assert.equal(getTranslation('price.delivery', 'ru'), 'Доставка и услуга');
});

test('missing Russian engine information keeps the customs summary pending', () => {
  const result = calculateImportCost({ ...base, hp: undefined, destination: 'russia' });
  const html = renderToStaticMarkup(React.createElement(RussiaCustomsSummary, { breakdown: result }));
  const summary = html.match(/<summary[\s\S]*?<\/summary>/)[0];
  assert.ok(summary.includes(getTranslation('price.confirmingShort', 'ru')));
  assert.doesNotMatch(summary, /\d[\d\s]* ₽/);
});

test('SUV shipping uses $3,200 for source and translated body labels', () => {
  for (const bodyType of ['SUV', 'suv', 'Кроссовер/Внедорожник', 'Кроссовер', 'Внедорожник', 'Crossover']) {
    assert.equal(getTjContainerShippingUsd({ bodyType }), 3200, bodyType);
  }
});

test('other cars and unknown body classifications keep $3,000 shipping', () => {
  for (const bodyType of ['Седан', 'sedan', 'Минивэн', 'RV', 'Хэтчбек', 'Купе', 'Pickup', '', undefined]) {
    assert.equal(getTjContainerShippingUsd({ bodyType }), 3000, bodyType);
  }
});

test('saved SUV listings without body type use their established model family', () => {
  for (const vehicle of [
    { brand: 'Kia', model: 'Mohave 더 Master' },
    { brand: 'Kia', model: '스포티지 5세대 하이브리드' },
    { brand: 'Hyundai', model: '더 뉴 싼타페' },
    { brand: 'BMW', model: 'X5 (G05)' },
  ]) assert.equal(getTjContainerShippingUsd(vehicle), 3200, vehicle.model);
  const result = calculateImportCost({ ...base, model: 'Mohave 더 Master', destination: 'tajikistan' });
  assert.equal(result.serviceFee, 3200);
});

test('explicit non-SUV classification overrides a model-family fallback', () => {
  assert.equal(getTjContainerShippingUsd({ brand: 'Kia', model: 'Mohave', bodyType: 'RV' }), 3000);
  assert.equal(getTjContainerShippingUsd({ brand: 'Unknown', model: 'X5' }), 3000);
  assert.equal(getTjContainerShippingUsd({ brand: 'Hyundai', model: 'Ioniq 6' }), 3000);
});

test('model fallback covers all SUV families in the existing local vehicle data', () => {
  const { SEED_CARS } = loadTs(path.resolve(__dirname, '../src/lib/seed-data.ts'));
  for (const car of SEED_CARS) {
    if (/Кроссовер|Внедорожник/.test(car.bodyType || '')) {
      assert.equal(getTjContainerShippingUsd({ brand: car.brand, model: car.model }), 3200, `${car.brand} ${car.model}`);
    }
  }
});

test('SUV delivery changes every Tajikistan delivery field and the total by $200', () => {
  const sedan = calculateImportCost({ ...base, bodyType: 'Седан', destination: 'tajikistan' });
  const suv = calculateImportCost({ ...base, bodyType: 'SUV', destination: 'tajikistan' });
  assert.equal(suv.currency, 'USD');
  assert.equal(suv.calculationComplete, true);
  for (const field of ['deliveryKhujand', 'serviceFee', 'serviceFeeUsd']) assert.equal(suv[field], 3200);
  assert.equal(suv.total - sedan.total, 200);
  assert.equal(suv.customsTotal, sedan.customsTotal);
  assert.equal(suv.total, suv.carPrice + suv.encarFee + suv.serviceFee + suv.customsTotal);
});

test('SUV shipping is quoted even if Tajik customs cannot yet be calculated', () => {
  const result = calculateImportCost({ ...base, brand: '', bodyType: 'SUV', destination: 'tajikistan' });
  assert.equal(result.serviceFee, 3200);
  assert.equal(result.calculationComplete, false);
  assert.equal(result.total, 0);
});

test('Russian fees and incomplete-calculation protection are unchanged by SUV shipping', () => {
  const sedan = calculateImportCost({ ...base, bodyType: 'Седан', destination: 'russia' });
  const suv = calculateImportCost({ ...base, bodyType: 'SUV', destination: 'russia' });
  assert.deepEqual(suv, sedan);
  assert.equal(suv.currency, 'RUB');
  const incomplete = calculateImportCost({ ...base, hp: undefined, bodyType: 'SUV', destination: 'russia' });
  assert.equal(incomplete.calculationComplete, false);
  assert.equal(incomplete.total, 0);
});

test('body repair details are open by default and appear before the other condition details', () => {
  const { default: CarCondition } = loadTs(path.resolve(__dirname, '../src/components/detail/CarCondition.tsx'), {
    './CarDamageMap': { __esModule: true, default: () => null, getPanelLabel: panel => panel.name },
    './AccidentHistory': { __esModule: true, default: () => null },
    '@/lib/encar-inspection': { parseEncarInsuranceHistory },
    '@/contexts/AppContext': { useApp: () => ({ t: key => key, lang: 'ru', formatMileage: String }) },
  });
  const report = { panels: [{ name: 'hood', nameRu: 'Капот', rank: '1', damages: ['CHANGE'] }],
    hasDamage: true, reportKind: 'inspection', reportDate: '2026-09-15', accidentHistory: false,
    simpleRepair: true, floodHistory: false, checks: [{ key: 'engine', status: 'good' }] };
  const html = renderToStaticMarkup(React.createElement(CarCondition, {
    records: [], carId: '123', source: 'encar', inspectionData: report,
  }));
  const repairs = html.indexOf('condition.bodyRepairs');
  assert.match(html, /<details[^>]*\sopen=""/);
  assert.ok(repairs >= 0);
  for (const label of ['condition.reportDate', 'accident.history', 'condition.engine']) {
    assert.ok(html.indexOf(label) > repairs, label);
  }
});

function renderInsuranceHistory(data, lang = 'ru') {
  const app = { useApp: () => ({ t: key => getTranslation(key, lang), lang, formatMileage: String }) };
  const damageMap = loadTs(path.resolve(__dirname, '../src/components/detail/CarDamageMap.tsx'), {
    '@/contexts/AppContext': app,
  });
  const { default: CarCondition } = loadTs(path.resolve(__dirname, '../src/components/detail/CarCondition.tsx'), {
    './CarDamageMap': { __esModule: true, ...damageMap },
    './AccidentHistory': { __esModule: true, default: () => null },
    '@/lib/encar-inspection': { parseEncarInsuranceHistory },
    '@/contexts/AppContext': app,
  });
  return renderToStaticMarkup(React.createElement(CarCondition, {
    records: [], carId: '123', source: 'encar',
    inspectionData: { panels: [], hasDamage: false, reportKind: 'inspection', ...data },
  }));
}

test('condition UI replaces the original Korean paragraph with the insurance count, including cached reports', () => {
  const html = renderInsuranceHistory({ inspectorNotes: '내차피해1회 (1,213,922원)/정비이력1건/비금속(FRP 플라스틱)' });
  assert.match(html, /Страховые случаи по этому авто<\/dt>\s*<dd[^>]*>1<\/dd>/);
  assert.ok(!html.includes('Примечание инспектора'));
  assert.ok(!/[가-힣]/.test(html));
  assert.ok(!html.includes('1,213,922'));
});

test('condition UI uses saved insurance counts and shows unknown, not zero, for unreported own-car claims', () => {
  const structured = renderInsuranceHistory({ insuranceHistory: { ownDamageClaims: 2, thirdPartyDamageClaims: 3 }, inspectorNotes: '내차피해1회' });
  assert.match(structured, /Страховые случаи по этому авто<\/dt>\s*<dd[^>]*>2<\/dd>/);
  assert.match(structured, /Страховые случаи — ущерб другим авто<\/dt>\s*<dd[^>]*>3<\/dd>/);
  const missing = renderInsuranceHistory({ inspectorNotes: '정비이력1건' });
  const unknown = getTranslation('condition.unknown', 'ru');
  assert.ok(missing.includes(`>${unknown}</dd>`));
  assert.ok(!/Страховые случаи по этому авто<\/dt>\s*<dd[^>]*>0<\/dd>/.test(missing));
});

test('insurance counts and labels are visible without expanding a note in every selected language', () => {
  for (const lang of ['ru', 'en', 'tj', 'uz']) {
    const html = renderInsuranceHistory({ insuranceHistory: { ownDamageClaims: 0 } }, lang);
    assert.ok(html.includes(getTranslation('condition.insuranceCases', lang)), lang);
    assert.match(html, /<dd[^>]*>0<\/dd>/);
    assert.ok(!html.includes(getTranslation('condition.originalNotes', lang)));
    assert.match(html, /<details[^>]*\sopen=""/);
  }
});

test('both body diagrams remain open for a report with no damaged or repaired panels', () => {
  const html = renderInsuranceHistory({ bodyInspectionAvailable: true, accidentHistory: false, simpleRepair: false });
  assert.match(html, /<details[^>]*open=""[^>]*data-testid="body-repair-diagram"/);
  assert.ok(html.includes('/images/inspect_exterior.png'));
  assert.ok(html.includes('/images/inspect_structural.png'));
  assert.ok(html.includes(getTranslation('condition.noBodyRepairs', 'ru')));
  assert.ok(!html.includes('absolute flex items-center justify-center'));
  assert.ok(!html.includes('Повреждения и ремонт кузова (0)'));
});

test('missing panel data shows an unmarked diagram with an explicit unknown-data explanation', () => {
  const html = renderInsuranceHistory({ bodyInspectionAvailable: false, checks: [{ key: 'engine', status: 'good' }] });
  assert.ok(html.includes('data-testid="body-repair-diagram"'));
  assert.ok(html.includes(getTranslation('condition.bodyMarksNotListed', 'ru')));
  assert.ok(!html.includes(getTranslation('condition.noBodyRepairs', 'ru')));
  assert.ok(!html.includes('absolute flex items-center justify-center'));
});

test('known repairs without a panel list keep the diagram visible and retain the repair warning', () => {
  const html = renderInsuranceHistory({ hasDamage: true, accidentHistory: true, bodyInspectionAvailable: true });
  assert.ok(html.includes('data-testid="body-repair-diagram"'));
  assert.ok(html.includes(getTranslation('condition.bodyDetailsMissing', 'ru')));
  assert.ok(!html.includes(getTranslation('condition.noBodyRepairs', 'ru')));
  assert.ok(!html.includes('absolute flex items-center justify-center'));
});

test('partial body diagnosis stays visible without implying the whole vehicle was inspected or clean', () => {
  const html = renderInsuranceHistory({ reportKind: 'body_diagnosis', bodyInspectionAvailable: true,
    bodyChecks: [{ name: 'hood', nameRu: 'Капот', status: 'normal' }] });
  assert.ok(html.includes('data-testid="body-repair-diagram"'));
  assert.ok(html.includes(getTranslation('condition.bodyOnly', 'ru')));
  assert.ok(html.includes(getTranslation('condition.bodyMarksNotListed', 'ru')));
  assert.ok(!html.includes(getTranslation('condition.noBodyRepairs', 'ru')));
});

test('repair markers and the panel count still appear only for actual reported panels', () => {
  const html = renderInsuranceHistory({ hasDamage: true, bodyInspectionAvailable: true,
    panels: [{ name: 'hood', nameRu: 'Капот', rank: '1', damages: ['CHANGE'] },
      { name: 'rearPanel', nameRu: 'Задняя панель', rank: 'A', damages: ['METAL'] }] });
  assert.ok(html.includes('Повреждения и ремонт кузова (2)'));
  assert.ok(html.includes('title="Капот: Замена"'));
  assert.ok(html.includes('title="Задняя панель: Рихтовка/сварка"'));
  assert.equal((html.match(/absolute flex items-center justify-center/g) || []).length, 2);
});

test('unavailable inspection data does not show an empty diagram as though a report had loaded', () => {
  const { default: CarCondition } = loadTs(path.resolve(__dirname, '../src/components/detail/CarCondition.tsx'), {
    './CarDamageMap': { __esModule: true, default: () => null, getPanelLabel: panel => panel.name },
    './AccidentHistory': { __esModule: true, default: () => null },
    '@/lib/encar-inspection': { parseEncarInsuranceHistory },
    '@/contexts/AppContext': { useApp: () => ({ t: key => key, lang: 'ru', formatMileage: String }) },
  });
  const html = renderToStaticMarkup(React.createElement(CarCondition, { records: [], carId: '123', source: 'encar' }));
  assert.ok(html.includes('condition.loading'));
  assert.ok(!html.includes('body-repair-diagram'));
});
