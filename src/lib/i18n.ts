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
  'nav.auction': { ru: 'Аукцион', en: 'Auction', tj: 'Музояда', uz: 'Auksion' },
  'brand.subtitle': { ru: 'Авто из Кореи', en: 'Cars from Korea', tj: 'Мошинҳо аз Корея', uz: 'Koreyadan avtomobillar' },
  'contact.carInterest': { ru: 'Интересует автомобиль', en: 'I am interested in car', tj: 'Ба ин мошин таваҷҷуҳ дорам', uz: 'Bu avtomobilga qiziqyapman' },

  // Source tabs
  'tab.encar': { ru: 'Encar', en: 'Encar', tj: 'Encar', uz: 'Encar' },
  'tab.auction': { ru: 'Kcar Аукцион', en: 'Kcar Auction', tj: 'Kcar Аукцион', uz: 'Kcar Auktsion' },
  'tab.forSale': { ru: 'В наличии', en: 'For Sale', tj: 'Дар мавҷуд', uz: 'Sotuvda' },

  // Homepage hero
  'home.heroEyebrow': { ru: 'Авто из Кореи · расчёт под ключ', en: 'Encar Korea · turnkey pricing', tj: 'Мошинҳо аз Корея · ҳисоб тайёр', uz: 'Koreyadan avtomobillar · tayyor narx' },
  'home.heroTitle': { ru: 'Авто из Кореи от компании GHAYRAT KOREA', en: 'Cars from Korea with live prices', tj: 'Мошинҳо аз Корея бо нархҳои зинда', uz: 'Koreyadan jonli narxlardagi avtomobillar' },
  'home.heroSubtitle': { ru: 'Выберите нужный автомобиль на сайте, а мы проверим его в Корее и надёжно доставим до вас.', en: 'Choose the car you want on the website, and we will inspect it in Korea and deliver it to you reliably.', tj: 'Мошини дилхоҳатонро дар сайт интихоб кунед, мо онро дар Корея месанҷем ва боэътимод ба шумо мерасонем.', uz: 'Saytdan kerakli avtomobilni tanlang, biz uni Koreyada tekshirib, ishonchli yetkazib beramiz.' },
  'home.liveCars': { ru: 'авто в каталоге', en: 'live cars', tj: 'мошин дар каталог', uz: 'katalogdagi avtomobillar' },
  'home.koreaPrice': { ru: 'цена в Корее', en: 'Korea price', tj: 'нарх дар Корея', uz: 'Koreyadagi narx' },
  'home.turnkey': { ru: 'под ключ', en: 'turnkey', tj: 'тайёр', uz: 'tayyor' },
  'home.yearsInKorea': { ru: 'года в Корее', en: 'years in Korea', tj: 'сол дар Корея', uz: 'yil Koreyada' },
  'home.carsDelivered': { ru: 'доставлено авто', en: 'cars delivered', tj: 'мошин расонида шуд', uz: 'avtomobil yetkazildi' },
  'home.deliveryTo': { ru: 'Доставляем в страны СНГ и в Россию', en: 'Delivery to CIS countries and Russia', tj: 'Ба кишварҳои ИДМ ва Русия мерасонем', uz: 'MDH davlatlari va Rossiyaga yetkazamiz' },
  'home.serviceSelect': { ru: 'Выберите авто', en: 'Choose a car', tj: 'Мошинро интихоб кунед', uz: 'Avto tanlang' },
  'home.serviceInspect': { ru: 'Проверим в Корее', en: 'We inspect it in Korea', tj: 'Дар Корея месанҷем', uz: 'Koreyada tekshiramiz' },
  'home.serviceDeliver': { ru: 'Доставим под ключ', en: 'We deliver turnkey', tj: 'Тайёр мерасонем', uz: 'Tayyor yetkazamiz' },
  'home.deliveryNote': { ru: 'Россия, Таджикистан, Узбекистан, Казахстан', en: 'Russia, Tajikistan, Uzbekistan, Kazakhstan', tj: 'Русия, Тоҷикистон, Ӯзбекистон, Қазоқистон', uz: 'Rossiya, Tojikiston, Oʻzbekiston, Qozogʻiston' },
  'home.catalogTitle': { ru: 'Ваш следующий автомобиль — из Кореи', en: 'Your next car — from Korea', tj: 'Мошини навбатии шумо — аз Корея', uz: 'Keyingi avtomobilingiz — Koreyadan' },
  'home.catalogHint': { ru: 'Выбирайте из тысяч предложений. Мы проверим автомобиль и организуем доставку до вашего города.', en: 'Choose from thousands of cars. We will inspect your vehicle and arrange delivery to your city.', tj: 'Аз байни ҳазорҳо мошин интихоб кунед. Мо мошинро месанҷем ва то шаҳри шумо мерасонем.', uz: 'Minglab avtomobillardan tanlang. Biz mashinani tekshirib, shahringizgacha yetkazamiz.' },
  'home.catalogPriceNote': { ru: 'Сопровождение от выбора до доставки', en: 'Support from selection to delivery', tj: 'Ҳамроҳӣ аз интихоб то расонидан', uz: 'Tanlovdan yetkazib berishgacha yordam' },
  'welcome.label': { ru: 'Добро пожаловать', en: 'Welcome', tj: 'Хуш омадед', uz: 'Xush kelibsiz' },
  'welcome.close': { ru: 'Закрыть', en: 'Close', tj: 'Пӯшидан', uz: 'Yopish' },
  'welcome.title': { ru: 'Автомобиль из Кореи — проще, чем кажется', en: 'A car from Korea — easier than it seems', tj: 'Мошин аз Корея — осонтар аз он ки менамояд', uz: 'Koreyadan avtomobil — o‘ylaganingizdan osonroq' },
  'welcome.text': { ru: 'Поможем выбрать, проверить и доставить автомобиль до вашего города.', en: 'We will help you choose, inspect, and deliver a car to your city.', tj: 'Барои интихоб, санҷиш ва расонидани мошин то шаҳри шумо кумак мекунем.', uz: 'Avtomobilni tanlash, tekshirish va shahringizgacha yetkazishda yordam beramiz.' },
  'home.destinationLabel': { ru: 'Куда доставить', en: 'Delivery destination', tj: 'Ба куҷо расондан', uz: 'Qayerga yetkazish' },
  'home.russiaCalculation': { ru: 'Расчёт до Владивостока', en: 'Calculation to Vladivostok', tj: 'Ҳисоб то Владивосток', uz: 'Vladivostokgacha hisob' },
  'home.tajikistanCalculation': { ru: 'Расчёт до Худжанда', en: 'Calculation to Khujand', tj: 'Ҳисоб то Хуҷанд', uz: 'Xo‘jandgacha hisob' },
  'country.russia': { ru: 'Россия', en: 'Russia', tj: 'Русия', uz: 'Rossiya' },
  'country.tajikistan': { ru: 'Таджикистан', en: 'Tajikistan', tj: 'Тоҷикистон', uz: 'Tojikiston' },
  'country.uzbekistan': { ru: 'Узбекистан', en: 'Uzbekistan', tj: 'Ӯзбекистон', uz: 'Oʻzbekiston' },
  'country.kazakhstan': { ru: 'Казахстан', en: 'Kazakhstan', tj: 'Қазоқистон', uz: 'Qozogʻiston' },

  // Search & Filters
  'search.brandPlaceholder': { ru: 'Марка, модель', en: 'Brand, model', tj: 'Бренд, модел', uz: 'Brend, model' },
  'search.brandLabel': { ru: 'Марка', en: 'Brand', tj: 'Бренд', uz: 'Brend' },
  'search.modelLabel': { ru: 'Модель', en: 'Model', tj: 'Модел', uz: 'Model' },
  'search.pickCarTitle': { ru: 'Подберите автомобиль', en: 'Find a car', tj: 'Мошинро интихоб кунед', uz: 'Avtomobil tanlang' },
  'search.pickCarHint': { ru: 'Сначала выберите марку', en: 'Start with the brand', tj: 'Аввал брендро интихоб кунед', uz: 'Avval brendni tanlang' },
  'search.modelAfterBrand': { ru: 'Сначала выберите марку', en: 'Choose a brand first', tj: 'Аввал брендро интихоб кунед', uz: 'Avval brendni tanlang' },
  'search.allModels': { ru: 'Все модели', en: 'All models', tj: 'Ҳамаи моделҳо', uz: 'Barcha modellar' },
  'search.brandModelTitle': { ru: 'Марка и модель', en: 'Brand and model', tj: 'Бренд ва модел', uz: 'Brend va model' },
  'search.searchBrand': { ru: 'Найти марку', en: 'Find a brand', tj: 'Ҷустуҷӯи бренд', uz: 'Brendni qidiring' },
  'search.searchModel': { ru: 'Найти модель', en: 'Find a model', tj: 'Ҷустуҷӯи модел', uz: 'Modelni qidiring' },
  'search.noMatches': { ru: 'Ничего не найдено', en: 'Nothing found', tj: 'Чизе ёфт нашуд', uz: 'Hech narsa topilmadi' },
  'search.all': { ru: 'Все', en: 'All', tj: 'Ҳама', uz: 'Barchasi' },
  'search.generationPlaceholder': { ru: 'Поколение', en: 'Generation', tj: 'Насл', uz: 'Avlod' },
  'search.allGenerations': { ru: 'Все поколения', en: 'All generations', tj: 'Ҳамаи наслҳо', uz: 'Barcha avlodlar' },
  'search.loading': { ru: 'Загрузка...', en: 'Loading...', tj: 'Боркунӣ...', uz: 'Yuklanmoqda...' },
  'search.noModels': { ru: 'Нет моделей', en: 'No models', tj: 'Модел нест', uz: 'Modellar yo\'q' },
  'search.searching': { ru: 'Поиск...', en: 'Searching...', tj: 'Ҷустуҷӯ...', uz: 'Qidirilmoqda...' },
  'search.found': { ru: 'Найдено', en: 'Found', tj: 'Ёфт шуд', uz: 'Topildi' },
  'search.cars': { ru: 'авто', en: 'cars', tj: 'мошин', uz: 'avtomobil' },
  'search.comingSoon': { ru: 'Скоро будет доступно', en: 'Coming soon', tj: 'Ба наздикӣ дастрас мешавад', uz: 'Tez orada' },
  'search.noCars': { ru: 'Автомобили не найдены', en: 'No cars found', tj: 'Мошин ёфт нашуд', uz: 'Avtomobillar topilmadi' },
  'search.noCarsHint': { ru: 'Попробуйте изменить параметры поиска или сбросить фильтры', en: 'Try changing your search filters or resetting them', tj: 'Параметрҳои ҷустуҷӯро тағйир диҳед ё филтрҳоро тоза кунед', uz: 'Qidiruv parametrlarini o\'zgartiring yoki filtrlarni tozalang' },
  'search.unavailableTitle': { ru: 'Каталог временно недоступен', en: 'The catalog is temporarily unavailable', tj: 'Каталог муваққатан дастнорас аст', uz: 'Katalog vaqtincha ishlamayapti' },
  'search.unavailableHint': { ru: 'Не удалось загрузить автомобили с Encar. Попробуйте ещё раз через минуту.', en: 'We could not load cars from Encar. Please try again in a minute.', tj: 'Мошинҳоро аз Encar бор карда натавонистем. Пас аз як дақиқа дубора кӯшиш кунед.', uz: 'Encar avtomobillarini yuklab bo\'lmadi. Bir daqiqadan so\'ng qayta urinib ko\'ring.' },
  'search.retry': { ru: 'Попробовать снова', en: 'Try again', tj: 'Аз нав кӯшиш кардан', uz: 'Qayta urinish' },
  'search.savedCatalog': { ru: 'Показаны сохранённые объявления Encar', en: 'Showing saved Encar listings', tj: 'Эълонҳои захирашудаи Encar нишон дода мешаванд', uz: 'Saqlangan Encar e\'lonlari ko\'rsatilmoqda' },
  'search.savedCatalogHint': { ru: 'Прямое обновление временно недоступно. Каталог обновится автоматически.', en: 'Live updates are temporarily unavailable. The catalog will refresh automatically.', tj: 'Навсозии мустақим муваққатан дастнорас аст. Каталог худкор нав мешавад.', uz: 'Jonli yangilanish vaqtincha mavjud emas. Katalog avtomatik yangilanadi.' },
  'search.hideFilters': { ru: 'Скрыть фильтры', en: 'Hide filters', tj: 'Пинҳон кардани филтрҳо', uz: 'Filtrlarni yashirish' },
  'search.moreFilters': { ru: 'Ещё фильтры', en: 'More filters', tj: 'Филтрҳои бештар', uz: 'Ko\'proq filtrlar' },
  'search.chooseBrand': { ru: 'Выбор марки', en: 'Choose brand', tj: 'Интихоби бренд', uz: 'Brendni tanlang' },
  'search.chooseModel': { ru: 'Выбор модели', en: 'Choose model', tj: 'Интихоби модел', uz: 'Modelni tanlang' },
  'search.chooseGeneration': { ru: 'Выбор поколения', en: 'Choose generation', tj: 'Интихоби насл', uz: 'Avlodni tanlang' },
  'search.showResults': { ru: 'Показать', en: 'Show', tj: 'Нишон додан', uz: 'Ko\'rsatish' },

  // Filter sections
  'filter.type': { ru: 'Тип', en: 'Type', tj: 'Навъ', uz: 'Turi' },
  'filter.trim': { ru: 'Комплектация', en: 'Trim', tj: 'Комплектатсия', uz: 'Komplektatsiya' },
  'filter.showMore': { ru: 'Показать ещё', en: 'Show more', tj: 'Бештар нишон диҳед', uz: 'Yana ko\'rsatish' },
  'filter.year': { ru: 'Год', en: 'Year', tj: 'Сол', uz: 'Yil' },
  'filter.hp': { ru: 'Мощность (л.с.)', en: 'Horsepower', tj: 'Қувват (а.қ.)', uz: 'Quvvat (o.k.)' },
  'filter.hpFrom': { ru: 'От, л.с.', en: 'From, hp', tj: 'Аз, а.қ.', uz: 'Dan, o.k.' },
  'filter.hpTo': { ru: 'До, л.с.', en: 'To, hp', tj: 'То, а.қ.', uz: 'Gacha, o.k.' },
  'filter.price': { ru: 'Цена', en: 'Price', tj: 'Нарх', uz: 'Narx' },
  'filter.mileage': { ru: 'Пробег', en: 'Mileage', tj: 'Масофа', uz: 'Yurgan masofasi' },
  'filter.kmShort': { ru: 'км', en: 'km', tj: 'км', uz: 'km' },
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
  'card.reserved': { ru: 'Забронировано', en: 'Reserved', tj: 'Резерв шудааст', uz: 'Band qilingan' },
  'card.sold': { ru: 'Продано', en: 'Sold', tj: 'Фурӯхта шуд', uz: 'Sotilgan' },
  'card.priceInKorea': { ru: 'Цена в Корее', en: 'Price in Korea', tj: 'Нарх дар Корея', uz: 'Koreyadagi narx' },
  'card.priceInKoreaUsd': { ru: 'Цена в Корее · USD', en: 'Korea price · USD', tj: 'Нарх дар Корея · USD', uz: 'Koreya narxi · USD' },
  'card.viewAndCalculate': { ru: 'Открыть и рассчитать доставку', en: 'Open and calculate delivery', tj: 'Кушодан ва ҳисоб кардани таҳвил', uz: 'Ochish va yetkazishni hisoblash' },
  'card.turnkeyVladivostok': { ru: 'ориентировочно до Владивостока, с доставкой и растаможкой', en: 'estimated to Vladivostok, including shipping and customs', tj: 'тахминан то Владивосток, бо интиқол ва расмиёти гумрукӣ', uz: 'Vladivostokgacha taxminiy, yetkazish va bojxona bilan' },
  'card.turnkeyTajikistan': { ru: 'цена авто + доставка контейнером, без растаможки', en: 'car price + container shipping, excluding customs', tj: 'нархи мошин + таҳвил бо контейнер, бе расмиёти гумрукӣ', uz: 'avto narxi + konteyner yetkazish, bojxonasiz' },

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
  'spec.yearSuffix': { ru: 'г.', en: '', tj: 'с.', uz: 'y.' },
  'spec.cc': { ru: 'см³', en: 'cc', tj: 'см³', uz: 'sm³' },

  // Image gallery
  'gallery.noPhoto': { ru: 'Нет фото', en: 'No photo', tj: 'Сурат нест', uz: 'Rasm yo‘q' },
  'gallery.previous': { ru: 'Предыдущее фото', en: 'Previous photo', tj: 'Сурати пешина', uz: 'Oldingi rasm' },
  'gallery.next': { ru: 'Следующее фото', en: 'Next photo', tj: 'Сурати навбатӣ', uz: 'Keyingi rasm' },
  'gallery.close': { ru: 'Закрыть галерею', en: 'Close gallery', tj: 'Пӯшидани галерея', uz: 'Galereyani yopish' },
  'gallery.morePhotos': { ru: 'фото', en: 'photos', tj: 'сурат', uz: 'rasm' },

  // Price breakdown
  'price.carPriceKorea': { ru: 'Стоимость авто в Корее', en: 'Car price in Korea', tj: 'Нархи мошин дар Корея', uz: 'Koreyadagi narx' },
  'price.customsValue': { ru: 'Таможенная стоимость', en: 'Customs value', tj: 'Арзиши гумрукӣ', uz: 'Bojxona qiymati' },
  'price.customsDuty': { ru: 'Таможенная пошлина', en: 'Customs duty', tj: 'Божи гумрукӣ', uz: 'Bojxona boji' },
  'price.utilizationFee': { ru: 'Утилизационный сбор', en: 'Utilization fee', tj: 'Ҳаққи утилизатсия', uz: 'Utilizatsiya to\'lovi' },
  'price.delivery': { ru: 'Доставка и оформление', en: 'Delivery & processing', tj: 'Интиқол ва расмиёт', uz: 'Yetkazib berish va rasmiylashtirish' },
  'price.deliveryDesc': { ru: 'расходы в Корее, доставка до Владивостока, услуга компании', en: 'expenses in Korea, delivery to Vladivostok, company service', tj: 'хароҷот дар Корея, интиқол то Владивосток, хизмати ширкат', uz: 'Koreyadagi xarajatlar, Vladivostokgacha yetkazish, kompaniya xizmati' },
  'price.customsFee': { ru: 'Таможенный сбор', en: 'Customs processing fee', tj: 'Ҳаққи гумрукӣ', uz: 'Bojxona yigʻimi' },
  'price.customsFeeDesc': { ru: 'сбор за оформление', en: 'declaration processing', tj: 'барои расмиёт', uz: 'rasmiylashtirish uchun' },
  'price.broker': { ru: 'Брокер во Владивостоке', en: 'Broker in Vladivostok', tj: 'Брокер дар Владивосток', uz: 'Vladivostokdagi broker' },
  'price.brokerDesc': { ru: 'Таможенное оформление', en: 'Customs clearance', tj: 'Расмиёти гумрукӣ', uz: 'Bojxona rasmiylashtiruvi' },
  'price.exciseTax': { ru: 'Акцизный налог', en: 'Excise tax', tj: 'Андози аксиз', uz: 'Aksiz soligʻi' },
  'price.vat': { ru: 'НДС', en: 'VAT', tj: 'ААИ', uz: 'QQS' },
  'price.procedureFee': { ru: 'Процедура оформления', en: 'Processing fee', tj: 'Расмиёт', uz: 'Rasmiylashtirish' },
  'price.procedureFeeDesc': { ru: 'таможенное оформление', en: 'customs processing', tj: 'расмиёти гумрукӣ', uz: 'bojxona rasmiylash' },
  'price.customsClearance': { ru: 'Растаможка + утилизация', en: 'Customs + utilization', tj: 'Расмиёти гумрукӣ + утилизатсия', uz: 'Bojxona + utilizatsiya' },
  'price.dependsOnRate': { ru: 'зависит от курса валют', en: 'depends on exchange rate', tj: 'аз курби асъор вобаста аст', uz: 'valyuta kursiga bog\'liq' },
  'price.deliveryVladivostok': { ru: 'Доставка до Владивостока', en: 'Delivery to Vladivostok', tj: 'Интиқол то Владивосток', uz: 'Vladivostokga yetkazish' },
  'price.deliveryVladivostokDesc': { ru: 'Корея → Владивосток', en: 'Korea → Vladivostok', tj: 'Корея → Владивосток', uz: 'Koreya → Vladivostok' },
  'price.deliveryKhujand': { ru: 'Доставка до Худжанда', en: 'Delivery to Khujand', tj: 'Интиқол то Хуҷанд', uz: 'Xo\'jandga yetkazish' },
  'price.deliveryKhujandDesc': { ru: '~$3,000 Владивосток → Худжанд', en: '~$3,000 Vladivostok → Khujand', tj: '~$3,000 Владивосток → Хуҷанд', uz: '~$3,000 Vladivostok → Xo\'jand' },
  'price.customsClearanceDesc': { ru: 'по данным rastamojka.tj', en: 'based on rastamojka.tj', tj: 'аз рӯи маълумоти rastamojka.tj', uz: 'rastamojka.tj ma\'lumotlari bo\'yicha' },
  'price.customsApproxWarningTj': { ru: 'примерная стоимость. Обязательно проверьте самостоятельно перед покупкой.', en: 'approximate cost. Please verify it yourself before purchasing.', tj: 'арзиши тахминӣ. Пеш аз харид ҳатман худатон санҷед.', uz: 'taxminiy narx. Xarid qilishdan oldin albatta o‘zingiz tekshiring.' },
  'price.serviceFeeKorea': { ru: 'Расходы в Корее + услуги компании', en: 'Expenses in Korea + service fee', tj: 'Хароҷот дар Корея + хизматрасонӣ', uz: 'Koreyadagi xarajatlar + xizmat' },
  'price.serviceFeeKoreaDesc': { ru: 'документы, расходы на авто, комиссия', en: 'documents, car expenses, commission', tj: 'ҳуҷҷатҳо, хароҷоти мошин, комиссия', uz: 'hujjatlar, avto xarajatlari, komissiya' },
  'price.deliveryTj': { ru: 'Доставка контейнером', en: 'Container shipping', tj: 'Таҳвил бо контейнер', uz: 'Konteynerda yetkazish' },
  'price.deliveryTjDesc': { ru: 'около $3,000 — зависит от автомобиля', en: 'about $3,000 — depends on the vehicle', tj: 'тақрибан $3,000 — аз мошин вобаста аст', uz: 'taxminan $3,000 — avtomobilga bog‘liq' },
  'price.totalTurnkey': { ru: 'Итого под ключ', en: 'Total turnkey', tj: 'Ҷамъ таёр', uz: 'Jami tayyor' },
  'price.totalDelivered': { ru: 'Итого с доставкой', en: 'Total delivered', tj: 'Ҷамъ бо интиқол', uz: 'Jami yetkazib berish bilan' },
  'price.inVladivostok': { ru: 'Во Владивостоке', en: 'In Vladivostok', tj: 'Дар Владивосток', uz: 'Vladivostokda' },
  'price.inTajikistan': { ru: 'в Худжанде', en: 'in Khujand', tj: 'дар Хуҷанд', uz: 'Xo\'jandda' },
  'price.disclaimer': { ru: 'Предварительный расчёт по действующим ставкам ЕАЭС и утилизационного сбора РФ. Итог зависит от курса ЦБ, документов и решения таможни.', en: 'Preliminary estimate using current EAEU customs and Russian recycling-fee rates. The final amount depends on official exchange rates, documents, and customs assessment.', tj: 'Ҳисоби пешакӣ аз рӯи ставкаҳои амалкунандаи ЕАЭС ва пардохти утилизатсионии Русия. Маблағи ниҳоӣ аз қурб, ҳуҷҷатҳо ва баҳодиҳии гумрук вобаста аст.', uz: 'Amaldagi YEOII bojxona va Rossiya utilizatsiya yig‘imi stavkalari bo‘yicha dastlabki hisob. Yakuniy summa kurs, hujjatlar va bojxona bahosiga bog‘liq.' },
  'price.disclaimerTj': { ru: 'В итог включены цена автомобиля и примерная доставка контейнером. Растаможка не включена и оплачивается отдельно.', en: 'The total includes the car price and estimated container shipping. Customs clearance is excluded and paid separately.', tj: 'Ба ҷамъ нархи мошин ва таҳвили тахминӣ бо контейнер дохил аст. Расмиёти гумрукӣ дохил нест ва алоҳида пардохт мешавад.', uz: 'Jami narxga avtomobil va taxminiy konteyner yetkazish kiradi. Bojxona kiritilmagan va alohida to‘lanadi.' },
  'price.showBreakdown': { ru: 'Показать расчёт цены', en: 'Show price breakdown', tj: 'Нишон додани ҳисоб', uz: 'Narx tafsilotini ko\'rsatish' },
  'price.hideBreakdown': { ru: 'Скрыть расчёт цены', en: 'Hide price breakdown', tj: 'Пинҳон кардани ҳисоб', uz: 'Narx tafsilotini yashirish' },
  'price.priceInKorea': { ru: 'Цена в Корее:', en: 'Price in Korea:', tj: 'Нарх дар Корея:', uz: 'Koreyadagi narx:' },
  'price.calculatingExact': { ru: 'Уточняем стоимость...', en: 'Calculating exact price...', tj: 'Ҳисоби дақиқ...', uz: 'Aniq narx hisoblanmoqda...' },
  'price.estimatedTotal': { ru: 'Расчёт с доставкой и оформлением', en: 'Estimated delivery and processing total', tj: 'Ҳисоб бо таҳвил ва расмиёт', uz: 'Yetkazish va rasmiylashtirish hisobi' },
  'price.needsEngineData': { ru: 'Нужно уточнить данные двигателя', en: 'Engine details need confirmation', tj: 'Маълумоти муҳаррикро бояд дақиқ кард', uz: 'Dvigatel ma’lumotlarini aniqlash kerak' },
  'price.needsEngineDataDesc': { ru: 'Мы не показываем заниженную цену. Менеджер проверит объём и мощность и рассчитает итог.', en: 'We will not show an understated total. A manager will verify displacement and power before calculating it.', tj: 'Мо маблағи камшударо нишон намедиҳем. Менеҷер ҳаҷм ва қувваро санҷида, ҷамъро ҳисоб мекунад.', uz: 'Kam ko‘rsatilgan summani bermaymiz. Menejer hajm va quvvatni tekshirib, yakuniy hisobni beradi.' },
  'price.highPowerTitle': { ru: 'Повышенный утилизационный сбор', en: 'Higher recycling fee', tj: 'Пардохти баланди утилизатсионӣ', uz: 'Yuqori utilizatsiya yig‘imi' },
  'price.highPowerDesc': { ru: '{hp} л.с. — выше льготного порога {limit} л.с. В расчёт включена повышенная ставка утильсбора.', en: '{hp} hp is above the {limit} hp preferential threshold. The estimate includes the higher recycling-fee rate.', tj: '{hp} қ.о. аз ҳадди имтиёзноки {limit} қ.о. зиёд аст. Дар ҳисоб ставкаи баланд дохил шудааст.', uz: '{hp} o.k. imtiyozli {limit} o.k. chegarasidan yuqori. Hisobga yuqori utilizatsiya stavkasi kiritilgan.' },
  'price.powerBoundaryTitle': { ru: 'Пограничная мощность', en: 'Power threshold', tj: 'Ҳадди қувва', uz: 'Quvvat chegarasi' },
  'price.powerBoundaryDesc': { ru: '{limit} л.с. — пограничное значение. Таможня проверяет мощность в кВт по документам автомобиля.', en: '{limit} hp is the boundary value. Customs verifies the kW figure in the vehicle documents.', tj: '{limit} қ.о. арзиши ҳаддӣ аст. Гумрук қувваро бо кВт аз рӯи ҳуҷҷатҳои мошин месанҷад.', uz: '{limit} o.k. chegara qiymati. Bojxona avtomobil hujjatlaridagi kVt ko‘rsatkichini tekshiradi.' },
  'price.hybridPowerTitle': { ru: 'Мощность гибрида нужно подтвердить', en: 'Hybrid power needs confirmation', tj: 'Қувваи гибридро бояд тасдиқ кард', uz: 'Gibrid quvvatini tasdiqlash kerak' },
  'price.hybridPowerDesc': { ru: 'Для утильсбора берётся мощность по документам: у последовательного гибрида — 30-минутная мощность электромотора, у остальных — сумма ДВС и электромотора. Итог может измениться после проверки.', en: 'The recycling fee uses documented power: maximum 30-minute electric-motor power for a series hybrid, or ICE plus electric-motor power for other hybrids. The final amount may change after verification.', tj: 'Барои пардохт қувва аз ҳуҷҷатҳо гирифта мешавад: барои гибриди пайдарпай — қувваи 30-дақиқаинаи электромотор, барои дигарон — ҷамъбасти ДВС ва электромотор. Маблағ баъди санҷиш тағйир ёфта метавонад.', uz: 'Yig‘im uchun hujjatlardagi quvvat olinadi: ketma-ket gibridda elektr motorning 30 daqiqalik quvvati, boshqalarida esa ichki yonuv va elektr motor quvvati yig‘indisi. Tekshiruvdan so‘ng summa o‘zgarishi mumkin.' },
  'price.preferentialUtilTitle': { ru: 'Льготный утилизационный сбор', en: 'Preferential recycling fee', tj: 'Пардохти имтиёзноки утилизатсионӣ', uz: 'Imtiyozli utilizatsiya yig‘imi' },
  'price.preferentialUtilDesc': { ru: '{hp} л.с. — ниже порога {limit} л.с. При соблюдении условий личного ввоза применяется льготная ставка.', en: '{hp} hp is below the {limit} hp threshold. The preferential rate applies when personal-import conditions are met.', tj: '{hp} қ.о. аз ҳадди {limit} қ.о. кам аст. Ҳангоми риояи шартҳои воридоти шахсӣ ставкаи имтиёзнок амал мекунад.', uz: '{hp} o.k. {limit} o.k. chegarasidan past. Shaxsiy import shartlari bajarilganda imtiyozli stavka qo‘llanadi.' },

  // Detail purchase flow
  'detail.destinationTitle': { ru: 'Куда доставить автомобиль?', en: 'Where should we deliver the car?', tj: 'Мошинро ба куҷо расонем?', uz: 'Avtomobilni qayerga yetkazamiz?' },
  'detail.destinationHint': { ru: 'Выберите страну — стоимость и расходы пересчитаются автоматически.', en: 'Choose a country and all costs will update automatically.', tj: 'Кишварро интихоб кунед — нарх ва хароҷот худкор аз нав ҳисоб мешаванд.', uz: 'Davlatni tanlang — narx va xarajatlar avtomatik qayta hisoblanadi.' },

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

const vehicleValueKeys: Array<{ key: TranslationKey; aliases: string[] }> = [
  { key: 'fuel.hybrid', aliases: ['hybrid', 'гибрид', '하이브리드', '가솔린+전기', '디젤+전기', 'gasoline+electric', 'diesel+electric'] },
  { key: 'fuel.electric', aliases: ['electric', 'электро', '전기'] },
  { key: 'fuel.gasoline', aliases: ['gasoline', 'бензин', '가솔린'] },
  { key: 'fuel.diesel', aliases: ['diesel', 'дизель', '디젤'] },
  { key: 'fuel.lpg', aliases: ['lpg', 'газ'] },
  { key: 'trans.dct', aliases: ['dct', 'робот'] },
  { key: 'trans.cvt', aliases: ['cvt', 'вариатор'] },
  { key: 'trans.auto', aliases: ['automatic', 'автомат', '오토'] },
  { key: 'trans.manual', aliases: ['manual', 'механика', '수동'] },
  { key: 'body.sedan', aliases: ['sedan', 'седан'] },
  { key: 'body.suv', aliases: ['suv', 'crossover', 'кроссовер', 'внедорожник'] },
  { key: 'body.hatchback', aliases: ['hatchback', 'хэтчбек'] },
  { key: 'body.wagon', aliases: ['wagon', 'универсал'] },
  { key: 'body.coupe', aliases: ['coupe', 'купе'] },
  { key: 'body.convertible', aliases: ['convertible', 'кабриолет'] },
  { key: 'body.minivan', aliases: ['minivan', 'минивэн'] },
  { key: 'body.pickup', aliases: ['pickup', 'пикап'] },
  { key: 'color.white', aliases: ['white', 'белый', '흰색'] },
  { key: 'color.black', aliases: ['black', 'черный', 'чёрный', '검정색'] },
  { key: 'color.gray', aliases: ['gray', 'grey', 'серый', '회색'] },
  { key: 'color.silver', aliases: ['silver', 'серебристый', '은색'] },
  { key: 'color.blue', aliases: ['blue', 'синий', '파란색'] },
  { key: 'color.red', aliases: ['red', 'красный', '빨간색'] },
  { key: 'color.brown', aliases: ['brown', 'коричневый', '갈색'] },
  { key: 'color.green', aliases: ['green', 'зеленый', 'зелёный', '녹색'] },
];

export function localizeVehicleValue(value: string | undefined, lang: Lang): string | undefined {
  if (!value) return value;
  const normalized = value.trim().toLocaleLowerCase();
  const match = vehicleValueKeys.find(item => item.aliases.some(alias => normalized === alias || normalized.includes(alias)));
  return match ? getTranslation(match.key, lang) : value;
}
