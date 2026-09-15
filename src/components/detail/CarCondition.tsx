'use client';

import { useEffect, useState } from 'react';
import type { AccidentRecord, CarListing, EncarConditionResult, InspectionCheckKey, InspectionCheckStatus, InspectionData } from '@/types';
import CarDamageMap, { getPanelLabel } from './CarDamageMap';
import AccidentHistory from './AccidentHistory';
import { useApp } from '@/contexts/AppContext';
import type { TranslationKey } from '@/lib/i18n';
import { parseEncarInsuranceHistory } from '@/lib/encar-inspection';

interface CarConditionProps {
  records: AccidentRecord[];
  carId: string;
  inspectionData?: InspectionData;
  source: CarListing['source'];
}

const checkLabels: Record<InspectionCheckKey, TranslationKey> = {
  engine: 'condition.engine', transmission: 'condition.transmission', engineOilLeak: 'condition.engineOilLeak',
  coolantLeak: 'condition.coolantLeak', transmissionOilLeak: 'condition.transmissionOilLeak',
  oilLevel: 'condition.oilLevel', coolantLevel: 'condition.coolantLevel', steering: 'condition.steering',
  brakes: 'condition.brakes', electrical: 'condition.electrical', fuelLeak: 'condition.fuelLeak', evSystem: 'condition.evSystem',
};
const statusLabels: Record<InspectionCheckStatus, TranslationKey> = {
  good: 'condition.good', none: 'condition.none', adequate: 'condition.adequate', minor: 'condition.minor',
  fault: 'condition.fault', low: 'condition.low', excess: 'condition.excess', unknown: 'condition.unknown',
};

export default function CarCondition({ records, carId, inspectionData, source }: CarConditionProps) {
  const { t, lang, formatMileage } = useApp();
  const [retry, setRetry] = useState(0);
  const [remote, setRemote] = useState<EncarConditionResult & { carId: string }>();
  const canFetch = source === 'encar' && /^\d{1,12}$/.test(carId);

  useEffect(() => {
    if (!canFetch) return;
    const controller = new AbortController();
    setRemote(undefined);
    fetch(`/api/encar-condition/${carId}`, { signal: controller.signal })
      .then(async response => {
        const data: EncarConditionResult = await response.json();
        if (data.status !== 'available' && data.status !== 'not_published') throw new Error('Condition unavailable');
        return data;
      })
      .then(data => setRemote({ ...data, carId }))
      .catch(() => {
        if (controller.signal.aborted) return;
        setRemote({ carId, status: 'unavailable', inspectionData: null });
      });
    return () => controller.abort();
  }, [canFetch, carId, retry]);

  const currentRemote = remote?.carId === carId ? remote : undefined;
  const report = currentRemote?.inspectionData || inspectionData;
  const hasDamage = report?.hasDamage ?? false;
  const insuranceHistory = report?.insuranceHistory || parseEncarInsuranceHistory(report?.inspectorNotes);
  const isLoading = canFetch && !currentRemote && !report;
  const isUnavailable = currentRemote?.status === 'unavailable';

  // Privately listed cars keep their existing manually supplied condition/history.
  if (!canFetch) return <AccidentHistory records={records} inspectionData={inspectionData} />;

  const flags = report ? [
    { label: t('accident.history'), value: report.accidentHistory },
    { label: t('accident.simpleRepair'), value: report.simpleRepair },
    { label: t('condition.floodHistory'), value: report.floodHistory },
  ] : [];
  const reportDate = report?.reportDate
    ? new Date(`${report.reportDate}T00:00:00Z`).toLocaleDateString(
      { ru: 'ru-RU', en: 'en-US', tj: 'tg-TJ', uz: 'uz-UZ' }[lang], { timeZone: 'UTC' },
    ) : null;

  return (
    <>
      <section className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm" aria-label={t('accident.title')}>
        <h2 className="text-lg font-bold text-gray-900 mb-3">{t('accident.title')}</h2>
        {isLoading && (
          <div role="status" className="text-sm text-gray-500">
            {t('condition.loading')}
            <div className="mt-3 h-14 animate-pulse rounded-xl bg-gray-100" />
          </div>
        )}
        {!isLoading && !report && (
          <div>
            <p className="text-sm leading-6 text-gray-500" role="status">
              {t(isUnavailable ? 'condition.unavailable' : 'condition.notPublished')}
            </p>
            {isUnavailable ? (
              <button type="button" onClick={() => setRetry(value => value + 1)} className="mt-3 inline-flex min-h-11 items-center text-sm font-semibold text-primary hover:underline">
                {t('condition.retry')}
              </button>
            ) : (
              <a href="https://t.me/ghayrat_korea" target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex min-h-11 items-center text-sm font-semibold text-primary hover:underline">
                {t('condition.requestReport')}
              </a>
            )}
          </div>
        )}
        {report && (
          <>
            {!!report.panels.length && (
              <details open className="mb-4 rounded-xl border border-gray-200 p-3">
                <summary className="cursor-pointer text-sm font-semibold text-gray-900">{t('condition.bodyRepairs')} ({report.panels.length})</summary>
                <div className="mt-4"><CarDamageMap panels={report.panels} /></div>
              </details>
            )}
            {(reportDate || report.reportedMileage !== undefined) && (
              <div className="mb-4 flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">
                {reportDate && <span>{t('condition.reportDate')}: {reportDate}</span>}
                {report.reportedMileage !== undefined && <span>{t('condition.reportMileage')}: {formatMileage(report.reportedMileage)}</span>}
              </div>
            )}
            {report.reportKind !== 'body_diagnosis' && (
            <dl className="grid grid-cols-3 gap-2">
              {flags.map(flag => (
                <div key={flag.label} className={`min-w-0 rounded-xl border px-2 py-2.5 sm:px-3 ${
                  flag.value === true ? 'border-amber-200 bg-amber-50'
                    : flag.value === false ? 'border-emerald-100 bg-emerald-50/50' : 'border-gray-200 bg-gray-50'
                }`}>
                  <dt className="break-words text-xs leading-5 text-gray-500">{flag.label}</dt>
                  <dd className={`mt-1 text-sm font-semibold ${
                    flag.value === true ? 'text-amber-800' : flag.value === false ? 'text-emerald-700' : 'text-gray-500'
                  }`}>{flag.value === true ? t('accident.yes') : flag.value === false ? t('accident.no') : t('condition.unknown')}</dd>
                </div>
              ))}
            </dl>
            )}
            {report.reportKind === 'body_diagnosis' && (
              <div>
                <p className="mb-2 text-sm leading-6 text-gray-500">{t('condition.bodyOnly')}</p>
                <dl className="grid gap-x-6 sm:grid-cols-2">
                  {report.bodyChecks?.map(check => (
                    <div key={check.name} className="flex items-start justify-between gap-3 border-b border-gray-100 py-2.5 text-sm">
                      <dt className="text-gray-500">{getPanelLabel(check, lang)}</dt>
                      <dd className={`text-right font-semibold ${check.status === 'replacement' ? 'text-amber-800' : check.status === 'unknown' ? 'text-gray-500' : 'text-gray-900'}`}>
                        {t(check.status === 'normal' ? 'condition.noReplacement' : check.status === 'replacement' ? 'damage.change' : 'condition.unknown')}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>
            )}
            {(report.previousUsage?.length || report.tuning === true) ? (
              <p className="mt-3 text-sm font-medium text-amber-800">
                {[...(report.previousUsage || []).map(usage => t(usage === 'rental' ? 'condition.previousRental' : 'condition.previousTaxi')),
                  ...(report.tuning === true ? [t('condition.tuning')] : [])].join(' · ')}
              </p>
            ) : null}
            {!!report.checks?.length && (
              <dl className="mt-4 grid gap-x-6 sm:grid-cols-2">
                {report.checks.map(check => (
                  <div key={check.key} className="flex items-start justify-between gap-3 border-b border-gray-100 py-2.5 text-sm">
                    <dt className="text-gray-500">{t(checkLabels[check.key])}</dt>
                    <dd className={`text-right font-semibold ${
                      ['minor', 'low', 'excess', 'fault'].includes(check.status) ? 'text-amber-800'
                        : check.status === 'unknown' ? 'text-gray-500' : 'text-gray-900'
                    }`}>{t(statusLabels[check.status])}</dd>
                  </div>
                ))}
              </dl>
            )}
            {report.reportKind !== 'body_diagnosis' && report.bodyInspectionAvailable && !hasDamage && (
              <p className="mt-4 text-sm text-emerald-700">{t('condition.noBodyRepairs')}</p>
            )}
            {hasDamage && !report.panels.length && (
              <p className="mt-4 text-sm text-amber-800">{t('condition.bodyDetailsMissing')}</p>
            )}
            <dl className="mt-4 border-t border-gray-100 pt-1">
              <div className="flex items-start justify-between gap-3 py-2.5 text-sm">
                <dt className="text-gray-500">{t('condition.insuranceCases')}</dt>
                <dd className="shrink-0 text-right font-semibold text-gray-900">
                  {insuranceHistory?.ownDamageClaims ?? t('condition.unknown')}
                </dd>
              </div>
              {insuranceHistory?.thirdPartyDamageClaims !== undefined && (
                <div className="flex items-start justify-between gap-3 py-2.5 text-sm">
                  <dt className="text-gray-500">{t('condition.thirdPartyInsuranceCases')}</dt>
                  <dd className="shrink-0 text-right font-semibold text-gray-900">{insuranceHistory.thirdPartyDamageClaims}</dd>
                </div>
              )}
            </dl>
            <p className="mt-4 text-xs leading-5 text-gray-500" role="note">{t('condition.disclaimer')}</p>
          </>
        )}
      </section>
      {!!records.length && <AccidentHistory records={records} />}
    </>
  );
}
