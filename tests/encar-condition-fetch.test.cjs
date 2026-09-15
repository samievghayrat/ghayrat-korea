const assert = require('node:assert/strict');
const test = require('node:test');
const fs = require('node:fs');
const path = require('node:path');
const { createRequire, Module } = require('node:module');
const ts = require('typescript');

// Load these server modules with the same TypeScript import resolution as the app.
const modules = new Map();
function loadTs(file) {
  if (modules.has(file)) return modules.get(file).exports;
  const loaded = new Module(file);
  modules.set(file, loaded);
  const originalRequire = createRequire(file);
  loaded.require = name => name.startsWith('.')
    ? loadTs(path.resolve(path.dirname(file), `${name}.ts`)) : originalRequire(name);
  const compiled = ts.transpileModule(fs.readFileSync(file, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  });
  loaded._compile(compiled.outputText, file);
  return loaded.exports;
}
const { fetchEncarInspection } = loadTs(path.resolve(__dirname, '../src/lib/fetch-encar-inspection.ts'));

async function mockFetch(callback, action) {
  const previous = global.fetch;
  global.fetch = callback;
  try { return await action(); } finally { global.fetch = previous; }
}
const json = value => Response.json(value);
const diagnosis = { items: [{ name: 'HOOD', resultCode: 'NORMAL' }], diagnosisDate: '2026-09-15T00:00:00' };

test('resolves dummy listings and fetches a body diagnosis when the full report is missing', async () => {
  const calls = [];
  const result = await mockFetch(async url => {
    calls.push(url);
    if (url.endsWith('/vehicle/42736778')) return json({ vehicleId: 42732329 });
    if (url.includes('/inspect/')) return new Response(null, { status: 400 });
    assert.ok(url.endsWith('/diagnosis/vehicle/42732329'));
    return json(diagnosis);
  }, () => fetchEncarInspection('42736778'));
  assert.equal(result.status, 'available');
  assert.equal(result.inspectionData.reportKind, 'body_diagnosis');
  assert.equal(calls.length, 3);
});

test('an unreadable full-report response does not prevent the independent body report', async () => {
  const result = await mockFetch(async url => url.includes('/inspect/')
    ? new Response('not json') : json(diagnosis), () => fetchEncarInspection('123', '123'));
  assert.equal(result.status, 'available');
  assert.equal(result.inspectionData.reportKind, 'body_diagnosis');
});

test('timeouts are unavailable, not interpreted as no report or no damage', async () => {
  const result = await mockFetch(async () => { throw new Error('timeout'); }, () => fetchEncarInspection('123', '123'));
  assert.equal(result.status, 'unavailable');
  assert.equal(result.inspectionData, null);
});

test('only explicit missing responses produce the report-not-published state', async () => {
  const result = await mockFetch(async () => new Response(null, { status: 404 }), () => fetchEncarInspection('123', '123'));
  assert.equal(result.status, 'not_published');
  const malformed = await mockFetch(async () => new Response('bad response'), () => fetchEncarInspection('123', '123'));
  assert.equal(malformed.status, 'unavailable');
});

test('a supplied vehicle ID avoids fetching listing metadata again', async () => {
  const calls = [];
  const result = await mockFetch(async url => {
    calls.push(url);
    return json({ master: { accyn: 'N', simpleRepair: 'N' } });
  }, () => fetchEncarInspection('123', '456'));
  assert.equal(result.status, 'available');
  assert.equal(result.inspectionData.reportKind, 'inspection');
  assert.equal(calls.length, 1);
  assert.ok(calls[0].endsWith('/inspect/456'));
});
