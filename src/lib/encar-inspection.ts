import type { DamageType, InspectionCheck, InspectionCheckKey, InspectionCheckStatus, InspectionData, PanelDamage } from '@/types';

const panelNameRu: Record<string, string> = {
  hood: 'Капот', frontFenderLeft: 'Переднее крыло (лев.)', frontFenderRight: 'Переднее крыло (прав.)',
  frontDoorLeft: 'Передняя дверь (лев.)', frontDoorRight: 'Передняя дверь (прав.)',
  rearDoorLeft: 'Задняя дверь (лев.)', rearDoorRight: 'Задняя дверь (прав.)', trunkLead: 'Крышка багажника',
  frontPanel: 'Передняя панель', insidePanelLeft: 'Внутренняя панель (лев.)', insidePanelRight: 'Внутренняя панель (прав.)',
  frontWheelHouseLeft: 'Передняя колёсная арка (лев.)', frontWheelHouseRight: 'Передняя колёсная арка (прав.)',
  crossMember: 'Поперечина', dashPanel: 'Панель приборов', roofPanel: 'Крыша', floorPanel: 'Днище',
  rearDashPanel: 'Задняя панель приборов', rearWheelHouseLeft: 'Задняя колёсная арка (лев.)',
  rearWheelHouseRight: 'Задняя колёсная арка (прав.)', trunkFloor: 'Пол багажника', rearPanel: 'Задняя панель',
  quarterPanelLeft: 'Заднее крыло (лев.)', quarterPanelRight: 'Заднее крыло (прав.)',
  sideSillPanelLeft: 'Порог (лев.)', sideSillPanelRight: 'Порог (прав.)',
  pillarPanelFrontLeft: 'Стойка A (лев.)', pillarPanelFrontRight: 'Стойка A (прав.)',
  pillarPanelMiddleLeft: 'Стойка B (лев.)', pillarPanelMiddleRight: 'Стойка B (прав.)',
  pillarPanelRearLeft: 'Стойка C (лев.)', pillarPanelRearRight: 'Стойка C (прав.)',
  rearSideMemberLeft: 'Задний лонжерон (лев.)', rearSideMemberRight: 'Задний лонжерон (прав.)',
  frontSideMemberLeft: 'Передний лонжерон (лев.)', frontSideMemberRight: 'Передний лонжерон (прав.)',
  radiatorSupport: 'Суппорт радиатора', packageTray: 'Полка багажника',
};

const panelRankMap: Record<string, string> = {
  hood: '1', frontFenderLeft: '1', frontFenderRight: '1', frontDoorLeft: '1', frontDoorRight: '1',
  rearDoorLeft: '1', rearDoorRight: '1', trunkLead: '1', radiatorSupport: '1',
  roofPanel: '2', quarterPanelLeft: '2', quarterPanelRight: '2', sideSillPanelLeft: '2', sideSillPanelRight: '2',
  frontPanel: 'A', insidePanelLeft: 'A', insidePanelRight: 'A', crossMember: 'A', trunkFloor: 'A', rearPanel: 'A',
  frontWheelHouseLeft: 'B', frontWheelHouseRight: 'B', rearWheelHouseLeft: 'B', rearWheelHouseRight: 'B',
  pillarPanelFrontLeft: 'B', pillarPanelFrontRight: 'B', pillarPanelMiddleLeft: 'B', pillarPanelMiddleRight: 'B',
  pillarPanelRearLeft: 'B', pillarPanelRearRight: 'B', rearSideMemberLeft: 'B', rearSideMemberRight: 'B',
  frontSideMemberLeft: 'B', frontSideMemberRight: 'B', dashPanel: 'C', floorPanel: 'C', packageTray: 'C',
};

const damageTypes = new Set<DamageType>(['CHANGE', 'METAL', 'CORROSION', 'SCRATCH', 'HILLS', 'DAMAGE']);
const statusMap: Record<string, InspectionCheckStatus> = {
  GOOD: 'good', NONE: 'none', ADEQUATE: 'adequate',
  MINUTE: 'minor', MINOR: 'minor', TRACE: 'minor',
  BAD: 'fault', DEFECT: 'fault', LEAK: 'fault', EXISTS: 'fault',
  LACK: 'low', LOW: 'low', EXCESS: 'excess',
};
const severity: Record<InspectionCheckStatus, number> = {
  good: 0, none: 0, adequate: 0, unknown: 1, minor: 2, low: 3, excess: 3, fault: 4,
};

const checkFields: Array<[InspectionCheckKey, string[]]> = [
  ['engine', ['motorOperationStatus', 'selfCheckMotor', 'motorHighPressurePump']],
  ['transmission', ['transAutoStatus', 'transManualStatus', 'transManualGearShifting', 'selfCheckTransmission']],
  ['engineOilLeak', ['motorOilLeakLockerArmCover', 'motorOilLeakCylinderHeaderGasket', 'motorOilLeakOilFan']],
  ['coolantLeak', ['motorWaterLeakCylinderHeaderGasket', 'motorWaterLeakPump', 'motorWaterLeakRadiator']],
  ['transmissionOilLeak', ['transAutoOilLeakage', 'transManualOilLeakage']],
  ['oilLevel', ['motorOilFlowRate']],
  ['coolantLevel', ['motorWaterLeakCoolingRate']],
  ['steering', ['steeringPowerOilLeakage', 'steeringGear', 'steeringPump', 'steeringJoint', 'steeringPowerHighPressureHose', 'steeringTieRodEndAndBallJoint']],
  ['brakes', ['brakeMasterCylinderOilLeakage', 'brakeOilLeakage', 'brakeSystemStatus']],
  ['electrical', ['electricGeneratorOutput', 'electricStarterMotor', 'electricWiperMotorFunction', 'electricIndoorBlowerMotor', 'electricRadiatorFanMotor', 'electricWindowMotor']],
  ['fuelLeak', ['otherFuelLeaks']],
  ['evSystem', ['highPowerChargingInsulatedStatus', 'highPowerBatteryIsolationStatus', 'highPowerWiringStatus']],
];

function record(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : {};
}

function reportedBoolean(value: unknown): boolean | undefined {
  if (value === 'EXISTS' || value === 'Y') return true;
  if (value === 'NONE' || value === 'N') return false;
  return undefined;
}

function reportDate(value: unknown): string | undefined {
  if (typeof value !== 'string' || !/^\d{8}$/.test(value)) return undefined;
  const date = `${value.slice(0, 4)}-${value.slice(4, 6)}-${value.slice(6, 8)}`;
  const parsed = new Date(`${date}T00:00:00Z`);
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === date ? date : undefined;
}

// Only explicit report values are translated. Missing/unknown data is never a clean result.
export function parseEncarInspection(value: unknown): InspectionData | null {
  const data = record(value);
  const master = record(data.master);
  const inner = record(data.inner);
  const outer = record(data.outer);
  const accidentSummary = { ...record(data.inspectionAccidentSummary), ...record(data.inspectAccidentSummary) };
  const panels: PanelDamage[] = [];
  const summary = { change: 0, metal: 0, corrosion: 0, scratch: 0, dent: 0, damage: 0 };
  let hasUnmappedDamage = false;

  for (const [name, values] of Object.entries(outer)) {
    if (!Array.isArray(values) || values.length === 0 || name === 'crossMemberType1') continue;
    const damages = Array.from(new Set(values.filter((item): item is DamageType => damageTypes.has(item))));
    if (values.some(item => !damageTypes.has(item))) hasUnmappedDamage = true;
    if (!damages.length) continue;
    panels.push({ name, nameRu: Object.prototype.hasOwnProperty.call(panelNameRu, name) ? panelNameRu[name] : name,
      rank: Object.prototype.hasOwnProperty.call(panelRankMap, name) ? panelRankMap[name] : '', damages });
    for (const damage of damages) {
      if (damage === 'CHANGE') summary.change++;
      else if (damage === 'METAL') summary.metal++;
      else if (damage === 'CORROSION') summary.corrosion++;
      else if (damage === 'SCRATCH') summary.scratch++;
      else if (damage === 'HILLS') summary.dent++;
      else if (damage === 'DAMAGE') summary.damage++;
    }
  }

  const checks: InspectionCheck[] = [];
  for (const [key, fields] of checkFields) {
    const values = fields.map(field => inner[field]).filter(item => item !== null && item !== undefined && item !== '');
    if (!values.length) continue;
    const statuses = values.map(item => typeof item === 'string' && Object.prototype.hasOwnProperty.call(statusMap, item)
      ? statusMap[item] : 'unknown' as const);
    const status = statuses.reduce((worst, current) => severity[current] > severity[worst] ? current : worst);
    checks.push({ key, status });
  }

  const accidentHistory = reportedBoolean(accidentSummary.accident) ?? reportedBoolean(master.accyn);
  const simpleRepair = reportedBoolean(accidentSummary.simpleRepair) ?? reportedBoolean(master.simpleRepair);
  const floodHistory = reportedBoolean(master.waterlogyn);
  const tuning = reportedBoolean(master.tuningyn);
  const hasOuter = Object.keys(outer).some(key => Object.prototype.hasOwnProperty.call(panelNameRu, key));
  const hasDamage = panels.length > 0 || hasUnmappedDamage || accidentHistory === true || simpleRepair === true
    || ['exterior1rank', 'exterior2rank', 'mainFramework'].some(key => accidentSummary[key] === 'EXISTS');
  const bodyInspectionAvailable = hasOuter || (accidentHistory === false && simpleRepair === false);
  const reportedMileage = typeof master.mileage === 'number' && Number.isFinite(master.mileage) && master.mileage >= 0
    ? master.mileage : undefined;
  const inspectorNotes = typeof master.comments === 'string' && master.comments.trim()
    ? master.comments.trim().slice(0, 4000) : undefined;
  const previousUsage: Array<'rental' | 'taxi'> = [];
  if (Array.isArray(master.usageChange)) {
    if (master.usageChange.includes('RENT')) previousUsage.push('rental');
    if (master.usageChange.includes('TAXI')) previousUsage.push('taxi');
  }

  if (!hasOuter && !panels.length && !checks.length && accidentHistory === undefined
    && simpleRepair === undefined && floodHistory === undefined && !inspectorNotes) return null;

  return {
    panels, summary, hasDamage, bodyInspectionAvailable,
    accidentHistory, simpleRepair, floodHistory, tuning,
    reportDate: reportDate(master.issuedt), reportedMileage, checks, previousUsage, inspectorNotes,
    reportKind: 'inspection',
  };
}

const diagnosisPanelNames: Record<string, string> = {
  FRONT_DOOR_LEFT: 'frontDoorLeft', BACK_DOOR_LEFT: 'rearDoorLeft', TRUNK_LID: 'trunkLead',
  BACK_DOOR_RIGHT: 'rearDoorRight', FRONT_DOOR_RIGHT: 'frontDoorRight', HOOD: 'hood',
  FRONT_FENDER_RIGHT: 'frontFenderRight', FRONT_FENDER_LEFT: 'frontFenderLeft',
};

// A diagnosis report only describes the panels it actually checks, not the engine or flood history.
export function parseEncarDiagnosis(value: unknown): InspectionData | null {
  const data = record(value);
  if (!Array.isArray(data.items)) return null;
  const outer: Record<string, string[]> = {};
  const bodyChecks: NonNullable<InspectionData['bodyChecks']> = [];
  const notes: string[] = [];
  for (const rawItem of data.items) {
    const item = record(rawItem);
    const itemName = typeof item.name === 'string' ? item.name : '';
    if (['CHECKER_COMMENT', 'OUTER_PANEL_COMMENT'].includes(itemName) && typeof item.result === 'string') {
      notes.push(item.result.trim());
    }
    if (!Object.prototype.hasOwnProperty.call(diagnosisPanelNames, itemName)) continue;
    const name = diagnosisPanelNames[itemName];
    const code = item.resultCode || item.resultCd;
    const status = code === 'NORMAL' ? 'normal' : code === 'REPLACEMENT' ? 'replacement' : 'unknown';
    bodyChecks.push({ name, nameRu: panelNameRu[name], status });
    outer[name] = status === 'replacement' ? ['CHANGE'] : status === 'normal' ? [] : ['UNKNOWN'];
  }
  if (!bodyChecks.length) return null;
  let date = typeof data.realDiagnosisDate === 'string' ? data.realDiagnosisDate.slice(0, 10)
    : typeof data.diagnosisDate === 'string' ? data.diagnosisDate.slice(0, 10) : undefined;
  const timestamp = data.realDiagnosisDt || data.diagnosisDt;
  if (!date && typeof timestamp === 'number' && Number.isFinite(timestamp)) {
    // Encar's report date is in Korea (UTC+9), not the visitor's local time zone.
    const parsedDate = new Date(timestamp + 9 * 60 * 60 * 1000);
    if (!Number.isNaN(parsedDate.getTime())) date = parsedDate.toISOString().slice(0, 10);
  }
  const report = parseEncarInspection({ outer, master: { comments: notes.join('\n\n') } });
  if (!report) return null;
  return {
    ...report, reportKind: 'body_diagnosis', bodyChecks,
    reportDate: date ? reportDate(date.replace(/-/g, '')) : undefined,
    bodyInspectionAvailable: bodyChecks.every(check => check.status !== 'unknown'),
  };
}
