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
  const thumbnailContainerRef = useRef<HTMLDivElement>(null);
  const activeThumbnailRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    setActiveIndex(0);
  }, [images.length]);

  // Scroll active thumbnail into view
  useEffect(() => {
    if (activeThumbnailRef.current && thumbnailContainerRef.current) {
      const container = thumbnailContainerRef.current;
      const thumb = activeThumbnailRef.current;
      const containerRect = container.getBoundingClientRect();
      const thumbRect = thumb.getBoundingClientRect();

      if (thumbRect.left < containerRect.left || thumbRect.right > containerRect.right) {
        thumb.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      }
    }
  }, [activeIndex]);

  const goNext = useCallback(() => {
    setActiveIndex(i => (i < images.length - 1 ? i + 1 : 0));
  }, [images.length]);

  const goPrev = useCallback(() => {
    setActiveIndex(i => (i > 0 ? i - 1 : images.length - 1));
  }, [images.length]);

  // Keyboard navigation
  useEffect(() => {
    if (!lightboxOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') goNext();
      else if (e.key === 'ArrowLeft') goPrev();
      else if (e.key === 'Escape') setLightboxOpen(false);
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [lightboxOpen, goNext, goPrev]);

  // Prevent body scroll when lightbox is open
  useEffect(() => {
    if (lightboxOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [lightboxOpen]);

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
        <span className="text-gray-400">No photo</span>
      </div>
    );
  }

  // Smart progress dots: show max 7, with scaling effect around active
  const renderProgressDots = () => {
    const total = images.length;
    if (total <= 1) return null;

    const maxDots = 7;
    if (total <= maxDots) {
      return (
        <div className="flex gap-1 items-center">
          {images.map((_, i) => (
            <span
              key={i}
              className={`rounded-full transition-all duration-200 ${
                i === activeIndex
                  ? 'bg-white w-4 h-1.5'
                  : 'bg-white/50 w-1.5 h-1.5'
              }`}
            />
          ))}
        </div>
      );
    }

    // For many images, show a sliding window of dots
    const dots: { index: number; size: 'lg' | 'md' | 'sm' }[] = [];
    const half = Math.floor(maxDots / 2);
    let start = Math.max(0, activeIndex - half);
    let end = start + maxDots;
    if (end > total) {
      end = total;
      start = Math.max(0, end - maxDots);
    }

    for (let i = start; i < end; i++) {
      const dist = Math.abs(i - activeIndex);
      const size = dist === 0 ? 'lg' : dist <= 1 ? 'md' : 'sm';
      dots.push({ index: i, size });
    }

    return (
      <div className="flex gap-1 items-center">
        {start > 0 && <span className="w-1 h-1 rounded-full bg-white/30" />}
        {dots.map(({ index, size }) => (
          <span
            key={index}
            className={`rounded-full transition-all duration-200 ${
              index === activeIndex
                ? 'bg-white w-4 h-1.5'
                : size === 'md'
                  ? 'bg-white/50 w-1.5 h-1.5'
                  : 'bg-white/30 w-1 h-1'
            }`}
          />
        ))}
        {end < total && <span className="w-1 h-1 rounded-full bg-white/30" />}
      </div>
    );
  };

  // Show up to 8 thumbnails on desktop, scrollable
  const maxThumbnails = 8;

  return (
    <>
      {/* Main image */}
      <div
        className="relative aspect-[16/10] bg-gray-100 rounded-xl overflow-hidden cursor-pointer select-none"
        onClick={() => setLightboxOpen(true)}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <Image
          src={images[activeIndex]}
          alt={`${alt} - ${activeIndex + 1}`}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 60vw"
          priority
          unoptimized
        />

        {/* Navigation arrows - desktop */}
        {images.length > 1 && (
          <>
            <button
              onClick={(e) => { e.stopPropagation(); goPrev(); }}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white w-9 h-9 rounded-full hidden sm:flex items-center justify-center transition-colors"
              aria-label="Previous"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); goNext(); }}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white w-9 h-9 rounded-full hidden sm:flex items-center justify-center transition-colors"
              aria-label="Next"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </>
        )}

        {/* Counter badge - top right */}
        {images.length > 1 && (
          <div className="absolute top-3 right-3 bg-black/50 text-white text-xs font-medium px-2.5 py-1 rounded-full flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            {activeIndex + 1}/{images.length}
          </div>
        )}

        {/* Smart progress dots - mobile bottom */}
        {images.length > 1 && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 sm:hidden">
            {renderProgressDots()}
          </div>
        )}
      </div>

      {/* Thumbnail strip - desktop */}
      {images.length > 1 && (
        <div
          ref={thumbnailContainerRef}
          className="hidden sm:flex gap-2 mt-3 overflow-x-auto pb-1 scrollbar-thin"
        >
          {images.slice(0, maxThumbnails).map((img, i) => {
            const isLast = i === maxThumbnails - 1 && images.length > maxThumbnails;
            const extraCount = images.length - maxThumbnails;
            return (
              <button
                key={i}
                ref={i === activeIndex ? activeThumbnailRef : undefined}
                onClick={() => {
                  if (isLast) {
                    setActiveIndex(maxThumbnails - 1);
                    setLightboxOpen(true);
                  } else {
                    setActiveIndex(i);
                  }
                }}
                className={`relative flex-shrink-0 w-[72px] h-[50px] rounded-lg overflow-hidden border-2 transition-all ${
                  i === activeIndex
                    ? 'border-primary ring-1 ring-primary/30'
                    : 'border-transparent hover:border-gray-300'
                }`}
              >
                <Image src={img} alt="" fill className="object-cover" sizes="72px" unoptimized />
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
          className="fixed inset-0 z-50 bg-black flex flex-col"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {/* Top bar */}
          <div className="flex items-center justify-between px-4 py-3 text-white/80">
            <span className="text-sm font-medium">{activeIndex + 1} / {images.length}</span>
            <button
              className="w-10 h-10 flex items-center justify-center hover:text-white transition-colors"
              onClick={() => setLightboxOpen(false)}
              aria-label="Close"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Main image area */}
          <div className="flex-1 relative flex items-center justify-center min-h-0">
            <button
              className="absolute left-2 top-1/2 -translate-y-1/2 text-white/60 hover:text-white z-10 w-12 h-12 flex items-center justify-center"
              onClick={(e) => { e.stopPropagation(); goPrev(); }}
              aria-label="Previous"
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              className="absolute right-2 top-1/2 -translate-y-1/2 text-white/60 hover:text-white z-10 w-12 h-12 flex items-center justify-center"
              onClick={(e) => { e.stopPropagation(); goNext(); }}
              aria-label="Next"
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
            <div
              className="relative w-full h-full max-w-[90vw] max-h-[80vh] mx-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <Image
                src={images[activeIndex]}
                alt={`${alt} - ${activeIndex + 1}`}
                fill
                className="object-contain"
                sizes="90vw"
                unoptimized
              />
            </div>
          </div>

          {/* Thumbnail strip in lightbox */}
          <div className="px-4 py-3 overflow-x-auto flex gap-2 justify-center scrollbar-thin">
            {images.map((img, i) => (
              <button
                key={i}
                onClick={() => setActiveIndex(i)}
                className={`relative flex-shrink-0 w-12 h-9 rounded overflow-hidden border transition-all ${
                  i === activeIndex
                    ? 'border-white ring-1 ring-white/50 opacity-100'
                    : 'border-transparent opacity-50 hover:opacity-80'
                }`}
              >
                <Image src={img} alt="" fill className="object-cover" sizes="48px" unoptimized />
              </button>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
