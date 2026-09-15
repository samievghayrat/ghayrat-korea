const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { Module, createRequire } = require('node:module');
const ts = require('typescript');
const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');

function loadTs(relative, overrides = {}) {
  const file = path.resolve(__dirname, '..', relative);
  const loaded = new Module(file);
  const originalRequire = createRequire(file);
  loaded.require = name => Object.hasOwn(overrides, name) ? overrides[name] : originalRequire(name);
  loaded._compile(ts.transpileModule(fs.readFileSync(file, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022,
      jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true },
  }).outputText, file);
  return loaded.exports;
}

const { getTranslation } = loadTs('src/lib/i18n.ts');
const sharing = loadTs('src/lib/car-sharing.ts');

function renderFloating(pathname = '/', lang = 'ru', open = false) {
  const { default: Contact } = loadTs('src/components/shared/FloatingContact.tsx', {
    'next/navigation': { usePathname: () => pathname },
    '@/contexts/AppContext': { useApp: () => ({ t: key => getTranslation(key, lang) }) },
    '@/lib/car-sharing': sharing,
    react: { ...React, useState: () => [open, () => {}] },
  });
  return renderToStaticMarkup(React.createElement(Contact));
}

test('mobile floating contact stays above the bottom navigation and device safe area', () => {
  const html = renderFloating();
  assert.ok(html.includes('data-testid="floating-contact"'));
  assert.ok(html.includes('bottom-[calc(4.5rem+env(safe-area-inset-bottom))]'));
  assert.ok(html.includes('right-4 z-40 flex'));
  assert.ok(!/class="[^"]*\bhidden\b/.test(html));
  assert.ok(html.includes('h-12 w-12'));
  assert.ok(html.includes('lg:bottom-6 lg:right-6'));
  assert.ok(html.includes('lg:h-14 lg:w-14'));
});

test('contact options start collapsed without taking up additional space', () => {
  const html = renderFloating();
  assert.ok(html.includes('aria-expanded="false"'));
  assert.ok(!html.includes('https://wa.me/'));
  assert.ok(!html.includes('https://t.me/'));
});

test('expanded floating action shows the existing safe WhatsApp and Telegram links', () => {
  const html = renderFloating('/', 'ru', true);
  assert.ok(html.includes('aria-expanded="true"'));
  assert.ok(html.includes('aria-controls="floating-contact-options"'));
  assert.ok(html.includes('id="floating-contact-options"'));
  assert.ok(html.includes('href="https://wa.me/821099221601"'));
  assert.ok(html.includes('href="https://t.me/ghayrat_korea"'));
  assert.equal((html.match(/rel="noopener noreferrer"/g) || []).length, 2);
});

test('floating contact is available on car details as well as list and information pages, but not admin', () => {
  for (const route of ['/', '/catalog', '/auction', '/our-cars', '/favorites', '/about', '/contacts', '/how-to-buy',
    '/catalog/42738544', '/auction/1001', '/our-cars/abcdef123456789012345678']) {
    assert.ok(renderFloating(route).includes('data-testid="floating-contact"'), route);
  }
  for (const route of ['/admin', '/admin/cars']) {
    assert.equal(renderFloating(route), '', route);
  }
});

test('car-page contact sits near the safe bottom edge without reserving space for the hidden navigation', () => {
  const html = renderFloating('/catalog/42738544');
  assert.ok(html.includes('bottom-[calc(1rem+env(safe-area-inset-bottom))]'));
  assert.ok(!html.includes('bottom-[calc(4.5rem+env(safe-area-inset-bottom))]'));
  assert.ok(html.includes('h-12 w-12'));
  assert.ok(html.includes('aria-expanded="false"'));
});

test('WhatsApp and Telegram drafts include the current car link in every selected language', () => {
  for (const lang of ['ru', 'en', 'tj', 'uz']) {
    for (const route of ['/catalog/42738544', '/auction/1001', '/our-cars/abcdef123456789012345678']) {
      const html = renderFloating(route, lang, true);
      const hrefs = [...html.matchAll(/href="([^"]+)"/g)].map(match => new URL(match[1].replaceAll('&amp;', '&')));
      assert.equal(hrefs.length, 2);
      assert.equal(hrefs[0].pathname, '/ghayrat_korea');
      assert.equal(hrefs[1].pathname, '/821099221601');
      for (const link of hrefs) {
        const message = link.searchParams.get('text');
        assert.ok(message.startsWith(getTranslation('contact.carInterest', lang)));
        assert.ok(message.endsWith(`https://ghayrat.vercel.app${route}`));
      }
      assert.equal(hrefs[0].searchParams.get('text'), hrefs[1].searchParams.get('text'));
    }
  }
});

test('header, footer and contact actions also include the current listing link', () => {
  const route = '/catalog/42738544';
  for (const file of ['src/components/layout/Header.tsx', 'src/components/layout/Footer.tsx',
    'src/components/shared/ContactCTA.tsx']) {
    const { default: Component } = loadTs(file, {
      'next/navigation': { usePathname: () => route },
      'next/link': { __esModule: true, default: ({ children, ...props }) => React.createElement('a', props, children) },
      '@/contexts/AppContext': { useApp: () => ({ t: key => getTranslation(key, 'ru'), lang: 'ru', currency: 'USD' }) },
      '@/lib/car-sharing': sharing,
    });
    const html = renderToStaticMarkup(React.createElement(Component));
    const links = [...html.matchAll(/href="(https:\/\/(?:wa\.me\/821099221601|t\.me\/ghayrat_korea)[^"]*)"/g)]
      .map(match => new URL(match[1].replaceAll('&amp;', '&')))
      .filter(url => url.pathname === '/821099221601' || url.pathname === '/ghayrat_korea');
    assert.ok(links.length > 0, file);
    for (const link of links) assert.ok(link.searchParams.get('text').endsWith(`https://ghayrat.vercel.app${route}`), file);
  }
});

test('mobile contact control uses accessible labels in each selected language', () => {
  for (const lang of ['ru', 'en', 'tj', 'uz']) {
    assert.ok(renderFloating('/', lang).includes(`aria-label="${getTranslation('nav.writeManager', lang)}"`));
    assert.ok(renderFloating('/', lang, true).includes(`aria-label="${getTranslation('nav.closeMenu', lang)}"`));
  }
});

test('bottom navigation includes our cars without a duplicate contact tab', () => {
  const { default: Nav } = loadTs('src/components/layout/BottomNav.tsx', {
    'next/navigation': { usePathname: () => '/' },
    'next/link': { __esModule: true, default: ({ children, ...props }) => React.createElement('a', props, children) },
    './MobileMenu': { __esModule: true, default: () => null },
    '@/contexts/AppContext': { useApp: () => ({ t: key => getTranslation(key, 'ru') }) },
  });
  const html = renderToStaticMarkup(React.createElement(Nav));
  for (const href of ['/', '/our-cars', '/auction', '/favorites']) assert.ok(html.includes(`href="${href}"`));
  assert.ok(html.indexOf('href="/"') < html.indexOf('href="/auction"'));
  assert.ok(html.indexOf('href="/auction"') < html.indexOf('href="/our-cars"'));
  assert.ok(html.indexOf('href="/our-cars"') < html.indexOf('href="/favorites"'));
  assert.ok(html.includes('Меню'));
  assert.equal((html.match(/<a /g) || []).length, 4);
  assert.ok(html.includes('grid-cols-5'));
  assert.ok(!html.includes('WhatsApp'));
  assert.ok(!html.includes('wa.me'));
  assert.ok(html.includes('pb-[env(safe-area-inset-bottom)]'));
});
