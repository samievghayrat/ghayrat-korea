export type Lang = 'ru' | 'en' | 'tj' | 'uz';
export type Currency = 'RUB' | 'USD' | 'EUR' | 'KRW';

const t = {
  // Navigation
  'nav.catalog': { ru: 'Каталог', en: 'Catalog', tj: 'Каталог', uz: 'Katalog' },
  'nav.howToBuy': { ru: 'Как купить', en: 'How to buy', tj: 'Чӣ тавр харид кунам', uz: 'Qanday sotib olish' },
  'nav.about': { ru: 'О компании', en: 'About us', tj: 'Дар бораи мо', uz: 'Biz haqimizda' },
  'nav.contacts': { ru: 'Контакты', en: 'Contacts', tj: 'Тамос', uz: 'Kontaktlar' },
  'nav.favorites': { ru: 'Избранное', en: 'Favorites', tj: 'Интихобшуда', uz: 'Tanlanganlar' },
  'nav.menu': { ru: 'Меню', en: 'Menu', tj: 'Меню', uz: 'Menyu' },
  'nav.closeMenu': { ru: 'Закрыть меню', en: 'Close menu', tj: 'Пӯшидани меню', uz: 'Menyuni yopish' },
  'nav.writeManager': { ru: 'Написать менеджеру', en: 'Contact manager', tj: 'Ба мудир навиштан', uz: 'Menejerga yozish' },

  // Search & Filters
  'search.brandPlaceholder': { ru: 'Марка, модель, поколение', en: 'Brand, model, generation', tj: 'Бренд, модел, насл', uz: 'Brend, model, avlod' },
  'search.allModels': { ru: 'Все модели', en: 'All models', tj: 'Ҳамаи моделҳо', uz: 'Barcha modellar' },
  'search.all': { ru: 'Все', en: 'All', tj: 'Ҳама', uz: 'Barchasi' },
  'search.loading': { ru: 'Загрузка...', en: 'Loading...', tj: 'Боркунӣ...', uz: 'Yuklanmoqda...' },
  'search.noModels': { ru: 'Нет моделей', en: 'No models', tj: 'Модел нест', uz: 'Modellar yo\'q' },
  'search.searching': { ru: 'Поиск...', en: 'Searching...', tj: 'Ҷустуҷӯ...', uz: 'Qidirilmoqda...' },
  'search.found': { ru: 'Найдено', en: 'Found', tj: 'Ёфт шуд', uz: 'Topildi' },
  'search.cars': { ru: 'авто', en: 'cars', tj: 'мошин', uz: 'avtomobil' },
  'search.hideFilters': { ru: 'Скрыть фильтры', en: 'Hide filters', tj: 'Пинҳон кардани филтрҳо', uz: 'Filtrlarni yashirish' },
  'search.moreFilters': { ru: 'Ещё фильтры', en: 'More filters', tj: 'Филтрҳои бештар', uz: 'Ko\'proq filtrlar' },

  // Filter sections
  'filter.type': { ru: 'Тип', en: 'Type', tj: 'Навъ', uz: 'Turi' },
  'filter.trim': { ru: 'Комплектация', en: 'Trim', tj: 'Комплектатсия', uz: 'Komplektatsiya' },
  'filter.showMore': { ru: 'Показать ещё', en: 'Show more', tj: 'Бештар нишон диҳед', uz: 'Yana ko\'rsatish' },
  'filter.year': { ru: 'Год', en: 'Year', tj: 'Сол', uz: 'Yil' },
  'filter.price': { ru: 'Цена', en: 'Price', tj: 'Нарх', uz: 'Narx' },
  'filter.mileage': { ru: 'Пробег', en: 'Mileage', tj: 'Масофа', uz: 'Yurgan masofasi' },
  'filter.color': { ru: 'Цвет', en: 'Color', tj: 'Ранг', uz: 'Rang' },
  'filter.fuelType': { ru: 'Тип топлива', en: 'Fuel type', tj: 'Намуди сӯзишворӣ', uz: 'Yoqilg\'i turi' },
  'filter.transmission': { ru: 'КПП', en: 'Transmission', tj: 'КПП', uz: 'Uzatmalar qutisi' },
  'filter.drivetrain': { ru: 'Привод', en: 'Drivetrain', tj: 'Ҳаракат', uz: 'Yetakchi g\'ildirak' },
  'filter.options': { ru: 'Опции', en: 'Options', tj: 'Имконотҳо', uz: 'Opsiyalar' },
  'filter.yearFrom': { ru: 'Год от', en: 'Year from', tj: 'Сол аз', uz: 'Yildan' },
  'filter.yearTo': { ru: 'Год до', en: 'Year to', tj: 'Сол то', uz: 'Yilgacha' },
  'filter.month': { ru: 'Мес.', en: 'Mo.', tj: 'Моҳ', uz: 'Oy' },
  'filter.from': { ru: 'От', en: 'From', tj: 'Аз', uz: 'Dan' },
  'filter.to': { ru: 'До', en: 'To', tj: 'То', uz: 'Gacha' },
  'filter.fromKm': { ru: 'От, км', en: 'From, km', tj: 'Аз, км', uz: 'Dan, km' },
  'filter.toKm': { ru: 'До, км', en: 'To, km', tj: 'То, км', uz: 'Gacha, km' },

  // Filter chip labels
  'chip.model': { ru: 'Модель:', en: 'Model:', tj: 'Модел:', uz: 'Model:' },
  'chip.generation': { ru: 'Поколение:', en: 'Generation:', tj: 'Насл:', uz: 'Avlod:' },
  'chip.trans': { ru: 'КПП:', en: 'Trans:', tj: 'КПП:', uz: 'UQ:' },
  'chip.drive': { ru: 'Привод:', en: 'Drive:', tj: 'Ҳаракат:', uz: 'Yetakchi:' },
  'chip.color': { ru: 'Цвет:', en: 'Color:', tj: 'Ранг:', uz: 'Rang:' },
  'chip.from': { ru: 'от', en: 'from', tj: 'аз', uz: 'dan' },
  'chip.to': { ru: 'до', en: 'to', tj: 'то', uz: 'gacha' },
  'chip.yr': { ru: 'г.', en: 'yr', tj: 'с.', uz: 'y.' },
  'chip.km': { ru: 'км', en: 'km', tj: 'км', uz: 'km' },

  // Fuel types
  'fuel.gasoline': { ru: 'Бензин', en: 'Gasoline', tj: 'Бензин', uz: 'Benzin' },
  'fuel.diesel': { ru: 'Дизель', en: 'Diesel', tj: 'Дизел', uz: 'Dizel' },
  'fuel.hybrid': { ru: 'Гибрид', en: 'Hybrid', tj: 'Гибрид', uz: 'Gibrid' },
  'fuel.electric': { ru: 'Электро', en: 'Electric', tj: 'Электрикӣ', uz: 'Elektr' },
  'fuel.lpg': { ru: 'Газ (LPG)', en: 'LPG', tj: 'Газ (LPG)', uz: 'Gaz (LPG)' },

  // Body types
  'body.sedan': { ru: 'Седан', en: 'Sedan', tj: 'Седан', uz: 'Sedan' },
  'body.suv': { ru: 'Кроссовер/Внедорожник', en: 'SUV/Crossover', tj: 'Кроссовер', uz: 'Krossover' },
  'body.hatchback': { ru: 'Хэтчбек', en: 'Hatchback', tj: 'Хэтчбек', uz: 'Xetchbek' },
  'body.wagon': { ru: 'Универсал', en: 'Wagon', tj: 'Универсал', uz: 'Universal' },
  'body.coupe': { ru: 'Купе', en: 'Coupe', tj: 'Купе', uz: 'Kupe' },
  'body.convertible': { ru: 'Кабриолет', en: 'Convertible', tj: 'Кабриолет', uz: 'Kabriolet' },
  'body.minivan': { ru: 'Минивэн', en: 'Minivan', tj: 'Минивэн', uz: 'Miniven' },
  'body.pickup': { ru: 'Пикап', en: 'Pickup', tj: 'Пикап', uz: 'Pikap' },

  // Transmission types
  'trans.auto': { ru: 'Автомат', en: 'Automatic', tj: 'Автомат', uz: 'Avtomat' },
  'trans.manual': { ru: 'Механика', en: 'Manual', tj: 'Механика', uz: 'Mexanika' },
  'trans.dct': { ru: 'Робот (DCT)', en: 'DCT', tj: 'Робот (DCT)', uz: 'Robot (DCT)' },
  'trans.cvt': { ru: 'Вариатор (CVT)', en: 'CVT', tj: 'Вариатор (CVT)', uz: 'Variator (CVT)' },

  // Drivetrain types
  'drive.fwd': { ru: 'Передний', en: 'FWD', tj: 'Пеш', uz: 'Oldingi' },
  'drive.rwd': { ru: 'Задний', en: 'RWD', tj: 'Ақиб', uz: 'Orqa' },
  'drive.awd': { ru: 'Полный (AWD)', en: 'AWD', tj: 'Пурра (AWD)', uz: 'To\'liq (AWD)' },

  // Color options
  'color.white': { ru: 'Белый', en: 'White', tj: 'Сафед', uz: 'Oq' },
  'color.black': { ru: 'Черный', en: 'Black', tj: 'Сиёҳ', uz: 'Qora' },
  'color.gray': { ru: 'Серый', en: 'Gray', tj: 'Хокистарӣ', uz: 'Kulrang' },
  'color.silver': { ru: 'Серебристый', en: 'Silver', tj: 'Нуқрагӣ', uz: 'Kumush' },
  'color.blue': { ru: 'Синий', en: 'Blue', tj: 'Кабуд', uz: 'Ko\'k' },
  'color.red': { ru: 'Красный', en: 'Red', tj: 'Сурх', uz: 'Qizil' },
  'color.brown': { ru: 'Коричневый', en: 'Brown', tj: 'Қаҳваранг', uz: 'Jigarrang' },
  'color.green': { ru: 'Зеленый', en: 'Green', tj: 'Сабз', uz: 'Yashil' },
  'color.other': { ru: 'Другой', en: 'Other', tj: 'Дигар', uz: 'Boshqa' },

  // Sort options
  'sort.priceAsc': { ru: 'Цена: по возрастанию', en: 'Price: low to high', tj: 'Нарх: паст то баланд', uz: 'Narx: arzondan qimmatga' },
  'sort.priceDesc': { ru: 'Цена: по убыванию', en: 'Price: high to low', tj: 'Нарх: баланд то паст', uz: 'Narx: qimmatdan arzon' },
  'sort.yearDesc': { ru: 'Год: сначала новые', en: 'Year: newest first', tj: 'Сол: аввал нав', uz: 'Yil: avval yangi' },
  'sort.yearAsc': { ru: 'Год: сначала старые', en: 'Year: oldest first', tj: 'Сол: аввал кӯҳна', uz: 'Yil: avval eski' },
  'sort.mileageAsc': { ru: 'Пробег: по возрастанию', en: 'Mileage: low to high', tj: 'Масофа: паст то баланд', uz: 'Masofa: kamdan ko\'pga' },
  'sort.mileageDesc': { ru: 'Пробег: по убыванию', en: 'Mileage: high to low', tj: 'Масофа: баланд то паст', uz: 'Masofa: ko\'pdan kamga' },

  // Car options / equipment
  'opt.010': { ru: 'Люк (санруф)', en: 'Sunroof', tj: 'Люк', uz: 'Lyuk' },
  'opt.014': { ru: 'Кожаный салон', en: 'Leather seats', tj: 'Салони чармӣ', uz: 'Charm salon' },
  'opt.005': { ru: 'Навигация', en: 'Navigation', tj: 'Навигатсия', uz: 'Navigatsiya' },
  'opt.058': { ru: 'Камера заднего вида', en: 'Rear camera', tj: 'Камераи ақиб', uz: 'Orqa kamera' },
  'opt.087': { ru: 'Камера 360°', en: '360° camera', tj: 'Камера 360°', uz: '360° kamera' },
  'opt.075': { ru: 'Фары LED', en: 'LED headlights', tj: 'Фараҳои LED', uz: 'LED faralar' },
  'opt.007': { ru: 'Подогрев сидений', en: 'Heated seats', tj: 'Гармкунии ҷойгоҳ', uz: 'O\'rindiq isitgich' },
  'opt.009': { ru: 'Вентиляция сидений', en: 'Ventilated seats', tj: 'Шамолдиҳии ҷойгоҳ', uz: 'Shamollatish' },
  'opt.082': { ru: 'Подогрев руля', en: 'Heated steering', tj: 'Гармкунии руль', uz: 'Rul isitgich' },
  'opt.023': { ru: 'Климат-контроль', en: 'Climate control', tj: 'Иқлим-контрол', uz: 'Iqlim-nazorat' },
  'opt.068': { ru: 'Круиз-контроль', en: 'Cruise control', tj: 'Круиз-контрол', uz: 'Kruiz-nazorat' },
  'opt.079': { ru: 'Адаптивный круиз', en: 'Adaptive cruise', tj: 'Круизи адаптивӣ', uz: 'Adaptiv kruiz' },
  'opt.057': { ru: 'Бесключевой запуск', en: 'Keyless start', tj: 'Бе калид', uz: 'Kalitsiz ishga tushirish' },
  'opt.059': { ru: 'Электро-багажник', en: 'Power trunk', tj: 'Электро-багажник', uz: 'Elektr bagaj' },
  'opt.088': { ru: 'Контроль полосы', en: 'Lane assist', tj: 'Контроли хат', uz: 'Chiziq nazorati' },
  'opt.086': { ru: 'Контроль слепых зон', en: 'Blind spot monitor', tj: 'Контроли нуқтаи кӯр', uz: 'Ko\'r zona nazorati' },
  'opt.095': { ru: 'HUD (проекция)', en: 'HUD', tj: 'HUD', uz: 'HUD' },
  'opt.091': { ru: 'Массаж сидений', en: 'Massage seats', tj: 'Массажи ҷойгоҳ', uz: 'Massaj o\'rindig\'i' },

  // Car card
  'card.inStock': { ru: 'В наличии', en: 'In stock', tj: 'Дар мавҷуд', uz: 'Mavjud' },
  'card.priceInKorea': { ru: 'Цена в Корее', en: 'Price in Korea', tj: 'Нарх дар Корея', uz: 'Koreyadagi narx' },
  'card.turnkeyVladivostok': { ru: 'под ключ до Владивостока', en: 'turnkey to Vladivostok', tj: 'таёр то Владивосток', uz: 'Vladivostokgacha tayyor' },
  'card.turnkeyTajikistan': { ru: 'с доставкой до Таджикистана', en: 'delivered to Tajikistan', tj: 'бо интиқол то Тоҷикистон', uz: 'Tojikistonga yetkazib berish' },

  // Car specs
  'spec.generalData': { ru: 'Общие данные', en: 'General info', tj: 'Маълумоти умумӣ', uz: 'Umumiy ma\'lumot' },
  'spec.brand': { ru: 'Марка', en: 'Brand', tj: 'Бренд', uz: 'Brend' },
  'spec.model': { ru: 'Модель', en: 'Model', tj: 'Модел', uz: 'Model' },
  'spec.date': { ru: 'Дата выпуска', en: 'Production date', tj: 'Санаи истеҳсол', uz: 'Ishlab chiqarilgan sana' },
  'spec.mileage': { ru: 'Пробег', en: 'Mileage', tj: 'Масофа', uz: 'Yurgan masofa' },
  'spec.engine': { ru: 'Двигатель', en: 'Engine', tj: 'Муҳаррик', uz: 'Dvigatel' },
  'spec.displacement': { ru: 'Объём', en: 'Displacement', tj: 'Ҳаҷм', uz: 'Hajm' },
  'spec.power': { ru: 'Мощность', en: 'Power', tj: 'Қудрат', uz: 'Quvvat' },
  'spec.fuel': { ru: 'Топливо', en: 'Fuel', tj: 'Сӯзишворӣ', uz: 'Yoqilg\'i' },
  'spec.trans': { ru: 'КПП', en: 'Transmission', tj: 'КПП', uz: 'Uzatmalar qutisi' },
  'spec.color': { ru: 'Цвет', en: 'Color', tj: 'Ранг', uz: 'Rang' },
  'spec.body': { ru: 'Кузов', en: 'Body', tj: 'Кузов', uz: 'Kuzov' },
  'spec.seats': { ru: 'Кол-во мест', en: 'Seats', tj: 'Ҷойҳо', uz: 'Oʻrindiqlar' },
  'spec.hp': { ru: 'л.с.', en: 'hp', tj: 'қ.о.', uz: 'o.k.' },

  // Price breakdown
  'price.carPriceKorea': { ru: 'Стоимость авто в Корее', en: 'Car price in Korea', tj: 'Нархи мошин дар Корея', uz: 'Koreyadagi narx' },
  'price.customsDuty': { ru: 'Таможенная пошлина', en: 'Customs duty', tj: 'Божи гумрукӣ', uz: 'Bojxona boji' },
  'price.utilizationFee': { ru: 'Утилизационный сбор', en: 'Utilization fee', tj: 'Ҳаққи утилизатсия', uz: 'Utilizatsiya to\'lovi' },
  'price.delivery': { ru: 'Доставка и оформление', en: 'Delivery & processing', tj: 'Интиқол ва расмиёт', uz: 'Yetkazib berish va rasmiylashtirish' },
  'price.deliveryDesc': { ru: 'расходы в Корее, доставка до Владивостока, услуга компании', en: 'expenses in Korea, delivery to Vladivostok, company service', tj: 'хароҷот дар Корея, интиқол то Владивосток, хизмати ширкат', uz: 'Koreyadagi xarajatlar, Vladivostokgacha yetkazish, kompaniya xizmati' },
  'price.customsFee': { ru: 'Таможенный сбор', en: 'Customs processing fee', tj: 'Ҳаққи гумрукӣ', uz: 'Bojxona yigʻimi' },
  'price.customsFeeDesc': { ru: 'сбор за оформление', en: 'declaration processing', tj: 'барои расмиёт', uz: 'rasmiylashtirish uchun' },
  'price.broker': { ru: 'Брокер во Владивостоке', en: 'Broker in Vladivostok', tj: 'Брокер дар Владивосток', uz: 'Vladivostokdagi broker' },
  'price.brokerDesc': { ru: 'Таможенное оформление', en: 'Customs clearance', tj: 'Расмиёти гумрукӣ', uz: 'Bojxona rasmiylashtiruvi' },
  'price.deliveryTj': { ru: 'Доставка до Таджикистана', en: 'Delivery to Tajikistan', tj: 'Интиқол то Тоҷикистон', uz: 'Tojikistonga yetkazish' },
  'price.deliveryTjDesc': { ru: 'доставка Корея → Таджикистан', en: 'shipping Korea → Tajikistan', tj: 'интиқол Корея → Тоҷикистон', uz: 'yetkazish Koreya → Tojikiston' },
  'price.totalTurnkey': { ru: 'Итого под ключ', en: 'Total turnkey', tj: 'Ҷамъ таёр', uz: 'Jami tayyor' },
  'price.totalDelivered': { ru: 'Итого с доставкой', en: 'Total delivered', tj: 'Ҷамъ бо интиқол', uz: 'Jami yetkazib berish bilan' },
  'price.inVladivostok': { ru: 'Во Владивостоке', en: 'In Vladivostok', tj: 'Дар Владивосток', uz: 'Vladivostokda' },
  'price.inTajikistan': { ru: 'В Таджикистане', en: 'In Tajikistan', tj: 'Дар Тоҷикистон', uz: 'Tojikistonda' },
  'price.disclaimer': { ru: 'Расчёт по ставкам tks.ru. Точная стоимость зависит от курса валют на момент оформления.', en: 'Calculated using tks.ru rates. Final cost depends on exchange rates at the time of processing.', tj: 'Ҳисоб аз рӯи ставкаҳои tks.ru. Арзиши дақиқ аз курби асъор вобаста аст.', uz: 'tks.ru stavkalari bo\'yicha hisoblangan. Aniq narx rasmiylashtirish vaqtidagi valyuta kursiga bog\'liq.' },
  'price.showBreakdown': { ru: 'Показать расчёт цены', en: 'Show price breakdown', tj: 'Нишон додани ҳисоб', uz: 'Narx tafsilotini ko\'rsatish' },
  'price.hideBreakdown': { ru: 'Скрыть расчёт цены', en: 'Hide price breakdown', tj: 'Пинҳон кардани ҳисоб', uz: 'Narx tafsilotini yashirish' },
  'price.priceInKorea': { ru: 'Цена в Корее:', en: 'Price in Korea:', tj: 'Нарх дар Корея:', uz: 'Koreyadagi narx:' },
  'price.calculatingExact': { ru: 'Уточняем стоимость...', en: 'Calculating exact price...', tj: 'Ҳисоби дақиқ...', uz: 'Aniq narx hisoblanmoqda...' },

  // Price bar
  'pricebar.carPrice': { ru: 'Стоимость авто', en: 'Car price', tj: 'Нархи мошин', uz: 'Avto narxi' },
  'pricebar.customs': { ru: 'Таможенная пошлина', en: 'Customs duty', tj: 'Божи гумрукӣ', uz: 'Bojxona boji' },
  'pricebar.delivery': { ru: 'Доставка и оформление', en: 'Delivery & processing', tj: 'Интиқол ва расмиёт', uz: 'Yetkazib berish' },
  'pricebar.other': { ru: 'Утильсбор + брокер', en: 'Util. fee + broker', tj: 'Утил. + брокер', uz: 'Util. + broker' },

  // Equipment
  'equip.title': { ru: 'Комплектация', en: 'Equipment', tj: 'Таҷҳизот', uz: 'Jihozlanish' },
  'equip.options': { ru: 'опций', en: 'options', tj: 'имконот', uz: 'opsiya' },
  'equip.interior': { ru: 'Интерьер и экстерьер', en: 'Interior & Exterior', tj: 'Дохилӣ ва берунӣ', uz: 'Ichki va tashqi' },
  'equip.safety': { ru: 'Безопасность', en: 'Safety', tj: 'Бехатарӣ', uz: 'Xavfsizlik' },
  'equip.multimedia': { ru: 'Мультимедиа', en: 'Multimedia', tj: 'Мултимедиа', uz: 'Multimedia' },
  'equip.comfort': { ru: 'Комфорт и сиденья', en: 'Comfort & Seats', tj: 'Роҳатӣ ва ҷойгоҳ', uz: 'Komfort va o\'rindiqlar' },
  'equip.other': { ru: 'Прочее', en: 'Other', tj: 'Дигар', uz: 'Boshqa' },
  'equip.hide': { ru: 'Скрыть', en: 'Hide', tj: 'Пинҳон', uz: 'Yashirish' },
  'equip.showAll': { ru: 'Показать все', en: 'Show all', tj: 'Ҳама нишон', uz: 'Hammasini ko\'rsatish' },
  'equip.more': { ru: 'ещё', en: 'more', tj: 'боз', uz: 'yana' },

  // Accident / Inspection
  'accident.title': { ru: 'Техническое состояние', en: 'Technical condition', tj: 'Ҳолати техникӣ', uz: 'Texnik holat' },
  'accident.history': { ru: 'Аварийность', en: 'Accident history', tj: 'Садама', uz: 'Avariya tarixi' },
  'accident.simpleRepair': { ru: 'Простой ремонт', en: 'Simple repair', tj: 'Таъмири оддӣ', uz: 'Oddiy ta\'mir' },
  'accident.yes': { ru: 'Есть', en: 'Yes', tj: 'Ҳаст', uz: 'Bor' },
  'accident.no': { ru: 'Нет', en: 'No', tj: 'Не', uz: 'Yo\'q' },
  'accident.noDamage': { ru: 'Повреждений кузова не обнаружено', en: 'No body damage found', tj: 'Зарари кузов ёфт нашуд', uz: 'Kuzov shikasti topilmadi' },
  'accident.byEncar': { ru: 'По данным технической экспертизы Encar', en: 'Based on Encar technical inspection', tj: 'Аз рӯи экспертизаи техникии Encar', uz: 'Encar texnik ekspertizasi bo\'yicha' },
  'accident.noData': { ru: 'Данные техосмотра недоступны для этого автомобиля', en: 'Inspection data unavailable for this vehicle', tj: 'Маълумоти техосмотр дастнорас нест', uz: 'Texnik ko\'rik ma\'lumotlari mavjud emas' },
  'accident.insuranceHistory': { ru: 'История страховых случаев', en: 'Insurance claim history', tj: 'Таърихи суғуртавӣ', uz: 'Sug\'urta da\'volari tarixi' },
  'accident.cases': { ru: 'Случаев', en: 'Cases', tj: 'Ҳолатҳо', uz: 'Holatlar' },
  'accident.amount': { ru: 'Сумма', en: 'Amount', tj: 'Маблағ', uz: 'Summa' },
  'accident.showDetails': { ru: 'Показать подробности', en: 'Show details', tj: 'Нишон додан', uz: 'Tafsilotlarni ko\'rsatish' },
  'accident.hideDetails': { ru: 'Скрыть подробности', en: 'Hide details', tj: 'Пинҳон кардан', uz: 'Tafsilotlarni yashirish' },

  // Damage map
  'damage.change': { ru: 'Замена', en: 'Replaced', tj: 'Иваз', uz: 'Almashtirilgan' },
  'damage.metal': { ru: 'Рихтовка/сварка', en: 'Metal work', tj: 'Рихтовка', uz: 'Rixovka' },
  'damage.corrosion': { ru: 'Коррозия', en: 'Corrosion', tj: 'Коррозия', uz: 'Korroziya' },
  'damage.scratch': { ru: 'Царапина', en: 'Scratch', tj: 'Хурошидагӣ', uz: 'Tirnalish' },
  'damage.dent': { ru: 'Вмятина', en: 'Dent', tj: 'Ғижим', uz: 'Botiqlik' },
  'damage.damage': { ru: 'Повреждение', en: 'Damage', tj: 'Зарар', uz: 'Shikast' },
  'damage.exterior': { ru: 'Внешние панели', en: 'Exterior panels', tj: 'Панелҳои берунӣ', uz: 'Tashqi panellar' },
  'damage.structural': { ru: 'Каркас / рама', en: 'Frame / structure', tj: 'Каркас / рама', uz: 'Karkас / rama' },
  'damage.passenger': { ru: '* Для пассажирских автомобилей', en: '* For passenger vehicles', tj: '* Барои мошинҳои мусофиркаш', uz: '* Yo\'lovchi avtomobillari uchun' },

  // Detail page
  'detail.notFound': { ru: 'Автомобиль не найден', en: 'Car not found', tj: 'Мошин ёфт нашуд', uz: 'Avtomobil topilmadi' },
  'detail.notFoundDesc': { ru: 'Возможно, объявление было удалено или ссылка устарела.', en: 'The listing may have been removed or the link is outdated.', tj: 'Эълон метавонад нест шуда бошад.', uz: 'E\'lon o\'chirilgan yoki havola eskirgan bo\'lishi mumkin.' },
  'detail.backToCatalog': { ru: 'Вернуться в каталог', en: 'Back to catalog', tj: 'Бозгашт ба каталог', uz: 'Katalogga qaytish' },
  'detail.loadingPhotos': { ru: 'Загрузка фото...', en: 'Loading photos...', tj: 'Боркунии сурат...', uz: 'Suratlar yuklanmoqda...' },
  'detail.howToBuy': { ru: 'Как купить автомобиль', en: 'How to buy a car', tj: 'Чӣ тавр мошин харид кунам', uz: 'Avtomobil qanday sotib olish' },

  // Favorites
  'fav.title': { ru: 'Избранное', en: 'Favorites', tj: 'Интихобшуда', uz: 'Tanlanganlar' },
  'fav.count': { ru: 'автомобилей', en: 'vehicles', tj: 'мошин', uz: 'avtomobil' },
  'fav.clearAll': { ru: 'Очистить всё', en: 'Clear all', tj: 'Ҳамаро тоза кунед', uz: 'Hammasini tozalash' },
  'fav.empty': { ru: 'Нет избранных автомобилей', en: 'No favorite vehicles', tj: 'Мошини интихобшуда нест', uz: 'Tanlangan avtomobillar yo\'q' },
  'fav.emptyDesc': { ru: 'Нажмите на сердечко на карточке автомобиля, чтобы добавить в избранное', en: 'Click the heart icon on a car card to add it to favorites', tj: 'Ба дили дар кортаи мошин занед, то ба интихобшуда илова шавад', uz: 'Sevimlilaringizga qo\'shish uchun avtomobil kartasidagi yurak belgisini bosing' },
  'fav.goToCatalog': { ru: 'Перейти в каталог', en: 'Go to catalog', tj: 'Ба каталог гузаред', uz: 'Katalogga o\'tish' },
  'fav.addToFav': { ru: 'Добавить в избранное', en: 'Add to favorites', tj: 'Ба интихобшуда илова кунед', uz: 'Tanlanganlarga qo\'shish' },
  'fav.removeFromFav': { ru: 'Убрать из избранного', en: 'Remove from favorites', tj: 'Аз интихобшуда нест кунед', uz: 'Tanlanganlardan olib tashlash' },

  // Footer
  'footer.description': { ru: 'Автомобили со всей Кореи: Encar, аукционы и прямые продажи.', en: 'Cars from all over Korea: Encar, auctions, and direct sales.', tj: 'Мошинҳо аз тамоми Корея: Encar, кимёфурӯшӣ ва фурӯши мустақим.', uz: 'Butun Koreyadan avtomobillar: Encar, auktsionlar va to\'g\'ridan-to\'g\'ri savdo.' },
  'footer.contacts': { ru: 'Контакты', en: 'Contacts', tj: 'Тамос', uz: 'Kontaktlar' },
  'footer.callOrWrite': { ru: '24/7 — звоните или пишите', en: '24/7 — call or text us', tj: '24/7 — занг занед ё нависед', uz: '24/7 — qo\'ng\'iroq qiling yoki yozing' },
  'footer.rights': { ru: 'Все права защищены.', en: 'All rights reserved.', tj: 'Ҳамаи ҳуқуқҳо маҳфузанд.', uz: 'Barcha huquqlar himoyalangan.' },
  'footer.disclaimer': { ru: 'Информация на сайте носит информационный характер и не является публичной офертой.', en: 'Information on this website is for reference only and does not constitute a public offer.', tj: 'Маълумот дар сайт хусусияти иттилоотӣ дорад.', uz: 'Saytdagi ma\'lumotlar faqat ma\'lumot berish uchun.' },

  // Mileage unit
  'unit.km': { ru: 'км', en: 'km', tj: 'км', uz: 'km' },
} as const;

export type TranslationKey = keyof typeof t;

export function getTranslation(key: TranslationKey, lang: Lang): string {
  return t[key]?.[lang] || t[key]?.['en'] || key;
}

// Currency formatting
const currencySymbols: Record<Currency, string> = { RUB: '₽', USD: '$', EUR: '€', KRW: '₩' };
const currencyLocales: Record<Currency, string> = { RUB: 'ru-RU', USD: 'en-US', EUR: 'de-DE', KRW: 'ko-KR' };

export function formatCurrencyPrice(price: number, currency: Currency): string {
  return new Intl.NumberFormat(currencyLocales[currency], {
    style: 'decimal',
    maximumFractionDigits: 0,
  }).format(price) + ' ' + currencySymbols[currency];
}

export function formatLocaleMileage(km: number, lang: Lang): string {
  const locale = lang === 'ru' || lang === 'tj' ? 'ru-RU' : 'en-US';
  return new Intl.NumberFormat(locale).format(km) + ' ' + getTranslation('unit.km', lang);
}
