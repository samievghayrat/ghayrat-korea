export default function Footer() {
  return (
    <footer className="bg-primary-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-white font-black text-sm">GK</span>
              </div>
              <div className="leading-tight">
                <div className="text-white font-bold text-sm">GHAYRAT</div>
                <div className="text-primary-accent text-[9px] tracking-[0.15em]">KOREA</div>
              </div>
            </div>
            <p className="text-sm leading-relaxed mb-4">
              Подбор и доставка автомобилей из Южной Кореи. Работаем без посредников.
            </p>
            <div className="flex gap-3">
              <a href="https://t.me/ghayrat_korea" target="_blank" rel="noopener noreferrer"
                className="w-9 h-9 bg-white/5 hover:bg-[#0088cc]/20 rounded-lg flex items-center justify-center transition-colors">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0h-.056zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.479.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                </svg>
              </a>
              <a href="https://wa.me/821099221601" target="_blank" rel="noopener noreferrer"
                className="w-9 h-9 bg-white/5 hover:bg-[#25D366]/20 rounded-lg flex items-center justify-center transition-colors">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981z"/>
                </svg>
              </a>
            </div>
          </div>

{/* Contacts */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-4">Контакты</h4>
            <div className="space-y-3 text-sm">
              <p>Работаем ежедневно<br /><span className="text-white">09:00 — 21:00 (МСК)</span></p>
              <a href="https://t.me/ghayrat_korea" className="block text-primary-accent hover:text-white transition-colors">
                @ghayrat_korea
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-white/5 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-green-200/60">
            &copy; {new Date().getFullYear()} GHAYRAT KOREA. Все права защищены.
          </p>
          <p className="text-xs text-green-200/40">
            Информация на сайте носит информационный характер и не является публичной офертой.
          </p>
        </div>
      </div>
    </footer>
  );
}
