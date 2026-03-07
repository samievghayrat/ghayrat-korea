'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import Image from 'next/image';

interface ImageGalleryProps {
  images: string[];
  alt: string;
}

export default function ImageGallery({ images, alt }: ImageGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  // Reset index when images array changes (e.g., API data replaces session data)
  useEffect(() => {
    setActiveIndex(0);
  }, [images.length]);

  const goNext = useCallback(() => {
    setActiveIndex(i => (i < images.length - 1 ? i + 1 : 0));
  }, [images.length]);

  const goPrev = useCallback(() => {
    setActiveIndex(i => (i > 0 ? i - 1 : images.length - 1));
  }, [images.length]);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    touchEndX.current = e.changedTouches[0].clientX;
    const diff = touchStartX.current - touchEndX.current;
    if (Math.abs(diff) > 50) {
      if (diff > 0) goNext();
      else goPrev();
    }
  };

  if (images.length === 0) {
    return (
      <div className="aspect-[16/10] bg-gray-100 rounded-xl flex items-center justify-center">
        <span className="text-gray-400">Нет фото</span>
      </div>
    );
  }

  const thumbnails = images.slice(0, 6);
  const extraCount = images.length - 6;

  return (
    <>
      {/* Main image */}
      <div
        className="relative aspect-[16/10] bg-gray-100 rounded-xl overflow-hidden cursor-pointer"
        onClick={() => setLightboxOpen(true)}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <Image
          src={images[activeIndex]}
          alt={`${alt} - фото ${activeIndex + 1}`}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 60vw"
          priority
          unoptimized
        />
        {/* Navigation arrows */}
        {images.length > 1 && (
          <>
            <button
              onClick={(e) => { e.stopPropagation(); goPrev(); }}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white w-9 h-9 rounded-full flex items-center justify-center transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); goNext(); }}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white w-9 h-9 rounded-full flex items-center justify-center transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </>
        )}
        {/* Counter badge */}
        <div className="absolute bottom-3 right-3 bg-black/50 text-white text-xs font-medium px-2.5 py-1 rounded-full">
          {activeIndex + 1} / {images.length}
        </div>
        {/* Dot indicators (mobile) */}
        {images.length > 1 && images.length <= 20 && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 sm:hidden">
            {images.slice(0, 10).map((_, i) => (
              <span
                key={i}
                className={`w-1.5 h-1.5 rounded-full transition-all ${
                  i === activeIndex ? 'bg-white w-3' : 'bg-white/50'
                }`}
              />
            ))}
            {images.length > 10 && <span className="text-white/50 text-[8px] leading-none">…</span>}
          </div>
        )}
      </div>

      {/* Thumbnail strip */}
      {images.length > 1 && (
        <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
          {thumbnails.map((img, i) => {
            const isLast = i === 5 && extraCount > 0;
            return (
              <button
                key={i}
                onClick={() => {
                  if (isLast) {
                    setActiveIndex(5);
                    setLightboxOpen(true);
                  } else {
                    setActiveIndex(i);
                  }
                }}
                className={`relative flex-shrink-0 w-20 h-14 rounded-lg overflow-hidden border-2 transition-colors ${
                  i === activeIndex ? 'border-primary' : 'border-transparent hover:border-gray-300'
                }`}
              >
                <Image src={img} alt="" fill className="object-cover" sizes="80px" unoptimized />
                {isLast && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                    <span className="text-white font-bold text-xs">+{extraCount}</span>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* Lightbox */}
      {lightboxOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
          onClick={() => setLightboxOpen(false)}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <button className="absolute top-4 right-4 text-white/80 hover:text-white z-10 w-10 h-10 flex items-center justify-center" onClick={() => setLightboxOpen(false)}>
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <button
            className="absolute left-3 top-1/2 -translate-y-1/2 text-white/70 hover:text-white z-10 w-10 h-10 flex items-center justify-center"
            onClick={(e) => { e.stopPropagation(); goPrev(); }}
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            className="absolute right-3 top-1/2 -translate-y-1/2 text-white/70 hover:text-white z-10 w-10 h-10 flex items-center justify-center"
            onClick={(e) => { e.stopPropagation(); goNext(); }}
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
          <div className="relative w-[90vw] h-[80vh]" onClick={(e) => e.stopPropagation()}>
            <Image
              src={images[activeIndex]}
              alt={`${alt} - фото ${activeIndex + 1}`}
              fill
              className="object-contain"
              sizes="90vw"
              unoptimized
            />
          </div>
          <div className="absolute bottom-4 text-white/80 text-sm font-medium">
            {activeIndex + 1} / {images.length}
          </div>
        </div>
      )}
    </>
  );
}
