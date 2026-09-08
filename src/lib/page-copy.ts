import type { Lang } from './i18n';

export const ABOUT_COPY: Record<Lang, {
  title: string;
  intro: string[];
  stats: string[];
  benefitsTitle: string;
  benefits: string[];
  contactTitle: string;
  contactText: string;
}> = {
  ru: {
    title: 'О компании',
    intro: [
      'Мы специализируемся на подборе и доставке автомобилей из Южной Кореи. Наша команда находится непосредственно в Корее, поэтому мы можем лично осмотреть автомобиль перед покупкой.',
      'За годы работы мы помогли сотням клиентов приобрести автомобили по выгодным ценам. Мы ценим прозрачность и репутацию надёжного партнёра.',
      'Организуем доставку через Владивосток и дальше автовозом или железнодорожным транспортом до вашего города.',
    ],
    stats: ['Лет на рынке', 'Довольных клиентов', 'Дней — средняя доставка'],
    benefitsTitle: 'Наши преимущества',
    benefits: ['Команда в Южной Корее', 'Проверка автомобиля перед покупкой', 'Сопровождение от выбора до получения', 'Прозрачная цена без скрытых комиссий', 'Помощь с таможней и документами'],
    contactTitle: 'Свяжитесь с нами',
    contactText: 'Поможем подобрать подходящий автомобиль',
  },
  en: {
    title: 'About us',
    intro: [
      'We specialize in selecting and delivering vehicles from South Korea. Our team is based in Korea, so we can personally inspect a car before purchase.',
      'Over the years, we have helped hundreds of customers buy cars at competitive prices. We value transparency and our reputation as a trusted partner.',
      'We arrange delivery through Vladivostok and onward by car carrier or rail to your city.',
    ],
    stats: ['Years in the market', 'Happy customers', 'Days — average delivery'],
    benefitsTitle: 'Why choose us',
    benefits: ['Team based in South Korea', 'Vehicle inspection before purchase', 'Support from selection to delivery', 'Transparent pricing with no hidden fees', 'Help with customs and documents'],
    contactTitle: 'Contact us',
    contactText: 'We will help you find the right vehicle',
  },
  tj: {
    title: 'Дар бораи мо',
    intro: [
      'Мо ба интихоб ва расонидани мошинҳо аз Кореяи Ҷанубӣ машғулем. Дастаи мо дар Корея қарор дорад, бинобар ин мошинро пеш аз харид шахсан месанҷем.',
      'Дар тӯли фаъолият ба садҳо муштарӣ барои харидани мошин бо нархи мувофиқ кумак кардем. Барои мо шаффофият ва эътимод муҳим аст.',
      'Интиқолро тавассути Владивосток ва баъдан бо автовоз ё роҳи оҳан то шаҳри шумо ташкил мекунем.',
    ],
    stats: ['Сол дар бозор', 'Муштарии қаноатманд', 'Рӯз — муҳлати миёнаи таҳвил'],
    benefitsTitle: 'Бартариҳои мо',
    benefits: ['Даста дар Кореяи Ҷанубӣ', 'Санҷиши мошин пеш аз харид', 'Ҳамроҳӣ аз интихоб то қабул', 'Нархи шаффоф бе комиссияи пинҳонӣ', 'Кумак бо гумрук ва ҳуҷҷатҳо'],
    contactTitle: 'Бо мо тамос гиред',
    contactText: 'Барои интихоби мошини мувофиқ кумак мекунем',
  },
  uz: {
    title: 'Biz haqimizda',
    intro: [
      'Biz Janubiy Koreyadan avtomobil tanlash va yetkazib berishga ixtisoslashganmiz. Jamoamiz Koreyada bo‘lgani uchun avtomobilni xariddan oldin shaxsan tekshiramiz.',
      'Faoliyatimiz davomida yuzlab mijozlarga qulay narxda avtomobil xarid qilishda yordam berdik. Shaffoflik va ishonchli hamkor obro‘sini qadrlaymiz.',
      'Vladivostok orqali va undan keyin avtotashuvchi yoki temir yo‘l orqali shahringizgacha yetkazishni tashkil qilamiz.',
    ],
    stats: ['Yil bozorda', 'Mamnun mijoz', 'Kun — o‘rtacha yetkazish'],
    benefitsTitle: 'Afzalliklarimiz',
    benefits: ['Janubiy Koreyadagi jamoa', 'Xariddan oldin avtomobilni tekshirish', 'Tanlovdan qabul qilishgacha yordam', 'Yashirin to‘lovlarsiz shaffof narx', 'Bojxona va hujjatlarda yordam'],
    contactTitle: 'Biz bilan bog‘laning',
    contactText: 'Mos avtomobilni tanlashda yordam beramiz',
  },
};

type Step = { title: string; description: string };
type Faq = { q: string; a: string };

export const HOW_TO_BUY_COPY: Record<Lang, {
  title: string;
  subtitle: string;
  steps: Step[];
  faqTitle: string;
  faqs: Faq[];
  ctaTitle: string;
  ctaText: string;
}> = {
  ru: {
    title: 'Как купить автомобиль из Кореи',
    subtitle: 'Простой и прозрачный процесс — от выбора до доставки в ваш город',
    steps: [
      { title: 'Выбор автомобиля', description: 'Выберите автомобиль в каталоге или сообщите марку, модель, год и бюджет — мы подберём варианты.' },
      { title: 'Проверка и согласование', description: 'Проверим историю, пробег и состояние автомобиля и предоставим подробный отчёт с фотографиями.' },
      { title: 'Расчёт стоимости', description: 'Подготовим полный расчёт автомобиля, доставки, оформления и применимых таможенных платежей.' },
      { title: 'Оплата и покупка', description: 'После согласования условий вы производите оплату, а мы покупаем автомобиль в Корее.' },
      { title: 'Доставка морем', description: 'Погрузим автомобиль на судно и отправим в порт Владивостока.' },
      { title: 'Таможенное оформление', description: 'Поможем с декларацией, платежами и необходимыми документами.' },
      { title: 'Получение автомобиля', description: 'Передадим автомобиль во Владивостоке или организуем дальнейшую доставку до вашего города.' },
    ],
    faqTitle: 'Частые вопросы',
    faqs: [
      { q: 'Сколько времени занимает весь процесс?', a: 'В среднем около 30 дней. Срок зависит от судна, таможни и дальнейшего маршрута.' },
      { q: 'Можно ли купить автомобиль в кредит?', a: 'Мы работаем по предоплате. Возможность кредита после покупки можно уточнить в вашем банке.' },
      { q: 'Есть ли гарантия на автомобиль?', a: 'Мы предоставляем доступную историю и результаты проверки. Условия заводской гарантии зависят от конкретного автомобиля.' },
      { q: 'Какие документы я получу?', a: 'Комплект зависит от страны назначения; менеджер заранее объяснит список документов для вашего маршрута.' },
    ],
    ctaTitle: 'Остались вопросы?',
    ctaText: 'Напишите нам — ответим и поможем с выбором',
  },
  en: {
    title: 'How to buy a car from Korea', subtitle: 'A simple, transparent process from selection to delivery in your city',
    steps: [
      { title: 'Choose a car', description: 'Select a car in the catalog or tell us the brand, model, year, and budget you need.' },
      { title: 'Inspection and approval', description: 'We check history, mileage, and condition and provide a detailed photo report.' },
      { title: 'Cost calculation', description: 'We prepare a full estimate covering the car, shipping, processing, and applicable customs charges.' },
      { title: 'Payment and purchase', description: 'Once the terms are approved, you pay and we purchase the vehicle in Korea.' },
      { title: 'Sea shipping', description: 'We load the vehicle and ship it to the port of Vladivostok.' },
      { title: 'Customs processing', description: 'We help with the declaration, payments, and required documents.' },
      { title: 'Receive your car', description: 'Collect it in Vladivostok or let us arrange onward delivery to your city.' },
    ],
    faqTitle: 'Frequently asked questions',
    faqs: [
      { q: 'How long does the process take?', a: 'About 30 days on average. Timing depends on the vessel, customs, and onward route.' },
      { q: 'Can I buy with financing?', a: 'We work on a prepayment basis. Ask your bank about financing after purchase.' },
      { q: 'Does the car have a warranty?', a: 'We provide the available history and inspection results. Factory warranty depends on the specific vehicle.' },
      { q: 'Which documents will I receive?', a: 'The set depends on the destination country; your manager will explain the required documents in advance.' },
    ],
    ctaTitle: 'Still have questions?', ctaText: 'Message us and we will help you choose',
  },
  tj: {
    title: 'Чӣ тавр мошинро аз Корея харидан мумкин аст', subtitle: 'Раванди одӣ ва шаффоф — аз интихоб то таҳвил ба шаҳри шумо',
    steps: [
      { title: 'Интихоби мошин', description: 'Аз каталог интихоб кунед ё бренд, модел, сол ва буҷетро ба мо гӯед.' },
      { title: 'Санҷиш ва мувофиқа', description: 'Таърих, масофа ва ҳолати мошинро санҷида, ҳисоботи аксдор медиҳем.' },
      { title: 'Ҳисоби арзиш', description: 'Ҳисоби пурраи мошин, интиқол, расмиёт ва пардохтҳои гумрукиро омода мекунем.' },
      { title: 'Пардохт ва харид', description: 'Пас аз мувофиқа шумо пардохт мекунед ва мо мошинро дар Корея мехарем.' },
      { title: 'Интиқол бо баҳр', description: 'Мошинро ба киштӣ бор карда, ба бандари Владивосток мефиристем.' },
      { title: 'Расмиёти гумрукӣ', description: 'Бо эъломия, пардохтҳо ва ҳуҷҷатҳои зарурӣ кумак мекунем.' },
      { title: 'Қабули мошин', description: 'Мошинро дар Владивосток гиред ё таҳвилро то шаҳри худ фармоиш диҳед.' },
    ],
    faqTitle: 'Саволҳои маъмул',
    faqs: [
      { q: 'Тамоми раванд чанд вақт мегирад?', a: 'Ба ҳисоби миёна тақрибан 30 рӯз. Муҳлат аз киштӣ, гумрук ва масир вобаста аст.' },
      { q: 'Бо қарз харидан мумкин аст?', a: 'Мо бо пешпардохт кор мекунем. Имкони қарзро пас аз харид аз бонки худ пурсед.' },
      { q: 'Мошин кафолат дорад?', a: 'Мо таърих ва натиҷаи санҷишро медиҳем. Кафолати завод аз мошини мушаххас вобаста аст.' },
      { q: 'Кадом ҳуҷҷатҳоро мегирам?', a: 'Маҷмӯа аз кишвари таъинот вобаста аст; менеҷер рӯйхатро пешакӣ шарҳ медиҳад.' },
    ],
    ctaTitle: 'Савол доред?', ctaText: 'Ба мо нависед — ҷавоб медиҳем ва кумак мекунем',
  },
  uz: {
    title: 'Koreyadan avtomobil qanday sotib olinadi', subtitle: 'Tanlovdan shahringizga yetkazishgacha oddiy va shaffof jarayon',
    steps: [
      { title: 'Avtomobil tanlash', description: 'Katalogdan tanlang yoki brend, model, yil va byudjetni ayting.' },
      { title: 'Tekshiruv va tasdiqlash', description: 'Tarix, masofa va holatni tekshirib, fotosuratli batafsil hisobot beramiz.' },
      { title: 'Narxni hisoblash', description: 'Avtomobil, yetkazish, rasmiylashtirish va tegishli bojxona to‘lovlarini hisoblaymiz.' },
      { title: 'To‘lov va xarid', description: 'Shartlar tasdiqlangach, to‘lov qilasiz va biz avtomobilni Koreyada sotib olamiz.' },
      { title: 'Dengiz orqali yetkazish', description: 'Avtomobilni kemaga yuklab, Vladivostok portiga jo‘natamiz.' },
      { title: 'Bojxona rasmiylashtiruvi', description: 'Deklaratsiya, to‘lovlar va zarur hujjatlarda yordam beramiz.' },
      { title: 'Avtomobilni olish', description: 'Vladivostokda oling yoki shahringizgacha yetkazishni bizga topshiring.' },
    ],
    faqTitle: 'Ko‘p so‘raladigan savollar',
    faqs: [
      { q: 'Jarayon qancha vaqt oladi?', a: 'O‘rtacha 30 kun. Muddat kema, bojxona va keyingi yo‘nalishga bog‘liq.' },
      { q: 'Kreditga olish mumkinmi?', a: 'Biz oldindan to‘lov asosida ishlaymiz. Xariddan keyingi kreditni bankingizdan aniqlang.' },
      { q: 'Avtomobil kafolatlimi?', a: 'Mavjud tarix va tekshiruv natijasini beramiz. Zavod kafolati aniq avtomobilga bog‘liq.' },
      { q: 'Qanday hujjatlar beriladi?', a: 'To‘plam manzil davlatiga bog‘liq; menejer kerakli hujjatlarni oldindan tushuntiradi.' },
    ],
    ctaTitle: 'Savollaringiz bormi?', ctaText: 'Bizga yozing — javob beramiz va tanlashda yordam beramiz',
  },
};

export const CONTACT_COPY: Record<Lang, {
  title: string; write: string; sent: string; sentText: string; again: string;
  name: string; namePlaceholder: string; phone: string; messenger: string; call: string;
  message: string; messagePlaceholder: string; sending: string; send: string;
  sendError: string; networkError: string; quick: string; phoneLabel: string;
  hours: string; weekdays: string; weekends: string; response: string;
}> = {
  ru: { title: 'Контакты', write: 'Напишите нам', sent: 'Сообщение отправлено!', sentText: 'Мы скоро свяжемся с вами.', again: 'Отправить ещё', name: 'Имя', namePlaceholder: 'Ваше имя', phone: 'Телефон', messenger: 'Предпочитаемый мессенджер', call: 'Звонок', message: 'Сообщение', messagePlaceholder: 'Расскажите, какой автомобиль вас интересует', sending: 'Отправка...', send: 'Отправить', sendError: 'Не удалось отправить. Попробуйте ещё раз.', networkError: 'Ошибка сети. Попробуйте позже.', quick: 'Быстрая связь', phoneLabel: 'Телефон', hours: 'Режим работы', weekdays: 'Пн — Пт', weekends: 'Сб — Вс', response: 'Отвечаем в течение часа в рабочее время. Для срочных вопросов пишите в WhatsApp или Telegram.' },
  en: { title: 'Contacts', write: 'Message us', sent: 'Message sent!', sentText: 'We will contact you shortly.', again: 'Send another', name: 'Name', namePlaceholder: 'Your name', phone: 'Phone', messenger: 'Preferred messenger', call: 'Phone call', message: 'Message', messagePlaceholder: 'Tell us which car you are interested in', sending: 'Sending...', send: 'Send', sendError: 'Could not send the message. Please try again.', networkError: 'Network error. Please try later.', quick: 'Quick contact', phoneLabel: 'Phone', hours: 'Business hours', weekdays: 'Mon — Fri', weekends: 'Sat — Sun', response: 'We reply within one hour during business hours. For urgent questions, use WhatsApp or Telegram.' },
  tj: { title: 'Тамос', write: 'Ба мо нависед', sent: 'Паём фиристода шуд!', sentText: 'Ба зудӣ бо шумо тамос мегирем.', again: 'Боз фиристодан', name: 'Ном', namePlaceholder: 'Номи шумо', phone: 'Телефон', messenger: 'Паёмрасони мувофиқ', call: 'Занг', message: 'Паём', messagePlaceholder: 'Гӯед, ки кадом мошин ба шумо маъқул аст', sending: 'Фиристодан...', send: 'Фиристодан', sendError: 'Паём фиристода нашуд. Боз кӯшиш кунед.', networkError: 'Хатои шабака. Баъдтар кӯшиш кунед.', quick: 'Тамоси зуд', phoneLabel: 'Телефон', hours: 'Вақти кор', weekdays: 'Дш — Ҷм', weekends: 'Шн — Яш', response: 'Дар вақти корӣ дар давоми як соат ҷавоб медиҳем. Барои саволи фаврӣ ба WhatsApp ё Telegram нависед.' },
  uz: { title: 'Kontaktlar', write: 'Bizga yozing', sent: 'Xabar yuborildi!', sentText: 'Tez orada siz bilan bog‘lanamiz.', again: 'Yana yuborish', name: 'Ism', namePlaceholder: 'Ismingiz', phone: 'Telefon', messenger: 'Afzal messenjer', call: 'Qo‘ng‘iroq', message: 'Xabar', messagePlaceholder: 'Qaysi avtomobilga qiziqayotganingizni yozing', sending: 'Yuborilmoqda...', send: 'Yuborish', sendError: 'Xabar yuborilmadi. Qayta urinib ko‘ring.', networkError: 'Tarmoq xatosi. Keyinroq urinib ko‘ring.', quick: 'Tezkor aloqa', phoneLabel: 'Telefon', hours: 'Ish vaqti', weekdays: 'Du — Ju', weekends: 'Sha — Yak', response: 'Ish vaqtida bir soat ichida javob beramiz. Shoshilinch savollar uchun WhatsApp yoki Telegram orqali yozing.' },
};

export const NOT_FOUND_COPY: Record<Lang, { title: string; text: string; home: string }> = {
  ru: { title: 'Страница не найдена', text: 'Страница не существует или была перемещена.', home: 'На главную' },
  en: { title: 'Page not found', text: 'The page does not exist or has been moved.', home: 'Back to home' },
  tj: { title: 'Саҳифа ёфт нашуд', text: 'Саҳифа вуҷуд надорад ё кӯчонида шудааст.', home: 'Ба саҳифаи асосӣ' },
  uz: { title: 'Sahifa topilmadi', text: 'Sahifa mavjud emas yoki ko‘chirilgan.', home: 'Bosh sahifaga' },
};

export const ERROR_COPY: Record<Lang, { title: string; text: string; retry: string }> = {
  ru: { title: 'Что-то пошло не так', text: 'Произошла непредвиденная ошибка. Попробуйте ещё раз.', retry: 'Попробовать снова' },
  en: { title: 'Something went wrong', text: 'An unexpected error occurred. Please try again.', retry: 'Try again' },
  tj: { title: 'Хатое рух дод', text: 'Хатои ғайричашмдошт рух дод. Боз кӯшиш кунед.', retry: 'Боз кӯшиш кардан' },
  uz: { title: 'Xatolik yuz berdi', text: 'Kutilmagan xatolik yuz berdi. Qayta urinib ko‘ring.', retry: 'Qayta urinish' },
};

export type AuctionCopy = {
  auction: string; startPrice: string; allBrands: string; allModels: string; allYears: string;
  found: string; noCars: string; prev: string; next: string; page: string; of: string;
  carsOnAuction: string; sortOrderAsc: string; sortOrderDesc: string; sortYearDesc: string;
  sortYearAsc: string; sortPriceAsc: string; sortPriceDesc: string; showPhoto: string;
  lot: string; back: string; location: string; drive: string; priceNote: string; makeBid: string;
  yourBid: string; extraCosts: string; total: string; extraCostsNote: string; sejong: string;
  remaining: string; started: string; dayShort: string; hourShort: string; minuteShort: string;
  pricePending: string; pricePendingNote: string; askPrice: string;
};

export const AUCTION_COPY: Record<Lang, AuctionCopy> = {
  ru: { auction: 'Аукцион', startPrice: 'Стартовая цена', allBrands: 'Все марки', allModels: 'Все модели', allYears: 'Все годы', found: 'Найдено:', noCars: 'Автомобили не найдены.', prev: 'Назад', next: 'Далее', page: 'Страница', of: 'из', carsOnAuction: 'авто на аукционе', sortOrderAsc: 'Порядок: сначала первые', sortOrderDesc: 'Порядок: сначала последние', sortYearDesc: 'Год: сначала новые', sortYearAsc: 'Год: сначала старые', sortPriceAsc: 'Цена: сначала дешевле', sortPriceDesc: 'Цена: сначала дороже', showPhoto: 'Показать фото', lot: 'Лот', back: 'Назад к аукциону', location: 'Локация', drive: 'Привод', priceNote: 'Цена указана без дополнительных расходов.', makeBid: 'Сделать ставку в WhatsApp', yourBid: 'Ваша ставка', extraCosts: 'Другие расходы', total: 'Итого', extraCostsNote: 'комиссия аукциона, доставка и услуга', sejong: 'Седжон, аукционная площадка', remaining: 'До аукциона', started: 'Аукцион начался', dayShort: 'д', hourShort: 'ч', minuteShort: 'мин', pricePending: 'Цена ожидается', pricePendingNote: 'KCar ещё не опубликовал стартовую цену. Автомобиль уже доступен для просмотра.', askPrice: 'Уточнить цену в WhatsApp' },
  en: { auction: 'Auction', startPrice: 'Starting price', allBrands: 'All brands', allModels: 'All models', allYears: 'All years', found: 'Found:', noCars: 'No cars found.', prev: 'Previous', next: 'Next', page: 'Page', of: 'of', carsOnAuction: 'cars at auction', sortOrderAsc: 'Order: first lots first', sortOrderDesc: 'Order: last lots first', sortYearDesc: 'Year: newest first', sortYearAsc: 'Year: oldest first', sortPriceAsc: 'Price: lowest first', sortPriceDesc: 'Price: highest first', showPhoto: 'Show photo', lot: 'Lot', back: 'Back to auction', location: 'Location', drive: 'Drivetrain', priceNote: 'This price excludes additional costs.', makeBid: 'Place bid via WhatsApp', yourBid: 'Your bid', extraCosts: 'Other costs', total: 'Total', extraCostsNote: 'auction fee, shipping, and service', sejong: 'Sejong auction site', remaining: 'Time to auction', started: 'Auction started', dayShort: 'd', hourShort: 'h', minuteShort: 'min', pricePending: 'Price pending', pricePendingNote: 'KCar has not published the starting price yet. The car is already available to view.', askPrice: 'Ask for price on WhatsApp' },
  tj: { auction: 'Музояда', startPrice: 'Нархи ибтидоӣ', allBrands: 'Ҳамаи брендҳо', allModels: 'Ҳамаи моделҳо', allYears: 'Ҳамаи солҳо', found: 'Ёфт шуд:', noCars: 'Мошин ёфт нашуд.', prev: 'Қафо', next: 'Баъдӣ', page: 'Саҳифа', of: 'аз', carsOnAuction: 'мошин дар музояда', sortOrderAsc: 'Тартиб: аввал аввалинҳо', sortOrderDesc: 'Тартиб: аввал охиринҳо', sortYearDesc: 'Сол: аввал нав', sortYearAsc: 'Сол: аввал кӯҳна', sortPriceAsc: 'Нарх: аввал арзон', sortPriceDesc: 'Нарх: аввал гарон', showPhoto: 'Нишон додани сурат', lot: 'Лот', back: 'Бозгашт ба музояда', location: 'Ҷой', drive: 'Ҳаракат', priceNote: 'Нарх бе хароҷоти иловагӣ нишон дода шудааст.', makeBid: 'Пешниҳод дар WhatsApp', yourBid: 'Пешниҳоди шумо', extraCosts: 'Хароҷоти дигар', total: 'Ҷамъ', extraCostsNote: 'комиссияи музояда, интиқол ва хизматрасонӣ', sejong: 'Майдони музоядаи Сеҷон', remaining: 'То музояда', started: 'Музояда оғоз шуд', dayShort: 'р', hourShort: 'с', minuteShort: 'дақ', pricePending: 'Нарх интизор аст', pricePendingNote: 'KCar ҳанӯз нархи ибтидоиро нашр накардааст. Мошин барои дидан дастрас аст.', askPrice: 'Нархро дар WhatsApp пурсед' },
  uz: { auction: 'Auksion', startPrice: 'Boshlang‘ich narx', allBrands: 'Barcha brendlar', allModels: 'Barcha modellar', allYears: 'Barcha yillar', found: 'Topildi:', noCars: 'Avtomobil topilmadi.', prev: 'Orqaga', next: 'Keyingi', page: 'Sahifa', of: 'dan', carsOnAuction: 'auksiondagi avtomobil', sortOrderAsc: 'Tartib: birinchi lotlar', sortOrderDesc: 'Tartib: oxirgi lotlar', sortYearDesc: 'Yil: avval yangi', sortYearAsc: 'Yil: avval eski', sortPriceAsc: 'Narx: avval arzon', sortPriceDesc: 'Narx: avval qimmat', showPhoto: 'Rasmni ko‘rsatish', lot: 'Lot', back: 'Auksionga qaytish', location: 'Joy', drive: 'Yetakchi', priceNote: 'Narx qo‘shimcha xarajatlarsiz ko‘rsatilgan.', makeBid: 'WhatsApp orqali taklif berish', yourBid: 'Taklifingiz', extraCosts: 'Boshqa xarajatlar', total: 'Jami', extraCostsNote: 'auksion komissiyasi, yetkazish va xizmat', sejong: 'Sejong auksion maydoni', remaining: 'Auksiongacha', started: 'Auksion boshlandi', dayShort: 'k', hourShort: 's', minuteShort: 'daq', pricePending: 'Narx kutilmoqda', pricePendingNote: 'KCar boshlang‘ich narxni hali e’lon qilmagan. Avtomobilni hozir ko‘rish mumkin.', askPrice: 'Narxni WhatsApp orqali so‘rash' },
};
