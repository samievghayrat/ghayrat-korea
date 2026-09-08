'use client';

import ContactCTA from '@/components/shared/ContactCTA';
import { useApp } from '@/contexts/AppContext';
import { ABOUT_COPY } from '@/lib/page-copy';

export default function AboutContent() {
  const { lang } = useApp();
  const copy = ABOUT_COPY[lang];
  const values = ['7+', '500+', '30'];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8">{copy.title}</h1>
      <div className="prose prose-lg max-w-none">
        <div className="bg-white rounded-xl shadow-sm p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">GHAYRAT KOREA</h2>
          {copy.intro.map((paragraph, index) => (
            <p key={paragraph} className={`text-gray-600 leading-relaxed ${index < copy.intro.length - 1 ? 'mb-4' : ''}`}>{paragraph}</p>
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {values.map((value, index) => (
            <div key={value} className="bg-white rounded-xl shadow-sm p-6 text-center">
              <div className="text-4xl font-bold text-primary mb-2">{value}</div>
              <div className="text-gray-600">{copy.stats[index]}</div>
            </div>
          ))}
        </div>
        <div className="bg-white rounded-xl shadow-sm p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">{copy.benefitsTitle}</h2>
          <ul className="space-y-3">
            {copy.benefits.map(benefit => (
              <li key={benefit} className="flex items-start gap-3">
                <svg className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span className="text-gray-600">{benefit}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">{copy.contactTitle}</h2>
          <p className="text-gray-600 mb-6">{copy.contactText}</p>
          <ContactCTA />
        </div>
      </div>
    </div>
  );
}
