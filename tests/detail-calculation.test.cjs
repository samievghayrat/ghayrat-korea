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
const { calculateImportCost } = loadTs(path.resolve(__dirname, '../src/lib/calculator.ts'), {
  './tj-customs': { lookupTjCustomsMinimum: brand => brand ? { minimumUsd: 10000 } : undefined },
});
const base = { priceKrw: 10000000, priceRub: 600000, priceUsd: 8000, encarFeeKrw: 440000,
  displacement: 1998, year: 2022, month: 1, fuel: 'Бензин', hp: 150,
  brand: 'Kia', model: 'Sportage', usdRate: 75, eurRate: 90 };

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

test('body repair details appear before date, history flags and mechanical checks', () => {
  const { default: CarCondition } = loadTs(path.resolve(__dirname, '../src/components/detail/CarCondition.tsx'), {
    './CarDamageMap': { __esModule: true, default: () => null, getPanelLabel: panel => panel.name },
    './AccidentHistory': { __esModule: true, default: () => null },
    '@/contexts/AppContext': { useApp: () => ({ t: key => key, lang: 'ru', formatMileage: String }) },
  });
  const report = { panels: [{ name: 'hood', nameRu: 'Капот', rank: '1', damages: ['CHANGE'] }],
    hasDamage: true, reportKind: 'inspection', reportDate: '2026-09-15', accidentHistory: false,
    simpleRepair: true, floodHistory: false, checks: [{ key: 'engine', status: 'good' }] };
  const html = renderToStaticMarkup(React.createElement(CarCondition, {
    records: [], carId: '123', source: 'encar', inspectionData: report,
  }));
  const repairs = html.indexOf('condition.bodyRepairs');
  assert.ok(repairs >= 0);
  for (const label of ['condition.reportDate', 'accident.history', 'condition.engine']) {
    assert.ok(html.indexOf(label) > repairs, label);
  }
});
