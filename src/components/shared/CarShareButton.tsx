'use client';

import { useEffect, useRef, useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { getCarShareLinks, tryNativeCarShare } from '@/lib/car-sharing';

export default function CarShareButton({ title, url }: { title: string; url: string }) {
  const { t } = useApp();
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [manualCopy, setManualCopy] = useState(false);
  const [nativeAvailable, setNativeAvailable] = useState(false);
  const container = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const firstAction = useRef<HTMLAnchorElement>(null);
  const links = getCarShareLinks(title, url);

  useEffect(() => { setNativeAvailable(typeof navigator.share === 'function'); }, []);

  useEffect(() => {
    setCopied(false);
    setManualCopy(false);
  }, [url]);

  useEffect(() => {
    if (!open) return;
    firstAction.current?.focus();
    const closeOutside = (event: PointerEvent) => {
      if (!container.current?.contains(event.target as Node)) setOpen(false);
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
        trigger.current?.focus();
      }
    };
    document.addEventListener('pointerdown', closeOutside);
    document.addEventListener('keydown', closeOnEscape);
    return () => {
      document.removeEventListener('pointerdown', closeOutside);
      document.removeEventListener('keydown', closeOnEscape);
    };
  }, [open]);

  const shareNative = async () => {
    const result = await tryNativeCarShare({ title, url }, navigator.share?.bind(navigator));
    if (result === 'shared') setOpen(false);
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setManualCopy(false);
    } catch {
      setCopied(false);
      setManualCopy(true);
    }
  };

  return (
    <div ref={container} className="relative shrink-0">
      <button ref={trigger} type="button" onClick={() => setOpen(value => !value)} aria-label={t('share.button')} aria-expanded={open}
        className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-3 text-sm font-semibold text-gray-700 shadow-sm transition hover:border-gray-300 hover:bg-gray-50 focus-visible:outline-primary">
        <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24" aria-hidden="true">
          <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" />
          <path d="m8.6 10.5 6.8-4M8.6 13.5l6.8 4" />
        </svg>
        <span className="sr-only sm:not-sr-only">{t('share.button')}</span>
      </button>
      {open && (
        <div className="absolute right-0 top-full z-40 mt-2 w-64 max-w-[calc(100vw-32px)] rounded-xl border border-gray-200 bg-white p-2 shadow-lg">
          <a ref={firstAction} href={links.whatsapp} target="_blank" rel="noopener noreferrer"
            className="block rounded-lg px-3 py-3 text-sm font-semibold text-gray-800 hover:bg-gray-50">WhatsApp</a>
          <a href={links.telegram} target="_blank" rel="noopener noreferrer"
            className="block rounded-lg px-3 py-3 text-sm font-semibold text-gray-800 hover:bg-gray-50">Telegram</a>
          <button type="button" onClick={copy} className="block w-full rounded-lg px-3 py-3 text-left text-sm font-semibold text-primary hover:bg-gray-50">
            {copied ? t('share.copied') : t('share.copyLink')}
          </button>
          {nativeAvailable && (
            <button type="button" onClick={shareNative} className="block w-full rounded-lg px-3 py-3 text-left text-sm font-semibold text-gray-800 hover:bg-gray-50">
              {t('share.otherApps')}
            </button>
          )}
          <span className="sr-only" role="status">{copied ? t('share.copied') : ''}</span>
          {manualCopy && (
            <label className="block px-3 pb-2 text-xs text-gray-500">
              {t('share.manualCopy')}
              <input readOnly value={url} onFocus={event => event.target.select()}
                className="mt-2 w-full rounded-md border border-gray-200 p-2 text-sm text-gray-800" />
            </label>
          )}
        </div>
      )}
    </div>
  );
}
