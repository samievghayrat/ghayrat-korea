import type { Metadata } from 'next';
import ContactCTA from '@/components/shared/ContactCTA';

export const metadata: Metadata = {
  title: 'О компании',
  description: 'GHAYRAT KOREA — надежный поставщик автомобилей из Южной Кореи. Работаем с 2017 года.',
};

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8">О компании</h1>

      <div className="prose prose-lg max-w-none">
        <div className="bg-white rounded-xl shadow-sm p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">GHAYRAT KOREA</h2>
          <p className="text-gray-600 leading-relaxed mb-4">
            Мы — компания <strong>GHAYRAT KOREA</strong>, специализируемся на подборе и доставке автомобилей из Южной Кореи в Россию.
            Наша команда находится непосредственно в Корее, что позволяет нам лично осматривать каждый автомобиль и гарантировать его качество.
          </p>
          <p className="text-gray-600 leading-relaxed mb-4">
            За годы работы мы помогли сотням клиентов приобрести автомобили мечты по выгодным ценам.
            Мы гордимся нашей репутацией надёжного партнёра и прозрачной работой.
          </p>
          <p className="text-gray-600 leading-relaxed">
            Работаем со всеми регионами России — доставляем автомобили через порт Владивостока с последующей
            отправкой автовозом или железнодорожным транспортом в любой город.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6 text-center">
            <div className="text-4xl font-bold text-primary mb-2">7+</div>
            <div className="text-gray-600">Лет на рынке</div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6 text-center">
            <div className="text-4xl font-bold text-primary mb-2">500+</div>
            <div className="text-gray-600">Довольных клиентов</div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6 text-center">
            <div className="text-4xl font-bold text-primary mb-2">30</div>
            <div className="text-gray-600">Дней средняя доставка</div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Наши преимущества</h2>
          <ul className="space-y-3">
            <li className="flex items-start gap-3">
              <svg className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span className="text-gray-600">Собственное представительство в Южной Корее</span>
            </li>
            <li className="flex items-start gap-3">
              <svg className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span className="text-gray-600">Проверка каждого автомобиля перед покупкой</span>
            </li>
            <li className="flex items-start gap-3">
              <svg className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span className="text-gray-600">Полное сопровождение от подбора до получения</span>
            </li>
            <li className="flex items-start gap-3">
              <svg className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span className="text-gray-600">Прозрачное ценообразование без скрытых комиссий</span>
            </li>
            <li className="flex items-start gap-3">
              <svg className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span className="text-gray-600">Помощь с растаможкой и оформлением документов</span>
            </li>
          </ul>
        </div>

        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Свяжитесь с нами</h2>
          <p className="text-gray-600 mb-6">Готовы помочь с выбором автомобиля</p>
          <ContactCTA />
        </div>
      </div>
    </div>
  );
}
