import assert from 'node:assert/strict';
import test from 'node:test';
import { parseEncarDiagnosis, parseEncarInspection } from '../src/lib/encar-inspection.ts';

test('rejects an absent or empty report rather than marking the car undamaged', () => {
  for (const value of [null, {}, { outer: null }, { outer: {} }, { carSaleDto: { carId: 123 } }]) {
    assert.equal(parseEncarInspection(value), null);
  }
});

test('parses the published clean-car report fields and keeps inspection mileage separate', () => {
  const report = parseEncarInspection({
    master: { issuedt: '20260429', mileage: 192503, waterlogyn: 'N', tuningyn: 'N', usageChange: ['RENT'] },
    inner: { motorOperationStatus: 'GOOD', selfCheckMotor: 'GOOD', transAutoStatus: 'GOOD', motorOilLeakOilFan: 'NONE', motorOilFlowRate: 'ADEQUATE' },
    outer: null,
    inspectAccidentSummary: { accident: 'NONE', simpleRepair: 'NONE' },
  });
  assert.equal(report.accidentHistory, false);
  assert.equal(report.simpleRepair, false);
  assert.equal(report.floodHistory, false);
  assert.equal(report.reportDate, '2026-04-29');
  assert.equal(report.reportedMileage, 192503);
  assert.equal(report.hasDamage, false);
  assert.equal(report.bodyInspectionAvailable, true);
  assert.deepEqual(report.previousUsage, ['rental']);
  assert.equal(report.checks.find(check => check.key === 'engine').status, 'good');
  assert.equal(report.checks.find(check => check.key === 'engineOilLeak').status, 'none');
});

test('keeps non-accident body repairs distinct and counts replacement and welding markers', () => {
  const report = parseEncarInspection({
    outer: { hood: ['CHANGE', 'CHANGE'], rearDoorLeft: ['METAL'], frontFenderLeft: null, crossMemberType1: ['CHANGE'] },
    inspectionAccidentSummary: { accident: 'NONE', simpleRepair: 'EXISTS' },
  });
  assert.equal(report.accidentHistory, false);
  assert.equal(report.simpleRepair, true);
  assert.equal(report.hasDamage, true);
  assert.equal(report.panels.length, 2);
  assert.equal(report.summary.change, 1);
  assert.equal(report.summary.metal, 1);
  assert.equal(report.panels[0].nameRu, 'Капот');
});

test('missing accident flags and unknown mechanical codes never become positive results', () => {
  const report = parseEncarInspection({ inner: { motorOperationStatus: 'NEW_UNKNOWN_CODE', transAutoStatus: null } });
  assert.equal(report.accidentHistory, undefined);
  assert.equal(report.simpleRepair, undefined);
  assert.equal(report.floodHistory, undefined);
  assert.equal(report.bodyInspectionAvailable, false);
  assert.deepEqual(report.checks, [{ key: 'engine', status: 'unknown' }]);
});

test('the worst finding in a system is not hidden by other normal checks', () => {
  const report = parseEncarInspection({ inner: { selfCheckMotor: 'GOOD', motorOperationStatus: 'BAD', motorOilLeakOilFan: 'MINUTE', motorOilLeakLockerArmCover: 'NONE' } });
  assert.equal(report.checks.find(check => check.key === 'engine').status, 'fault');
  assert.equal(report.checks.find(check => check.key === 'engineOilLeak').status, 'minor');
});

test('accident/repair flags still warn when a detailed body map is absent', () => {
  const report = parseEncarInspection({ master: { accyn: 'Y', simpleRepair: 'Y', waterlogyn: 'Y' }, outer: null });
  assert.equal(report.hasDamage, true);
  assert.equal(report.floodHistory, true);
  assert.equal(report.panels.length, 0);
});

test('unknown damage markers never produce a clean body result', () => {
  const report = parseEncarInspection({ outer: { hood: ['UNKNOWN'] } });
  assert.equal(report.hasDamage, true);
  assert.equal(report.panels.length, 0);
});

test('rejects invalid dates and preserves a reported zero mileage', () => {
  const report = parseEncarInspection({ master: { issuedt: '20260230', mileage: 0, waterlogyn: 'N' } });
  assert.equal(report.reportDate, undefined);
  assert.equal(report.reportedMileage, 0);
});

test('body diagnosis is kept distinct from an engine, gearbox or flood inspection', () => {
  const report = parseEncarDiagnosis({ realDiagnosisDate: '2026-09-15T11:41:16', items: [
    { name: 'HOOD', resultCode: 'NORMAL' },
    { name: 'FRONT_DOOR_LEFT', resultCode: 'NORMAL' },
    { name: 'OUTER_PANEL_COMMENT', result: 'Original inspector note' },
  ] });
  assert.equal(report.reportKind, 'body_diagnosis');
  assert.equal(report.reportDate, '2026-09-15');
  assert.equal(report.accidentHistory, undefined);
  assert.equal(report.floodHistory, undefined);
  assert.deepEqual(report.checks, []);
  assert.equal(report.bodyChecks.length, 2);
  assert.equal(report.inspectorNotes, 'Original inspector note');
});

test('legacy body diagnosis replacement markers are mapped correctly', () => {
  const report = parseEncarDiagnosis({ realDiagnosisDt: 1785942000000, items: [
    { name: 'HOOD', resultCd: 'REPLACEMENT' },
    { name: 'BACK_DOOR_LEFT', resultCd: 'NORMAL' },
  ] });
  assert.equal(report.hasDamage, true);
  assert.equal(report.panels[0].name, 'hood');
  assert.deepEqual(report.panels[0].damages, ['CHANGE']);
  assert.equal(report.bodyChecks[1].name, 'rearDoorLeft');
});

test('unknown body diagnosis codes are not presented as normal', () => {
  const report = parseEncarDiagnosis({ items: [{ name: 'HOOD', resultCd: 'NEW_CODE' }] });
  assert.equal(report.bodyChecks[0].status, 'unknown');
  assert.equal(report.bodyInspectionAvailable, false);
  assert.equal(parseEncarDiagnosis({ items: [] }), null);
});
