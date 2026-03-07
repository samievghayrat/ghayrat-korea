import type { Metadata } from 'next';
import ContactCTA from '@/components/shared/ContactCTA';

export const metadata: Metadata = {
  title: 'Как купить авто из Кореи',
  description: 'Пошаговая инструкция по покупке автомобиля из Южной Кореи с доставкой в Россию.',
};

const steps = [
  {
    number: '01',
    title: 'Выбор автомобиля',
    description: 'Выберите автомобиль из нашего каталога или сообщите нам ваши пожелания — марку, модель, год, бюджет. Мы подберём лучшие варианты.',
  },
  {
    number: '02',
    title: 'Проверка и согласование',
    description: 'Мы проверяем историю автомобиля (ДТП, ремонты, пробег), делаем детальный осмотр и предоставляем полный отчёт с фото.',
  },
  {
    number: '03',
    title: 'Расчёт стоимости',
    description: 'Рассчитываем полную стоимость под ключ: цена авто, таможенная пошлина, утилизационный сбор, доставка, оформление.',
  },
  {
    number: '04',
    title: 'Оплата и покупка',
    description: 'После согласования всех условий вы производите оплату. Мы покупаем автомобиль на аукционе или у дилера в Корее.',
  },
  {
    number: '05',
    title: 'Доставка морем',
    description: 'Автомобиль грузится на судно и отправляется в порт Владивостока. Срок доставки — 7-14 дней.',
  },
  {
    number: '06',
    title: 'Растаможка',
    description: 'Мы берём на себя все таможенные процедуры: декларирование, уплата пошлин и сборов, получение ПТС.',
  },
  {
    number: '07',
    title: 'Получение автомобиля',
    description: 'Вы получаете автомобиль во Владивостоке или мы организуем доставку автовозом/ж.д. транспортом в ваш город.',
  },
];

export default function HowToBuyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Как купить авто из Кореи</h1>
      <p className="text-lg text-gray-600 mb-12">
        Простой и прозрачный процесс покупки автомобиля из Южной Кореи в 7 шагов
      </p>

      <div className="space-y-8">
        {steps.map((step, i) => (
          <div key={step.number} className="flex gap-6 items-start">
            <div className="flex-shrink-0 w-14 h-14 bg-primary rounded-xl flex items-center justify-center text-white font-bold text-lg">
              {step.number}
            </div>
            <div className={`flex-1 bg-white rounded-xl shadow-sm p-6 ${i < steps.length - 1 ? 'relative' : ''}`}>
              <h3 className="text-lg font-bold text-gray-900 mb-2">{step.title}</h3>
              <p className="text-gray-600">{step.description}</p>
            </div>
          </div>
        ))}
      </div>

      {/* FAQ */}
      <div className="mt-16">
        <h2 className="text-2xl font-bold text-gray-900 mb-8">Частые вопросы</h2>
        <div className="space-y-4">
          {[
            {
              q: 'Сколько времени занимает весь процесс?',
              a: 'От выбора автомобиля до получения — в среднем 30 дней. Доставка морем 7-14 дней, растаможка 3-5 дней, доставка по России 5-14 дней.',
            },
            {
              q: 'Можно ли купить автомобиль в кредит или рассрочку?',
              a: 'Мы работаем по предоплате. После покупки вы можете оформить автокредит в любом банке, используя ПТС.',
            },
            {
              q: 'Есть ли гарантия на автомобиль?',
              a: 'Мы предоставляем полную историю автомобиля и гарантируем соответствие заявленным характеристикам. На б/у авто заводская гарантия не распространяется.',
            },
            {
              q: 'Какие документы я получу?',
              a: 'ПТС (паспорт транспортного средства), ГТД (грузовая таможенная декларация), договор купли-продажи.',
            },
          ].map((faq, i) => (
            <div key={i} className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="font-semibold text-gray-900 mb-2">{faq.q}</h3>
              <p className="text-gray-600 text-sm">{faq.a}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="mt-16 text-center bg-primary-50 rounded-2xl p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Остались вопросы?</h2>
        <p className="text-gray-600 mb-6">Свяжитесь с нами — ответим на все вопросы и поможем с выбором</p>
        <ContactCTA />
      </div>
    </div>
  );
}
