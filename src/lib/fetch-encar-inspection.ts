import type { EncarConditionResult } from '@/types';
import { ENCAR_DIAGNOSIS_BASE, ENCAR_INSPECTION_BASE, ENCAR_READSIDE_BASE } from './encar-endpoints';
import { parseEncarDiagnosis, parseEncarInspection } from './encar-inspection';

const headers = {
  Accept: 'application/json',
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  Referer: 'https://fem.encar.com/',
};

export async function fetchEncarInspection(carId: string, resolvedVehicleId?: string): Promise<EncarConditionResult> {
  try {
    let vehicleId = resolvedVehicleId;
    if (!vehicleId) {
      const listing = await fetch(`${ENCAR_READSIDE_BASE}/vehicle/${carId}`, {
        headers, cache: 'no-store', signal: AbortSignal.timeout(8000),
      });
      if (!listing.ok) return { status: 'unavailable', inspectionData: null };
      const metadata = await listing.json();
      vehicleId = String(metadata.vehicleId || carId);
    }
    if (!/^\d{1,12}$/.test(vehicleId)) return { status: 'unavailable', inspectionData: null };

    const report = await fetch(`${ENCAR_INSPECTION_BASE}/${vehicleId}`, {
      headers, cache: 'no-store', signal: AbortSignal.timeout(8000),
    }).catch(() => null);
    const inspectionData = report?.ok && report.status !== 204
      ? parseEncarInspection(await report.json()) : null;
    if (inspectionData) return { status: 'available', inspectionData };

    const diagnosis = await fetch(`${ENCAR_DIAGNOSIS_BASE}/${vehicleId}`, {
      headers, cache: 'no-store', signal: AbortSignal.timeout(8000),
    }).catch(() => null);
    const bodyReport = diagnosis?.ok && diagnosis.status !== 204
      ? parseEncarDiagnosis(await diagnosis.json()) : null;
    if (bodyReport) return { status: 'available', inspectionData: bodyReport };
    const reportMissing = report && (report.ok || [400, 404, 204].includes(report.status));
    const diagnosisMissing = diagnosis && (diagnosis.ok || [400, 404, 204].includes(diagnosis.status));
    return { status: reportMissing && diagnosisMissing ? 'not_published' : 'unavailable', inspectionData: null };
  } catch {
    return { status: 'unavailable', inspectionData: null };
  }
}
