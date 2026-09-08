'use client';

import ContactCTA from '@/components/shared/ContactCTA';
import { useApp } from '@/contexts/AppContext';
import { HOW_TO_BUY_COPY } from '@/lib/page-copy';

export default function HowToBuyContent() {
  const { lang } = useApp();
  const copy = HOW_TO_BUY_COPY[lang];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">{copy.title}</h1>
      <p className="text-lg text-gray-600 mb-12">{copy.subtitle}</p>
      <div className="space-y-8">
        {copy.steps.map((step, index) => (
          <div key={step.title} className="flex gap-6 items-start">
            <div className="flex-shrink-0 w-14 h-14 bg-primary rounded-xl flex items-center justify-center text-white font-bold text-lg">{String(index + 1).padStart(2, '0')}</div>
            <div className="flex-1 bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-2">{step.title}</h3>
              <p className="text-gray-600">{step.description}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-16">
        <h2 className="text-2xl font-bold text-gray-900 mb-8">{copy.faqTitle}</h2>
        <div className="space-y-4">
          {copy.faqs.map(faq => (
            <div key={faq.q} className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="font-semibold text-gray-900 mb-2">{faq.q}</h3>
              <p className="text-gray-600 text-sm">{faq.a}</p>
            </div>
          ))}
        </div>
      </div>
      <div className="mt-16 text-center bg-primary-50 rounded-2xl p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">{copy.ctaTitle}</h2>
        <p className="text-gray-600 mb-6">{copy.ctaText}</p>
        <ContactCTA />
      </div>
    </div>
  );
}
