'use client';

import { useState } from 'react';
import type { AccidentRecord, InspectionData } from '@/types';
import CarDamageMap from './CarDamageMap';

interface AccidentHistoryProps {
  records: AccidentRecord[];
  carId?: string;
  inspectionData?: InspectionData;
}

export default function AccidentHistory({ records, inspectionData }: AccidentHistoryProps) {
  const [expanded, setExpanded] = useState(false);

  const hasInspection = !!inspectionData;
  const hasDamage = inspectionData?.hasDamage ?? false;
  const hasRecords = records && records.length > 0;

  const totalAmount = (records || []).reduce((sum, r) => {
    const num = parseInt(String(r.amount).replace(/[^\d]/g, '')) || 0;
    return sum + num;
  }, 0);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4">Техническое состояние</h2>

      {/* Accident / repair status flags */}
      {hasInspection && (
        <div className="grid grid-cols-2 gap-3 mb-5">
          <div className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border ${
            inspectionData.accidentHistory === true
              ? 'bg-red-50 border-red-200'
              : 'bg-green-50 border-green-200'
          }`}>
            <span className={`w-2 h-2 rounded-full flex-shrink-0 ${
              inspectionData.accidentHistory === true ? 'bg-red-500' : 'bg-green-500'
            }`} />
            <div>
              <div className="text-xs text-gray-500">Аварийность</div>
              <div className={`text-sm font-medium ${
                inspectionData.accidentHistory === true ? 'text-red-700' : 'text-green-700'
              }`}>
                {inspectionData.accidentHistory === true ? 'Есть' :
                 inspectionData.accidentHistory === false ? 'Нет' : '—'}
              </div>
            </div>
          </div>
          <div className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border ${
            inspectionData.simpleRepair === true
              ? 'bg-orange-50 border-orange-200'
              : 'bg-green-50 border-green-200'
          }`}>
            <span className={`w-2 h-2 rounded-full flex-shrink-0 ${
              inspectionData.simpleRepair === true ? 'bg-orange-500' : 'bg-green-500'
            }`} />
            <div>
              <div className="text-xs text-gray-500">Простой ремонт</div>
              <div className={`text-sm font-medium ${
                inspectionData.simpleRepair === true ? 'text-orange-700' : 'text-green-700'
              }`}>
                {inspectionData.simpleRepair === true ? 'Есть' :
                 inspectionData.simpleRepair === false ? 'Нет' : '—'}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Car damage diagram — always show when inspection exists */}
      {hasInspection && inspectionData && (
        <div className="mb-4">
          {!hasDamage && (
            <div className="flex items-center gap-3 px-4 py-3 bg-green-50 border border-green-200 rounded-xl mb-4">
              <svg className="w-5 h-5 text-green-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <div>
                <span className="font-medium text-green-700 text-sm">Повреждений кузова не обнаружено</span>
                <p className="text-xs text-green-600 mt-0.5">По данным технической экспертизы Encar</p>
              </div>
            </div>
          )}
          <CarDamageMap panels={inspectionData.panels} />
        </div>
      )}

      {/* No inspection data available */}
      {!hasInspection && !hasRecords && (
        <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl">
          <svg className="w-5 h-5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-sm text-gray-500">Данные техосмотра недоступны для этого автомобиля</span>
        </div>
      )}

      {/* Insurance records */}
      {hasRecords && records && (
        <div className={hasInspection ? 'mt-6 pt-6 border-t border-gray-100' : ''}>
          <h3 className="text-base font-semibold text-gray-900 mb-3">История страховых случаев</h3>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="flex items-baseline gap-1">
              <span className="text-gray-500 text-sm">Случаев</span>
              <span className="flex-1 border-b border-dotted border-gray-300" />
              <span className="font-semibold text-orange-600">{records.length}</span>
            </div>
            {totalAmount > 0 && (
              <div className="flex items-baseline gap-1">
                <span className="text-gray-500 text-sm">Сумма</span>
                <span className="flex-1 border-b border-dotted border-gray-300" />
                <span className="font-semibold text-orange-600">{totalAmount.toLocaleString('ru-RU')} &#8381;</span>
              </div>
            )}
          </div>

          <button
            onClick={() => setExpanded(!expanded)}
            className="text-sm text-primary hover:underline flex items-center gap-1"
          >
            {expanded ? 'Скрыть подробности' : 'Показать подробности'}
            <svg className={`w-4 h-4 transition-transform ${expanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {expanded && (
            <div className="space-y-3 mt-4">
              {records.map((record, i) => (
                <div key={i} className="border border-orange-200 bg-orange-50 rounded-xl p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="font-medium text-orange-800">{record.type}</span>
                      {record.description && (
                        <p className="text-sm text-orange-600 mt-1">{record.description}</p>
                      )}
                    </div>
                    <div className="text-right text-sm">
                      <div className="text-orange-800 font-medium">{record.amount}</div>
                      <div className="text-orange-500">{record.date}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

    </div>
  );
}
