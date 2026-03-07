'use client';

import { useState } from 'react';
import Image from 'next/image';

interface ImageGalleryProps {
  images: string[];
  alt: string;
}

export default function ImageGallery({ images, alt }: ImageGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  if (images.length === 0) {
    return (
      <div className="aspect-[16/10] bg-gray-100 rounded-xl flex items-center justify-center">
        <span className="text-gray-400">Нет фото</span>
      </div>
    );
  }

  const thumbnails = images.slice(0, 4);
  const extraCount = images.length - 4;

  return (
    <>
      {/* Main image */}
      <div
        className="relative aspect-[16/10] bg-gray-100 rounded-xl overflow-hidden cursor-pointer group"
        onClick={() => setLightboxOpen(true)}
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
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
          <svg className="w-10 h-10 text-white opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
          </svg>
        </div>
        {/* Navigation arrows */}
        {images.length > 1 && (
          <>
            <button
              onClick={(e) => { e.stopPropagation(); setActiveIndex(i => i > 0 ? i - 1 : images.length - 1); }}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white w-10 h-10 rounded-full flex items-center justify-center"
            >
              &#8592;
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); setActiveIndex(i => i < images.length - 1 ? i + 1 : 0); }}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white w-10 h-10 rounded-full flex items-center justify-center"
            >
              &#8594;
            </button>
          </>
        )}
        <div className="absolute bottom-3 right-3 bg-black/60 text-white text-sm px-2 py-1 rounded">
          {activeIndex + 1} / {images.length}
        </div>
      </div>

      {/* Thumbnail grid (4 columns) */}
      {images.length > 1 && (
        <div className="grid grid-cols-4 gap-2 mt-3">
          {thumbnails.map((img, i) => {
            const isLast = i === 3 && extraCount > 0;
            return (
              <button
                key={i}
                onClick={() => {
                  if (isLast) {
                    setActiveIndex(3);
                    setLightboxOpen(true);
                  } else {
                    setActiveIndex(i);
                  }
                }}
                className={`relative aspect-[16/10] rounded-lg overflow-hidden border-2 transition-colors ${
                  i === activeIndex ? 'border-primary' : 'border-transparent hover:border-gray-300'
                }`}
              >
                <Image src={img} alt="" fill className="object-cover" sizes="150px" unoptimized />
                {isLast && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                    <span className="text-white font-bold text-sm">+{extraCount} фото</span>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* Lightbox */}
      {lightboxOpen && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center" onClick={() => setLightboxOpen(false)}>
          <button className="absolute top-4 right-4 text-white text-3xl z-10" onClick={() => setLightboxOpen(false)}>
            &times;
          </button>
          <button
            className="absolute left-4 top-1/2 -translate-y-1/2 text-white text-3xl z-10"
            onClick={(e) => { e.stopPropagation(); setActiveIndex(i => i > 0 ? i - 1 : images.length - 1); }}
          >
            &#8592;
          </button>
          <button
            className="absolute right-4 top-1/2 -translate-y-1/2 text-white text-3xl z-10"
            onClick={(e) => { e.stopPropagation(); setActiveIndex(i => i < images.length - 1 ? i + 1 : 0); }}
          >
            &#8594;
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
          <div className="absolute bottom-4 text-white text-sm">
            {activeIndex + 1} / {images.length}
          </div>
        </div>
      )}
    </>
  );
}
