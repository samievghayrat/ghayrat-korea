'use client';

import type { PanelDamage, DamageType } from '@/types';
import { useApp } from '@/contexts/AppContext';
import type { TranslationKey } from '@/lib/i18n';

interface CarDamageMapProps {
  panels: PanelDamage[];
}

const damageMarker: Record<DamageType, { letter: string; bg: string; text: string }> = {
  CHANGE:    { letter: 'X', bg: '#e74c3c', text: '#fff' },
  METAL:     { letter: 'W', bg: '#f39c12', text: '#fff' },
  CORROSION: { letter: 'C', bg: '#95a5a6', text: '#fff' },
  SCRATCH:   { letter: 'A', bg: '#7f8c8d', text: '#fff' },
  HILLS:     { letter: 'U', bg: '#3498db', text: '#fff' },
  DAMAGE:    { letter: 'T', bg: '#8e44ad', text: '#fff' },
};

const damageLabelKey: Record<DamageType, TranslationKey> = {
  CHANGE: 'damage.change',
  METAL: 'damage.metal',
  CORROSION: 'damage.corrosion',
  SCRATCH: 'damage.scratch',
  HILLS: 'damage.dent',
  DAMAGE: 'damage.damage',
};

// Marker positions as CSS percentages (left%, top%) on the 320x303 car image
// Exterior view (bg_inspect_front) - panels rank 1 and 2
const exteriorPositions: Record<string, { left: string; top: string }> = {
  radiatorSupport:    { left: '47.5%', top: '7%' },
  hood:               { left: '47.5%', top: '20%' },
  frontFenderLeft:    { left: '15%',   top: '22%' },
  frontFenderRight:   { left: '79%',   top: '22%' },
  frontDoorLeft:      { left: '14%',   top: '42%' },
  frontDoorRight:     { left: '81%',   top: '42%' },
  rearDoorLeft:       { left: '14%',   top: '62%' },
  rearDoorRight:      { left: '81%',   top: '62%' },
  roofPanel:          { left: '47.5%', top: '53%' },
  quarterPanelLeft:   { left: '16%',   top: '80%' },
  quarterPanelRight:  { left: '78%',   top: '80%' },
  sideSillPanelLeft:  { left: '5%',    top: '51%' },
  sideSillPanelRight: { left: '89%',   top: '51%' },
  trunkLead:          { left: '47.5%', top: '92%' },
};

// Structural view (bg_inspect_back) - panels rank A, B, C
const structuralPositions: Record<string, { left: string; top: string }> = {
  frontPanel:              { left: '47.5%', top: '7%' },
  crossMember:             { left: '47.5%', top: '20%' },
  insidePanelLeft:         { left: '35%',   top: '16%' },
  insidePanelRight:        { left: '60%',   top: '16%' },
  dashPanel:               { left: '47.5%', top: '36%' },
  frontWheelHouseLeft:     { left: '26%',   top: '38%' },
  frontWheelHouseRight:    { left: '70%',   top: '38%' },
  frontSideMemberLeft:     { left: '24%',   top: '30%' },
  frontSideMemberRight:    { left: '72%',   top: '30%' },
  pillarPanelFrontLeft:    { left: '35%',   top: '25%' },
  pillarPanelFrontRight:   { left: '60%',   top: '25%' },
  pillarPanelMiddleLeft:   { left: '5%',    top: '51%' },
  pillarPanelMiddleRight:  { left: '89%',   top: '51%' },
  pillarPanelRearLeft:     { left: '27%',   top: '68%' },
  pillarPanelRearRight:    { left: '69%',   top: '68%' },
  floorPanel:              { left: '47.5%', top: '53%' },
  rearWheelHouseLeft:      { left: '16%',   top: '80%' },
  rearWheelHouseRight:     { left: '78%',   top: '80%' },
  rearSideMemberLeft:      { left: '34%',   top: '80%' },
  rearSideMemberRight:     { left: '61%',   top: '80%' },
  trunkFloor:              { left: '47.5%', top: '81%' },
  rearPanel:               { left: '47.5%', top: '90%' },
  rearDashPanel:           { left: '47.5%', top: '72%' },
  packageTray:             { left: '47.5%', top: '65%' },
};

const exteriorPanelSet = new Set(Object.keys(exteriorPositions));
const structuralPanelSet = new Set(Object.keys(structuralPositions));

function DamageMarker({ damage, style, label, damageText }: { damage: DamageType; style: React.CSSProperties; label: string; damageText: string }) {
  const m = damageMarker[damage];
  return (
    <span
      className="absolute flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-bold leading-none -translate-x-1/2 -translate-y-1/2 shadow-sm cursor-default"
      style={{ ...style, backgroundColor: m.bg, color: m.text }}
      title={`${label}: ${damageText}`}
    >
      {m.letter}
    </span>
  );
}

function CarDiagram({
  title,
  bgImage,
  panels,
  positions,
  getDamageLabel,
}: {
  title: string;
  bgImage: string;
  panels: PanelDamage[];
  positions: Record<string, { left: string; top: string }>;
  getDamageLabel: (d: DamageType) => string;
}) {
  const relevant = panels.filter((p) => positions[p.name]);

  return (
    <div className="flex-1 min-w-0">
      <div className="text-center text-xs font-semibold text-gray-500 mb-2 tracking-wide">
        {title}
      </div>
      <div
        className="relative mx-auto bg-no-repeat bg-top bg-contain"
        style={{
          backgroundImage: `url(${bgImage})`,
          width: '100%',
          maxWidth: '280px',
          aspectRatio: '320 / 303',
        }}
      >
        {relevant.map((panel) => {
          const pos = positions[panel.name];
          if (!pos) return null;
          return (
            <DamageMarker
              key={panel.name}
              damage={panel.damages[0]}
              label={panel.nameRu}
              damageText={getDamageLabel(panel.damages[0])}
              style={{ left: pos.left, top: pos.top }}
            />
          );
        })}
      </div>
    </div>
  );
}

export default function CarDamageMap({ panels }: CarDamageMapProps) {
  const { t } = useApp();
  const exterior = panels.filter((p) => exteriorPanelSet.has(p.name));
  const structural = panels.filter((p) => structuralPanelSet.has(p.name));

  const getDamageLabel = (d: DamageType) => t(damageLabelKey[d]);

  return (
    <div className="space-y-4">
      <div className="flex gap-2 sm:gap-4">
        <CarDiagram
          title={t('damage.exterior')}
          bgImage="/images/inspect_exterior.png"
          panels={exterior}
          positions={exteriorPositions}
          getDamageLabel={getDamageLabel}
        />
        <CarDiagram
          title={t('damage.structural')}
          bgImage="/images/inspect_structural.png"
          panels={structural}
          positions={structuralPositions}
          getDamageLabel={getDamageLabel}
        />
      </div>

      {panels.length > 0 && (
        <div className="flex flex-wrap gap-x-3 gap-y-1.5 text-sm">
          {panels.map((p) => (
            <span key={p.name} className="inline-flex items-center gap-1">
              <span className="text-xs font-medium text-gray-700">{p.nameRu}</span>
              {p.damages.map((d) => (
                <span
                  key={d}
                  className="inline-flex items-center justify-center w-4 h-4 rounded-full text-white text-[8px] font-bold leading-none"
                  style={{ backgroundColor: damageMarker[d].bg }}
                >
                  {damageMarker[d].letter}
                </span>
              ))}
            </span>
          ))}
        </div>
      )}

      <div className="flex flex-wrap gap-x-4 gap-y-1.5 pt-3 border-t border-gray-100">
        {(Object.entries(damageMarker) as [DamageType, { letter: string; bg: string }][]).map(
          ([key, m]) => (
            <span key={key} className="inline-flex items-center gap-1.5 text-xs text-gray-500">
              <span
                className="inline-flex items-center justify-center w-4 h-4 rounded-full text-white text-[8px] font-bold leading-none"
                style={{ backgroundColor: m.bg }}
              >
                {m.letter}
              </span>
              {getDamageLabel(key as DamageType)}
            </span>
          ),
        )}
      </div>

      <p className="text-[10px] text-gray-300">{t('damage.passenger')}</p>
    </div>
  );
}
